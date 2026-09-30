import random
from django.core.management.base import BaseCommand
from django.contrib.gis.geos import Point
from geodata.models import SafeSite

SITE_NAMES = ["Government Relief Ground", "New Township Site", "Rehabilitation Colony",
              "District Sports Ground", "Agricultural Land Plot", "Forest Clearance Site",
              "Model Village Extension", "State Housing Board Land"]

DISTRICTS = ["Dehradun", "Tehri Garhwal", "Uttarkashi", "Pauri Garhwal", "Rudraprayag"]
CENTER_LAT, CENTER_LON = 30.32, 78.03


class Command(BaseCommand):
    help = "Seed candidate safe relocation sites"

    def add_arguments(self, parser):
        parser.add_argument("--count", type=int, default=15)

    def handle(self, *args, **options):
        count = options["count"]
        for i in range(count):
            lat = CENTER_LAT + random.uniform(-0.6, 0.6)
            lon = CENTER_LON + random.uniform(-0.6, 0.6)
            area = round(random.uniform(2, 40), 1)          # hectares
            density_norm = 150                                # people per hectare, assumed planning norm
            capacity = int(area * density_norm)

            SafeSite.objects.create(
                name=f"{random.choice(SITE_NAMES)} {i+1}",
                district=random.choice(DISTRICTS),
                location=Point(lon, lat),
                available_area_hectares=area,
                estimated_capacity=capacity,
                current_occupied=random.randint(0, int(capacity * 0.3)),
                hazard_score=round(random.uniform(5, 40), 1),  # safe sites are deliberately low-hazard
                road_access=random.choice([True, True, True, False]),
                water_availability=random.choice([True, True, False]),
            )

        self.stdout.write(self.style.SUCCESS(f"Seeded {count} safe sites."))