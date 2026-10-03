"""
RiskOS Real Data Ingestion Pipeline
====================================
Reads OSM villages, Census Excel, Rivers, DEM, and Seismic data.
Populates the Habitation table with real Uttarakhand data.
"""
import json
import os
import sys
import glob
from pathlib import Path
import pandas as pd
from django.core.management.base import BaseCommand
from django.contrib.gis.geos import Point
from django.utils import timezone
from geodata.models import Habitation, SafeSite


# Uttarakhand districts with their approximate bounding boxes for assignment
DISTRICT_BOUNDS = {
    "Uttarkashi":      {"lat_min": 30.4, "lat_max": 31.5, "lon_min": 77.8, "lon_max": 78.8},
    "Chamoli":         {"lat_min": 30.2, "lat_max": 30.9, "lon_min": 79.0, "lon_max": 80.0},
    "Rudraprayag":     {"lat_min": 30.1, "lat_max": 30.6, "lon_min": 78.7, "lon_max": 79.4},
    "Tehri Garhwal":   {"lat_min": 30.1, "lat_max": 30.6, "lon_min": 78.0, "lon_max": 78.8},
    "Dehradun":        {"lat_min": 30.0, "lat_max": 30.8, "lon_min": 77.5, "lon_max": 78.2},
    "Pauri Garhwal":   {"lat_min": 29.6, "lat_max": 30.3, "lon_min": 78.3, "lon_max": 79.3},
    "Pithoragarh":     {"lat_min": 29.5, "lat_max": 30.3, "lon_min": 80.0, "lon_max": 81.1},
    "Bageshwar":       {"lat_min": 29.7, "lat_max": 30.1, "lon_min": 79.5, "lon_max": 80.1},
    "Almora":          {"lat_min": 29.4, "lat_max": 30.0, "lon_min": 79.3, "lon_max": 80.0},
    "Champawat":       {"lat_min": 29.1, "lat_max": 29.6, "lon_min": 79.8, "lon_max": 80.4},
    "Nainital":        {"lat_min": 29.0, "lat_max": 29.6, "lon_min": 79.2, "lon_max": 79.8},
    "Udham Singh Nagar": {"lat_min": 28.8, "lat_max": 29.3, "lon_min": 79.0, "lon_max": 80.0},
    "Haridwar":        {"lat_min": 29.5, "lat_max": 30.2, "lon_min": 77.7, "lon_max": 78.3},
}

# Uttarakhand is primarily in Seismic Zone IV and V
# Zone V: Uttarkashi, Chamoli, Rudraprayag, Pithoragarh, Bageshwar, Champawat
# Zone IV: Dehradun, Tehri Garhwal, Pauri Garhwal, Almora, Nainital, Haridwar, Udham Singh Nagar
DISTRICT_SEISMIC = {
    "Uttarkashi": "V", "Chamoli": "V", "Rudraprayag": "V",
    "Pithoragarh": "V", "Bageshwar": "V", "Champawat": "V",
    "Dehradun": "IV", "Tehri Garhwal": "IV", "Pauri Garhwal": "IV",
    "Almora": "IV", "Nainital": "IV", "Haridwar": "IV",
    "Udham Singh Nagar": "IV",
}


def assign_district(lat, lon):
    """Assign district based on lat/lon using bounding boxes."""
    best = "Unknown"
    best_dist = float('inf')
    for name, bounds in DISTRICT_BOUNDS.items():
        if (bounds["lat_min"] <= lat <= bounds["lat_max"] and
            bounds["lon_min"] <= lon <= bounds["lon_max"]):
            # Calculate distance to center for tie-breaking
            clat = (bounds["lat_min"] + bounds["lat_max"]) / 2
            clon = (bounds["lon_min"] + bounds["lon_max"]) / 2
            d = ((lat - clat)**2 + (lon - clon)**2)**0.5
            if d < best_dist:
                best_dist = d
                best = name
    return best


