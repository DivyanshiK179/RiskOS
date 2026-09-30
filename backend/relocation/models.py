from django.contrib.gis.db import models
from django.conf import settings
from geodata.models import Habitation, SafeSite


class RelocationPlan(models.Model):
    class Priority(models.TextChoices):
        IMMEDIATE = "IMMEDIATE", "Immediate"
        SHORT_TERM = "SHORT_TERM", "Short-term"
        MEDIUM_TERM = "MEDIUM_TERM", "Medium-term"

    class Status(models.TextChoices):
        PROPOSED = "PROPOSED", "Proposed"
        APPROVED = "APPROVED", "Approved"
        IN_PROGRESS = "IN_PROGRESS", "In Progress"
        COMPLETED = "COMPLETED", "Completed"

    habitation = models.ForeignKey(Habitation, on_delete=models.CASCADE, related_name="relocation_plans")
    safe_site = models.ForeignKey(SafeSite, on_delete=models.CASCADE, related_name="incoming_plans")
    priority = models.CharField(max_length=20, choices=Priority.choices)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.PROPOSED)
    population_to_relocate = models.IntegerField()
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True)
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.habitation.name} -> {self.safe_site.name} ({self.status})"


class Alert(models.Model):
    class Severity(models.TextChoices):
        INFO = "INFO", "Info"
        WARNING = "WARNING", "Warning"
        CRITICAL = "CRITICAL", "Critical"

    habitation = models.ForeignKey(Habitation, on_delete=models.CASCADE, related_name="alerts", null=True, blank=True)
    title = models.CharField(max_length=200)
    message = models.TextField()
    severity = models.CharField(max_length=20, choices=Severity.choices, default=Severity.INFO)
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"[{self.severity}] {self.title}"