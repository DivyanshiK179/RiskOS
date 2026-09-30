
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
