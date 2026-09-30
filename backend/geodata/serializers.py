from rest_framework_gis.serializers import GeoFeatureModelSerializer
from rest_framework import serializers
from .models import Habitation, SafeSite


class HabitationDetailSerializer(serializers.ModelSerializer):
    latitude = serializers.SerializerMethodField()
    longitude = serializers.SerializerMethodField()
    score_breakdown = serializers.SerializerMethodField()

    class Meta:
        model = Habitation
        fields = (
            "id", "name", "district", "state", "population",
            "latitude", "longitude",
            "seismic_zone", "avg_annual_rainfall_mm", "extreme_rainfall_days",
            "distance_to_river_km", "elevation_m",
            "pct_dilapidated_housing", "pct_kutcha_roof_wall",
            "pct_no_drinking_water_premises", "pct_no_toilet", "pct_no_drainage",
            "hazard_score", "vulnerability_score", "hazard_level",
            "score_breakdown", "scored_at",
        )

    def get_latitude(self, obj):
        return obj.location.y

    def get_longitude(self, obj):
        return obj.location.x

    def get_score_breakdown(self, obj):
        return obj.score_breakdown()


class HabitationSerializer(GeoFeatureModelSerializer):
    class Meta:
        model = Habitation
        geo_field = "location"
        fields = (
            "id", "name", "district", "population", "hazard_level"
        )


class SafeSiteSerializer(GeoFeatureModelSerializer):
    remaining_capacity = serializers.IntegerField(read_only=True)

    class Meta:
        model = SafeSite
        geo_field = "location"
        fields = (
            "id", "name", "district", "available_area_hectares",
            "estimated_capacity", "current_occupied", "remaining_capacity",
            "hazard_score", "road_access", "water_availability",
        )


class SafeSiteDetailSerializer(serializers.ModelSerializer):
    latitude = serializers.SerializerMethodField()
    longitude = serializers.SerializerMethodField()
    remaining_capacity = serializers.IntegerField(read_only=True)

    class Meta:
        model = SafeSite
        fields = (
            "id", "name", "district", "latitude", "longitude",
            "available_area_hectares", "estimated_capacity", "current_occupied",
            "remaining_capacity", "hazard_score", "road_access", "water_availability",
        )

    def get_latitude(self, obj):
        return obj.location.y

    def get_longitude(self, obj):
        return obj.location.x


class SafeSiteMatchSerializer(serializers.Serializer):
    id = serializers.IntegerField(source="site.id")
    name = serializers.CharField(source="site.name")
    district = serializers.CharField(source="site.district")
    distance_km = serializers.FloatField()
    remaining_capacity = serializers.IntegerField()
    suitability_score = serializers.FloatField()
    can_fully_accommodate = serializers.BooleanField()
    latitude = serializers.SerializerMethodField()
    longitude = serializers.SerializerMethodField()

    def get_latitude(self, obj):
        return obj["site"].location.y

    def get_longitude(self, obj):
        return obj["site"].location.x