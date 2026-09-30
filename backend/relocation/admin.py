from django.contrib import admin
from .models import RelocationPlan, Alert

@admin.register(RelocationPlan)
class RelocationPlanAdmin(admin.ModelAdmin):
    list_display = ("habitation", "get_habitation_district", "safe_site", "priority", "status", "population_to_relocate", "created_at")
    list_filter = ("priority", "status", "habitation__district")

    def get_habitation_district(self, obj):
        return obj.habitation.district
    get_habitation_district.short_description = 'District'
    get_habitation_district.admin_order_field = 'habitation__district'

@admin.register(Alert)
class AlertAdmin(admin.ModelAdmin):
    list_display = ("title", "severity", "habitation", "created_at")
    list_filter = ("severity",)