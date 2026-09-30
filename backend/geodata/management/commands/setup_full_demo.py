import random
from django.core.management.base import BaseCommand
from django.core.management import call_command
from django.contrib.auth import get_user_model
from django.contrib.gis.geos import Point
from geodata.models import Habitation, SafeSite
from relocation.models import RelocationPlan, Alert

User = get_user_model()

DISTRICTS = {
    "Dehradun": (30.32, 78.03),
    "Tehri Garhwal": (30.38, 78.48),
    "Uttarkashi": (30.72, 78.44),
    "Pauri Garhwal": (29.88, 79.00),
    "Rudraprayag": (30.28, 79.01),
    "Chamoli": (30.45, 79.32),
    "Pithoragarh": (29.58, 80.22),
    "Bageshwar": (29.83, 79.77),
    "Almora": (29.60, 79.65),
    "Nainital": (29.39, 79.45),
}

VILLAGE_PREFIXES = ["Dev", "Ram", "Nand", "Gopal", "Shiva", "Badr", "Kedar", "Hari", "Malla", "Talla"]
VILLAGE_SUFFIXES = ["pur", "gaon", "nagar", "prayag", "khal", "tal", "kote"]

def generate_village_name():
    return random.choice(VILLAGE_PREFIXES) + random.choice(VILLAGE_SUFFIXES)

class Command(BaseCommand):
    help = "Setup full demo data for RiskSetu"

    def handle(self, *args, **kwargs):
        # 1. Create demo users
        official, _ = User.objects.get_or_create(username="official", defaults={
            "role": "OFFICIAL",
            "is_staff": False,
            "department": "SDMA Uttarakhand",
            "district": "Dehradun"
        })
        official.set_password("RiskSetu@2026")
        official.save()

        superadmin, _ = User.objects.get_or_create(username="superadmin", defaults={
            "role": "SUPERADMIN",
            "is_staff": True,
            "is_superuser": True,
            "department": "NDMA"
        })
        superadmin.set_password("Admin@RS2026")
        superadmin.save()

        field1, _ = User.objects.get_or_create(username="field1", defaults={
            "role": "OFFICIAL",
            "department": "NDRF 8th Bn",
            "district": "Tehri Garhwal"
        })
        field1.set_password("Field@RS1")
        field1.save()

        # 2. Seed habitations
        current_hab_count = Habitation.objects.count()
        if current_hab_count < 60:
            to_create = 80 - current_hab_count
            habs = []
            for _ in range(to_create):
                dist_name = random.choice(list(DISTRICTS.keys()))
                center_lat, center_lon = DISTRICTS[dist_name]
                # jitter lat/lon slightly
                lat = center_lat + random.uniform(-0.1, 0.1)
                lon = center_lon + random.uniform(-0.1, 0.1)
                
                habs.append(Habitation(
                    name=generate_village_name() + f" {random.randint(1, 100)}",
                    district=dist_name,
                    state="Uttarakhand",
                    location=Point(lon, lat),
                    population=random.randint(100, 5000),
                    seismic_zone=random.choice(["II", "III", "IV", "V"]),
                    avg_annual_rainfall_mm=random.uniform(1000, 3000),
                    extreme_rainfall_days=random.randint(0, 40),
                    distance_to_river_km=random.uniform(0.1, 20),
                    elevation_m=random.uniform(300, 3500),
                    pct_dilapidated_housing=random.uniform(0, 100),
                    pct_kutcha_roof_wall=random.uniform(0, 100),
                    pct_no_drinking_water_premises=random.uniform(0, 100),
                    pct_no_toilet=random.uniform(0, 100),
                    pct_no_drainage=random.uniform(0, 100)
                ))
            Habitation.objects.bulk_create(habs)
            self.stdout.write(f"Seeded {to_create} habitations.")

        # 3. Seed safe sites
        current_safe_count = SafeSite.objects.count()
        if current_safe_count < 25:
            to_create = 30 - current_safe_count
            safes = []
            for _ in range(to_create):
                dist_name = random.choice(list(DISTRICTS.keys()))
                center_lat, center_lon = DISTRICTS[dist_name]
                lat = center_lat + random.uniform(-0.1, 0.1)
                lon = center_lon + random.uniform(-0.1, 0.1)
                
                capacity = random.randint(50, 1000)
                safes.append(SafeSite(
                    name=f"Safe Shelter {generate_village_name()}",
                    district=dist_name,
                    location=Point(lon, lat),
                    available_area_hectares=random.uniform(0.5, 5.0),
                    estimated_capacity=capacity,
                    current_occupied=random.randint(0, capacity // 2),
                    hazard_score=random.uniform(0, 30),
                    road_access=random.choice([True, False]),
                    water_availability=random.choice([True, False])
                ))
            SafeSite.objects.bulk_create(safes)
            self.stdout.write(f"Seeded {to_create} safe sites.")

        # 4. Compute hazard scores
        call_command('compute_hazard_scores')

        # 5. Create relocation plans
        if RelocationPlan.objects.count() == 0:
            high_risk = list(Habitation.objects.filter(hazard_level__in=["RED", "HIGH"])[:5])
            safe_sites = list(SafeSite.objects.all()[:5])
            plans = []
            for i, hab in enumerate(high_risk):
                if i < len(safe_sites):
                    plans.append(RelocationPlan(
                        habitation=hab,
                        safe_site=safe_sites[i],
                        priority=random.choice(["IMMEDIATE", "SHORT_TERM"]),
                        population_to_relocate=hab.population,
                        created_by=official
                    ))
            RelocationPlan.objects.bulk_create(plans)
            self.stdout.write(f"Seeded {len(plans)} relocation plans.")

        # 6. Create alerts
        if Alert.objects.count() == 0:
            hab = Habitation.objects.first()
            alerts = [
                Alert(title="Heavy rainfall warning", message="Expect 100mm rain", severity="INFO", habitation=hab, created_by=official),
                Alert(title="Landslide possible", message="Soil moisture is high", severity="WARNING", habitation=hab, created_by=official),
                Alert(title="Evacuate immediately", message="River breached banks", severity="CRITICAL", habitation=hab, created_by=official)
            ]
            Alert.objects.bulk_create(alerts)
            self.stdout.write("Seeded 3 alerts.")

        self.stdout.write(self.style.SUCCESS("Demo setup complete!"))
