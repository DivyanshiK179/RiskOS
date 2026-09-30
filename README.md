# RiskSetu — Setup & Run Guide

> Geospatial Disaster Risk Assessment & Relocation Decision Support System  
> Stack: Django 5.2 · PostGIS · DRF · React · Vite · TypeScript · MapLibre GL · TailwindCSS

---

## Prerequisites

| Requirement | Version | Notes |
|---|---|---|
| Python | 3.11+ | venv at `./myenv` |
| Node.js | 18+ | npm 9+ |
| Docker Desktop | any | for PostGIS |
| OSGeo4W | installed | GDAL/GEOS for Django GIS |

---

## 1. Start the Database (Docker PostGIS)

```powershell
docker run -d `
  --name risksetu-postgis `
  -e POSTGRES_PASSWORD=APS@ST29 `
  -e POSTGRES_DB=postgres `
  -p 5432:5432 `
  postgis/postgis:16-3.4
```

If the container already exists and is stopped:
```powershell
docker start risksetu-postgis
```

Check it's running:
```powershell
docker ps | findstr risksetu
```

---

## 2. Backend Setup

### Install dependencies (first time only)
```powershell
cd "d:\Study Area\RiskSetu"
.\myenv\Scripts\pip.exe install -r backend\requirements.txt
```

### Apply migrations
```powershell
.\myenv\Scripts\python.exe backend/manage.py migrate
```

### Seed demo data (creates users, habitations, safe sites, computes scores)
```powershell
.\myenv\Scripts\python.exe backend/manage.py setup_full_demo
```

### Create your own superuser (optional)
```powershell
.\myenv\Scripts\python.exe backend/manage.py createsuperuser
```

### Run the backend dev server
```powershell
.\myenv\Scripts\python.exe backend/manage.py runserver
```

Backend runs at: **http://localhost:8000**

---

## 3. Frontend Setup

### Install dependencies (first time only)
```powershell
cd "d:\Study Area\RiskSetu\frontend"
npm install
```

### Run the dev server
```powershell
npm run dev
```

Frontend runs at: **http://localhost:5173**

---

## 4. Demo Credentials

| Username | Password | Role | Access |
|---|---|---|---|
| `official` | `RiskSetu@2026` | OFFICIAL | Full dashboard access |
| `superadmin` | `Admin@RS2026` | SUPERADMIN | Full dashboard + system console |
| `field1` | `Field@RS1` | OFFICIAL | Field officer view |
| `Aditya` | *(original password)* | OFFICIAL | Original admin |

**Developer database admin:** http://localhost:8000/system-console/  
*(Log in with `superadmin` / `Admin@RS2026`)*

---

## 5. API Overview

| Endpoint | Method | Auth | Description |
|---|---|---|---|
| `/api/auth/login/` | POST | None | Get JWT tokens |
| `/api/auth/refresh/` | POST | None | Refresh access token |
| `/api/auth/me/` | GET | JWT | Current user profile |
| `/api/geodata/habitations/` | GET | None (read) | GeoJSON of all habitations |
| `/api/geodata/habitations/?district=Dehradun` | GET | None | Filter by district |
| `/api/geodata/habitations/?hazard_level=RED` | GET | None | Filter by hazard level |
| `/api/geodata/habitations/{id}/` | GET | None | Habitation detail with score breakdown |
| `/api/geodata/habitations/{id}/safe_sites/` | GET | None | AI-matched safe sites for habitation |
| `/api/geodata/safesites/` | GET | None (read) | GeoJSON of all safe sites |
| `/api/geodata/stats/` | GET | None | Aggregated district/risk statistics |
| `/api/relocation/plans/` | GET, POST | JWT | List / create relocation plans |
| `/api/relocation/plans/{id}/` | PATCH | JWT | Update plan status |
| `/api/relocation/alerts/` | GET | None | Public alert list |
| `/api/relocation/alerts/` | POST | JWT | Create alert |
| `/api/relocation/alerts/{id}/` | DELETE | JWT | Delete alert |
| `/api/docs/` | GET | None | Swagger UI (interactive API docs) |

---

## 6. Management Commands

```powershell
# Seed all demo data at once (idempotent — safe to run multiple times)
.\myenv\Scripts\python.exe backend/manage.py setup_full_demo

