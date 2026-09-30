from django.contrib.gis.db import models


class Habitation(models.Model):
    class HazardLevel(models.TextChoices):
        SAFE = "SAFE", "Safe"
        MODERATE = "MODERATE", "Moderate Risk"
        HIGH = "HIGH", "High Risk"
        RED = "RED", "Red Zone"

    class SeismicZone(models.TextChoices):
        ZONE_II = "II", "Zone II (Low)"
        ZONE_III = "III", "Zone III (Moderate)"
        ZONE_IV = "IV", "Zone IV (High)"
        ZONE_V = "V", "Zone V (Very High)"

    name = models.CharField(max_length=200)
    district = models.CharField(max_length=100)
    state = models.CharField(max_length=100)
    location = models.PointField(geography=True)
    population = models.IntegerField(default=0)

    # --- Raw hazard inputs (feed the scoring engine) ---
    seismic_zone = models.CharField(max_length=5, choices=SeismicZone.choices, default=SeismicZone.ZONE_III)
    avg_annual_rainfall_mm = models.FloatField(default=0)       # from IMD subdivision data
    extreme_rainfall_days = models.IntegerField(default=0)      # days/year with rainfall > 100mm, proxy for cloudburst/flood risk
    distance_to_river_km = models.FloatField(default=5.0)       # flood proxy
    elevation_m = models.FloatField(default=500)                # landslide proxy (simplified: lower elevation + hilly district = higher risk in our rule)
    distance_to_coast_km = models.FloatField(default=500.0)     # coastal erosion proxy

    # --- Raw vulnerability inputs (from HLPCA-style housing data) ---
    pct_dilapidated_housing = models.FloatField(default=0)      # % of houses in poor condition
    pct_kutcha_roof_wall = models.FloatField(default=0)         # % with non-permanent roof/wall material
    pct_no_drinking_water_premises = models.FloatField(default=0)
    pct_no_toilet = models.FloatField(default=0)
    pct_no_drainage = models.FloatField(default=0)

    # --- Computed outputs (written by the scoring engine, not by hand) ---
    hazard_score = models.FloatField(default=0)
    vulnerability_score = models.FloatField(default=0)
    hazard_level = models.CharField(max_length=20, choices=HazardLevel.choices, default=HazardLevel.SAFE)
    scored_at = models.DateTimeField(null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def score_breakdown(self):
        from geodata.management.commands.compute_hazard_scores import (
            SEISMIC_ZONE_SCORE, HAZARD_WEIGHTS, VULNERABILITY_WEIGHTS, normalize
        )

        seismic_component = SEISMIC_ZONE_SCORE.get(self.seismic_zone, 45)
        rainfall_component = normalize(self.extreme_rainfall_days, 0, 30)
        river_component = normalize(8 - self.distance_to_river_km, 0, 8)
        landslide_component = normalize(2200 - self.elevation_m, 0, 1900)

        return {
            "hazard": {
                "seismic": round(seismic_component * HAZARD_WEIGHTS["seismic"], 1),
                "rainfall_extreme": round(rainfall_component * HAZARD_WEIGHTS["rainfall_extreme"], 1),
                "river_proximity": round(river_component * HAZARD_WEIGHTS["river_proximity"], 1),
                "landslide_elevation": round(landslide_component * HAZARD_WEIGHTS["landslide_elevation"], 1),
            },
            "vulnerability": {
                "dilapidated_housing": round(self.pct_dilapidated_housing * VULNERABILITY_WEIGHTS["dilapidated"], 1),
                "kutcha_roof_wall": round(self.pct_kutcha_roof_wall * VULNERABILITY_WEIGHTS["kutcha"], 1),
                "no_drinking_water": round(self.pct_no_drinking_water_premises * VULNERABILITY_WEIGHTS["no_water"], 1),
                "no_toilet": round(self.pct_no_toilet * VULNERABILITY_WEIGHTS["no_toilet"], 1),
                "no_drainage": round(self.pct_no_drainage * VULNERABILITY_WEIGHTS["no_drainage"], 1),
            },
        }
    
    def __str__(self):
        return f"{self.name}, {self.district}"


class SafeSite(models.Model):
    name = models.CharField(max_length=200)
    district = models.CharField(max_length=100)
    location = models.PointField(geography=True)
    available_area_hectares = models.FloatField()
    estimated_capacity = models.IntegerField()
    current_occupied = models.IntegerField(default=0)
    hazard_score = models.FloatField(default=0)
    road_access = models.BooleanField(default=True)
    water_availability = models.BooleanField(default=True)

    def remaining_capacity(self):
        return max(self.estimated_capacity - self.current_occupied, 0)

    def __str__(self):
        return self.name