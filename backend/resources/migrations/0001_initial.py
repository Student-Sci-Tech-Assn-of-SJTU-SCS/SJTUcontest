import django.db.models.deletion
import resources.models
import uuid
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):
    initial = True

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name="Resource",
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
                    "category",
                    models.CharField(
                        choices=[
                            ("contest_material", "相关竞赛资料"),
                            ("past_experience", "往届经验分享"),
                        ],
                        max_length=32,
                    ),
                ),
                ("title", models.CharField(max_length=120)),
                ("description", models.TextField(blank=True)),
                (
                    "attachment",
                    models.FileField(
                        blank=True,
                        max_length=500,
                        upload_to=resources.models.resource_upload_path,
                    ),
                ),
                ("original_filename", models.CharField(blank=True, max_length=255)),
                ("file_size", models.PositiveBigIntegerField(default=0)),
                ("download_count", models.PositiveIntegerField(default=0)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                (
                    "uploader",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="shared_resources",
                        to=settings.AUTH_USER_MODEL,
                    ),
                ),
            ],
            options={
                "verbose_name": "共享资料",
                "verbose_name_plural": "共享资料",
                "db_table": "resources_resource",
                "ordering": ["-created_at"],
            },
        ),
        migrations.AddIndex(
            model_name="resource",
            index=models.Index(
                fields=["category", "-created_at"],
                name="resources_r_categor_22b410_idx",
            ),
        ),
    ]
