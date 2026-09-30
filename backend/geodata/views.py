from rest_framework import viewsets, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework_gis.filters import InBBoxFilter
from .models import Habitation, SafeSite
from .serializers import (
    HabitationSerializer,
    HabitationDetailSerializer,
    SafeSiteSerializer,
    SafeSiteMatchSerializer,
)
from .matching import find_safe_sites_for


class HabitationViewSet(viewsets.ModelViewSet):
    queryset = Habitation.objects.all()
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    bbox_filter_field = "location"
    filter_backends = [InBBoxFilter]

    def get_serializer_class(self):
        if self.action == "retrieve":
            return HabitationDetailSerializer
        return HabitationSerializer

    def get_queryset(self):
        qs = super().get_queryset()
        district = self.request.query_params.get("district")
        hazard_level = self.request.query_params.get("hazard_level")
        if district:
            qs = qs.filter(district__iexact=district)
        if hazard_level:
            qs = qs.filter(hazard_level=hazard_level)
        return qs

    @action(detail=True, methods=["get"])
    def safe_sites(self, request, pk=None):
        habitation = self.get_object()
        matches = find_safe_sites_for(habitation)
        serializer = SafeSiteMatchSerializer(matches, many=True)
        return Response(serializer.data)


from rest_framework.views import APIView
from django.db.models import Sum, F

class SafeSiteViewSet(viewsets.ModelViewSet):
    queryset = SafeSite.objects.all()
    serializer_class = SafeSiteSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        qs = super().get_queryset()
        district = self.request.query_params.get("district")
        if district:
            qs = qs.filter(district__iexact=district)
        return qs

class GeoStatsView(APIView):
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get(self, request, *args, **kwargs):
        habs = Habitation.objects.all()
        safes = SafeSite.objects.all()

        total_habs = habs.count()
        red_count = habs.filter(hazard_level="RED").count()
        high_count = habs.filter(hazard_level="HIGH").count()
        mod_count = habs.filter(hazard_level="MODERATE").count()
        safe_count = habs.filter(hazard_level="SAFE").count()

        at_risk = habs.filter(hazard_level__in=["RED", "HIGH"]).aggregate(total=Sum("population"))["total"] or 0
        cap = safes.aggregate(cap=Sum(F("estimated_capacity") - F("current_occupied")))["cap"] or 0
        districts = list(habs.values_list("district", flat=True).distinct().order_by("district"))

        return Response({
            "total_habitations": total_habs,
            "red_count": red_count,
            "high_count": high_count,
            "moderate_count": mod_count,
            "safe_count": safe_count,
            "total_population_at_risk": at_risk,
            "total_safe_sites": safes.count(),
            "total_shelter_capacity": cap,
            "districts": districts
        })
from django.contrib.gis.geos import Point
from django.contrib.gis.measure import D
from django.contrib.gis.db.models.functions import Distance

class SimulateDisasterView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request, *args, **kwargs):
        data = request.data
        lat = float(data.get('lat', 0))
        lon = float(data.get('lon', 0))
        radius_km = float(data.get('radius_km', 5.0))
        disaster_type = data.get('type', 'CLOUDBURST')
        
        epicenter = Point(lon, lat, srid=4326)
        
        affected = Habitation.objects.filter(location__distance_lte=(epicenter, D(km=radius_km)))
        affected = affected.annotate(dist_from_epicenter=Distance('location', epicenter)).order_by('dist_from_epicenter')
        
        all_safe_sites = SafeSite.objects.all()
        safe_site_tracker = {s.id: s.remaining_capacity() for s in all_safe_sites}
        
        results = []
        total_pop = 0
        
        for hab in affected:
            assigned_site = None
            closest_sites = SafeSite.objects.annotate(dist=Distance('location', hab.location)).exclude(location__distance_lte=(epicenter, D(km=radius_km))).order_by('dist')
            
            for site in closest_sites:
                cap = safe_site_tracker.get(site.id, 0)
                if cap >= hab.population:
                    assigned_site = {
                        "id": site.id,
                        "name": site.name,
                        "lat": site.location.y,
                        "lon": site.location.x,
                        "distance_km": round(site.dist.km, 2) if hasattr(site, 'dist') else 0
                    }
                    safe_site_tracker[site.id] -= hab.population
                    break
            
            results.append({
                "id": hab.id,
                "name": hab.name,
                "population": hab.population,
                "lat": hab.location.y,
                "lon": hab.location.x,
                "distance_from_epicenter_km": round(hab.dist_from_epicenter.km, 2) if hasattr(hab, 'dist_from_epicenter') else 0,
                "assigned_safe_site": assigned_site
            })
            total_pop += hab.population
            
        return Response({
            "epicenter": {"lat": lat, "lon": lon, "radius_km": radius_km, "type": disaster_type},
            "affected_habitations": results,
            "total_affected_population": total_pop
        })
