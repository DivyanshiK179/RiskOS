import os
import joblib
import pandas as pd
import numpy as np
import xgboost as xgb
from sklearn.ensemble import IsolationForest
from sklearn.preprocessing import StandardScaler
from django.core.management.base import BaseCommand
from django.utils import timezone
from geodata.models import Habitation

class Command(BaseCommand):
    help = "Train and run ML models (XGBoost for Hazard, Isolation Forest for Vulnerability) to score risk."

    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS("Starting AI Model Training & Inference..."))

        # Create model directory
        model_dir = "backend/ai_engine/models"
        os.makedirs(model_dir, exist_ok=True)

        # 1. Fetch Data
        habitations = list(Habitation.objects.all())
        if not habitations:
            self.stdout.write(self.style.ERROR("No habitations found in DB!"))
            return

        data = []
        for h in habitations:
            # Map seismic zone to numeric
            sz_map = {'II': 2, 'III': 3, 'IV': 4, 'V': 5}
            sz_num = sz_map.get(h.seismic_zone, 3)

            data.append({
                'id': h.id,
                'seismic_zone_num': sz_num,
                'elevation_m': h.elevation_m,
                'distance_to_river_km': h.distance_to_river_km,
                'extreme_rainfall_days': h.extreme_rainfall_days,
                'pct_dilapidated': h.pct_dilapidated_housing,
                'pct_kutcha': h.pct_kutcha_roof_wall,
                'pct_no_water': h.pct_no_drinking_water_premises,
                'pct_no_toilet': h.pct_no_toilet,
                'pct_no_drainage': h.pct_no_drainage,
            })
        
        df = pd.DataFrame(data)

        # ==========================================
        # AI AGENT 1: HAZARD PREDICTION (XGBOOST)
        # ==========================================
        self.stdout.write("Training Hazard Prediction Agent (XGBoost)...")
        
        # Features for hazard
        hazard_features = ['seismic_zone_num', 'elevation_m', 'distance_to_river_km', 'extreme_rainfall_days']
        X_hazard = df[hazard_features]

        # Since we lack real historical disaster labels, we generate a synthetic but logical historical target
        # high seismic OR (low elevation AND close to river) -> prone to disaster
        # We add some random noise to make the model actually learn patterns rather than a strict rule
        np.random.seed(42)
        base_risk = (
            (df['seismic_zone_num'] >= 4).astype(int) * 0.4 + 
            (df['elevation_m'] < 1500).astype(int) * 0.3 + 
            (df['distance_to_river_km'] < 2.0).astype(int) * 0.4
        )
        noise = np.random.normal(0, 0.2, len(df))
        historical_disaster_prob = np.clip(base_risk + noise, 0, 1)
        # Binary target: 1 if disaster occurred in past, 0 otherwise
        y_hazard = (historical_disaster_prob > 0.6).astype(int)

        # Train XGBoost
        xgb_model = xgb.XGBClassifier(n_estimators=100, max_depth=4, learning_rate=0.1, random_state=42)
        xgb_model.fit(X_hazard, y_hazard)
        
        # Save model
        joblib.dump(xgb_model, f"{model_dir}/xgboost_hazard_model.pkl")

        # Predict hazard probability (0.0 to 1.0)
        hazard_probs = xgb_model.predict_proba(X_hazard)[:, 1]


        # ==========================================
        # AI AGENT 2: VULNERABILITY (ISOLATION FOREST)
        # ==========================================
        self.stdout.write("Training Vulnerability Agent (Isolation Forest)...")
        
        # We use unsupervised anomaly detection to find the most vulnerable/anomalous villages
        vuln_features = ['pct_dilapidated', 'pct_kutcha', 'pct_no_water', 'pct_no_toilet', 'pct_no_drainage']
        X_vuln = df[vuln_features]

        # Scale features
        scaler = StandardScaler()
        X_vuln_scaled = scaler.fit_transform(X_vuln)
        joblib.dump(scaler, f"{model_dir}/vuln_scaler.pkl")

        # Train Isolation Forest (assumes ~10% are highly vulnerable anomalies)
        iso_forest = IsolationForest(contamination=0.1, random_state=42)
        iso_forest.fit(X_vuln_scaled)
        joblib.dump(iso_forest, f"{model_dir}/iso_forest_vuln_model.pkl")

        # Anomaly score: negative means more anomalous (more vulnerable)
        # We normalize it to 0.0 - 1.0 (1.0 being highly vulnerable)
        vuln_anomaly_scores = iso_forest.decision_function(X_vuln_scaled)
        # Invert so lower score (more anomalous) becomes higher vulnerability
        vuln_probs = 1.0 - ((vuln_anomaly_scores - vuln_anomaly_scores.min()) / (vuln_anomaly_scores.max() - vuln_anomaly_scores.min()))


        # ==========================================
        # ENSEMBLE & DATABASE UPDATE
        # ==========================================
        self.stdout.write("Combining AI Agents and updating database...")
        
        updated_habs = []
        now = timezone.now()

        for i, h in enumerate(habitations):
            # Scale to 0-100
            ai_hazard_score = hazard_probs[i] * 100
            ai_vuln_score = vuln_probs[i] * 100

            # Ensemble combination (60% Hazard, 40% Vulnerability)
            composite_score = (ai_hazard_score * 0.6) + (ai_vuln_score * 0.4)

            # Classify based on AI composite score
            if composite_score >= 70:
                h_level = Habitation.HazardLevel.RED
            elif composite_score >= 50:
                h_level = Habitation.HazardLevel.HIGH
            elif composite_score >= 30:
                h_level = Habitation.HazardLevel.MODERATE
            else:
                h_level = Habitation.HazardLevel.SAFE

            h.hazard_score = round(ai_hazard_score, 2)
            h.vulnerability_score = round(ai_vuln_score, 2)
            h.hazard_level = h_level
            h.scored_at = now
            updated_habs.append(h)

        # Bulk update
        Habitation.objects.bulk_update(
            updated_habs, 
            ['hazard_score', 'vulnerability_score', 'hazard_level', 'scored_at'],
            batch_size=2000
        )

        red = sum(1 for h in updated_habs if h.hazard_level == 'RED')
        high = sum(1 for h in updated_habs if h.hazard_level == 'HIGH')
        mod = sum(1 for h in updated_habs if h.hazard_level == 'MODERATE')
        safe = sum(1 for h in updated_habs if h.hazard_level == 'SAFE')

        self.stdout.write(self.style.SUCCESS("=" * 50))
        self.stdout.write(self.style.SUCCESS("  AI MODEL INFERENCE COMPLETE"))
        self.stdout.write("=" * 50)
        self.stdout.write(f"  RED:      {red}")
        self.stdout.write(f"  HIGH:     {high}")
        self.stdout.write(f"  MODERATE: {mod}")
        self.stdout.write(f"  SAFE:     {safe}")
        self.stdout.write("=" * 50)
        self.stdout.write(self.style.SUCCESS("Models saved in backend/ai_engine/models/"))