# Re-score all habitations (run after editing raw inputs in admin)
.\myenv\Scripts\python.exe backend/manage.py compute_hazard_scores

# Seed habitations only
.\myenv\Scripts\python.exe backend/manage.py seed_demo_data --count 40

# Seed safe sites only
.\myenv\Scripts\python.exe backend/manage.py seed_safe_sites
```

---

## 7. Architecture

```
RiskSetu/
├── backend/                        # Django project
│   ├── accounts/                   # Custom User model (role, department, district)
│   │   ├── models.py               # User extends AbstractUser
│   │   ├── serializers.py          # UserSerializer
│   │   └── views.py               # CurrentUserView (/api/auth/me/)
│   ├── geodata/                    # Core GIS data layer
│   │   ├── models.py              # Habitation + SafeSite (PostGIS PointField)
│   │   ├── serializers.py         # GeoJSON + detail serializers
│   │   ├── views.py               # ViewSets + GeoStatsView
│   │   ├── matching.py            # AI safe site matching algorithm
│   │   └── management/commands/
│   │       ├── setup_full_demo.py  # Master seed command
│   │       ├── compute_hazard_scores.py  # Scoring engine
│   │       ├── seed_demo_data.py  # Habitation seeder
│   │       └── seed_safe_sites.py # Safe site seeder
│   ├── relocation/                 # Plans + Alerts
│   │   ├── models.py              # RelocationPlan + Alert
│   │   ├── serializers.py         # Plan + Alert serializers
│   │   └── views.py               # ViewSets with filtering
│   └── risksetu/
│       ├── settings.py            # Django settings (OSGeo4W, PostGIS, JWT, CORS)
│       └── urls.py                # URL routing (/system-console/ = dev admin)
│
├── frontend/                       # React + Vite + TypeScript
│   └── src/
│       ├── api/                   # Axios service functions
│       │   ├── client.ts          # Axios instance + JWT refresh interceptor
│       │   ├── auth.ts            # Login, getCurrentUser
│       │   ├── habitations.ts     # getHabitations, getHabitationDetail, getSafeSiteMatches
│       │   ├── safesites.ts       # getSafeSites
│       │   ├── relocation.ts      # Plans + Alerts CRUD
│       │   └── stats.ts           # getGeoStats
│       ├── components/
│       │   ├── MapView.tsx        # MapLibre GL map with dual layers
│       │   ├── HabitationDetailPanel.tsx  # Risk profile slide-over
│       │   ├── CreatePlanModal.tsx
│       │   ├── CreateAlertModal.tsx
│       │   └── ProtectedRoute.tsx
│       ├── lib/
│       │   └── utils.ts           # Badge/colour helper functions
│       ├── pages/
│       │   ├── Login.tsx          # JWT authentication
│       │   ├── PublicMap.tsx      # Public-facing hazard map
│       │   └── Dashboard.tsx      # Official command centre (5 tabs)
│       ├── store/
│       │   └── authStore.ts       # Zustand auth state
│       └── types/
│           └── index.ts           # Shared TypeScript interfaces
│
└── myenv/                         # Python virtualenv (not committed)
```

---

## 8. Key Design Decisions

### Hazard Scoring (Rule-based)
Scores are computed from raw census/environmental inputs — not black-box ML. This makes the system explainable and auditable:

```
Hazard Score = seismic (30%) + extreme_rainfall_days (30%) + river_proximity (20%) + elevation_proxy (20%)
Vulnerability Score = dilapidated_housing (30%) + kutcha_roof_wall (25%) + no_water (15%) + no_toilet (15%) + no_drainage (15%)
Composite = Hazard (60%) + Vulnerability (40%)

RED   ≥ 75 composite
HIGH  ≥ 55
MOD   ≥ 35
SAFE  < 35
```

### Safe Site Matching (Rule-based ranking)
```
Suitability = distance_score (40%) + capacity_score (30%) + safety_score (30%)
```
Only sites within 50km and with hazard_score < 50 are considered.

### Developer Admin vs. Website
- `/system-console/` → Django admin (developers + superadmin only)
- `/dashboard` → Application command centre (officials)
- `/` → Public hazard map (anyone)
