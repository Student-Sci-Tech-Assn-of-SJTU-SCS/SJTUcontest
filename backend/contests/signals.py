from django.db.models.signals import post_delete
from django.dispatch import receiver

from .models import ContestAttachment


@receiver(post_delete, sender=ContestAttachment)
def delete_contest_attachment_file(sender, instance, **kwargs):
    if instance.file:
        instance.file.delete(save=False)
