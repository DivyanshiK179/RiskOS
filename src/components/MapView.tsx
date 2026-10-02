import { useEffect, useRef, useState, useCallback } from "react";
import * as maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { getHabitations } from "../api/habitations";
import { getSafeSites } from "../api/safesites";
import * as turf from "@turf/turf";
import type { SimulationResult } from "../api/stats";
import { useQueryClient } from "@tanstack/react-query";
import {
  Maximize2,
  Compass,
  ZoomIn,
  ZoomOut,
  Layers,
  ChevronDown,
  ChevronUp,
  Map as MapIcon,
  Ruler,
  Navigation,
  Crosshair,
  Route,
  Expand,
  Minimize2,
  X
} from "lucide-react";
import { useTranslation } from "../i18n/translations";
import { useUIStore } from "../store/uiStore";

interface MapViewProps {
  district?: string;
  hazardLevel?: string;
  onSelectHabitation?: (id: number) => void;
  selectedHabitationId?: number | null;
  showSafeSites?: boolean;
  simulationMode?: boolean;
  onMapClick?: (lat: number, lon: number) => void;
  simulationResults?: SimulationResult | null;
  habitationsData?: any;
}

type BasemapType = "satellite" | "street" | "topo";

// Authoritative Uttarakhand Hazard Susceptibility Corridors (GSI / NRSC / NDMA)
const UTTARAKHAND_LANDSLIDE_ZONES: GeoJSON.FeatureCollection = {
  type: "FeatureCollection",
  features: [
    {
      type: "Feature",
      properties: { name: "Joshimath - Alaknanda Valley High Hazard Corridor", severity: "HIGH" },
      geometry: {
        type: "Polygon",
        coordinates: [[
          [79.48, 30.48], [79.62, 30.56], [79.68, 30.53], [79.60, 30.42], [79.52, 30.40], [79.48, 30.48]
        ]]
      }
    },
    {
      type: "Feature",
      properties: { name: "Mandakini - Kedarnath Valley Steep Slope Zone", severity: "CRITICAL" },
      geometry: {
        type: "Polygon",
        coordinates: [[
          [78.98, 30.58], [79.08, 30.74], [79.16, 30.70], [79.08, 30.52], [79.00, 30.50], [78.98, 30.58]
        ]]
      }
    },
    {
      type: "Feature",
      properties: { name: "Pithoragarh - Dharchula High Susceptibility Belt", severity: "HIGH" },
      geometry: {
        type: "Polygon",
        coordinates: [[
          [80.35, 29.80], [80.55, 30.00], [80.60, 29.92], [80.45, 29.75], [80.35, 29.80]
        ]]
      }
    },
    {
      type: "Feature",
      properties: { name: "Bhagirathi Valley - Uttarkashi Landslide Zone", severity: "HIGH" },
      geometry: {
        type: "Polygon",
        coordinates: [[
          [78.35, 30.65], [78.50, 30.82], [78.62, 30.76], [78.48, 30.60], [78.35, 30.65]
        ]]
      }
    }
  ]
};

const UTTARAKHAND_FLOOD_ZONES: GeoJSON.FeatureCollection = {
  type: "FeatureCollection",
  features: [
    {
      type: "Feature",
      properties: { name: "Haridwar - Roorkee Ganga River Basin Floodplain", type: "RIVERINE" },
      geometry: {
        type: "Polygon",
        coordinates: [[
          [78.02, 29.85], [78.20, 29.98], [78.28, 29.88], [78.10, 29.75], [78.02, 29.85]
        ]]
      }
    },
    {
      type: "Feature",
      properties: { name: "Devprayag - Rishikesh Confluence Inundation Zone", type: "FLASH_FLOOD" },
      geometry: {
        type: "Polygon",
        coordinates: [[
          [78.50, 30.10], [78.62, 30.18], [78.68, 30.12], [78.55, 30.05], [78.50, 30.10]
        ]]
      }
    },
    {
      type: "Feature",
      properties: { name: "Karnaprayag - Rudraprayag Riverine Buffer", type: "FLASH_FLOOD" },
      geometry: {
        type: "Polygon",
        coordinates: [[
          [79.15, 30.25], [79.28, 30.30], [79.32, 30.22], [79.18, 30.18], [79.15, 30.25]
        ]]
      }
    }
  ]
};

