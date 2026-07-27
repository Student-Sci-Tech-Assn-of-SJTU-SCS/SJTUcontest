from django.urls import path

from .views import (
    create_resource,
    delete_resource,
    download_resource,
    get_resource,
    list_resources,
)


urlpatterns = [
    path("", list_resources, name="resource-list"),
    path("create/", create_resource, name="resource-create"),
    path("<uuid:resource_id>/", get_resource, name="resource-detail"),
    path(
        "<uuid:resource_id>/download/",
        download_resource,
        name="resource-download",
    ),
    path(
        "<uuid:resource_id>/delete/",
        delete_resource,
        name="resource-delete",
    ),
]
