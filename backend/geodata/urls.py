from rest_framework.routers import DefaultRouter
from django.urls import path
from .views import HabitationViewSet, SafeSiteViewSet, GeoStatsView, SimulateDisasterView

router = DefaultRouter()
router.register("habitations", HabitationViewSet)
router.register("safesites", SafeSiteViewSet)

urlpatterns = [
    path('stats/', GeoStatsView.as_view(), name='geostats'),
    path('simulate-disaster/', SimulateDisasterView.as_view(), name='simulate_disaster'),
] + router.urls