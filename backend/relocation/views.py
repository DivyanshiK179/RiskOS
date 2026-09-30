from rest_framework import viewsets, permissions
from .models import RelocationPlan, Alert
from .serializers import RelocationPlanSerializer, AlertSerializer


class RelocationPlanViewSet(viewsets.ModelViewSet):
    queryset = RelocationPlan.objects.all()
    serializer_class = RelocationPlanSerializer
    permission_classes = [permissions.IsAuthenticated]  # officials only, no public write/read

    def get_queryset(self):
        qs = super().get_queryset()
        habitation = self.request.query_params.get("habitation")
        status = self.request.query_params.get("status")
        if habitation:
            qs = qs.filter(habitation_id=habitation)
        if status:
            qs = qs.filter(status=status)
        return qs

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)


class AlertViewSet(viewsets.ModelViewSet):
    queryset = Alert.objects.all().order_by("-created_at")
    serializer_class = AlertSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        qs = super().get_queryset()
        severity = self.request.query_params.get("severity")
        if severity:
            qs = qs.filter(severity=severity)
        return qs

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)