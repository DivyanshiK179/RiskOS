from rest_framework.routers import DefaultRouter
from django.urls import path
from .views import (
    HabitationViewSet,
    SafeSiteViewSet,
    GeoStatsView,
    SimulateDisasterView,
    DataIngestionView,
    AnalyticsOverviewView,
)

router = DefaultRouter()
router.register("habitations", HabitationViewSet)
router.register("safesites", SafeSiteViewSet)

urlpatterns = [
    path('stats/', GeoStatsView.as_view(), name='geostats'),
    path('analytics/overview/', AnalyticsOverviewView.as_view(), name='geodata_analytics_overview'),
    path('simulate-disaster/', SimulateDisasterView.as_view(), name='simulate_disaster'),
    path('ingest/', DataIngestionView.as_view(), name='data_ingest'),
] + router.urls