from django.db import models


class News(models.Model):
    id = models.AutoField(primary_key=True, editable=False)
    contest = models.ForeignKey("contests.Contest", on_delete=models.CASCADE)

    class Meta:
        verbose_name = "News"
        verbose_name_plural = "News"
