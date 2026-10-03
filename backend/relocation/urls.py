from rest_framework.routers import DefaultRouter
from django.urls import path
from .views import RelocationPlanViewSet, AlertViewSet, GeneratePlanView, BroadcastAlertView

router = DefaultRouter()
router.register("plans", RelocationPlanViewSet)
router.register("alerts", AlertViewSet)

urlpatterns = [
    path("generate/", GeneratePlanView.as_view(), name="relocation_generate"),
    path("broadcast/", BroadcastAlertView.as_view(), name="relocation_broadcast"),
] + router.urls