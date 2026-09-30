from rest_framework import serializers
from .models import RelocationPlan, Alert


class RelocationPlanSerializer(serializers.ModelSerializer):
    habitation_name = serializers.CharField(source="habitation.name", read_only=True)
    safe_site_name = serializers.CharField(source="safe_site.name", read_only=True)
    created_by_name = serializers.CharField(source="created_by.username", read_only=True)

    class Meta:
        model = RelocationPlan
        fields = (
            "id", "habitation", "habitation_name", "safe_site", "safe_site_name",
            "priority", "status", "population_to_relocate", "notes",
            "created_by", "created_by_name",
            "created_at", "updated_at",
        )
        read_only_fields = ("created_by",)


class AlertSerializer(serializers.ModelSerializer):
    habitation_name = serializers.CharField(source="habitation.name", read_only=True, allow_null=True)
    created_by_name = serializers.CharField(source="created_by.username", read_only=True, allow_null=True)

    class Meta:
        model = Alert
        fields = (
            "id", "habitation", "habitation_name", "title", "message",
            "severity", "created_by", "created_by_name", "created_at"
        )
        read_only_fields = ("created_by",)