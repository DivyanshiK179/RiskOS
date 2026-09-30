import requests
from django.core.management.base import BaseCommand
from relocation.models import Alert
from django.contrib.auth import get_user_model

class Command(BaseCommand):
    help = "Automatically fetches live weather alerts (Open-Meteo) and creates RiskOS Alerts"

    def handle(self, *args, **options):
        self.stdout.write("Fetching live weather data for Uttarakhand...")
        
        # Coordinates for Uttarakhand center (approx)
        lat = 30.0668
        lon = 79.0193
        
        url = f"https://api.open-meteo.com/v1/forecast?latitude={lat}&longitude={lon}&daily=precipitation_sum&timezone=Asia/Kolkata&forecast_days=1"
        
        try:
            res = requests.get(url, timeout=10)
            data = res.json()
        except Exception as e:
            self.stdout.write(self.style.ERROR(f"Weather API failed: {e}"))
            return
            
        precip = data.get("daily", {}).get("precipitation_sum", [0])[0]
        
        self.stdout.write(f"Live Precipitation Forecast: {precip} mm")
        
        # Superadmin for creation
        User = get_user_model()
        admin = User.objects.filter(role="SUPERADMIN").first()
        
        if precip > 50:
            Alert.objects.create(
                title="AUTOMATED: Heavy Rainfall Warning",
                message=f"Live sensors detect impending heavy rainfall ({precip}mm). Flash floods likely in low-lying areas and river valleys.",
                severity="CRITICAL",
                created_by=admin
            )
            self.stdout.write(self.style.ERROR("CRITICAL Alert automatically triggered!"))
        elif precip > 20:
            Alert.objects.create(
                title="AUTOMATED: Moderate Rainfall Warning",
                message=f"Live sensors detect moderate rainfall ({precip}mm). Monitor river levels.",
                severity="WARNING",
                created_by=admin
            )
            self.stdout.write(self.style.WARNING("WARNING Alert automatically triggered!"))
        else:
            self.stdout.write(self.style.SUCCESS("Weather is clear. No automated alerts needed."))
            
        self.stdout.write(self.style.SUCCESS("Live Weather Sync Complete."))
