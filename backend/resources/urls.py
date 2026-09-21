from django.urls import path

from .views import (
    create_resource,
    delete_resource,
    download_resource,
    get_resource,
    list_resource_contest_options,
    list_resource_groups,
    list_resources,
)


urlpatterns = [
    path("", list_resources, name="resource-list"),
    path("groups/", list_resource_groups, name="resource-groups"),
    path(
        "contest-options/",
        list_resource_contest_options,
        name="resource-contest-options",
    ),
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
