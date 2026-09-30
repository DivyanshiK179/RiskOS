from django.contrib.gis.measure import D
from django.contrib.gis.db.models.functions import Distance
from .models import SafeSite


def find_safe_sites_for(habitation, max_distance_km=50, top_n=5):
    """
    Find candidate safe sites for a given habitation:
    - within max_distance_km
    - hazard_score below a safety threshold
    - has remaining capacity for the habitation's population
    Ranked by a weighted score: distance (closer better) + remaining capacity + hazard safety.
    """
    candidates = (
        SafeSite.objects.filter(location__distance_lte=(habitation.location, D(km=max_distance_km)))
        .filter(hazard_score__lt=50)  # only genuinely "safer" sites
        .annotate(distance=Distance("location", habitation.location))
    )

    results = []
    for site in candidates:
        remaining = site.remaining_capacity()
        if remaining <= 0:
            continue  # no room, skip

        distance_km = site.distance.km

        # Suitability score: closer = better, more remaining capacity = better, lower hazard = better
        # All normalized loosely into a 0-100 "suitability" score
        distance_score = max(0, 100 - (distance_km / max_distance_km) * 100)
        capacity_score = min(100, (remaining / max(habitation.population, 1)) * 50)
        safety_score = max(0, 100 - site.hazard_score)

        suitability = round((distance_score * 0.4) + (capacity_score * 0.3) + (safety_score * 0.3), 1)

        results.append({
            "site": site,
            "distance_km": round(distance_km, 2),
            "remaining_capacity": remaining,
            "suitability_score": suitability,
            "can_fully_accommodate": remaining >= habitation.population,
        })

    results.sort(key=lambda r: r["suitability_score"], reverse=True)
    return results[:top_n]