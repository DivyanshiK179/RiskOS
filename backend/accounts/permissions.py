from rest_framework.permissions import BasePermission
from .models import User, OfficialTier, AuthProvider

TIER_ORDER = {
    OfficialTier.NATIONAL_NDMA: 1,
    OfficialTier.STATE_SDMA: 2,
    OfficialTier.DISTRICT_DEOC: 3,
    OfficialTier.FIELD_RESPONDER: 4,
}


def get_user_tier_level(user) -> int:
    if not user or not user.is_authenticated:
        return 99
    if user.is_superuser:
        return 1
    tier = getattr(user, "tier", OfficialTier.FIELD_RESPONDER)
    return TIER_ORDER.get(tier, 4)


class HasTierClearance(BasePermission):
    """
    Base permission checking if authenticated user has clearance
    at or above the specified required tier level.
    """
    required_tier = OfficialTier.FIELD_RESPONDER

    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        required_level = TIER_ORDER.get(self.required_tier, 4)
        return get_user_tier_level(request.user) <= required_level


class IsNationalNDMA(BasePermission):
    """Tier 1: Apex National NDMA Command"""
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        return request.user.is_superuser or getattr(request.user, "tier", None) == OfficialTier.NATIONAL_NDMA


class IsStateSDMA(BasePermission):
    """Tier 2 or above: State SDMA SEOC Command"""
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        return get_user_tier_level(request.user) <= 2


class IsDistrictDEOC(BasePermission):
    """Tier 3 or above: District DEOC / Collectorate Command"""
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        return get_user_tier_level(request.user) <= 3


class IsFieldResponder(BasePermission):
    """Tier 4 or above: SDRF / Field Operations"""
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        return get_user_tier_level(request.user) <= 4


class IsParichayAuthenticated(BasePermission):
    """Requires authentication via Jan Parichay National SSO or Apex Clearance"""
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        if request.user.is_superuser:
            return True
        provider = getattr(request.user, "auth_provider", None)
        return provider == AuthProvider.PARICHAY or get_user_tier_level(request.user) <= 2


class IsGovNetAuthenticated(BasePermission):
    """Allow direct GovNet Intranet authenticated operators"""
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        return True


class CanExecuteSimulation(BasePermission):
    """
    Authorized to trigger AI scenario blast simulations.
    Requires Tier 1 or 2 (Apex / State SDMA) or Jan Parichay authorization.
    """
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        if request.user.is_superuser:
            return True
        return getattr(request.user, "is_state_command", lambda: False)()


class CanAuthorizeEvacuation(BasePermission):
    """
    Authorized to approve and sign statutory relocation/evacuation plans.
    Requires Tier 1/2 clearance or Parichay federated credential.
    """
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        if request.user.is_superuser:
            return True
        return getattr(request.user, "is_state_command", lambda: False)()


class CanUpdateShelterTelemetry(BasePermission):
    """
    Operational permission for District DEOC & SDRF field responders (GovNet Direct)
    to update local shelter capacity and submit incident verification forms.
    """
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        return True


class CanManageUsers(BasePermission):
    """Authorized to approve/reject personnel and reassign tiers/roles"""
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        if request.user.is_superuser:
            return True
        if getattr(request.user, "is_national_command", lambda: False)():
            return True
        return getattr(request.user, "role", None) in [User.Role.DISASTER_MANAGER, User.Role.SUPERADMIN]
