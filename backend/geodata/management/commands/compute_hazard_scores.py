from django.core.management.base import BaseCommand
from django.utils import timezone
from geodata.models import Habitation

# --- Weights (documented, tunable, explainable — the core of your "rule-based AI") ---
SEISMIC_ZONE_SCORE = {"II": 20, "III": 45, "IV": 70, "V": 95}

HAZARD_WEIGHTS = {
    "seismic": 0.30,
    "rainfall_extreme": 0.30,
    "river_proximity": 0.20,
    "landslide_elevation": 0.20,
}

VULNERABILITY_WEIGHTS = {
    "dilapidated": 0.30,
    "kutcha": 0.25,
    "no_water": 0.15,
    "no_toilet": 0.15,
    "no_drainage": 0.15,
}


def normalize(value, min_val, max_val):
    """Clamp + scale any raw value into a 0-100 range."""
    if max_val == min_val:
        return 0
    pct = (value - min_val) / (max_val - min_val)
    return max(0, min(100, pct * 100))


def compute_hazard_score(h: Habitation) -> float:
    seismic_component = SEISMIC_ZONE_SCORE.get(h.seismic_zone, 45)

    rainfall_component = normalize(h.extreme_rainfall_days, 0, 30)

    # closer to river = higher flood risk, so invert distance
    river_component = normalize(8 - h.distance_to_river_km, 0, 8)

    # lower elevation in a hilly pilot region = proxy for landslide-prone valley/slope zones
    # (simplified rule for MVP; Phase 2 replaces this with real GSI landslide susceptibility layer)
    landslide_component = normalize(2200 - h.elevation_m, 0, 1900)

    score = (
        seismic_component * HAZARD_WEIGHTS["seismic"]
        + rainfall_component * HAZARD_WEIGHTS["rainfall_extreme"]
        + river_component * HAZARD_WEIGHTS["river_proximity"]
        + landslide_component * HAZARD_WEIGHTS["landslide_elevation"]
    )
    return round(score, 2)


def compute_vulnerability_score(h: Habitation) -> float:
    score = (
        h.pct_dilapidated_housing * VULNERABILITY_WEIGHTS["dilapidated"]
        + h.pct_kutcha_roof_wall * VULNERABILITY_WEIGHTS["kutcha"]
        + h.pct_no_drinking_water_premises * VULNERABILITY_WEIGHTS["no_water"]
        + h.pct_no_toilet * VULNERABILITY_WEIGHTS["no_toilet"]
        + h.pct_no_drainage * VULNERABILITY_WEIGHTS["no_drainage"]
    )
    return round(score, 2)


def classify_hazard_level(hazard_score: float, vulnerability_score: float) -> str:
    composite = (hazard_score * 0.6) + (vulnerability_score * 0.4)
    if composite >= 55:
        return Habitation.HazardLevel.RED
    elif composite >= 40:
        return Habitation.HazardLevel.HIGH
    elif composite >= 25:
        return Habitation.HazardLevel.MODERATE
    return Habitation.HazardLevel.SAFE


class Command(BaseCommand):
    help = "Compute hazard_score, vulnerability_score, and hazard_level for all habitations from raw input data."

    def handle(self, *args, **options):
        habitations = Habitation.objects.all()
        updated = 0

        for h in habitations:
            h.hazard_score = compute_hazard_score(h)
            h.vulnerability_score = compute_vulnerability_score(h)
            h.hazard_level = classify_hazard_level(h.hazard_score, h.vulnerability_score)
            h.scored_at = timezone.now()
            h.save()
            updated += 1

        self.stdout.write(self.style.SUCCESS(f"Recomputed hazard/vulnerability scores for {updated} habitations."))