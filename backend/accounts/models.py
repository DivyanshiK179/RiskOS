from django.contrib.auth.models import AbstractUser
from django.db import models


class OfficialTier(models.TextChoices):
    NATIONAL_NDMA = "NATIONAL_NDMA", "Tier 1 - NDMA Apex / National"
    STATE_SDMA = "STATE_SDMA", "Tier 2 - State Officer (SDMA SEOC)"
    DISTRICT_DEOC = "DISTRICT_DEOC", "Tier 3 - District Magistrate / DEOC"
    FIELD_RESPONDER = "FIELD_RESPONDER", "Tier 4 - SDRF / Field Officer"


class AuthProvider(models.TextChoices):
    GOVNET = "GOVNET", "GovNet Direct Intranet"
    PARICHAY = "PARICHAY", "Jan Parichay National SSO"


class User(AbstractUser):
    class Role(models.TextChoices):
        DISASTER_MANAGER = "DISASTER_MANAGER", "Disaster Manager (Executive / Nodal Head)"
        DEPARTMENT_OFFICER = "DEPARTMENT_OFFICER", "Department Field Officer / Analyst"
        PUBLIC_CITIZEN = "PUBLIC_CITIZEN", "Public Citizen / Safety Access"
        # Backwards compatibility choices for legacy records
        SUPERADMIN = "SUPERADMIN", "System Admin (Disaster Manager)"
        OFFICIAL = "OFFICIAL", "Field Officer"
        PUBLIC = "PUBLIC", "Public"

    class ApprovalStatus(models.TextChoices):
        APPROVED = "APPROVED", "Approved"
        PENDING_APPROVAL = "PENDING_APPROVAL", "Pending Approval"
        REJECTED = "REJECTED", "Rejected"
        SUSPENDED = "SUSPENDED", "Suspended"

    # Multi-Tiered NDMA/SDMA RBAC Fields
    official_id = models.CharField(max_length=64, unique=True, null=True, blank=True, help_text="e.g. UK-SDMA-2026-9041")
    tier = models.CharField(max_length=32, choices=OfficialTier.choices, default=OfficialTier.FIELD_RESPONDER)
    cadre_designation = models.CharField(max_length=128, blank=True, help_text="e.g. Additional District Magistrate (E)")
    assigned_district = models.CharField(max_length=64, blank=True, null=True, help_text="e.g. Chamoli, Rudraprayag")
    is_2fa_enrolled = models.BooleanField(default=True)
    is_approved_by_nodal = models.BooleanField(default=False)
    auth_provider = models.CharField(max_length=20, choices=AuthProvider.choices, default=AuthProvider.GOVNET)

    # Legacy & operational identity fields
    role = models.CharField(max_length=30, choices=Role.choices, default=Role.DEPARTMENT_OFFICER)
    approval_status = models.CharField(
        max_length=30, 
        choices=ApprovalStatus.choices, 
        default=ApprovalStatus.APPROVED
    )
    department = models.CharField(max_length=128, default="Disaster Management Authority", blank=True)
    designation = models.CharField(max_length=128, blank=True)
    district = models.CharField(max_length=100, blank=True)
    phone_number = models.CharField(max_length=20, blank=True)
    employee_id = models.CharField(max_length=50, blank=True)

    # Hierarchical RBAC tier verification
    def is_national_command(self):
        return self.tier == OfficialTier.NATIONAL_NDMA or self.is_superuser

    def is_state_command(self):
        return self.tier in [OfficialTier.NATIONAL_NDMA, OfficialTier.STATE_SDMA] or self.is_superuser

    def is_district_command(self):
        return self.tier in [OfficialTier.NATIONAL_NDMA, OfficialTier.STATE_SDMA, OfficialTier.DISTRICT_DEOC] or self.is_superuser

    def is_field_responder(self):
        return True

    def is_disaster_manager(self):
        return self.is_state_command() or self.role in [self.Role.DISASTER_MANAGER, self.Role.SUPERADMIN] or self.is_superuser

    def is_department_officer(self):
        return self.is_district_command() or self.role in [self.Role.DEPARTMENT_OFFICER, self.Role.OFFICIAL] or self.is_disaster_manager()

    def __str__(self):
        id_display = self.official_id or self.username
        name_display = self.get_full_name() or self.username
        return f"[{self.tier}] {id_display} - {name_display}"


# Alias for explicit prompt specification
OfficialUser = User