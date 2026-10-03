from django.contrib import admin
from django.urls import path, include
from rest_framework_simplejwt.views import TokenRefreshView
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView
from accounts.views import (
    CurrentUserView,
    CustomTokenObtainPairView,
    RegisterView,
    UserManagementView,
    UserApprovalActionView,
)
from geodata.views import SimulateDisasterView, DataIngestionView, AnalyticsOverviewView
from relocation.views import GeneratePlanView, BroadcastAlertView

urlpatterns = [
    # Developer/System Admin Console (not the user portal)
    path("system-console/", admin.site.urls),

    # Main Application APIs
    path("api/geodata/", include("geodata.urls")),
    path("api/v1/ingest/", DataIngestionView.as_view(), name="v1_data_ingest"),
    path("api/v1/analytics/overview/", AnalyticsOverviewView.as_view(), name="v1_analytics_overview"),
    path("api/relocation/", include("relocation.urls")),
    path("api/simulation/run/", SimulateDisasterView.as_view(), name="simulation_run"),
    path("api/alerts/broadcast/", BroadcastAlertView.as_view(), name="alert_broadcast_root"),
    path("api/relocation/generate/", GeneratePlanView.as_view(), name="relocation_generate_root"),

    # Authentication & Multi-Tier RBAC Management
    path("api/auth/login/", CustomTokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("api/auth/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path("api/auth/register/", RegisterView.as_view(), name="register_user"),
    path("api/auth/me/", CurrentUserView.as_view(), name="current_user"),
    path("api/auth/users/", UserManagementView.as_view(), name="user_management_list"),
    path("api/auth/users/<int:user_id>/action/", UserApprovalActionView.as_view(), name="user_approval_action"),

    # API Documentation & Schema
    path("api/schema/", SpectacularAPIView.as_view(), name="schema"),
    path("api/docs/", SpectacularSwaggerView.as_view(url_name="schema"), name="swagger-ui"),
]