export default function MapView({
  district,
  hazardLevel,
  onSelectHabitation,
  selectedHabitationId,
  showSafeSites = true,
  simulationMode = false,
  onMapClick,
  simulationResults,
  habitationsData,
}: MapViewProps) {
  const { t, lang } = useTranslation();
  const { theme, layersCollapsed, toggleLayers, zenMode, toggleZenMode, resizeTrigger } = useUIStore();
  const langRef = useRef(lang);
  const themeRef = useRef(theme);

  useEffect(() => { langRef.current = lang; }, [lang]);
  useEffect(() => { themeRef.current = theme; }, [theme]);

  // Debounced MapLibre canvas resize on panel animations
  useEffect(() => {
    const timer = setTimeout(() => {
      if (mapRef.current) {
        mapRef.current.resize();
      }
    }, 320);
    return () => clearTimeout(timer);
  }, [resizeTrigger]);

  const queryClient = useQueryClient();
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const epicenterMarkerRef = useRef<maplibregl.Marker | null>(null);
  const activePopupRef = useRef<maplibregl.Popup | null>(null);
  const safeSitesRef = useRef<any>(null);

  const [mapLoaded, setMapLoaded] = useState(false);
  const [activeBasemap, setActiveBasemap] = useState<BasemapType>("satellite");
  const [basemapDropdownOpen, setBasemapDropdownOpen] = useState(false);

  // Grouped Hazard & Infrastructure Layer Toggles
  const [showHabs, setShowHabs] = useState(true);
  const [showSites, setShowSites] = useState(showSafeSites);
  const [showLandslide, setShowLandslide] = useState(true);
  const [showFlood, setShowFlood] = useState(false);
  const [activeLayerTab, setActiveLayerTab] = useState<"layers" | "legend">("layers");

  // GIS Inspector & Utilities
  const [cursorCoords, setCursorCoords] = useState<{ lat: string; lon: string; zoom: string } | null>(null);
  const [measuring, setMeasuring] = useState(false);
  const [measurePoints, setMeasurePoints] = useState<[number, number][]>([]);
  const [measureDistanceKm, setMeasureDistanceKm] = useState<number | null>(null);
  const [activeRouteInfo, setActiveRouteInfo] = useState<{ distanceKm: number; durationMin: number; destName: string } | null>(null);

  const simulationModeRef = useRef(simulationMode);
  const onMapClickRef = useRef(onMapClick);
  const measuringRef = useRef(measuring);
  const measurePointsRef = useRef(measurePoints);

  useEffect(() => {
    simulationModeRef.current = simulationMode;
    onMapClickRef.current = onMapClick;
    if (!simulationMode && epicenterMarkerRef.current) {
      epicenterMarkerRef.current.remove();
      epicenterMarkerRef.current = null;
    }
  }, [simulationMode, onMapClick]);

  useEffect(() => {
    measuringRef.current = measuring;
    measurePointsRef.current = measurePoints;
  }, [measuring, measurePoints]);

  // Function to show standardized RiskOS popup
  const showSettlementPopup = useCallback((feature: any, coords: [number, number]) => {
    if (!mapRef.current) return;
    const props = feature.properties || {};
    const id = props.id || feature.id;
    const isHi = langRef.current === "hi";
    const isDark = themeRef.current === "dark";

    const levelColors: Record<string, string> = {
      RED: "#DC2626",
      HIGH: "#EA580C",
      MODERATE: "#F59E0B",
      SAFE: "#10B981",
    };
    const levelLabels: Record<string, { en: string; hi: string }> = {
      RED: { en: "Critical Red Zone", hi: "अति-गंभीर लाल क्षेत्र" },
      HIGH: { en: "High Risk", hi: "उच्च जोखिम" },
      MODERATE: { en: "Moderate Watch", hi: "मध्यम जोखिम (निगरानी)" },
      SAFE: { en: "Safe Zone", hi: "सुरक्षित क्षेत्र" },
    };

    const hazardLvl = props.hazard_level || "SAFE";
    const color = levelColors[hazardLvl] || "#3B82F6";
    const levelText = isHi ? (levelLabels[hazardLvl]?.hi || hazardLvl) : (levelLabels[hazardLvl]?.en || hazardLvl);
    const lgdCode = `LGD-UK-${String(id).padStart(6, "0")}`;

    if (activePopupRef.current) {
      activePopupRef.current.remove();
    }

    const bgCard = isDark ? "#0F172A" : "#FFFFFF";
    const textTitle = isDark ? "#F8FAFC" : "#0B2545";
    const textSub = isDark ? "#94A3B8" : "#64748B";
    const bgBox = isDark ? "#1E293B" : "#F8FAFC";
    const borderBox = isDark ? "#334155" : "#E2E8F0";

    const popup = new maplibregl.Popup({
      offset: 14,
      closeButton: true,
      closeOnClick: false,
      maxWidth: "340px",
      className: "riskos-popup",
    })
      .setLngLat(coords)
      .setHTML(`
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 6px; background:${bgCard}; color:${textTitle}; border-radius: 8px;">
          <!-- Header strip -->
          <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom: 8px; border-bottom: 1px solid ${borderBox}; padding-bottom: 6px;">
            <div>
              <div style="font-size: 15px; font-weight: 800; color: ${textTitle}; line-height: 1.2;">
                ${props.name}
              </div>
              <div style="font-size: 10px; font-weight: 600; color: ${textSub}; margin-top: 2px;">
                ${isHi ? "स्थानिक कोड" : "LGD Code"}: <span style="font-family: monospace; color: ${isDark ? "#38BDF8" : "#1E3A8A"};">${lgdCode}</span>
              </div>
            </div>
            <span style="font-size: 9px; font-weight: 700; padding: 2px 7px; border-radius: 9999px; background: ${color}22; color: ${color}; border: 1px solid ${color}66; white-space: nowrap;">
              ${levelText}
            </span>
          </div>

          <!-- Metrics 2x2 Grid -->
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 6px; margin-bottom: 10px; font-size: 11px;">
            <div style="background: ${bgBox}; padding: 5px 8px; border-radius: 6px; border: 1px solid ${borderBox};">
              <span style="display:block; font-size: 9px; color: ${textSub}; font-weight: 600; text-transform: uppercase;">
                ${isHi ? "ज़िला" : "District"}
              </span>
              <strong style="color: ${textTitle}; font-size: 12px;">${props.district || "Uttarakhand"}</strong>
            </div>

            <div style="background: ${bgBox}; padding: 5px 8px; border-radius: 6px; border: 1px solid ${borderBox};">
              <span style="display:block; font-size: 9px; color: ${textSub}; font-weight: 600; text-transform: uppercase;">
                ${isHi ? "जनसंख्या" : "Population"}
              </span>
              <strong style="color: ${textTitle}; font-size: 12px; font-family: monospace;">${Number(props.population || 0).toLocaleString()}</strong>
            </div>

            <div style="background: ${bgBox}; padding: 5px 8px; border-radius: 6px; border: 1px solid ${borderBox};">
              <span style="display:block; font-size: 9px; color: ${textSub}; font-weight: 600; text-transform: uppercase;">
                ${isHi ? "जोखिम स्कोर" : "Hazard Score"}
              </span>
              <strong style="color: ${color}; font-size: 12px; font-weight: 800;">${Number(props.hazard_score || 0).toFixed(1)} / 100</strong>
            </div>

            <div style="background: ${bgBox}; padding: 5px 8px; border-radius: 6px; border: 1px solid ${borderBox};">
              <span style="display:block; font-size: 9px; color: ${textSub}; font-weight: 600; text-transform: uppercase;">
                ${isHi ? "भेद्यता" : "Vulnerability"}
              </span>
              <strong style="color: ${textTitle}; font-size: 12px;">${Number(props.vulnerability_score || 0).toFixed(1)} / 100</strong>
            </div>
          </div>

          <!-- Actions Stack -->
          <div style="display:flex; flex-direction:column; gap: 5px;">
            <button
              id="btn-calc-route"
              onclick="window.__rsCalcRoute(${id}, ${coords[0]}, ${coords[1]}, '${(props.name || "").replace(/'/g, "")}')"
              style="width: 100%; padding: 7px 10px; background: #059669; color: white; border: none; border-radius: 6px; font-size: 11px; font-weight: 700; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 6px;"
            >
              <span>🛡️ ${isHi ? "सुरक्षित आश्रय हेतु निकासी मार्ग ज्ञात करें" : "Calculate Evacuation Route to Safe Site"}</span>
            </button>

            <button
              onclick="window.__rsSelectHab(${id})"
              style="width: 100%; padding: 6px 10px; background: ${isDark ? "#1E3A8A" : "#0B2545"}; color: white; border: none; border-radius: 6px; font-size: 11px; font-weight: 600; cursor: pointer;"
            >
              ${isHi ? "सम्पूर्ण जोखिम प्रोफ़ाइल देखें →" : "Open Detailed Risk Dossier →"}
            </button>
          </div>
        </div>
      `)
      .addTo(mapRef.current);

    activePopupRef.current = popup;
  }, []);

  // Global popup handlers
  useEffect(() => {
    (window as any).__rsSelectHab = (hid: number) => {
      if (activePopupRef.current) activePopupRef.current.remove();
      onSelectHabitation?.(hid);
    };

    (window as any).__rsCalcRoute = async (
      _hid: number,
      lon: number,
      lat: number,
      habName: string
    ) => {
      const btn = document.getElementById("btn-calc-route");
      if (btn) btn.innerText = langRef.current === "hi" ? "मार्ग की गणना हो रही है..." : "Calculating Optimal Corridor...";

      const safeSites = safeSitesRef.current?.features || [];
      if (safeSites.length === 0) {
        if (btn) btn.innerText = "No Safe Sites Loaded";
        return;
      }

      // Find nearest safe site using Turf distance
      let nearestSite: any = null;
      let minDistanceKm = Infinity;
      for (const site of safeSites) {
        const [sLon, sLat] = site.geometry.coordinates;
        const d = turf.distance([lon, lat], [sLon, sLat], { units: "kilometers" });
        if (d < minDistanceKm) {
          minDistanceKm = d;
          nearestSite = site;
        }
      }

      if (!nearestSite) return;

      const [destLon, destLat] = nearestSite.geometry.coordinates;
      const destName = nearestSite.properties?.name || "Nearest Safe Relocation Shelter";

      try {
        const res = await fetch(
          `https://router.project-osrm.org/route/v1/driving/${lon},${lat};${destLon},${destLat}?overview=full&geometries=geojson`
        );
        const data = await res.json();

        if (data.routes && data.routes.length > 0 && mapRef.current) {
          const routeGeojson = data.routes[0].geometry;
          const distKm = Number((data.routes[0].distance / 1000).toFixed(2));
          const durationMins = Math.round(data.routes[0].duration / 60);

          (mapRef.current.getSource("active-evacuation-route") as any)?.setData({
            type: "FeatureCollection",
            features: [
              {
                type: "Feature",
                geometry: routeGeojson,
                properties: {
                  origin: habName,
                  destination: destName,
                  distance_km: distKm,
                  duration_min: durationMins,
                },
              },
            ],
          });

          setActiveRouteInfo({
            distanceKm: distKm,
            durationMin: durationMins,
            destName,
          });

          const bbox = turf.bbox(routeGeojson);
          mapRef.current.fitBounds(bbox as any, { padding: 80, duration: 1200 });

          if (btn) {
            btn.innerText = `✓ ${distKm} km • ~${durationMins} min (${destName})`;
            btn.style.background = "#10B981";
          }
        }
      } catch (err) {
        console.error("OSRM Route calculation error:", err);
        if (mapRef.current) {
          const directLine = turf.lineString([[lon, lat], [destLon, destLat]]);
          (mapRef.current.getSource("active-evacuation-route") as any)?.setData({
            type: "FeatureCollection",
            features: [directLine],
          });
          setActiveRouteInfo({
            distanceKm: Number(minDistanceKm.toFixed(1)),
            durationMin: Math.round(minDistanceKm * 2),
            destName,
          });
        }
      }
    };

    return () => {
      delete (window as any).__rsSelectHab;
      delete (window as any).__rsCalcRoute;
    };
  }, [onSelectHabitation]);

  // Main MapLibre Initialization with Multi-Basemap Architecture
  useEffect(() => {
    if (!mapContainer.current || mapRef.current) return;

    const map = new maplibregl.Map({
      container: mapContainer.current,
      maxZoom: 20,
      minZoom: 5,
      style: {
        version: 8,
        sources: {
          // 1. Esri World Imagery with maxzoom: 18 (PREVENTS GRAY "MAP DATA NOT YET AVAILABLE" TILES ON OVERZOOM)
          "esri-satellite": {
            type: "raster",
            tiles: ["https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"],
            tileSize: 256,
            maxzoom: 18,
          },
          // 2. High-contrast Transparent Cadastral Labels
          "carto-labels": {
            type: "raster",
            tiles: [
              "https://a.basemaps.cartocdn.com/rastertiles/voyager_only_labels/{z}/{x}/{y}.png",
              "https://b.basemaps.cartocdn.com/rastertiles/voyager_only_labels/{z}/{x}/{y}.png",
              "https://c.basemaps.cartocdn.com/rastertiles/voyager_only_labels/{z}/{x}/{y}.png",
            ],
            tileSize: 256,
            maxzoom: 20,
          },
          // 3a. Street / Cadastral Administrative Basemap Light (Carto Positron Light)
          "carto-street-light": {
            type: "raster",
            tiles: [
              "https://a.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png",
              "https://b.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png",
              "https://c.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png",
            ],
            tileSize: 256,
            maxzoom: 19,
          },
          // 3b. Street / Cadastral Administrative Basemap Dark (Carto Dark Matter)
          "carto-street-dark": {
            type: "raster",
            tiles: [
              "https://a.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png",
              "https://b.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png",
              "https://c.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png",
            ],
            tileSize: 256,
            maxzoom: 19,
          },
          // 4. OpenTopoMap Elevation & Terrain Contours
          "open-topo": {
            type: "raster",
            tiles: ["https://tile.opentopomap.org/{z}/{x}/{y}.png"],
            tileSize: 256,
            maxzoom: 17,
          },
        },
        layers: [
          // Base Rasters (Z-index 0)
          {
            id: "base-satellite",
            type: "raster",
            source: "esri-satellite",
            minzoom: 0,
            maxzoom: 22,
            layout: { visibility: "visible" },
          },
          {
            id: "base-street-light",
            type: "raster",
            source: "carto-street-light",
            minzoom: 0,
            maxzoom: 22,
            layout: { visibility: "none" },
          },
          {
            id: "base-street-dark",
            type: "raster",
            source: "carto-street-dark",
            minzoom: 0,
            maxzoom: 22,
            layout: { visibility: "none" },
          },
          {
            id: "base-topo",
            type: "raster",
            source: "open-topo",
            minzoom: 0,
            maxzoom: 22,
            layout: { visibility: "none" },
          },
          {
            id: "base-labels",
            type: "raster",
            source: "carto-labels",
            minzoom: 0,
            maxzoom: 22,
            layout: { visibility: "visible" },
          },
        ],
      },
      center: [79.25, 30.15],
      zoom: 7.8,
      attributionControl: false,
    });

    map.addControl(new maplibregl.ScaleControl({ maxWidth: 120, unit: "metric" }), "bottom-left");

    // Track Cursor Coordinates
    map.on("mousemove", (e: any) => {
      setCursorCoords({
        lat: e.lngLat.lat.toFixed(4),
        lon: e.lngLat.lng.toFixed(4),
        zoom: map.getZoom().toFixed(1),
      });
    });

    map.on("load", () => {
      // 1. Natural Hazard Polygon Sources
      map.addSource("landslide-susceptibility", {
        type: "geojson",
        data: UTTARAKHAND_LANDSLIDE_ZONES,
      });

      map.addSource("flood-inundation", {
        type: "geojson",
        data: UTTARAKHAND_FLOOD_ZONES,
      });

      // Hazard Polygon Layers
      map.addLayer({
        id: "landslide-fill",
        type: "fill",
        source: "landslide-susceptibility",
        paint: {
          "fill-color": "#EA580C",
          "fill-opacity": 0.35,
        },
      });

      map.addLayer({
        id: "landslide-outline",
        type: "line",
        source: "landslide-susceptibility",
        paint: {
          "line-color": "#C2410C",
          "line-width": 1.5,
          "line-dasharray": [3, 2],
        },
      });

      map.addLayer({
        id: "flood-fill",
        type: "fill",
        source: "flood-inundation",
        layout: { visibility: "none" },
        paint: {
          "fill-color": "#0284C7",
          "fill-opacity": 0.35,
        },
      });

      map.addLayer({
        id: "flood-outline",
        type: "line",
        source: "flood-inundation",
        layout: { visibility: "none" },
        paint: {
          "line-color": "#0369A1",
          "line-width": 1.5,
        },
      });

      // 2. Active Evacuation Route Layer
      map.addSource("active-evacuation-route", {
        type: "geojson",
        data: { type: "FeatureCollection", features: [] },
      });

      map.addLayer({
        id: "active-route-casing",
        type: "line",
        source: "active-evacuation-route",
        paint: {
          "line-color": "#064E3B",
          "line-width": 8,
          "line-opacity": 0.7,
        },
      });

      map.addLayer({
        id: "active-route-line",
        type: "line",
        source: "active-evacuation-route",
        paint: {
          "line-color": "#10B981",
          "line-width": 4.5,
          "line-opacity": 0.95,
        },
      });

      // 3. Distance Measurement Source & Layers
      map.addSource("measure-source", {
        type: "geojson",
        data: { type: "FeatureCollection", features: [] },
      });

      map.addLayer({
        id: "measure-lines",
        type: "line",
        source: "measure-source",
        filter: ["==", "$type", "LineString"],
        paint: {
          "line-color": "#F59E0B",
          "line-width": 3,
          "line-dasharray": [2, 2],
        },
      });

      map.addLayer({
        id: "measure-points",
        type: "circle",
        source: "measure-source",
        filter: ["==", "$type", "Point"],
        paint: {
          "circle-radius": 5,
          "circle-color": "#F59E0B",
          "circle-stroke-color": "#FFFFFF",
          "circle-stroke-width": 2,
        },
      });

      // 4. Disaster Simulation Sources
      map.addSource("simulation-circle", {
        type: "geojson",
        data: { type: "FeatureCollection", features: [] },
      });
      map.addSource("simulation-lines", {
        type: "geojson",
        data: { type: "FeatureCollection", features: [] },
      });

      map.addLayer({
        id: "simulation-circle-layer",
        type: "fill",
        source: "simulation-circle",
        paint: { "fill-color": "#EF4444", "fill-opacity": 0.25 },
      });
      map.addLayer({
        id: "simulation-circle-outline",
        type: "line",
        source: "simulation-circle",
        paint: { "line-color": "#DC2626", "line-width": 2 },
      });
      map.addLayer({
        id: "simulation-lines-layer",
        type: "line",
        source: "simulation-lines",
        paint: { "line-color": "#10B981", "line-width": 4, "line-opacity": 0.85 },
      });

      // 5. Safe Relocation Shelters Source & Symbology
      map.addSource("safesites", {
        type: "geojson",
        data: { type: "FeatureCollection", features: [] },
      });

      map.addLayer({
        id: "safesites-layer",
        type: "circle",
        source: "safesites",
        paint: {
          "circle-radius": [
            "interpolate", ["linear"], ["zoom"],
            6, 6,
            10, 9,
            14, 15
          ],
          "circle-color": "#10B981",
          "circle-stroke-width": 2,
          "circle-stroke-color": "#064E3B",
          "circle-opacity": 0.95,
        },
      });

      // 6. Habitations Geo-Entities Source (cluster: false prevents hiding red/moderate points)
      map.addSource("habitations", {
        type: "geojson",
        data: habitationsData || { type: "FeatureCollection", features: [] },
        cluster: false,
      });

      // High-visibility Pulsing Halo Glow for Critical Red Habitants
      map.addLayer({
        id: "habitations-halo",
        type: "circle",
        source: "habitations",
        filter: ["==", ["get", "hazard_level"], "RED"],
        paint: {
          "circle-radius": [
            "interpolate", ["linear"], ["zoom"],
            6, 14,
            10, 18,
            14, 26
          ],
          "circle-color": "#DC2626",
          "circle-opacity": 0.35,
          "circle-blur": 0.5,
        },
      });

      // Scale-Dependent Habitation Marker Symbology (Exact Spec Radii)
      map.addLayer({
        id: "habitations-layer",
        type: "circle",
        source: "habitations",
        paint: {
          "circle-radius": [
            "match", ["get", "hazard_level"],
            "RED", [
              "interpolate", ["linear"], ["zoom"],
              6, 8,
              10, 10,
              14, 14,
              17, 18
            ],
            "HIGH", [
              "interpolate", ["linear"], ["zoom"],
              6, 7,
              10, 8.5,
              14, 12,
              17, 15
            ],
            "MODERATE", [
              "interpolate", ["linear"], ["zoom"],
              6, 6,
              10, 7.5,
              14, 10,
              17, 13
            ],
            // SAFE / default
            [
              "interpolate", ["linear"], ["zoom"],
              6, 5,
              10, 6.5,
              14, 9,
              17, 12
            ]
          ],
          "circle-color": [
            "case",
            ["==", ["get", "sim_affected"], true], "#DC2626",
            ["match", ["get", "hazard_level"],
              "RED", "#DC2626",
              "HIGH", "#EA580C",
              "MODERATE", "#F59E0B",
              "SAFE", "#10B981",
              "#3B82F6"
            ]
          ],
          "circle-stroke-width": [
            "match", ["get", "hazard_level"],
            "RED", 2.5,
            "HIGH", 1.5,
            "MODERATE", 1.5,
            1.5
          ],
          "circle-stroke-color": [
            "match", ["get", "hazard_level"],
            "RED", "#7F1D1D",
            "HIGH", "#9A3412",
            "MODERATE", "#B45309",
            "SAFE", "#064E3B",
            "#1E293B"
          ],
          "circle-opacity": 0.95,
        },
      });

      // Zoom 13.5+ Settlement Label & Population Underneath Marker
      map.addLayer({
        id: "habitations-labels-layer",
        type: "symbol",
        source: "habitations",
        minzoom: 13.5,
        layout: {
          "text-field": ["concat", ["get", "name"], " (Pop: ", ["to-string", ["get", "population"]], ")"],
          "text-size": 11,
          "text-offset": [0, 1.4],
          "text-anchor": "top",
          "text-max-width": 14,
        },
        paint: {
          "text-color": "#FFFFFF",
          "text-halo-color": "#0B2545",
          "text-halo-width": 2.5,
        },
      });

      // ── Event Handlers ──
      map.on("click", (e: any) => {
        // Measurement tool interaction
        if (measuringRef.current) {
          const newPt: [number, number] = [e.lngLat.lng, e.lngLat.lat];
          const updated = [...measurePointsRef.current, newPt];
          setMeasurePoints(updated);

          const ptsGeojson = updated.map((pt) => turf.point(pt));
          const features: any[] = [...ptsGeojson];
          if (updated.length >= 2) {
            const line = turf.lineString(updated);
            features.push(line);
            const dist = turf.length(line, { units: "kilometers" });
            setMeasureDistanceKm(Number(dist.toFixed(2)));
          }
          (map.getSource("measure-source") as any)?.setData({
            type: "FeatureCollection",
            features,
          });
          return;
        }

        // Disaster simulation click
        if (simulationModeRef.current && onMapClickRef.current) {
          const lat = e.lngLat.lat;
          const lon = e.lngLat.lng;

          if (!epicenterMarkerRef.current) {
            const el = document.createElement("div");
            el.innerHTML = `<svg class="w-6 h-6 text-red-600 drop-shadow-md" viewBox="0 0 24 24" fill="currentColor" stroke="white" stroke-width="2"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 010-5 2.5 2.5 0 010 5z"/></svg>`;
            el.style.transform = "translate(-50%, -100%)";
            epicenterMarkerRef.current = new maplibregl.Marker({ element: el })
              .setLngLat([lon, lat])
              .addTo(map);
          } else {
            epicenterMarkerRef.current.setLngLat([lon, lat]);
          }

          onMapClickRef.current(lat, lon);
        }
      });

      // Habitation Click: Open Standardized RiskOS Popup
      map.on("click", "habitations-layer", (e: any) => {
        if (measuringRef.current || simulationModeRef.current) return;
        const feat = e.features?.[0];
        if (!feat) return;
        const coords = (feat.geometry as any).coordinates.slice();
        showSettlementPopup(feat, coords);
        const id = feat.properties?.id || feat.id;
        if (onSelectHabitation && id) onSelectHabitation(Number(id));
      });

      // Safe Site Click: Open Detail
      map.on("click", "safesites-layer", (e: any) => {
        if (measuringRef.current || simulationModeRef.current) return;
        const feat = e.features?.[0];
        if (!feat) return;
        const props = feat.properties as any;
        const coords = (feat.geometry as any).coordinates.slice();
        const rem = props.remaining_capacity ?? props.estimated_capacity;
        const isHi = langRef.current === "hi";

        new maplibregl.Popup({ offset: 12, closeButton: true, maxWidth: "280px" })
          .setLngLat(coords as maplibregl.LngLatLike)
          .setHTML(`
            <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 4px; color: #0F172A;">
              <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px;">
                <div style="width:10px;height:10px;border-radius:50%;background:#10B981;flex-shrink:0;"></div>
                <span style="font-weight:700;color:#0B2545;font-size:13px;">${props.name}</span>
              </div>
              <div style="font-size:10px;font-weight:700;color:#10B981;text-transform:uppercase;margin-bottom:8px;">
                ${isHi ? "आधिकारिक सुरक्षित पुनर्वास स्थल" : "Official Relocation Shelter"}
              </div>
              <table style="width:100%;font-size:11px;border-collapse:collapse;color:#334155;">
                <tr><td style="padding:2px 0;color:#64748B;">${isHi ? "ज़िला" : "District"}</td><td style="padding:2px 0;font-weight:600;text-align:right;">${props.district}</td></tr>
                <tr><td style="padding:2px 0;color:#64748B;">${isHi ? "कुल क्षमता" : "Total Capacity"}</td><td style="padding:2px 0;font-weight:600;text-align:right;">${Number(props.estimated_capacity || 0).toLocaleString()}</td></tr>
                <tr><td style="padding:2px 0;color:#64748B;">${isHi ? "उपलब्ध" : "Available"}</td><td style="padding:2px 0;color:#10B981;font-weight:700;text-align:right;">${Number(rem || 0).toLocaleString()}</td></tr>
              </table>
            </div>
          `)
          .addTo(map);
      });

      // Hover Cursors
      for (const layer of ["habitations-layer", "safesites-layer"]) {
        map.on("mouseenter", layer, () => { map.getCanvas().style.cursor = "pointer"; });
        map.on("mouseleave", layer, () => { map.getCanvas().style.cursor = measuringRef.current ? "crosshair" : ""; });
      }

      setMapLoaded(true);
    });

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [showSettlementPopup, onSelectHabitation]);

  // Handle flyTo when selectedHabitationId is set externally
  useEffect(() => {
    if (!mapLoaded || !mapRef.current || !selectedHabitationId) return;

    const sourceData = (mapRef.current.getSource("habitations") as any)?._data || habitationsData;
    if (!sourceData?.features) return;

    const feat = sourceData.features.find((f: any) => (f.id || f.properties?.id) === selectedHabitationId);
    if (feat && feat.geometry?.coordinates) {
      const [lon, lat] = feat.geometry.coordinates;
      mapRef.current.flyTo({
        center: [lon, lat],
        zoom: 15,
        speed: 1.4,
        curve: 1.2,
        essential: true,
      });
      showSettlementPopup(feat, [lon, lat]);
    }
  }, [selectedHabitationId, mapLoaded, habitationsData, showSettlementPopup]);

  // Update Basemap Provider
  const switchBasemap = (type: BasemapType) => {
    setActiveBasemap(type);
    setBasemapDropdownOpen(false);
    if (!mapRef.current) return;

    const m = mapRef.current;
    const isDark = theme === "dark";

    if (type === "satellite") {
      if (m.getLayer("base-satellite")) m.setLayoutProperty("base-satellite", "visibility", "visible");
      if (m.getLayer("base-labels")) m.setLayoutProperty("base-labels", "visibility", "visible");
      if (m.getLayer("base-street-light")) m.setLayoutProperty("base-street-light", "visibility", "none");
      if (m.getLayer("base-street-dark")) m.setLayoutProperty("base-street-dark", "visibility", "none");
      if (m.getLayer("base-topo")) m.setLayoutProperty("base-topo", "visibility", "none");
    } else if (type === "street") {
      if (m.getLayer("base-satellite")) m.setLayoutProperty("base-satellite", "visibility", "none");
      if (m.getLayer("base-labels")) m.setLayoutProperty("base-labels", "visibility", "none");
      if (m.getLayer("base-street-light")) m.setLayoutProperty("base-street-light", "visibility", isDark ? "none" : "visible");
      if (m.getLayer("base-street-dark")) m.setLayoutProperty("base-street-dark", "visibility", isDark ? "visible" : "none");
      if (m.getLayer("base-topo")) m.setLayoutProperty("base-topo", "visibility", "none");
    } else if (type === "topo") {
      if (m.getLayer("base-satellite")) m.setLayoutProperty("base-satellite", "visibility", "none");
      if (m.getLayer("base-labels")) m.setLayoutProperty("base-labels", "visibility", "none");
      if (m.getLayer("base-street-light")) m.setLayoutProperty("base-street-light", "visibility", "none");
      if (m.getLayer("base-street-dark")) m.setLayoutProperty("base-street-dark", "visibility", "none");
      if (m.getLayer("base-topo")) m.setLayoutProperty("base-topo", "visibility", "visible");
    }
  };

  // Dynamically swap street basemap when theme changes
  useEffect(() => {
    if (!mapRef.current || !mapLoaded) return;
    if (activeBasemap === "street") {
      const isDark = theme === "dark";
      const m = mapRef.current;
      if (m.getLayer("base-street-light")) m.setLayoutProperty("base-street-light", "visibility", isDark ? "none" : "visible");
      if (m.getLayer("base-street-dark")) m.setLayoutProperty("base-street-dark", "visibility", isDark ? "visible" : "none");
    }
  }, [theme, activeBasemap, mapLoaded]);

  // Toggle Measurement Tool
  const toggleMeasurementTool = () => {
    const next = !measuring;
    setMeasuring(next);
    if (!next) {
      setMeasurePoints([]);
      setMeasureDistanceKm(null);
      if (mapRef.current) {
        (mapRef.current.getSource("measure-source") as any)?.setData({
          type: "FeatureCollection",
          features: [],
        });
        mapRef.current.getCanvas().style.cursor = "";
      }
    } else if (mapRef.current) {
      mapRef.current.getCanvas().style.cursor = "crosshair";
    }
  };

  const clearMeasurement = () => {
    setMeasurePoints([]);
    setMeasureDistanceKm(null);
    if (mapRef.current) {
      (mapRef.current.getSource("measure-source") as any)?.setData({
        type: "FeatureCollection",
        features: [],
      });
    }
  };

  const clearActiveRoute = () => {
    setActiveRouteInfo(null);
    if (mapRef.current) {
      (mapRef.current.getSource("active-evacuation-route") as any)?.setData({
        type: "FeatureCollection",
        features: [],
      });
    }
  };

  // Refresh habitations data
  useEffect(() => {
    if (!mapLoaded || !mapRef.current) return;
    if (simulationResults) return;

    if (habitationsData) {
      (mapRef.current.getSource("habitations") as any)?.setData(habitationsData);
      return;
    }

    const cachedData = queryClient.getQueryData(["habitations", district || "", hazardLevel || ""]);
    if (cachedData) {
      (mapRef.current.getSource("habitations") as any)?.setData(cachedData);
    } else {
      let alive = true;
      getHabitations({ district, hazard_level: hazardLevel }).then((geojson) => {
        if (!alive || !mapRef.current) return;
        (mapRef.current.getSource("habitations") as any)?.setData(geojson);
      });
      return () => { alive = false; };
    }
  }, [district, hazardLevel, mapLoaded, simulationResults, queryClient, habitationsData]);

  // Refresh safe sites
  useEffect(() => {
    if (!mapLoaded || !mapRef.current) return;
    let alive = true;
    getSafeSites().then((geojson) => {
      if (!alive || !mapRef.current) return;
      safeSitesRef.current = geojson;
      (mapRef.current.getSource("safesites") as any)?.setData(geojson);
    });
    return () => { alive = false; };
  }, [mapLoaded]);

  // Layer visibility toggles
  useEffect(() => {
    if (!mapLoaded || !mapRef.current) return;
    const vis = showHabs ? "visible" : "none";
    for (const l of ["habitations-layer", "habitations-halo", "habitations-labels-layer"]) {
      if (mapRef.current.getLayer(l)) mapRef.current.setLayoutProperty(l, "visibility", vis);
    }
  }, [showHabs, mapLoaded]);

  useEffect(() => {
    if (!mapLoaded || !mapRef.current) return;
    const vis = showSites ? "visible" : "none";
    if (mapRef.current.getLayer("safesites-layer")) {
      mapRef.current.setLayoutProperty("safesites-layer", "visibility", vis);
    }
  }, [showSites, mapLoaded]);

  useEffect(() => {
    if (!mapLoaded || !mapRef.current) return;
    const vis = showLandslide ? "visible" : "none";
    for (const l of ["landslide-fill", "landslide-outline"]) {
      if (mapRef.current.getLayer(l)) mapRef.current.setLayoutProperty(l, "visibility", vis);
    }
  }, [showLandslide, mapLoaded]);

  useEffect(() => {
    if (!mapLoaded || !mapRef.current) return;
    const vis = showFlood ? "visible" : "none";
    for (const l of ["flood-fill", "flood-outline"]) {
      if (mapRef.current.getLayer(l)) mapRef.current.setLayoutProperty(l, "visibility", vis);
    }
  }, [showFlood, mapLoaded]);

  // Handle simulation results rendering
  useEffect(() => {
    if (!mapLoaded || !mapRef.current) return;
    let isActive = true;

    if (!simulationResults) {
      (mapRef.current.getSource("simulation-circle") as any)?.setData({ type: "FeatureCollection", features: [] });
      (mapRef.current.getSource("simulation-lines") as any)?.setData({ type: "FeatureCollection", features: [] });

      getHabitations({ district, hazard_level: hazardLevel }).then((geojson) => {
        if (!isActive || !mapRef.current) return;
        (mapRef.current.getSource("habitations") as any)?.setData(geojson);
      });
      return () => { isActive = false; };
    }

    const { epicenter, affected_habitations } = simulationResults;

    const circle = turf.circle([epicenter.lon, epicenter.lat], epicenter.radius_km, { steps: 64, units: "kilometers" });
    (mapRef.current.getSource("simulation-circle") as any)?.setData({ type: "FeatureCollection", features: [circle] });

    const affectedIds = new Set(affected_habitations.map((h) => h.id));
    getHabitations({ district, hazard_level: hazardLevel }).then((geojson) => {
      if (!isActive || !mapRef.current) return;
      const updatedFeatures = geojson.features.map((f: any) => {
        if (affectedIds.has(f.id ?? f.properties.id)) {
          f.properties.sim_affected = true;
        }
        return f;
      });
      geojson.features = updatedFeatures;
      (mapRef.current.getSource("habitations") as any)?.setData(geojson);
    });

    const utilizedSites = new Map<number, { site: any; population: number }>();
    for (const h of affected_habitations) {
      if (h.assigned_safe_site) {
        const existing = utilizedSites.get(h.assigned_safe_site.id);
        if (existing) {
          existing.population += h.population || 0;
        } else {
          utilizedSites.set(h.assigned_safe_site.id, {
            site: h.assigned_safe_site,
            population: h.population || 0,
          });
        }
      }
    }

    const fetchRoutes = async () => {
      try {
        const routeFeatures = [];
        for (const { site, population } of utilizedSites.values()) {
          const res = await fetch(
            `https://router.project-osrm.org/route/v1/driving/${epicenter.lon},${epicenter.lat};${site.lon},${site.lat}?overview=full&geometries=geojson`
          );
          const data = await res.json();
          if (data.routes && data.routes.length > 0) {
            routeFeatures.push({
              type: "Feature",
              geometry: data.routes[0].geometry,
              properties: { population_routed: population, site_name: site.name },
            });
          }
        }
        if (isActive && mapRef.current) {
          (mapRef.current.getSource("simulation-lines") as any)?.setData({
            type: "FeatureCollection",
            features: routeFeatures,
          });
        }
      } catch (e) {
        console.error("Failed to fetch routes", e);
      }
    };

    fetchRoutes();
    return () => { isActive = false; };
  }, [simulationResults, mapLoaded, district, hazardLevel]);

  // Fullscreen & Compass controls
  const handleToggleFullscreen = () => {
    if (!mapContainer.current) return;
    if (!document.fullscreenElement) {
      mapContainer.current.parentElement?.requestFullscreen().catch((err) => {
        console.error("Error attempting fullscreen:", err);
      });
    } else {
      document.exitFullscreen();
    }
  };

  const handleResetNorth = () => {
    if (mapRef.current) mapRef.current.resetNorthPitch({ duration: 500 });
  };

  const handleZoomIn = () => {
    if (mapRef.current) mapRef.current.zoomIn({ duration: 300 });
  };

  const handleZoomOut = () => {
    if (mapRef.current) mapRef.current.zoomOut({ duration: 300 });
  };

  return (
    <div className="relative w-full h-full select-none overflow-hidden group">
      <div ref={mapContainer} className="w-full h-full" />

      {/* Floating Action Controls (Top Right) */}
      <div className="absolute top-4 right-4 z-20 flex flex-col items-end gap-2">
        {/* Basemap Switcher Floating Button & Dropdown */}
        <div className="relative">
          <button
            onClick={() => setBasemapDropdownOpen(!basemapDropdownOpen)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white/95 dark:bg-[#111827ee] backdrop-blur-md border border-slate-200 dark:border-[#374151] rounded-lg shadow-xl text-xs font-bold text-slate-800 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            title={t("basemap_title")}
          >
            <MapIcon className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span className="capitalize">{t(`basemap_${activeBasemap}`)}</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {basemapDropdownOpen && (
            <div className="absolute right-0 mt-1 w-52 bg-white dark:bg-[#111827ee] backdrop-blur-md border border-slate-200 dark:border-[#374151] rounded-xl shadow-2xl p-2 z-30 space-y-1 text-xs">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider px-2 py-1 block">
                {t("basemap_title")}
              </span>
              <button
                onClick={() => switchBasemap("satellite")}
                className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-left transition ${
                  activeBasemap === "satellite"
                    ? "bg-blue-600 text-white font-bold"
                    : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                }`}
              >
                <span>🛰️ {t("basemap_satellite")}</span>
                {activeBasemap === "satellite" && <span className="text-[10px]">✓</span>}
              </button>
              <button
                onClick={() => switchBasemap("street")}
                className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-left transition ${
                  activeBasemap === "street"
                    ? "bg-blue-600 text-white font-bold"
                    : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                }`}
              >
                <span>🗺️ {t("basemap_street")}</span>
                {activeBasemap === "street" && <span className="text-[10px]">✓</span>}
              </button>
              <button
                onClick={() => switchBasemap("topo")}
                className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-left transition ${
                  activeBasemap === "topo"
                    ? "bg-blue-600 text-white font-bold"
                    : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                }`}
              >
                <span>⛰️ {t("basemap_topo")}</span>
                {activeBasemap === "topo" && <span className="text-[10px]">✓</span>}
              </button>
            </div>
          )}
        </div>

        {/* GIS Controls Dock */}
        <div className="bg-white/95 dark:bg-[#111827ee] backdrop-blur-md border border-slate-200 dark:border-[#374151] rounded-lg shadow-xl overflow-hidden flex flex-col">
          <button
            onClick={handleZoomIn}
            className="p-2 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 border-b border-slate-200 dark:border-slate-700 transition"
            title="Zoom In"
            aria-label="Zoom In"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={handleZoomOut}
            className="p-2 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 border-b border-slate-200 dark:border-slate-700 transition"
            title="Zoom Out"
            aria-label="Zoom Out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
            onClick={handleResetNorth}
            className="p-2 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 border-b border-slate-200 dark:border-slate-700 transition"
            title="Reset Bearing (North)"
            aria-label="Reset Bearing to North"
          >
            <Compass className="w-4 h-4 text-amber-600 dark:text-amber-400" />
          </button>
          <button
            onClick={toggleMeasurementTool}
            className={`p-2 transition border-b border-slate-200 dark:border-slate-700 ${
              measuring
                ? "bg-amber-600 text-white hover:bg-amber-700"
                : "text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
            title={t("measure_tool")}
            aria-label="Distance Measurement Tool"
          >
            <Ruler className="w-4 h-4" />
          </button>
          <button
            onClick={toggleZenMode}
            className={`p-2 transition border-b border-slate-200 dark:border-slate-700 ${
              zenMode
                ? "bg-blue-600 text-white hover:bg-blue-700"
                : "text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
            title={zenMode ? t("restore_panels") : t("zen_mode_toggle")}
            aria-label="Toggle Full Map Zen Mode (Z)"
          >
            <Expand className="w-4 h-4" />
          </button>
          <button
            onClick={handleToggleFullscreen}
            className="p-2 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            title="Toggle Fullscreen"
            aria-label="Toggle Fullscreen"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Active Measurement Distance Banner */}
      {measuring && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 bg-amber-900/90 text-white backdrop-blur-md border border-amber-600 px-4 py-2 rounded-xl shadow-2xl flex items-center gap-3 text-xs">
          <Crosshair className="w-4 h-4 text-amber-300 animate-spin" />
          <div>
            <span className="font-bold block">{t("measure_active")}</span>
            {measureDistanceKm !== null ? (
              <span className="text-amber-200 font-mono text-sm font-bold">
                {t("route_distance")}: {measureDistanceKm} km ({measurePoints.length} points)
              </span>
            ) : (
              <span className="text-amber-300 text-[10px]">Click two or more points on map</span>
            )}
          </div>
          <button
            onClick={clearMeasurement}
            className="ml-2 px-2 py-1 bg-amber-800 hover:bg-amber-700 rounded text-[10px] font-bold"
          >
            {t("clear_measure")}
          </button>
          <button
            onClick={toggleMeasurementTool}
            className="p-1 text-amber-200 hover:text-white"
            title="Close Measure"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Active Evacuation Route Info Bar */}
      {activeRouteInfo && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 z-20 bg-emerald-950/90 text-white backdrop-blur-md border border-emerald-600 px-4 py-2.5 rounded-xl shadow-2xl flex items-center gap-3 text-xs max-w-md">
          <Route className="w-5 h-5 text-emerald-400 flex-shrink-0" />
          <div className="min-w-0 flex-1">
            <span className="font-bold text-emerald-300 block truncate">
              {t("nearest_safe_site")}: {activeRouteInfo.destName}
            </span>
            <div className="flex items-center gap-3 text-emerald-100 font-mono text-xs mt-0.5">
              <span><strong>{t("route_distance")}:</strong> {activeRouteInfo.distanceKm} km</span>
              <span>•</span>
              <span><strong>{t("route_eta")}:</strong> ~{activeRouteInfo.durationMin} mins</span>
            </div>
          </div>
          <button
            onClick={clearActiveRoute}
            className="p-1 text-emerald-300 hover:text-white"
            title="Clear Route"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Grouped Layer & Legend Card (Floating Top-Left) */}
      {layersCollapsed ? (
        <div className="absolute top-4 left-4 z-20">
          <button
            onClick={toggleLayers}
            className="flex items-center gap-2 px-3.5 py-2 bg-white/95 dark:bg-[#111827ee] hover:bg-slate-50 dark:hover:bg-[#1e293b] text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-[#374151] rounded-full shadow-xl backdrop-blur-md text-xs font-bold transition-all group hover:scale-105"
            title="Open Layers & Legend (L)"
            aria-label="Open Layers and Legend (L)"
          >
            <Layers className="w-4 h-4 text-blue-600 dark:text-blue-400 group-hover:rotate-12 transition-transform" />
            <span>{t("layers_header")}</span>
            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">L</span>
          </button>
        </div>
      ) : (
        <div className="absolute top-4 left-4 z-20 bg-white/95 dark:bg-[#111827ee] backdrop-blur-md border border-slate-200 dark:border-[#374151] rounded-xl shadow-2xl w-72 max-w-[calc(100vw-2rem)] transition-all animate-in fade-in zoom-in-95 duration-200">
          {/* Card Header with Collapse */}
          <div className="p-3 border-b border-slate-200 dark:border-slate-700/80 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                {t("layers_header")}
              </span>
              <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-400">L</span>
            </div>
            <button
              onClick={toggleLayers}
              className="p-1 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 rounded transition"
              title="Collapse Layers (L)"
              aria-label="Collapse Layers Panel"
            >
              <ChevronUp className="w-4 h-4" />
            </button>
          </div>

          <div className="p-3 space-y-3 max-h-[70vh] overflow-y-auto text-xs">
            {/* Tabs for Layers vs Legend */}
            <div className="flex rounded-lg bg-slate-100 dark:bg-slate-900/80 p-0.5 border border-slate-200 dark:border-slate-800">
              <button
                onClick={() => setActiveLayerTab("layers")}
                className={`flex-1 py-1 text-[11px] font-bold rounded-md transition ${
                  activeLayerTab === "layers"
                    ? "bg-white dark:bg-blue-600 text-blue-700 dark:text-white shadow-sm"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                {t("layers_header")}
              </button>
              <button
                onClick={() => setActiveLayerTab("legend")}
                className={`flex-1 py-1 text-[11px] font-bold rounded-md transition ${
                  activeLayerTab === "legend"
                    ? "bg-white dark:bg-blue-600 text-blue-700 dark:text-white shadow-sm"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                {t("legend_title")}
              </button>
            </div>

            {activeLayerTab === "layers" ? (
              <div className="space-y-3">
                {/* 1. Core Settlements & Safe Shelters */}
                <div className="space-y-1.5">
                  <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                    {t("core_geo_entities")}
                  </span>
                  <label className="flex items-center justify-between p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800/60 cursor-pointer transition">
                    <span className="flex items-center gap-2 text-slate-800 dark:text-slate-200 font-medium">
                      <span className="w-2.5 h-2.5 rounded-full bg-red-600 ring-2 ring-red-400/30 flex-shrink-0" />
                      {t("layer_settlements")}
                    </span>
                    <input
                      type="checkbox"
                      checked={showHabs}
                      onChange={(e) => setShowHabs(e.target.checked)}
                      className="rounded border-slate-300 dark:border-slate-600 text-blue-600 focus:ring-blue-500 w-3.5 h-3.5"
                    />
                  </label>
                  <label className="flex items-center justify-between p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800/60 cursor-pointer transition">
                    <span className="flex items-center gap-2 text-slate-800 dark:text-slate-200 font-medium">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 ring-2 ring-emerald-400/30 flex-shrink-0" />
                      {t("layer_safesites")}
                    </span>
                    <input
                      type="checkbox"
                      checked={showSites}
                      onChange={(e) => setShowSites(e.target.checked)}
                      className="rounded border-slate-300 dark:border-slate-600 text-blue-600 focus:ring-blue-500 w-3.5 h-3.5"
                    />
                  </label>
                </div>

                {/* 2. Hazard Susceptibility Layers */}
                <div className="space-y-1.5 pt-2 border-t border-slate-200 dark:border-slate-700/60">
                  <span className="text-[10px] font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider block">
                    {t("hazard_layers_grp")}
                  </span>
                  <label className="flex items-center justify-between p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800/60 cursor-pointer transition">
                    <span className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                      <span className="w-2.5 h-2.5 rounded-sm bg-orange-500/80 border border-orange-600 flex-shrink-0" />
                      {t("layer_landslide")}
                    </span>
                    <input
                      type="checkbox"
                      checked={showLandslide}
                      onChange={(e) => setShowLandslide(e.target.checked)}
                      className="rounded border-slate-300 dark:border-slate-600 text-amber-600 focus:ring-amber-500 w-3.5 h-3.5"
                    />
                  </label>
                  <label className="flex items-center justify-between p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800/60 cursor-pointer transition">
                    <span className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                      <span className="w-2.5 h-2.5 rounded-sm bg-blue-500/80 border border-blue-600 flex-shrink-0" />
                      {t("layer_flood")}
                    </span>
                    <input
                      type="checkbox"
                      checked={showFlood}
                      onChange={(e) => setShowFlood(e.target.checked)}
                      className="rounded border-slate-300 dark:border-slate-600 text-blue-600 focus:ring-blue-500 w-3.5 h-3.5"
                    />
                  </label>
                </div>
              </div>
            ) : (
              /* Legend View */
              <div className="space-y-2.5 py-1">
                <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                  {t("legend_desc")}
                </p>
                <div className="space-y-2">
                  <div className="flex items-center gap-2.5 p-1.5 rounded bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60">
                    <span className="w-3.5 h-3.5 rounded-full bg-[#DC2626] ring-2 ring-red-400/40 flex-shrink-0" />
                    <div>
                      <span className="font-bold text-[#DC2626] block leading-tight">{t("red_zone")}</span>
                      <span className="text-[10px] text-slate-600 dark:text-slate-400">{t("red_zone_legend")}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5 p-1.5 rounded bg-orange-50 dark:bg-orange-950/40 border border-orange-200 dark:border-orange-900/60">
                    <span className="w-3.5 h-3.5 rounded-full bg-[#EA580C] ring-2 ring-orange-400/40 flex-shrink-0" />
                    <div>
                      <span className="font-bold text-[#EA580C] block leading-tight">{t("high_risk")}</span>
                      <span className="text-[10px] text-slate-600 dark:text-slate-400">{t("high_risk_legend")}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5 p-1.5 rounded bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60">
                    <span className="w-3.5 h-3.5 rounded-full bg-[#F59E0B] ring-2 ring-amber-400/40 flex-shrink-0" />
                    <div>
                      <span className="font-bold text-[#CA8A04] dark:text-[#EAB308] block leading-tight">{t("moderate_risk")}</span>
                      <span className="text-[10px] text-slate-600 dark:text-slate-400">{t("moderate_risk_legend")}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5 p-1.5 rounded bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60">
                    <span className="w-3.5 h-3.5 rounded-full bg-[#10B981] ring-2 ring-emerald-400/40 flex-shrink-0" />
                    <div>
                      <span className="font-bold text-[#10B981] block leading-tight">{t("safe_zone")}</span>
                      <span className="text-[10px] text-slate-600 dark:text-slate-400">{t("safe_zone_legend")}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Zen Mode Floating Restore Button */}
      {zenMode && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-30">
          <button
            onClick={toggleZenMode}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-full shadow-2xl transition-all hover:scale-105"
            title="Restore all panels (Z)"
          >
            <Minimize2 className="w-4 h-4" />
            <span>{t("restore_panels")} (Z)</span>
          </button>
        </div>
      )}

      {/* RiskOS Clean Bottom Status Ribbon */}
      <div className="absolute bottom-2 right-4 z-10 bg-white/95 dark:bg-[#0F172Aee] backdrop-blur-md text-[#0F172A] dark:text-slate-200 border border-slate-200 dark:border-slate-700/80 px-3 py-1.5 rounded-full text-[10px] font-mono shadow-lg flex items-center gap-3">
        <div className="flex items-center gap-1.5 font-semibold">
          <Navigation className="w-3 h-3 text-blue-600 dark:text-amber-400" />
          <span>{cursorCoords ? `Lat: ${cursorCoords.lat}° N, Lon: ${cursorCoords.lon}° E` : "Lat: 30.1500° N, Lon: 79.2500° E"}</span>
        </div>
        <span className="text-slate-300 dark:text-slate-600">|</span>
        <span className="font-medium">Zoom: {cursorCoords ? cursorCoords.zoom : "7.8"}</span>
        <span className="text-slate-300 dark:text-slate-600 hidden sm:inline">|</span>
        <span className="text-blue-700 dark:text-cyan-400 font-bold hidden sm:inline">EPSG:4326 (WGS 84)</span>
        <span className="text-slate-300 dark:text-slate-600 hidden md:inline">|</span>
        <span className="text-emerald-700 dark:text-emerald-400 font-semibold hidden md:inline">Metric (km)</span>
      </div>
    </div>
  );
}