class Command(BaseCommand):
    help = "Ingest real Uttarakhand data into RiskOS database"

    def handle(self, *args, **options):
        from django.conf import settings
        data_dir = Path(settings.BASE_DIR) / ".." / "data"
        if not data_dir.exists():
            data_dir = Path(settings.BASE_DIR) / "data"

        self.stdout.write(self.style.SUCCESS("=" * 60))
        self.stdout.write(self.style.SUCCESS("  RiskOS Real Data Ingestion Pipeline"))
        self.stdout.write(self.style.SUCCESS("=" * 60))

        # ============================================================
        # STEP 1: Load OSM Villages (15,000+ real villages)
        # ============================================================
        osm_path = data_dir / "census" / "osm_villages.json"
        if not osm_path.exists():
            self.stdout.write(self.style.ERROR(f"FATAL: OSM villages file not found: {osm_path}"))
            return

        self.stdout.write("\n[1/6] Loading OSM Villages...")
        with open(osm_path, 'r', encoding='utf-8') as f:
            osm_data = json.load(f)

        # Filter to nodes with names only
        valid_nodes = [n for n in osm_data['elements'] if n.get('tags', {}).get('name')]
        self.stdout.write(f"  Found {len(valid_nodes)} named settlements in Uttarakhand")

        # Clear existing data
        old_count = Habitation.objects.count()
        Habitation.objects.all().delete()
        self.stdout.write(f"  Cleared {old_count} old habitations")

        # Build habitation objects
        habitations = []
        for node in valid_nodes:
            name = node['tags']['name']
            lat = node['lat']
            lon = node['lon']
            district = assign_district(lat, lon)
            seismic = DISTRICT_SEISMIC.get(district, "IV")

            habitations.append(Habitation(
                name=name,
                state="Uttarakhand",
                district=district,
                location=Point(lon, lat, srid=4326),
                population=100,
                seismic_zone=seismic,
            ))

        # Bulk create in batches
        Habitation.objects.bulk_create(habitations, batch_size=2000)
        self.stdout.write(self.style.SUCCESS(f"  Inserted {len(habitations)} real villages"))

        # ============================================================
        # STEP 2: Census Data (Vulnerability from 13 Excel files)
        # ============================================================
        self.stdout.write("\n[2/6] Processing Census Excel files...")
        excel_files = sorted(glob.glob(str(data_dir / "census" / "*.xlsx")))
        self.stdout.write(f"  Found {len(excel_files)} Excel files")

        # Build a lookup dictionary: lowercase name -> Habitation object
        all_habs = list(Habitation.objects.all())
        hab_by_name = {}
        for h in all_habs:
            key = h.name.strip().lower()
            if key not in hab_by_name:
                hab_by_name[key] = h

        match_count = 0
        census_updates = []

        for excel_file in excel_files:
            fname = Path(excel_file).stem
            self.stdout.write(f"  Reading {fname}.xlsx...")
            try:
                df = pd.read_excel(excel_file, header=None)

                for idx, row in df.iterrows():
                    # Skip header rows
                    rural_urban = str(row.iloc[9]) if len(row) > 9 else ""
                    if rural_urban not in ["Rural", "Total"]:
                        continue

                    area_name = str(row.iloc[8]) if len(row) > 8 else ""
                    if not area_name or area_name == "nan":
                        continue

                    # Only match village-level rows (skip district/sub-district summary)
                    village_code = str(row.iloc[6]) if len(row) > 6 else "0"
                    if village_code in ["000000", "0", "nan"]:
                        continue

                    total_hh = pd.to_numeric(row.iloc[10], errors='coerce') if len(row) > 10 else 0
                    if pd.isna(total_hh) or total_hh <= 0:
                        continue

                    # Extract vulnerability columns (percentage values)
                    def safe_pct(col_idx):
                        if len(row) <= col_idx:
                            return 0.0
                        v = pd.to_numeric(row.iloc[col_idx], errors='coerce')
                        return float(v) if not pd.isna(v) else 0.0

                    # Col 22: Grass/Thatch/Bamboo roof (kutcha indicator)
                    kutcha_roof_pct = safe_pct(22)
                    # Col 31: Grass/Thatch/Bamboo wall (kutcha indicator)
                    kutcha_wall_pct = safe_pct(31)
                    # Col 83: Water source "Away" from premises
                    water_away_pct = safe_pct(83)
                    # Col 101: Open defecation
                    open_defecation_pct = safe_pct(101)
                    # Col 107: No drainage
                    no_drainage_pct = safe_pct(107)

                    # Clean area name for matching
                    clean_name = area_name.strip().lower()
                    # Remove common prefixes like "Village - " etc
                    for prefix in ["village - ", "town - ", "ct - ", "ob - "]:
                        if clean_name.startswith(prefix):
                            clean_name = clean_name[len(prefix):]

                    hab = hab_by_name.get(clean_name)
                    if hab:
                        district_name = str(row.iloc[3]) if len(row) > 3 else hab.district
                        if district_name and district_name != "nan":
                            hab.district = district_name

                        hab.population = max(int(total_hh * 4.5), hab.population)
                        hab.pct_kutcha_roof_wall = min(100.0, kutcha_roof_pct + kutcha_wall_pct)
                        hab.pct_no_drinking_water_premises = min(100.0, water_away_pct)
                        hab.pct_no_toilet = min(100.0, open_defecation_pct)
                        hab.pct_no_drainage = min(100.0, no_drainage_pct)
                        census_updates.append(hab)
                        match_count += 1

            except Exception as e:
                self.stdout.write(self.style.WARNING(f"  Warning: Failed to parse {fname}: {e}"))

        if census_updates:
            Habitation.objects.bulk_update(
                census_updates,
                ['district', 'population', 'pct_kutcha_roof_wall',
                 'pct_no_drinking_water_premises', 'pct_no_toilet', 'pct_no_drainage'],
                batch_size=2000
            )
        self.stdout.write(self.style.SUCCESS(f"  Matched {match_count} villages with Census data"))

        # ============================================================
        # STEP 3: River Proximity (from OSM rivers)
        # ============================================================
        self.stdout.write("\n[3/6] Computing river proximity...")
        rivers_path = data_dir / "rivers" / "uttarakhand_rivers.json"
        if rivers_path.exists():
            with open(rivers_path, 'r', encoding='utf-8') as f:
                rivers_data = json.load(f)

            from django.contrib.gis.geos import LineString, MultiLineString

            river_lines = []
            for element in rivers_data.get('elements', []):
                if element.get('type') == 'way' and 'geometry' in element:
                    coords = [(pt['lon'], pt['lat']) for pt in element['geometry']]
                    if len(coords) >= 2:
                        try:
                            river_lines.append(LineString(coords, srid=4326))
                        except Exception:
                            pass

            self.stdout.write(f"  Loaded {len(river_lines)} river segments")

            if river_lines:
                # Merge all river segments into one MultiLineString
                all_rivers = MultiLineString(river_lines, srid=4326)

                # Use raw SQL for fast batch update
                from django.db import connection
                with connection.cursor() as cursor:
                    cursor.execute("""
                        UPDATE geodata_habitation
                        SET distance_to_river_km = GREATEST(0.1,
                            ST_DistanceSphere(
                                location::geometry,
                                ST_SetSRID(ST_GeomFromGeoJSON(%s), 4326)
                            ) / 1000.0
                        )
                    """, [all_rivers.geojson])
                self.stdout.write(self.style.SUCCESS("  River distances computed via PostGIS"))
        else:
            self.stdout.write(self.style.WARNING("  Rivers file not found, skipping."))

        # ============================================================
        # STEP 4: DEM Elevation
        # ============================================================
        self.stdout.write("\n[4/6] Extracting elevation from DEM...")
        dem_path = data_dir / "dem" / "uttarakhand_dem.tif"
        if dem_path.exists():
            try:
                import rasterio
                with rasterio.open(str(dem_path)) as src:
                    habs = list(Habitation.objects.all())
                    batch = []
                    for i, hab in enumerate(habs):
                        try:
                            for val in src.sample([(hab.location.x, hab.location.y)]):
                                elev = float(val[0])
                                if elev > 0:
                                    hab.elevation_m = elev
                                    batch.append(hab)
                                break
                        except Exception:
                            pass
                        if (i + 1) % 5000 == 0:
                            self.stdout.write(f"  Processed {i+1}/{len(habs)} elevations...")

                    Habitation.objects.bulk_update(batch, ['elevation_m'], batch_size=2000)
                    self.stdout.write(self.style.SUCCESS(f"  Updated elevation for {len(batch)} villages"))
            except ImportError:
                self.stdout.write(self.style.WARNING("  rasterio not installed. Skipping DEM."))
        else:
            self.stdout.write(self.style.WARNING(f"  DEM file not found at {dem_path}. Skipping."))

        # ============================================================
        # STEP 5: Compute Risk Scores
        # ============================================================
        self.stdout.write("\n[5/6] Computing AI Risk Scores...")
        from geodata.management.commands.compute_hazard_scores import (
            compute_hazard_score, compute_vulnerability_score, classify_hazard_level
        )

        habs = list(Habitation.objects.all())
        now = timezone.now()
        for h in habs:
            h.hazard_score = compute_hazard_score(h)
            h.vulnerability_score = compute_vulnerability_score(h)
            h.hazard_level = classify_hazard_level(h.hazard_score, h.vulnerability_score)
            h.scored_at = now

        Habitation.objects.bulk_update(
            habs,
            ['hazard_score', 'vulnerability_score', 'hazard_level', 'scored_at'],
            batch_size=2000
        )

        # Stats
        red = sum(1 for h in habs if h.hazard_level == 'RED')
        high = sum(1 for h in habs if h.hazard_level == 'HIGH')
        mod = sum(1 for h in habs if h.hazard_level == 'MODERATE')
        safe = sum(1 for h in habs if h.hazard_level == 'SAFE')

        self.stdout.write(self.style.SUCCESS(f"  Scored {len(habs)} habitations"))
        self.stdout.write(f"    RED:      {red}")
        self.stdout.write(f"    HIGH:     {high}")
        self.stdout.write(f"    MODERATE: {mod}")
        self.stdout.write(f"    SAFE:     {safe}")

        # ============================================================
        # STEP 6: Generate Real Safe Sites
        # ============================================================
        self.stdout.write("\n[6/6] Generating Safe Sites...")
        SafeSite.objects.all().delete()

        safe_sites_data = [
            # ── 1. STRATEGIC HELIPADS & AIR BASES ──
            ("Joshimath Army Helipad", "Chamoli", 30.5570, 79.5710, 15, 1200),
            ("Gauchar Airstrip & Helipad", "Chamoli", 30.2880, 79.1560, 45, 4500),
            ("Harsil Army Helipad", "Uttarkashi", 31.0370, 78.7360, 20, 1500),
            ("Chinyalisaur Airstrip Helipad", "Uttarkashi", 30.5600, 78.3300, 50, 4000),
            ("Agastyamuni Helipad", "Rudraprayag", 30.3920, 79.0280, 25, 2000),
            ("Phata Emergency Helipad", "Rudraprayag", 30.5730, 79.0390, 15, 1200),
            ("Kedarnath Base Helipad", "Rudraprayag", 30.7320, 79.0660, 10, 800),
            ("Dharchula Army Helipad", "Pithoragarh", 29.8490, 80.5390, 20, 1500),
            ("Naini Saini Airstrip Helipad", "Pithoragarh", 29.5930, 80.2440, 40, 3500),
            ("Jolly Grant Strategic Helipad", "Dehradun", 30.1900, 78.1800, 60, 5000),
            ("Roorkee Army Camp & Helipad", "Haridwar", 29.8543, 77.8880, 60, 6000),

            # ── 2. HOSPITALS & EMERGENCY HEALTH CENTERS ──
            ("Joshimath Military & Emergency Hospital", "Chamoli", 30.5560, 79.5660, 20, 1500),
            ("Gopeshwar District Hospital", "Chamoli", 30.4120, 79.3240, 25, 2000),
            ("Uttarkashi District Hospital Emergency", "Uttarkashi", 30.7310, 78.4410, 30, 2500),
            ("Rudraprayag District Hospital", "Rudraprayag", 30.2860, 78.9830, 20, 1800),
            ("Srinagar Medical College & Base Hospital", "Pauri Garhwal", 30.2240, 78.7840, 50, 4000),
            ("Pithoragarh Base Hospital", "Pithoragarh", 29.5840, 80.2190, 25, 2200),
            ("New Tehri District Hospital Emergency", "Tehri Garhwal", 30.3820, 78.4320, 25, 2000),
            ("Bageshwar District Hospital", "Bageshwar", 29.8390, 79.7720, 20, 1500),
            ("Doon Hospital Emergency Center", "Dehradun", 30.3210, 78.0380, 60, 5500),
            ("Haldwani Sushila Tiwari Hospital", "Nainital", 29.2190, 79.5160, 55, 5000),

            # ── 3. EVACUATION SCHOOLS & COLLEGES ──
            ("GIC Joshimath Evacuation School", "Chamoli", 30.5540, 79.5630, 12, 1200),
            ("GIC Gopeshwar Relief School", "Chamoli", 30.4090, 79.3210, 15, 1500),
            ("Kendriya Vidyalaya Uttarkashi Relief Campus", "Uttarkashi", 30.7280, 78.4360, 18, 1600),
            ("GIC Agastyamuni Evacuation College", "Rudraprayag", 30.3890, 79.0270, 15, 1400),
            ("GIC Srinagar Garhwal Inter College", "Pauri Garhwal", 30.2210, 78.7810, 20, 1800),
            ("GIC Dharchula Border Evacuation School", "Pithoragarh", 29.8510, 80.5370, 14, 1100),
            ("GIC New Tehri Vidyalaya Relief Campus", "Tehri Garhwal", 30.3810, 78.4330, 16, 1500),
            ("GIC Bageshwar Relief School", "Bageshwar", 29.8370, 79.7700, 15, 1300),

            # ── 4. RELIEF RATION & FOOD SUPPLY DEPOTS ──
            ("FCI Joshimath Relief Ration Depot", "Chamoli", 30.5530, 79.5620, 15, 2000),
            ("Pipalkoti Transit Ration Depot", "Chamoli", 30.4320, 79.4310, 12, 1500),
            ("Uttarkashi District Food Depot", "Uttarkashi", 30.7250, 78.4320, 20, 2200),
            ("Tilwara Relief Ration Depot", "Rudraprayag", 30.3470, 78.9710, 14, 1600),
            ("Srinagar Central Relief Ration Depot", "Pauri Garhwal", 30.2180, 78.7850, 25, 2500),
            ("Pithoragarh Food Supply Transit Depot", "Pithoragarh", 29.5810, 80.2160, 20, 2000),
            ("Almora Central Food Depot", "Almora", 29.5950, 79.6570, 20, 2200),

            # ── 5. EARLY WARNING SIRENS & RADAR TOWERS ──
            ("Joshimath Early Warning Siren Tower", "Chamoli", 30.5580, 79.5680, 5, 500),
            ("Raini Flash-Flood Warning Siren", "Chamoli", 30.4900, 79.6900, 5, 500),
            ("Bhagirathi Basin Warning Siren Tower", "Uttarkashi", 30.7300, 78.4380, 5, 500),
            ("Mandakini Valley Radar Siren Tower", "Rudraprayag", 30.2870, 78.9810, 5, 500),
            ("Alaknanda Basin Emergency Siren", "Pauri Garhwal", 30.2220, 78.7820, 5, 500),
            ("Kali River Early Warning Siren Tower", "Pithoragarh", 29.8500, 80.5400, 5, 500),

            # ── 6. STRATEGIC RELIEF SHELTERS & TRANSIT CAMPS ──
            ("Dehradun City Shelter", "Dehradun", 30.3165, 78.0322, 50, 5000),
            ("Haridwar Transit Camp", "Haridwar", 29.9457, 78.1642, 30, 3000),
            ("Rishikesh Relief Center", "Dehradun", 30.0869, 78.2676, 20, 2000),
            ("Haldwani Safe Zone", "Nainital", 29.2183, 79.5130, 40, 4000),
            ("Kotdwar Relief Camp", "Pauri Garhwal", 29.7487, 78.5260, 15, 1500),
            ("Rudrapur Shelter", "Udham Singh Nagar", 28.9740, 79.3960, 35, 3500),
            ("Kashipur Transit Camp", "Udham Singh Nagar", 29.2104, 78.9617, 25, 2500),
            ("Srinagar (Garhwal) Camp", "Pauri Garhwal", 30.2192, 78.7837, 10, 1000),
            ("New Tehri Relief Center", "Tehri Garhwal", 30.3800, 78.4300, 12, 1200),
            ("Gopeshwar Transit Camp", "Chamoli", 30.4100, 79.3200, 8, 800),
            ("Almora District Shelter", "Almora", 29.5971, 79.6591, 15, 1500),
            ("Pithoragarh Relief Camp", "Pithoragarh", 29.5827, 80.2181, 12, 1200),
            ("Bageshwar Safe Zone", "Bageshwar", 29.8377, 79.7710, 8, 800),
            ("Champawat Transit Camp", "Champawat", 29.3360, 80.0900, 10, 1000),
            ("Uttarkashi Emergency Camp", "Uttarkashi", 30.7268, 78.4354, 10, 1000),
            ("Rudraprayag Relief Center", "Rudraprayag", 30.2840, 78.9800, 8, 800),
            ("Ramnagar Safe Zone", "Nainital", 29.3940, 79.1300, 20, 2000),
            ("Vikasnagar Camp", "Dehradun", 30.4700, 77.7700, 15, 1500),
            ("Mussoorie Emergency Center", "Dehradun", 30.4598, 78.0644, 8, 800),
        ]

        sites = []
        for name, district, lat, lon, area, capacity in safe_sites_data:
            sites.append(SafeSite(
                name=name,
                district=district,
                location=Point(lon, lat, srid=4326),
                available_area_hectares=area,
                estimated_capacity=capacity,
                current_occupied=0,
                hazard_score=5.0,
                road_access=True,
                water_availability=True,
            ))
        SafeSite.objects.bulk_create(sites)
        self.stdout.write(self.style.SUCCESS(f"  Created {len(sites)} real safe sites across Uttarakhand"))

        # ============================================================
        # SUMMARY
        # ============================================================
        total = Habitation.objects.count()
        total_pop = sum(h.population for h in Habitation.objects.all())
        self.stdout.write("\n" + "=" * 60)
        self.stdout.write(self.style.SUCCESS("  INGESTION COMPLETE"))
        self.stdout.write("=" * 60)
        self.stdout.write(f"  Total Habitations: {total}")
        self.stdout.write(f"  Total Population:  {total_pop:,}")
        self.stdout.write(f"  Total Safe Sites:  {SafeSite.objects.count()}")
        self.stdout.write(f"  Census Matches:    {match_count}")
        self.stdout.write("=" * 60)
