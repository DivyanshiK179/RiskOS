from rest_framework.routers import DefaultRouter
from .views import RelocationPlanViewSet, AlertViewSet

router = DefaultRouter()
router.register("plans", RelocationPlanViewSet)
router.register("alerts", AlertViewSet)

urlpatterns = router.urls