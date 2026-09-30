from django.contrib.gis import admin
from .models import Habitation, SafeSite

@admin.register(Habitation)
class HabitationAdmin(admin.GISModelAdmin):
    list_display = ("name", "district", "population", "hazard_score", "vulnerability_score", "hazard_level")
    list_filter = ("state", "district", "hazard_level")
    search_fields = ("name", "district")
    readonly_fields = ("hazard_score", "vulnerability_score", "hazard_level", "scored_at")
    ordering = ("-hazard_score",)

@admin.register(SafeSite)
class SafeSiteAdmin(admin.GISModelAdmin):
    list_display = ("name", "district", "estimated_capacity", "current_occupied")
    list_filter = ("district",)