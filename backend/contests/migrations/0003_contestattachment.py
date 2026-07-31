import contests.models
import django.db.models.deletion
import uuid
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("contests", "0002_alter_contest_level_alter_contest_quality"),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name="ContestAttachment",
            fields=[
                (
                    "id",
                    models.UUIDField(
                        default=uuid.uuid4,
                        editable=False,
                        primary_key=True,
                        serialize=False,
                    ),
                ),
                (
                    "file",
                    models.FileField(
                        max_length=500,
                        upload_to=contests.models.contest_attachment_upload_path,
                    ),
                ),
                ("original_filename", models.CharField(max_length=255)),
                ("file_size", models.PositiveBigIntegerField()),
                (
                    "content_type",
                    models.CharField(
                        default="application/octet-stream",
                        max_length=150,
                    ),
                ),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                (
                    "contest",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="attachments",
                        to="contests.contest",
                    ),
                ),
                (
                    "uploaded_by",
                    models.ForeignKey(
                        null=True,
                        on_delete=django.db.models.deletion.SET_NULL,
                        related_name="uploaded_contest_attachments",
                        to=settings.AUTH_USER_MODEL,
                    ),
                ),
            ],
            options={
                "verbose_name": "比赛附件",
                "verbose_name_plural": "比赛附件",
                "db_table": "contests_attachment",
                "ordering": ["created_at"],
            },
        ),
    ]
