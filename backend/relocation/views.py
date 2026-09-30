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

    def perform_update(self, serializer):
        instance = serializer.instance
        old_status = instance.status
        new_status = serializer.validated_data.get('status', old_status)
        
        # Deduct capacity from SafeSite when Relocation Plan is COMPLETED
        if old_status != 'COMPLETED' and new_status == 'COMPLETED':
            site = instance.safe_site
            site.current_occupied += instance.population_to_relocate
            site.save()
            
        serializer.save()


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

    def perform_update(self, serializer):
        instance = serializer.instance
        old_status = instance.status
        new_status = serializer.validated_data.get('status', old_status)
        
        # Deduct capacity from SafeSite when Relocation Plan is COMPLETED
        if old_status != 'COMPLETED' and new_status == 'COMPLETED':
            site = instance.safe_site
            site.current_occupied += instance.population_to_relocate
            site.save()
            
        serializer.save()