import tempfile
from pathlib import Path

from django.contrib.auth import get_user_model
from django.core.files.uploadedfile import SimpleUploadedFile
from django.test import TestCase, override_settings
from django.urls import reverse
from rest_framework.test import APIClient

from .models import Resource


User = get_user_model()


class ResourceAPITestCase(TestCase):
    def setUp(self):
        self.media_directory = tempfile.TemporaryDirectory()
        self.override = override_settings(MEDIA_ROOT=self.media_directory.name)
        self.override.enable()

        self.user = User.objects.create_user(
            username="user",
            password="password",
        )
        self.other_user = User.objects.create_user(
            username="other_user",
            password="password",
        )
        self.client = APIClient()

    def tearDown(self):
        self.override.disable()
        self.media_directory.cleanup()

    def test_unauthenticated_user_cannot_list_resources(self):
        response = self.client.get(reverse("resource-list"))
        self.assertEqual(response.status_code, 401)

    def test_authenticated_user_can_create_list_and_download_resource(self):
        self.client.force_authenticate(self.user)
        upload = SimpleUploadedFile(
            "guide.pdf",
            b"sample pdf data",
            content_type="application/pdf",
        )
        create_response = self.client.post(
            reverse("resource-create"),
            {
                "category": Resource.Category.CONTEST_MATERIAL,
                "title": "竞赛指南",
                "description": "报名与备赛说明",
                "attachment": upload,
            },
            format="multipart",
        )
        self.assertEqual(create_response.status_code, 201)
        resource_id = create_response.json()["data"]["id"]

        list_response = self.client.get(
            reverse("resource-list"),
            {"category": Resource.Category.CONTEST_MATERIAL},
        )
        self.assertEqual(list_response.status_code, 200)
        self.assertEqual(list_response.json()["data"]["total_items"], 1)

        download_response = self.client.get(
            reverse("resource-download", args=[resource_id])
        )
        self.assertEqual(download_response.status_code, 200)
        self.assertEqual(b"".join(download_response.streaming_content), b"sample pdf data")

        resource = Resource.objects.get(id=resource_id)
        self.assertEqual(resource.download_count, 1)

    def test_past_experience_can_be_text_only(self):
        self.client.force_authenticate(self.user)
        response = self.client.post(
            reverse("resource-create"),
            {
                "category": Resource.Category.PAST_EXPERIENCE,
                "title": "往届备赛复盘",
                "description": "先完成基础实现，再逐步优化。",
            },
            format="multipart",
        )
        self.assertEqual(response.status_code, 201)
        self.assertFalse(response.json()["data"]["has_attachment"])

    def test_other_user_cannot_delete_resource(self):
        resource = Resource.objects.create(
            category=Resource.Category.PAST_EXPERIENCE,
            title="经验",
            description="内容",
            uploader=self.user,
        )
        self.client.force_authenticate(self.other_user)
        response = self.client.delete(reverse("resource-delete", args=[resource.id]))
        self.assertEqual(response.status_code, 403)
        self.assertTrue(Resource.objects.filter(id=resource.id).exists())

    def test_owner_delete_removes_attachment(self):
        self.client.force_authenticate(self.user)
        upload = SimpleUploadedFile("notes.txt", b"notes")
        create_response = self.client.post(
            reverse("resource-create"),
            {
                "category": Resource.Category.PAST_EXPERIENCE,
                "title": "笔记",
                "description": "",
                "attachment": upload,
            },
            format="multipart",
        )
        resource = Resource.objects.get(id=create_response.json()["data"]["id"])
        stored_path = Path(resource.attachment.path)
        self.assertTrue(stored_path.exists())

        response = self.client.delete(reverse("resource-delete", args=[resource.id]))
        self.assertEqual(response.status_code, 200)
        self.assertFalse(stored_path.exists())
