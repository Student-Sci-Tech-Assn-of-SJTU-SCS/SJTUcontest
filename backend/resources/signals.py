from django.db.models.signals import post_delete
from django.dispatch import receiver

from .models import Resource


@receiver(post_delete, sender=Resource)
def delete_resource_attachment(sender, instance, **kwargs):
    if instance.attachment:
        instance.attachment.delete(save=False)
