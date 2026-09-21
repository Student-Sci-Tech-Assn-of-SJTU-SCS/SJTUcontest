import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("contests", "0003_contestattachment"),
        ("resources", "0001_initial"),
    ]

    operations = [
        migrations.AddField(
            model_name="resource",
            name="contest",
            field=models.ForeignKey(
                blank=True,
                null=True,
                on_delete=django.db.models.deletion.SET_NULL,
                related_name="shared_resources",
                to="contests.contest",
                verbose_name="所属竞赛",
            ),
        ),
        migrations.AddField(
            model_name="resource",
            name="other_contest_name",
            field=models.CharField(
                blank=True,
                max_length=120,
                verbose_name="其他竞赛名称",
            ),
        ),
        migrations.AddIndex(
            model_name="resource",
            index=models.Index(
                fields=["category", "contest", "-created_at"],
                name="resources_r_categor_6817bb_idx",
            ),
        ),
    ]
