from rest_framework import viewsets, permissions, status
from rest_framework.views import APIView
from rest_framework.response import Response
from .models import RelocationPlan, Alert
from .serializers import RelocationPlanSerializer, AlertSerializer
from geodata.models import Habitation, SafeSite
from geodata.matching import find_safe_sites_for


class RelocationPlanViewSet(viewsets.ModelViewSet):
    queryset = RelocationPlan.objects.all()
    serializer_class = RelocationPlanSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

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
        serializer.save(created_by=self.request.user if self.request.user.is_authenticated else None)

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
        serializer.save(created_by=self.request.user if self.request.user.is_authenticated else None)

    def perform_update(self, serializer):
        serializer.save()


class GeneratePlanView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request, *args, **kwargs):
        hab_id = request.data.get("habitation") or request.data.get("habitation_id")
        site_id = request.data.get("safe_site") or request.data.get("safe_site_id")
        pop = request.data.get("population_to_relocate") or request.data.get("population") or 0
        priority = request.data.get("priority", "IMMEDIATE")

        if not hab_id:
            return Response({"error": "habitation is required"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            hab = Habitation.objects.get(id=hab_id)
        except Habitation.DoesNotExist:
            return Response({"error": "Habitation not found"}, status=status.HTTP_404_NOT_FOUND)

        if not pop:
            pop = hab.population

        if not site_id:
            matches = find_safe_sites_for(hab)
            if matches:
                site = matches[0]["site"]
            else:
                site = SafeSite.objects.first()
        else:
            try:
                site = SafeSite.objects.get(id=site_id)
            except SafeSite.DoesNotExist:
                return Response({"error": "SafeSite not found"}, status=status.HTTP_404_NOT_FOUND)

        plan = RelocationPlan.objects.create(
            habitation=hab,
            safe_site=site,
            population_to_relocate=pop,
            priority=priority,
            status="PROPOSED",
            created_by=request.user if request.user.is_authenticated else None,
        )
        return Response(RelocationPlanSerializer(plan).data, status=status.HTTP_201_CREATED)


class BroadcastAlertView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request, *args, **kwargs):
        title = request.data.get("title") or "SDMA Emergency Broadcast"
        message = request.data.get("message") or "Emergency alert triggered for evacuation corridor."
        severity = request.data.get("severity") or "WARNING"
        hab_id = request.data.get("habitation") or request.data.get("habitation_id")

        hab = None
        if hab_id:
            try:
                hab = Habitation.objects.get(id=hab_id)
            except Habitation.DoesNotExist:
                pass

        alert = Alert.objects.create(
            title=title,
            message=message,
            severity=severity,
            habitation=hab,
            created_by=request.user if request.user.is_authenticated else None,
        )
        return Response(AlertSerializer(alert).data, status=status.HTTP_201_CREATED)