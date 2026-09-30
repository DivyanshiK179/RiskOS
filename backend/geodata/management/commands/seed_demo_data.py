import random
from django.core.management.base import BaseCommand
from django.contrib.gis.geos import Point
from geodata.models import Habitation

# Rough village-name-like generator for demo purposes
NAME_PREFIXES = ["Rampur", "Shivpuri", "Chandangaon", "Bhatwari", "Lakhanpur",
                  "Nagla", "Devgarh", "Kotdwar", "Malhotra", "Sundarpur",
                  "Bindal", "Ghati", "Narendranagar", "Tapovan", "Rishikesh"]
SUFFIXES = ["Khas", "Kalan", "Purwa", "Nagar", "Basti", ""]

DISTRICTS = ["Dehradun", "Tehri Garhwal", "Uttarkashi", "Pauri Garhwal", "Rudraprayag"]

# Center roughly on Uttarakhand pilot region
CENTER_LAT, CENTER_LON = 30.32, 78.03


class Command(BaseCommand):
    help = "Seed realistic demo habitations with RAW hazard/vulnerability inputs (not final scores)"

    def add_arguments(self, parser):
        parser.add_argument("--count", type=int, default=40)

    def handle(self, *args, **options):
        count = options["count"]
        created = 0

        for i in range(count):
            lat = CENTER_LAT + random.uniform(-0.6, 0.6)
            lon = CENTER_LON + random.uniform(-0.6, 0.6)
            name = f"{random.choice(NAME_PREFIXES)} {random.choice(SUFFIXES)}".strip()

            Habitation.objects.create(
                name=name,
                district=random.choice(DISTRICTS),
                state="Uttarakhand",
                location=Point(lon, lat),
                population=random.randint(150, 5000),

                seismic_zone=random.choice(["III", "IV", "IV", "V"]),  # Himalayan belt skews high
                avg_annual_rainfall_mm=random.uniform(1200, 2800),
                extreme_rainfall_days=random.randint(2, 25),
                distance_to_river_km=round(random.uniform(0.1, 8.0), 2),
                elevation_m=random.uniform(300, 2200),
                distance_to_coast_km=999,  # Uttarakhand is landlocked; keep field consistent, irrelevant here

                pct_dilapidated_housing=round(random.uniform(2, 35), 1),
                pct_kutcha_roof_wall=round(random.uniform(5, 60), 1),
                pct_no_drinking_water_premises=round(random.uniform(5, 50), 1),
                pct_no_toilet=round(random.uniform(2, 40), 1),
                pct_no_drainage=round(random.uniform(10, 55), 1),
            )
            created += 1

        self.stdout.write(self.style.SUCCESS(f"Seeded {created} demo habitations (raw data only, unscored)."))