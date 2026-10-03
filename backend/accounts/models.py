from django.contrib.auth.models import AbstractUser
from django.db import models


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

    role = models.CharField(max_length=30, choices=Role.choices, default=Role.DEPARTMENT_OFFICER)
    approval_status = models.CharField(
        max_length=30, 
        choices=ApprovalStatus.choices, 
        default=ApprovalStatus.APPROVED
    )
    department = models.CharField(max_length=100, blank=True)   # e.g. "USDMA", "NDRF", "District Collectorate"
    designation = models.CharField(max_length=100, blank=True)  # e.g. "Incident Commander", "Field GIS Analyst"
    district = models.CharField(max_length=100, blank=True)     # jurisdiction scoping
    phone_number = models.CharField(max_length=20, blank=True)
    employee_id = models.CharField(max_length=50, blank=True)

    def is_disaster_manager(self):
        return self.role in [self.Role.DISASTER_MANAGER, self.Role.SUPERADMIN] or self.is_superuser

    def is_department_officer(self):
        return self.role in [self.Role.DEPARTMENT_OFFICER, self.Role.OFFICIAL] or self.is_disaster_manager()

    def __str__(self):
        return f"{self.username} ({self.role} - {self.approval_status})"