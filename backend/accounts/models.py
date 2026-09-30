from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    class Role(models.TextChoices):
        PUBLIC = "PUBLIC", "Public"
        OFFICIAL = "OFFICIAL", "Disaster Management Official"
        SUPERADMIN = "SUPERADMIN", "System Admin"

    role = models.CharField(max_length=20, choices=Role.choices, default=Role.OFFICIAL)
    department = models.CharField(max_length=100, blank=True)   # e.g. "NDRF", "State DMA - Uttarakhand"
    district = models.CharField(max_length=100, blank=True)      # jurisdiction scoping

    def __str__(self):
        return f"{self.username} ({self.role})"