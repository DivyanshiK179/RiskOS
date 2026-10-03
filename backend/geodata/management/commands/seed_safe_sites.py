from django.core.management.base import BaseCommand
from django.contrib.gis.geos import Point
from geodata.models import SafeSite

class Command(BaseCommand):
    help = "Seed realistic safe sites, helipads, hospitals, schools, ration depots, and sirens across all Uttarakhand districts"

    def handle(self, *args, **options):
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
        self.stdout.write(self.style.SUCCESS(f"Successfully seeded {len(sites)} safe sites & emergency facilities across Uttarakhand."))