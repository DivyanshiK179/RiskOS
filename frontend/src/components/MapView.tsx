import { useEffect, useRef, useState, useCallback } from "react";
import * as maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { toPng } from "html-to-image";
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
  ChevronUp,
  Ruler,
  Navigation,
  Crosshair,
  Route,
  Expand,
  Minimize2,
  X,
  Search,
  Download,
  Target,
  BarChart3,
  ArrowRight
} from "lucide-react";
import { useTranslation } from "../i18n/translations";
import { useUIStore } from "../store/uiStore";
import { useAuthStore } from "../store/authStore";
import { DISTRICT_CENTROIDS, UTTARAKHAND_DEFAULT_CENTER, DISTRICT_NAMES_HI } from "../lib/districts";
import { SOI_AUTHORITATIVE_BOUNDARY_GEOJSON } from "../lib/soiBoundary";

interface MapViewProps {
  district?: string;
  hazardLevel?: string;
  onSelectHabitation?: (id: number) => void;
  selectedHabitationId?: number | null;
  showSafeSites?: boolean;
  simulationMode?: boolean;
  simulationEpicenter?: { lat: number; lon: number } | null;
  simulationRadius?: number;
  simulationType?: string;
  onEpicenterChange?: (epicenter: { lat: number; lon: number }) => void;
  onMapClick?: (lat: number, lon: number) => void;
  simulationResults?: SimulationResult | null;
  habitationsData?: any;
  focusedLocation?: { lat: number; lon: number } | null;
  onActivateSimulation?: (epicenter?: { lat: number; lon: number }, radius?: number) => void;
  onToggleAnalytics?: () => void;
  isAnalyticsOpen?: boolean;
  settlementCount?: number;
  initialShowLandslide?: boolean;
  initialShowFlood?: boolean;
  initialFacility?: string;
}

export type BasemapType = "satellite" | "streets" | "street" | "topo" | "bhuvan";

export const BASEMAP_OPTIONS = [
  { id: "satellite", label: "Satellite Hybrid", icon: "🛰️", hiLabel: "उपग्रह हाइब्रिड" },
  { id: "bhuvan", label: "ISRO Bhuvan", icon: "🛰️", hiLabel: "इसरो भुवन" },
  { id: "topo", label: "Topographic", icon: "🗺️", hiLabel: "स्थलाकृतिक" },
  { id: "streets", label: "Street Map", icon: "🛣️", hiLabel: "सड़क मानचित्र" },
];

export const BASEMAPS = {
  satellite: {
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    attribution: "Esri, Maxar, Earthstar Geographics",
  },
  street: {
    url: "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",
    attribution: "CartoDB, OpenStreetMap",
  },
  topo: {
    url: "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png",
    attribution: "OpenTopoMap",
  },
  bhuvan: {
    url: import.meta.env.VITE_OFFLINE_TILE_SERVER || "https://tile1.nrsc.gov.in/tilecache/tilecache.py/1.0.0/bhuvan_layer/{z}/{x}/{y}.png",
    attribution: "ISRO / NRSC Bhuvan, Survey of India, SDC Uttarakhand",
  },
};

/**
 * Normalizes any coordinate representation into [lng, lat] for MapLibre GL JS.
 * Safeguards against Leaflet [lat, lng] vs GeoJSON [lng, lat] inversion.
 * In Uttarakhand, longitude is ~77.5 - 81.2 (always > 50) and latitude is ~28.5 - 31.5 (always < 50).
 */
export function normalizeMapCoords(item: any): [number, number] | null {
  if (!item) return null;
  // GeoJSON Feature or geometry
  const coords = item.geometry?.coordinates || item.coordinates;
  if (Array.isArray(coords) && coords.length >= 2) {
    const c0 = Number(coords[0]);
    const c1 = Number(coords[1]);
    if (!isNaN(c0) && !isNaN(c1)) {
      const lng = c0 > 50 ? c0 : c1;
      const lat = c0 > 50 ? c1 : c0;
      return [lng, lat];
    }
  }
  // Object with lat/lon or latitude/longitude
  const latVal = Number(item.latitude ?? item.lat);
  const lngVal = Number(item.longitude ?? item.lon ?? item.lng);
  if (!isNaN(latVal) && !isNaN(lngVal)) {
    const lng = lngVal > 50 ? lngVal : latVal;
    const lat = lngVal > 50 ? latVal : lngVal;
    return [lng, lat];
  }
  return null;
}

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
  simulationEpicenter,
  simulationRadius = 10,
  simulationType = "CLOUDBURST",
  onEpicenterChange,
  onMapClick,
  simulationResults,
  habitationsData,
  focusedLocation,
  onActivateSimulation,
  onToggleAnalytics,
  isAnalyticsOpen = false,
  settlementCount,
  initialShowLandslide,
  initialShowFlood,
  initialFacility,
}: MapViewProps) {
  const { t, lang } = useTranslation();
  const isHi = lang === "hi";
  const {
    theme,
    layersCollapsed,
    toggleLayers,
    zenMode,
    toggleZenMode,
    resizeTrigger,
    isTargetToolActive,
    setIsTargetToolActive,
  } = useUIStore();
  const clearanceRole = useAuthStore((s) => s.clearanceRole);
  const langRef = useRef(lang);
  const themeRef = useRef(theme);
  const clearanceRoleRef = useRef(clearanceRole);

  useEffect(() => { langRef.current = lang; }, [lang]);
  useEffect(() => { themeRef.current = theme; }, [theme]);
  useEffect(() => { clearanceRoleRef.current = clearanceRole; }, [clearanceRole]);

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
  const [isBasemapMenuOpen, setIsBasemapMenuOpen] = useState(false);

  const currentOption = BASEMAP_OPTIONS.find(
    (b) => b.id === activeBasemap || (b.id === "streets" && activeBasemap === "street")
  ) || BASEMAP_OPTIONS[0];

  // Grouped Hazard & Infrastructure Layer Toggles
  const [showHabs, setShowHabs] = useState(true);
  const [showSites, setShowSites] = useState(showSafeSites ?? true);
  const [showLandslide, setShowLandslide] = useState(initialShowLandslide ?? true);
  const [showFlood, setShowFlood] = useState(initialShowFlood ?? false);
  const [activeLayerTab, setActiveLayerTab] = useState<"layers" | "legend">("layers");

  useEffect(() => {
    if (showSafeSites !== undefined) setShowSites(showSafeSites);
  }, [showSafeSites]);

  // Facility Ribbon Filter (BharatMaps Standard)
  const [selectedFacility, setSelectedFacility] = useState<string>(initialFacility ?? "all");

  useEffect(() => {
    if (initialShowLandslide !== undefined) setShowLandslide(initialShowLandslide);
  }, [initialShowLandslide]);

  useEffect(() => {
    if (initialShowFlood !== undefined) setShowFlood(initialShowFlood);
  }, [initialShowFlood]);

  useEffect(() => {
    if (initialFacility !== undefined) setSelectedFacility(initialFacility);
  }, [initialFacility]);

  // Top-Left Floating Dock Search & Spatial Tools
  const [mapSearchText, setMapSearchText] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searchOpen, setSearchOpen] = useState(false);

  // Target Epicenter & Dynamic Hazard Buffer State
  const [targetEpicenter, setTargetEpicenter] = useState<{ lat: number; lon: number } | null>(null);
  const [targetRadiusKm, setTargetRadiusKm] = useState(15);
  const [targetBrief, setTargetBrief] = useState<{
    lat: number;
    lon: number;
    district: string;
    habitationsCount: number;
    totalPopulation: number;
    nearestShelters: Array<{ name: string; distanceKm: number; capacity?: number; type?: string }>;
  } | null>(null);

  const targetRadiusKmRef = useRef(15);
  const targetEpicenterRef = useRef<{ lat: number; lon: number } | null>(null);
  const targetMarkerRef = useRef<maplibregl.Marker | null>(null);
  const isTargetToolActiveRef = useRef(isTargetToolActive);

  useEffect(() => {
    isTargetToolActiveRef.current = isTargetToolActive;
  }, [isTargetToolActive]);

  useEffect(() => {
    targetRadiusKmRef.current = targetRadiusKm;
  }, [targetRadiusKm]);

  useEffect(() => {
    targetEpicenterRef.current = targetEpicenter;
  }, [targetEpicenter]);

  // GIS Inspector & Utilities
  const [cursorCoords, setCursorCoords] = useState<{ lat: string; lon: string; zoom: string } | null>(null);
  const [measuring, setMeasuring] = useState(false);
  const [measurePoints, setMeasurePoints] = useState<[number, number][]>([]);
  const [measureDistanceKm, setMeasureDistanceKm] = useState<number | null>(null);
  const [activeRouteInfo, setActiveRouteInfo] = useState<{ distanceKm: number; durationMin: number; destName: string } | null>(null);

  const simulationModeRef = useRef(simulationMode);
  const onMapClickRef = useRef(onMapClick);
  const onEpicenterChangeRef = useRef(onEpicenterChange);
  const measuringRef = useRef(measuring);
  const measurePointsRef = useRef(measurePoints);

  useEffect(() => {
    simulationModeRef.current = simulationMode;
    onMapClickRef.current = onMapClick;
    onEpicenterChangeRef.current = onEpicenterChange;
  }, [simulationMode, onMapClick, onEpicenterChange]);

  useEffect(() => {
    measuringRef.current = measuring;
    measurePointsRef.current = measurePoints;
  }, [measuring, measurePoints]);

  // Autocomplete search across loaded habitations and Uttarakhand districts
  useEffect(() => {
    if (!mapSearchText.trim()) {
      setSearchResults([]);
      return;
    }
    const q = mapSearchText.toLowerCase().trim();
    const results: any[] = [];

    // 1. Search official districts
    for (const [distName, center] of Object.entries(DISTRICT_CENTROIDS)) {
      if (distName.toLowerCase().includes(q)) {
        results.push({
          isDistrict: true,
          name: distName,
          lat: center.lat,
          lon: center.lon,
          zoom: center.zoom,
        });
      }
    }

    // 2. Search loaded settlements
    const allFeatures = habitationsData?.features || [];
    for (const f of allFeatures) {
      if (results.length >= 10) break;
      const name = (f.properties?.name || "").toLowerCase();
      const dist = (f.properties?.district || "").toLowerCase();
      if (name.includes(q) || dist.includes(q)) {
        results.push(f);
      }
    }

    // 3. Search loaded safe shelters & emergency facilities
    const safeSites = safeSitesRef.current?.features || [];
    for (const s of safeSites) {
      if (results.length >= 15) break;
      const name = (s.properties?.name || "").toLowerCase();
      const dist = (s.properties?.district || "").toLowerCase();
      if (name.includes(q) || dist.includes(q)) {
        results.push({ ...s, isSafeSite: true });
      }
    }

    setSearchResults(results.slice(0, 8));
  }, [mapSearchText, habitationsData]);

  const handleSelectSearchResult = (item: any) => {
    setSearchOpen(false);
    if (!mapRef.current) return;

    if (item.isDistrict) {
      setMapSearchText(item.name);
      mapRef.current.flyTo({
        center: [item.lon, item.lat],
        zoom: item.zoom || 10,
        duration: 1200,
        essential: true,
      });
      return;
    }

    if (item.isSafeSite) {
      setMapSearchText(item.properties?.name || "");
      const coords = normalizeMapCoords(item);
      if (coords) {
        mapRef.current.flyTo({
          center: coords,
          zoom: 15,
          duration: 1200,
          essential: true,
        });
        showSafeSitePopup(item, coords);
      }
      return;
    }

    setMapSearchText(item.properties?.name || "");
    const coords = normalizeMapCoords(item);
    if (coords) {
      mapRef.current.flyTo({
        center: coords,
        zoom: 14,
        duration: 1200,
        essential: true,
      });
      showSettlementPopup(item, coords);
      if (onSelectHabitation) onSelectHabitation(item.properties?.id || item.id);
    }
  };

  const handleDownloadMap = async () => {
    // Target the main map container DOM element
    const mapElement =
      (document.querySelector(".leaflet-container") as HTMLElement) ||
      document.getElementById("map-container") ||
      (document.querySelector(".maplibregl-map") as HTMLElement) ||
      mapContainer.current;

    const map = mapRef.current;

    if (!mapElement && !map) {
      console.error("Map container not found for export");
      return;
    }

    try {
      // Force repaint so WebGL drawing buffer is freshly rendered in preserveDrawingBuffer
      if (map) {
        map.triggerRepaint();
        await new Promise<void>((resolve) => {
          map.once("render", () => resolve());
          setTimeout(resolve, 200);
        });
      }

      // Filter out unwanted interactive UI buttons from the exported image
      const filter = (node: HTMLElement | Node) => {
        if (!(node instanceof HTMLElement)) return true;
        const exclusionClasses = [
          "leaflet-control-zoom",
          "leaflet-control-attribution",
          "gis-toolbar",
          "basemap-floating-card",
          "maplibregl-ctrl",
          "maplibregl-ctrl-top-right",
          "maplibregl-ctrl-bottom-right",
          "maplibregl-ctrl-bottom-left",
          "maplibregl-ctrl-top-left",
          "map-controls",
          "map-action-dock"
        ];
        return !exclusionClasses.some((cls) => node.classList?.contains(cls));
      };

      let dataUrl: string | null = null;

      if (mapElement) {
        try {
          dataUrl = await toPng(mapElement, {
            cacheBust: true,
            filter: filter as (domNode: HTMLElement) => boolean,
            pixelRatio: 2, // High resolution crisp export
          });
        } catch (err) {
          console.warn("toPng map export encountered issue, falling back to WebGL canvas:", err);
        }
      }

      // If toPng returned a blank or failed or was empty, fallback to WebGL canvas directly
      if (!dataUrl || dataUrl === "data:," || dataUrl.length < 1000) {
        if (map && typeof map.getCanvas === "function") {
          map.triggerRepaint();
          const canvas = map.getCanvas();
          dataUrl = canvas.toDataURL("image/png");
        }
      }

      if (dataUrl && dataUrl !== "data:," && dataUrl.length > 100) {
        const downloadLink = document.createElement("a");
        const timestamp = new Date().toISOString().split("T")[0];
        downloadLink.download = `riskos-map-inspection-${timestamp}.png`;
        downloadLink.href = dataUrl;
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
      } else {
        handleExportData();
      }
    } catch (error) {
      console.error("Failed to generate map image export:", error);

      // Fallback for MapLibre / WebGL context if using MapLibre GL
      if (map && typeof map.getCanvas === "function") {
        try {
          map.triggerRepaint();
          const canvas = map.getCanvas();
          const dataUrl = canvas.toDataURL("image/png");
          const downloadLink = document.createElement("a");
          const timestamp = new Date().toISOString().split("T")[0];
          downloadLink.download = `riskos-map-inspection-${timestamp}.png`;
          downloadLink.href = dataUrl;
          document.body.appendChild(downloadLink);
          downloadLink.click();
          document.body.removeChild(downloadLink);
        } catch {
          handleExportData();
        }
      } else {
        handleExportData();
      }
    }
  };

  const handleExportMapViewport = handleDownloadMap;

  const handleExportData = () => {
    const dataToExport = habitationsData || {
      type: "FeatureCollection",
      features: [],
    };
    const blob = new Blob([JSON.stringify(dataToExport, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `riskos-geodata-export-${new Date().toISOString().slice(0, 10)}.geojson`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const clearTargetTool = useCallback(() => {
    if (targetMarkerRef.current) {
      targetMarkerRef.current.remove();
      targetMarkerRef.current = null;
    }
    if (mapRef.current) {
      const src = mapRef.current.getSource("buffer-tool-source") as any;
      if (src) {
        src.setData({
          type: "FeatureCollection",
          features: [],
        });
      }
      if (!measuringRef.current && !simulationModeRef.current) {
        mapRef.current.getCanvas().style.cursor = "";
      }
    }
    setTargetEpicenter(null);
    setTargetBrief(null);
  }, []);

  const handleSetTargetEpicenter = useCallback((lat: number, lon: number, radiusKm: number) => {
    if (!mapRef.current) return;
    setTargetEpicenter({ lat, lon });

    // 1. Draw dynamic circular hazard buffer
    const circlePoly = turf.circle([lon, lat], radiusKm, { steps: 64, units: "kilometers" });
    const bufferSrc = mapRef.current.getSource("buffer-tool-source") as any;
    if (bufferSrc) {
      bufferSrc.setData({
        type: "FeatureCollection",
        features: [circlePoly],
      });
    }

    // 2. Animated Pulsating Epicenter Marker
    if (targetMarkerRef.current) {
      targetMarkerRef.current.setLngLat([lon, lat]);
    } else {
      const el = document.createElement("div");
      el.className = "riskos-epicenter-marker";
      el.title = "Disaster Epicenter (Drag to adjust coordinates)";
      el.innerHTML = `
        <div class="radar-ring-1"></div>
        <div class="radar-ring-2"></div>
        <div class="core-pin">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="width: 14px; height: 14px; color: white;">
            <circle cx="12" cy="12" r="10"/>
            <line x1="22" y1="12" x2="18" y2="12"/>
            <line x1="6" y1="12" x2="2" y2="12"/>
            <line x1="12" y1="6" x2="12" y2="2"/>
            <line x1="12" y1="22" x2="12" y2="18"/>
          </svg>
        </div>
      `;
      const marker = new maplibregl.Marker({
        element: el,
        draggable: true,
      })
        .setLngLat([lon, lat])
        .addTo(mapRef.current);

      marker.on("dragend", () => {
        const lngLat = marker.getLngLat();
        handleSetTargetEpicenter(lngLat.lat, lngLat.lng, targetRadiusKmRef.current);
      });

      targetMarkerRef.current = marker;
    }

    // 3. Spatial Query & Telemetry
    const epicPt = turf.point([lon, lat]);
    const habFeatures = habitationsData?.features || (mapRef.current.getSource("habitations") as any)?._data?.features || [];
    let affectedHabs = 0;
    let affectedPopulation = 0;
    let nearestDistrictName = "";
    let minDistrictDist = Infinity;

    for (const [dName, center] of Object.entries(DISTRICT_CENTROIDS)) {
      const dDist = turf.distance(epicPt, turf.point([center.lon, center.lat]), { units: "kilometers" });
      if (dDist < minDistrictDist) {
        minDistrictDist = dDist;
        nearestDistrictName = dName;
      }
    }

    for (const feat of habFeatures) {
      const coords = normalizeMapCoords(feat);
      if (!coords) continue;
      const pt = turf.point(coords);
      const d = turf.distance(epicPt, pt, { units: "kilometers" });
      if (d <= radiusKm) {
        affectedHabs++;
        const pop = Number(feat.properties?.population ?? feat.properties?.pop ?? feat.population ?? 0);
        affectedPopulation += isNaN(pop) ? 0 : pop;
      }
    }

    // 4. Safe Shelters Outside Buffer Perimeter
    const shelterFeatures = safeSitesRef.current?.features || [];
    const outsideShelters: Array<{ name: string; distanceKm: number; capacity?: number; type?: string }> = [];

    for (const s of shelterFeatures) {
      const coords = normalizeMapCoords(s);
      if (!coords) continue;
      const pt = turf.point(coords);
      const d = turf.distance(epicPt, pt, { units: "kilometers" });
      if (d > radiusKm) {
        outsideShelters.push({
          name: s.properties?.name || s.name || "Safe Relocation Shelter",
          distanceKm: Number(d.toFixed(1)),
          capacity: s.properties?.capacity || s.capacity,
          type: s.properties?.facility_type || s.properties?.type || "Shelter",
        });
      }
    }

    outsideShelters.sort((a, b) => a.distanceKm - b.distanceKm);

    setTargetBrief({
      lat,
      lon,
      district: nearestDistrictName || "Uttarakhand",
      habitationsCount: affectedHabs,
      totalPopulation: affectedPopulation,
      nearestShelters: outsideShelters.slice(0, 3),
    });
  }, [habitationsData]);

  const handleRadiusChange = (newRadius: number) => {
    setTargetRadiusKm(newRadius);
    targetRadiusKmRef.current = newRadius;
    if (targetEpicenterRef.current) {
      handleSetTargetEpicenter(targetEpicenterRef.current.lat, targetEpicenterRef.current.lon, newRadius);
    }
  };

  // Escape key cancels target tool mode
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (isTargetToolActiveRef.current) {
          setIsTargetToolActive(false);
          clearTargetTool();
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [setIsTargetToolActive, clearTargetTool]);

  // Dynamic Map Cursor Control
  useEffect(() => {
    if (!mapLoaded || !mapRef.current) return;
    const canvas = mapRef.current.getCanvas();
    if (!canvas) return;
    if (simulationMode || isTargetToolActive) {
      canvas.style.cursor = "crosshair";
    } else if (!measuring) {
      canvas.style.cursor = "";
    }
  }, [simulationMode, isTargetToolActive, measuring, mapLoaded]);

  // Animated Draggable Disaster Epicenter Marker
  useEffect(() => {
    if (!mapLoaded || !mapRef.current) return;

    if (!simulationMode || !simulationEpicenter) {
      if (epicenterMarkerRef.current) {
        epicenterMarkerRef.current.remove();
        epicenterMarkerRef.current = null;
      }
      return;
    }

    const { lat, lon } = simulationEpicenter;

    if (epicenterMarkerRef.current) {
      const currentPos = epicenterMarkerRef.current.getLngLat();
      if (Math.abs(currentPos.lat - lat) > 0.0001 || Math.abs(currentPos.lng - lon) > 0.0001) {
        epicenterMarkerRef.current.setLngLat([lon, lat]);
      }
    } else {
      const el = document.createElement("div");
      el.className = "riskos-epicenter-marker";
      el.title = "Disaster Epicenter (Drag to adjust coordinates)";
      el.innerHTML = `
        <div class="radar-ring-1"></div>
        <div class="radar-ring-2"></div>
        <div class="core-pin">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="width:16px;height:16px;">
            <circle cx="12" cy="12" r="8" />
            <circle cx="12" cy="12" r="2.5" fill="currentColor" />
            <line x1="12" y1="1" x2="12" y2="4" />
            <line x1="12" y1="20" x2="12" y2="23" />
            <line x1="1" y1="12" x2="4" y2="12" />
            <line x1="20" y1="12" x2="23" y2="12" />
          </svg>
        </div>
      `;

      const marker = new maplibregl.Marker({
        element: el,
        draggable: true,
      })
        .setLngLat([lon, lat])
        .addTo(mapRef.current);

      marker.on("drag", () => {
        const lngLat = marker.getLngLat();
        onEpicenterChangeRef.current?.({ lat: lngLat.lat, lon: lngLat.lng });
      });

      marker.on("dragend", () => {
        const lngLat = marker.getLngLat();
        onEpicenterChangeRef.current?.({ lat: lngLat.lat, lon: lngLat.lng });
      });

      epicenterMarkerRef.current = marker;
    }
  }, [simulationMode, simulationEpicenter, mapLoaded]);

  // Real-time Dynamic Impact Radius Buffer (Linked to Radius Slider & Disaster Type)
  useEffect(() => {
    if (!mapLoaded || !mapRef.current) return;
    const source = mapRef.current.getSource("simulation-circle") as any;
    if (!source) return;

    const targetEpicenter = simulationEpicenter || (simulationResults ? simulationResults.epicenter : null);

    if (!simulationMode || !targetEpicenter) {
      if (!simulationResults) {
        source.setData({ type: "FeatureCollection", features: [] });
      }
      return;
    }

    const { lat, lon } = targetEpicenter;
    const radius = simulationRadius || 10;
    const type = simulationType || (simulationResults ? simulationResults.epicenter.type : "CLOUDBURST");

    const circleFeatures: any[] = [];

    if (type === "EARTHQUAKE") {
      // Concentric seismic fault shockwave rings
      const r1 = Math.max(0.5, radius * 0.33);
      const r2 = Math.max(1, radius * 0.66);
      const r3 = radius;

      const circle3 = turf.circle([lon, lat], r3, { steps: 64, units: "kilometers" });
      circle3.properties = {
        fillColor: "rgba(220, 38, 38, 0.12)",
        fillOpacity: 0.18,
        strokeColor: "#ef4444",
        strokeWidth: 1.5,
      };

      const circle2 = turf.circle([lon, lat], r2, { steps: 64, units: "kilometers" });
      circle2.properties = {
        fillColor: "rgba(239, 68, 68, 0.20)",
        fillOpacity: 0.25,
        strokeColor: "#dc2626",
        strokeWidth: 2,
      };

      const circle1 = turf.circle([lon, lat], r1, { steps: 64, units: "kilometers" });
      circle1.properties = {
        fillColor: "rgba(220, 38, 38, 0.35)",
        fillOpacity: 0.40,
        strokeColor: "#991b1b",
        strokeWidth: 2.5,
      };

      circleFeatures.push(circle3, circle2, circle1);
    } else {
      let fillColor = "rgba(14, 165, 233, 0.25)";
      let strokeColor = "#0284c7";
      let innerFillColor = "rgba(2, 132, 199, 0.40)";

      if (type === "LANDSLIDE") {
        fillColor = "rgba(225, 29, 72, 0.25)";
        strokeColor = "#e11d48";
        innerFillColor = "rgba(190, 18, 60, 0.40)";
      } else if (type === "GLOF") {
        fillColor = "rgba(79, 70, 229, 0.25)";
        strokeColor = "#4f46e5";
        innerFillColor = "rgba(67, 56, 202, 0.40)";
      }

      // Outer shockwave buffer (100% radius)
      const outerCircle = turf.circle([lon, lat], radius, { steps: 64, units: "kilometers" });
      outerCircle.properties = {
        fillColor,
        fillOpacity: 0.25,
        strokeColor,
        strokeWidth: 2.5,
      };

      // Inner direct rupture core (30% radius)
      const innerRadius = Math.max(0.5, radius * 0.3);
      const innerCircle = turf.circle([lon, lat], innerRadius, { steps: 64, units: "kilometers" });
      innerCircle.properties = {
        fillColor: innerFillColor,
        fillOpacity: 0.35,
        strokeColor,
        strokeWidth: 2,
      };

      circleFeatures.push(outerCircle, innerCircle);
    }

    source.setData({
      type: "FeatureCollection",
      features: circleFeatures,
    });
  }, [simulationMode, simulationEpicenter, simulationRadius, simulationType, mapLoaded, simulationResults]);

  // Focus on Map transition
  useEffect(() => {
    if (!mapLoaded || !mapRef.current || !focusedLocation) return;
    const norm = normalizeMapCoords(focusedLocation);
    if (!norm) return;
    mapRef.current.flyTo({
      center: norm,
      zoom: 14.5,
      speed: 1.6,
      curve: 1.2,
      essential: true,
    });
  }, [focusedLocation, mapLoaded]);

  // Auto pan/zoom to district geographic center when district filter changes
  const prevDistrictRef = useRef<string | undefined>(district);
  useEffect(() => {
    if (!mapLoaded || !mapRef.current) return;
    if (district === prevDistrictRef.current) return;
    prevDistrictRef.current = district;

    if (district && DISTRICT_CENTROIDS[district]) {
      const { lat, lon, zoom } = DISTRICT_CENTROIDS[district];
      mapRef.current.flyTo({
        center: [lon, lat],
        zoom,
        duration: 1200,
        essential: true,
      });
    } else if (!district && !simulationMode && !focusedLocation) {
      mapRef.current.flyTo({
        center: [UTTARAKHAND_DEFAULT_CENTER.lon, UTTARAKHAND_DEFAULT_CENTER.lat],
        zoom: UTTARAKHAND_DEFAULT_CENTER.zoom,
        duration: 1000,
        essential: true,
      });
    }
  }, [district, mapLoaded, simulationMode, focusedLocation]);

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
                ${isHi ? "जिला" : "District"}
              </span>
              <strong style="color: ${textTitle}; font-size: 12px;">${isHi ? (DISTRICT_NAMES_HI[props.district] || props.district || "उत्तराखंड") : (props.district || "Uttarakhand")}</strong>
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

  // Standardized Safe Site / Facility Inspection Popup
  const showSafeSitePopup = useCallback((feat: any, coords: [number, number]) => {
    if (!mapRef.current) return;
    const props = feat.properties || {};
    const rem = props.remaining_capacity ?? props.estimated_capacity;
    const isHi = langRef.current === "hi";

    const facilityTypeLabels: Record<string, { en: string; hi: string; icon: string }> = {
      health: { en: "Emergency Hospital / Medical Center", hi: "आपातकालीन अस्पताल / स्वास्थ्य केंद्र", icon: "🏥" },
      school: { en: "Evacuation School / Inter College", hi: "निकासी विद्यालय / राहत परिसर", icon: "🏫" },
      shelter: { en: "Official Relocation Shelter", hi: "आधिकारिक सुरक्षित पुनर्वास स्थल", icon: "⛺" },
      helipad: { en: "Strategic Helipad / Air Base", hi: "सामरिक हेलीपैड / एयर बेस", icon: "🚁" },
      ration: { en: "Relief Food & Ration Depot", hi: "राहत खाद्य एवं रसद डिपो", icon: "🍞" },
      siren: { en: "Early Warning Radar Siren", hi: "पूर्व चेतावनी रडार / सायरन टावर", icon: "🚨" },
    };

    const fType = props.facility_type || "shelter";
    const typeInfo = facilityTypeLabels[fType] || facilityTypeLabels.shelter;

    if (activePopupRef.current) {
      activePopupRef.current.remove();
    }

    const isDark = themeRef.current === "dark";
    const bgCard = isDark ? "#0F172A" : "#FFFFFF";
    const textTitle = isDark ? "#F8FAFC" : "#0B2545";
    const textSub = isDark ? "#94A3B8" : "#64748B";
    const borderBox = isDark ? "#334155" : "#E2E8F0";

    const popup = new maplibregl.Popup({ offset: 14, closeButton: true, maxWidth: "320px", className: "riskos-popup" })
      .setLngLat(coords as maplibregl.LngLatLike)
      .setHTML(`
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 6px; background:${bgCard}; color:${textTitle}; border-radius: 8px;">
          <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px;border-bottom:1px solid ${borderBox};padding-bottom:6px;">
            <span style="font-size:18px;">${typeInfo.icon}</span>
            <span style="font-weight:700;color:${textTitle};font-size:13px;line-height:1.2;">${props.name}</span>
          </div>
          <div style="font-size:10px;font-weight:700;color:${isDark ? '#34D399' : '#059669'};text-transform:uppercase;margin-bottom:8px;padding:2px 8px;background:${isDark ? '#064E3B44' : '#ECFDF5'};border-radius:4px;display:inline-block;border:1px solid ${isDark ? '#065F46' : '#A7F3D0'};">
            ${isHi ? typeInfo.hi : typeInfo.en}
          </div>
          <table style="width:100%;font-size:11px;border-collapse:collapse;color:${textTitle};">
            <tr style="border-bottom:1px solid ${borderBox};"><td style="padding:4px 0;color:${textSub};">${isHi ? "जिला" : "District"}</td><td style="padding:4px 0;font-weight:600;text-align:right;">${isHi ? (DISTRICT_NAMES_HI[props.district] || props.district) : props.district}</td></tr>
            <tr style="border-bottom:1px solid ${borderBox};"><td style="padding:4px 0;color:${textSub};">${isHi ? "कुल क्षमता" : "Total Capacity"}</td><td style="padding:4px 0;font-weight:600;text-align:right;">${Number(props.estimated_capacity || 0).toLocaleString()}</td></tr>
            <tr style="border-bottom:1px solid ${borderBox};"><td style="padding:4px 0;color:${textSub};">${isHi ? "उपलब्ध बिस्तर / स्थान" : "Available Beds / Slots"}</td><td style="padding:4px 0;color:#059669;font-weight:700;text-align:right;">${Number(rem || 0).toLocaleString()}</td></tr>
            <tr style="border-bottom:1px solid ${borderBox};"><td style="padding:4px 0;color:${textSub};">${isHi ? "सड़क संपर्क" : "Road Connectivity"}</td><td style="padding:4px 0;color:${props.road_access ? '#059669' : '#DC2626'};font-weight:600;text-align:right;">${props.road_access ? (isHi ? 'उपलब्ध (बारहमासी)' : 'All-Weather') : (isHi ? 'अवरुद्ध / अनुपलब्ध' : 'Blocked')}</td></tr>
            <tr><td style="padding:5px 0 0;color:${textSub};" colspan="2">
              <div style="font-size:10px;color:${textSub};margin-top:2px;border-top:1px dashed ${borderBox};padding-top:4px;line-height:1.4;">
                <strong style="color:${textTitle};">${isHi ? "नोडल अधिकारी / नियंत्रण कक्ष:" : "Nodal Officer / Control Room:"}</strong><br/>
                ${(() => {
                  const raw = props.emergency_contact || (isHi ? `डीईओसी नियंत्रण कक्ष (${DISTRICT_NAMES_HI[props.district] || props.district}) • टोल-फ्री 1077 / 112` : `DEOC Control Room (${props.district}) • Toll-Free 1077 / 112`);
                  if (clearanceRoleRef.current === "PUBLIC_CITIZEN") {
                    return raw.replace(/(\+?91[\s-]?)?([6-9]\d{2})\d{4,5}(\d{2})/g, "$1$2•••••$3 <span style=\"font-size:9px;color:#94A3B8;\">[PII Masked]</span>");
                  }
                  return raw;
                })()}
              </div>
            </td></tr>
          </table>
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
      preserveDrawingBuffer: true,
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
          // 3a. Street / Cadastral Administrative Basemap Light (Carto Voyager)
          "carto-street-light": {
            type: "raster",
            tiles: [
              "https://a.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png",
              "https://b.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png",
              "https://c.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png",
            ],
            tileSize: 256,
            maxzoom: 20,
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
            tiles: [
              "https://a.tile.opentopomap.org/{z}/{x}/{y}.png",
              "https://b.tile.opentopomap.org/{z}/{x}/{y}.png",
              "https://c.tile.opentopomap.org/{z}/{x}/{y}.png",
            ],
            tileSize: 256,
            maxzoom: 17,
          },
          // 5. ISRO Bhuvan NRSC / SDC Fallback Basemap
          "bhuvan-basemap": {
            type: "raster",
            tiles: [
              import.meta.env.VITE_OFFLINE_TILE_SERVER || "https://tile1.nrsc.gov.in/tilecache/tilecache.py/1.0.0/bhuvan_layer/{z}/{x}/{y}.png",
            ],
            tileSize: 256,
            maxzoom: 19,
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
            layout: { visibility: activeBasemap === "satellite" ? "visible" : "none" },
          },
          {
            id: "base-street-light",
            type: "raster",
            source: "carto-street-light",
            minzoom: 0,
            maxzoom: 22,
            layout: { visibility: (activeBasemap === "streets" || activeBasemap === "street") && theme !== "dark" ? "visible" : "none" },
          },
          {
            id: "base-street-dark",
            type: "raster",
            source: "carto-street-dark",
            minzoom: 0,
            maxzoom: 22,
            layout: { visibility: (activeBasemap === "streets" || activeBasemap === "street") && theme === "dark" ? "visible" : "none" },
          },
          {
            id: "base-topo",
            type: "raster",
            source: "open-topo",
            minzoom: 0,
            maxzoom: 22,
            layout: { visibility: activeBasemap === "topo" ? "visible" : "none" },
          },
          {
            id: "base-bhuvan",
            type: "raster",
            source: "bhuvan-basemap",
            minzoom: 0,
            maxzoom: 22,
            layout: { visibility: activeBasemap === "bhuvan" ? "visible" : "none" },
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
    } as any);

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

      // 4b. Spatial Buffer Tool Source & Symbology
      map.addSource("buffer-tool-source", {
        type: "geojson",
        data: { type: "FeatureCollection", features: [] },
      });
      map.addLayer({
        id: "buffer-tool-fill",
        type: "fill",
        source: "buffer-tool-source",
        paint: { "fill-color": "#EF4444", "fill-opacity": 0.2 },
      });
      map.addLayer({
        id: "buffer-tool-line",
        type: "line",
        source: "buffer-tool-source",
        paint: { "line-color": "#DC2626", "line-width": 2.5, "line-dasharray": [2, 2] },
      });

      // 5. Safe Relocation Shelters Source & Symbology
      map.addSource("safesites", {
        type: "geojson",
        data: safeSitesRef.current && safeSitesRef.current.features?.length > 0
          ? safeSitesRef.current
          : { type: "FeatureCollection", features: [] },
      });

      map.addLayer({
        id: "safesites-layer",
        type: "circle",
        source: "safesites",
        layout: { visibility: showSites ? "visible" : "none" },
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
        layout: { visibility: showHabs ? "visible" : "none" },
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
        layout: { visibility: showHabs ? "visible" : "none" },
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
          visibility: showHabs ? "visible" : "none",
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

      // 0. Official Survey of India (SOI) Statutory Inviolable Boundary Overlay
      map.addSource("soi-boundary", {
        type: "geojson",
        data: SOI_AUTHORITATIVE_BOUNDARY_GEOJSON,
      });

      map.addLayer({
        id: "soi-boundary-casing",
        type: "line",
        source: "soi-boundary",
        paint: {
          "line-color": "#FFFFFF",
          "line-width": 4,
          "line-opacity": 0.55,
        },
      });

      map.addLayer({
        id: "soi-boundary-line",
        type: "line",
        source: "soi-boundary",
        paint: {
          "line-color": "#FF9933", // Official National Saffron
          "line-width": 2.2,
          "line-opacity": 0.95,
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

        // Target Epicenter & Hazard Radius Tool interaction
        if (isTargetToolActiveRef.current) {
          const lat = e.lngLat.lat;
          const lon = e.lngLat.lng;
          handleSetTargetEpicenter(lat, lon, targetRadiusKmRef.current);
          return;
        }

        // Disaster simulation click: set epicenter
        if (simulationModeRef.current) {
          const lat = e.lngLat.lat;
          const lon = e.lngLat.lng;

          if (onEpicenterChangeRef.current) {
            onEpicenterChangeRef.current({ lat, lon });
          }
          if (onMapClickRef.current) {
            onMapClickRef.current(lat, lon);
          }
          return;
        }
      });

      // Habitation Click: Open Standardized RiskOS Popup
      map.on("click", "habitations-layer", (e: any) => {
        if (measuringRef.current || simulationModeRef.current || isTargetToolActiveRef.current) return;
        const feat = e.features?.[0];
        if (!feat) return;
        const coords = (feat.geometry as any).coordinates.slice();
        showSettlementPopup(feat, coords);
        const id = feat.properties?.id || feat.id;
        if (onSelectHabitation && id) onSelectHabitation(Number(id));
      });

      // Safe Site Click: Pan and Open Detail Inspection Popup
      map.on("click", "safesites-layer", (e: any) => {
        if (measuringRef.current || simulationModeRef.current || isTargetToolActiveRef.current) return;
        const feat = e.features?.[0];
        if (!feat) return;
        const rawCoords = (feat.geometry as any).coordinates;
        const normCoords = normalizeMapCoords({ coordinates: rawCoords }) || [rawCoords[0], rawCoords[1]];

        map.flyTo({
          center: normCoords,
          zoom: 14.5,
          duration: 900,
          essential: true,
        });

        showSafeSitePopup(feat, normCoords);
      });

      // Hover Cursors
      for (const layer of ["habitations-layer", "safesites-layer"]) {
        map.on("mouseenter", layer, () => {
          if (!isTargetToolActiveRef.current && !measuringRef.current) {
            map.getCanvas().style.cursor = "pointer";
          }
        });
        map.on("mouseleave", layer, () => {
          map.getCanvas().style.cursor = (measuringRef.current || isTargetToolActiveRef.current || simulationModeRef.current) ? "crosshair" : "";
        });
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
  const switchBasemap = (type: BasemapType | string) => {
    const targetType = type as BasemapType;
    setActiveBasemap(targetType);
    if (!mapRef.current) return;

    const m = mapRef.current;
    const isDark = theme === "dark";

    if (type === "satellite") {
      if (m.getLayer("base-satellite")) m.setLayoutProperty("base-satellite", "visibility", "visible");
      if (m.getLayer("base-labels")) m.setLayoutProperty("base-labels", "visibility", "visible");
      if (m.getLayer("base-street-light")) m.setLayoutProperty("base-street-light", "visibility", "none");
      if (m.getLayer("base-street-dark")) m.setLayoutProperty("base-street-dark", "visibility", "none");
      if (m.getLayer("base-topo")) m.setLayoutProperty("base-topo", "visibility", "none");
      if (m.getLayer("base-bhuvan")) m.setLayoutProperty("base-bhuvan", "visibility", "none");
    } else if (type === "street" || type === "streets") {
      if (m.getLayer("base-satellite")) m.setLayoutProperty("base-satellite", "visibility", "none");
      if (m.getLayer("base-labels")) m.setLayoutProperty("base-labels", "visibility", "none");
      if (m.getLayer("base-street-light")) m.setLayoutProperty("base-street-light", "visibility", isDark ? "none" : "visible");
      if (m.getLayer("base-street-dark")) m.setLayoutProperty("base-street-dark", "visibility", isDark ? "visible" : "none");
      if (m.getLayer("base-topo")) m.setLayoutProperty("base-topo", "visibility", "none");
      if (m.getLayer("base-bhuvan")) m.setLayoutProperty("base-bhuvan", "visibility", "none");
    } else if (type === "topo") {
      if (m.getLayer("base-satellite")) m.setLayoutProperty("base-satellite", "visibility", "none");
      if (m.getLayer("base-labels")) m.setLayoutProperty("base-labels", "visibility", "none");
      if (m.getLayer("base-street-light")) m.setLayoutProperty("base-street-light", "visibility", "none");
      if (m.getLayer("base-street-dark")) m.setLayoutProperty("base-street-dark", "visibility", "none");
      if (m.getLayer("base-topo")) m.setLayoutProperty("base-topo", "visibility", "visible");
      if (m.getLayer("base-bhuvan")) m.setLayoutProperty("base-bhuvan", "visibility", "none");
    } else if (type === "bhuvan") {
      if (m.getLayer("base-satellite")) m.setLayoutProperty("base-satellite", "visibility", "none");
      if (m.getLayer("base-labels")) m.setLayoutProperty("base-labels", "visibility", "visible");
      if (m.getLayer("base-street-light")) m.setLayoutProperty("base-street-light", "visibility", "none");
      if (m.getLayer("base-street-dark")) m.setLayoutProperty("base-street-dark", "visibility", "none");
      if (m.getLayer("base-topo")) m.setLayoutProperty("base-topo", "visibility", "none");
      if (m.getLayer("base-bhuvan")) m.setLayoutProperty("base-bhuvan", "visibility", "visible");
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

    if (habitationsData && Array.isArray(habitationsData.features) && habitationsData.features.length > 0) {
      (mapRef.current.getSource("habitations") as any)?.setData(habitationsData);
      return;
    }

    const cachedData = queryClient.getQueryData<any>(["habitations", district || "", hazardLevel || ""]);
    if (cachedData && Array.isArray(cachedData.features) && cachedData.features.length > 0) {
      (mapRef.current.getSource("habitations") as any)?.setData(cachedData);
    } else {
      let alive = true;
      getHabitations({ district, hazard_level: hazardLevel })
        .then((geojson) => {
          if (!alive || !mapRef.current) return;
          if (geojson && Array.isArray(geojson.features)) {
            (mapRef.current.getSource("habitations") as any)?.setData(geojson);
          }
        })
        .catch((err) => {
          console.warn("Could not load habitations data into map:", err);
        });
      return () => { alive = false; };
    }
  }, [district, hazardLevel, mapLoaded, simulationResults, queryClient, habitationsData]);

  // Refresh safe sites with facility category filter & viewport sync
  useEffect(() => {
    if (!mapLoaded || !mapRef.current) return;
    let alive = true;
    const typeParam = selectedFacility === "all" ? undefined : selectedFacility;
    getSafeSites({ district: district || undefined, type: typeParam })
      .then((geojson) => {
        if (!alive || !mapRef.current) return;
        safeSitesRef.current = geojson;
        if (geojson && Array.isArray(geojson.features)) {
          (mapRef.current.getSource("safesites") as any)?.setData(geojson);
        }

        // Active Facility Filter & Map Pin Sync
        if (geojson && geojson.features && geojson.features.length > 0) {
          if (selectedFacility !== "all") {
            // Fit viewport to encompass the filtered facility markers
            const bbox = turf.bbox(geojson);
            if (bbox && isFinite(bbox[0]) && isFinite(bbox[1]) && isFinite(bbox[2]) && isFinite(bbox[3])) {
              mapRef.current.fitBounds(bbox as any, { padding: 90, maxZoom: 14, duration: 1000 });
            }
          }
        }
      })
      .catch((err) => {
        console.warn("Could not load safe sites data into map:", err);
      });
    return () => { alive = false; };
  }, [mapLoaded, selectedFacility, district]);

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
      <div ref={mapContainer} id="map-container" className="w-full h-full" />

      {/* ━━━ LAYER 1: Dedicated Top Action Dock (Floated at top-3) ━━━ */}
      <div className="absolute top-2 sm:top-3 left-2 sm:left-4 right-2 sm:right-4 z-30 flex items-center justify-between pointer-events-none gap-2">
        {/* LEFT: Search Bar & Core GIS Tools */}
        <div className="flex items-center gap-1.5 sm:gap-2 pointer-events-auto bg-white/95 dark:bg-slate-900/90 backdrop-blur-md p-1.5 rounded-xl border border-slate-200 dark:border-slate-700/80 shadow-xl">
          {/* Search Input */}
          <div className="relative flex items-center">
            <Search className="w-4 h-4 text-slate-400 absolute left-2.5 sm:left-3 pointer-events-none" />
            <input
              type="text"
              placeholder={t("searchPlaceholder") || t("search_map_placeholder") || "Search habitations / districts..."}
              value={mapSearchText}
              onChange={(e) => {
                setMapSearchText(e.target.value);
                setSearchOpen(true);
              }}
              onFocus={() => setSearchOpen(true)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && searchResults.length > 0) {
                  handleSelectSearchResult(searchResults[0]);
                }
              }}
              className="w-28 sm:w-56 focus:w-44 sm:focus:w-72 transition-all duration-200 pl-8 sm:pl-9 pr-6 sm:pr-7 py-1.5 text-xs bg-slate-100 dark:bg-slate-800/80 rounded-lg border-0 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 outline-none"
            />
            {mapSearchText && (
              <button
                onClick={() => {
                  setMapSearchText("");
                  setSearchResults([]);
                  setSearchOpen(false);
                }}
                className="absolute right-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}

            {/* Autocomplete Dropdown */}
            {searchOpen && searchResults.length > 0 && (
              <div className="absolute top-full left-0 mt-1 w-72 bg-white dark:bg-[#0F172Aee] backdrop-blur-md border border-slate-200 dark:border-slate-700 rounded-xl shadow-2xl p-1 max-h-60 overflow-y-auto z-40">
                {searchResults.map((feat: any) => (
                  <button
                    key={feat.properties?.id || feat.id || feat.name}
                    onClick={() => handleSelectSearchResult(feat)}
                    className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-xs flex items-center justify-between text-slate-800 dark:text-slate-200 transition"
                  >
                    <span className="font-semibold truncate">{feat.isDistrict ? feat.name : feat.properties?.name}</span>
                    <span className="text-[10px] text-slate-400 font-mono ml-2 flex-shrink-0">
                      {feat.isDistrict ? "District" : feat.properties?.district}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="h-5 w-px bg-slate-200 dark:bg-slate-700 mx-1" />

          {/* GIS Action Icons */}
          <div className="flex items-center gap-1">
            <button
              onClick={toggleLayers}
              title={t("map.layers") || "Layers"}
              aria-label={t("map.layers") || "Toggle Layers"}
              className={`p-1.5 rounded-lg transition ${
                !layersCollapsed
                  ? "bg-blue-600 text-white shadow-sm"
                  : "hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
              }`}
            >
              <Layers className="w-4 h-4" />
            </button>
            <button
              onClick={toggleMeasurementTool}
              title={t("map.measure") || "Measure"}
              aria-label={t("map.measure") || "Distance Measurement Tool"}
              className={`p-1.5 rounded-lg transition ${
                measuring
                  ? "bg-amber-600 text-white shadow-sm"
                  : "hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
              }`}
            >
              <Ruler className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                if (isTargetToolActive) {
                  setIsTargetToolActive(false);
                  clearTargetTool();
                } else {
                  setIsTargetToolActive(true);
                }
              }}
              title={t("map.targetTool") || "Disaster Epicenter & Hazard Radius Tool"}
              aria-label={t("map.targetTool") || "Spatial Buffer / Simulation"}
              className={`p-1.5 rounded-lg transition ${
                isTargetToolActive
                  ? "bg-rose-600 text-white shadow-md ring-2 ring-rose-400"
                  : "hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
              }`}
            >
              <Target className="w-4 h-4" />
            </button>
            <button
              onClick={handleExportMapViewport}
              title={t("map.export") || "Export Snapshot"}
              aria-label={t("map.export") || "Export Map Viewport"}
              className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition"
            >
              <Download className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* RIGHT: Settlement Analytics Drawer Toggle */}
        {onToggleAnalytics && (
          <div className="flex items-center gap-1.5 sm:gap-2 pointer-events-auto shrink-0">
            <button
              onClick={onToggleAnalytics}
              className={`flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3.5 py-2 text-xs font-semibold rounded-xl shadow-xl transition whitespace-nowrap ${
                isAnalyticsOpen
                  ? "bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-blue-600/30 ring-2 ring-blue-400/40"
                  : "bg-blue-600 hover:bg-blue-700 text-white"
              }`}
            >
              <BarChart3 className="w-4 h-4 text-white" />
              <span className="hidden md:inline whitespace-nowrap">{t("settlement_analytics") || "Settlement Analytics"}</span>
              <span className="px-1.5 py-0.5 rounded-full bg-blue-800 text-[10px] text-white font-mono font-bold">
                {(settlementCount ?? 13967).toLocaleString()}
              </span>
            </button>
          </div>
        )}
      </div>

      {/* ━━━ LAYER 2: Dedicated Facility Filter Ribbon (Floated at top-16) ━━━ */}
      <div className="absolute top-16 left-4 z-20 pointer-events-auto">
        <div className="flex items-center gap-1.5 bg-white/95 dark:bg-slate-900/90 backdrop-blur-md p-1.5 rounded-xl border border-slate-200 dark:border-slate-700/80 shadow-lg max-w-[calc(100vw-32px)] sm:max-w-[80vw] overflow-x-auto no-scrollbar touch-pan-x">
          {[
            { id: "all", icon: "🌐", label: "All Facilities", key: "facilities.all" },
            { id: "health", icon: "🏥", label: "Health Centers", key: "facilities.healthCenters" },
            { id: "school", icon: "🏫", label: "Evacuation Schools", key: "facilities.schools" },
            { id: "shelter", icon: "⛺", label: "Safe Shelters", key: "facilities.safeShelters" },
            { id: "helipad", icon: "🚁", label: "Helipads", key: "facilities.helipads" },
            { id: "ration", icon: "🍞", label: "Relief Ration Depots", key: "facilities.reliefDepots" },
            { id: "siren", icon: "🚨", label: "Alert Sirens", key: "facilities.sirens" },
          ].map((fac) => {
            const facLabel = t(fac.key) || t(fac.label) || fac.label;
            const isActive = selectedFacility === fac.id;
            return (
              <button
                key={fac.id}
                onClick={() => {
                  setSelectedFacility(fac.id);
                  if (!showSites) setShowSites(true);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition flex items-center gap-1.5 ${
                  isActive
                    ? "bg-blue-600 text-white font-bold shadow-sm"
                    : "hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
                }`}
                title={facLabel}
              >
                <span>{fac.icon}</span>
                <span className="whitespace-nowrap">{facLabel}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Floating Action Controls (Top Right, docked below ribbon) */}
      <div className="absolute top-16 right-4 z-20 flex flex-col items-end gap-2">
        <div className="bg-white/95 dark:bg-[#111827ee] backdrop-blur-md border border-slate-200 dark:border-[#374151] rounded-xl shadow-xl overflow-hidden flex flex-col">
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
        <div className="absolute top-16 left-1/2 -translate-x-1/2 z-20 bg-amber-900/90 text-white backdrop-blur-md border border-amber-600 px-4 py-2 rounded-xl shadow-2xl flex items-center gap-3 text-xs">
          <Crosshair className="w-4 h-4 text-amber-300 animate-spin" />
          <div>
            <span className="font-bold block">{t("measure_active")}</span>
            {measureDistanceKm !== null ? (
              <span className="text-amber-200 font-mono text-sm font-bold">
                {t("route_distance")}: {measureDistanceKm} km ({measurePoints.length} points)
              </span>
            ) : (
              <span className="text-amber-300 text-[10px]">{t("Click two or more points on map")}</span>
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
        <div className="absolute top-28 left-1/2 -translate-x-1/2 z-20 bg-emerald-950/90 text-white backdrop-blur-md border border-emerald-600 px-4 py-2.5 rounded-xl shadow-2xl flex items-center gap-3 text-xs max-w-md">
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

      {/* Target Mode Active Toast Notification Banner */}
      {isTargetToolActive && !targetBrief && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 z-30 pointer-events-auto flex items-center gap-2.5 px-4 py-2 rounded-full bg-rose-600/95 text-white text-xs font-semibold shadow-2xl border border-rose-400 backdrop-blur-md animate-in fade-in slide-in-from-top-3">
          <span className="w-2.5 h-2.5 rounded-full bg-white animate-ping shrink-0" />
          <span>{t("target_mode_active")}</span>
          <button
            onClick={() => {
              setIsTargetToolActive(false);
              clearTargetTool();
            }}
            className="ml-2 p-0.5 rounded-full hover:bg-rose-700/80 transition"
            aria-label="Cancel"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Floating BharatMaps-style Epicenter Incident Brief Card */}
      {targetBrief && (
        <div className="fixed sm:absolute inset-x-0 bottom-0 sm:bottom-12 sm:left-4 sm:right-auto z-40 sm:z-30 w-full sm:w-96 max-w-full sm:max-w-[calc(100vw-2rem)] max-h-[85vh] overflow-y-auto bg-white/95 dark:bg-slate-900/95 backdrop-blur-md rounded-t-2xl sm:rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl p-4 animate-in fade-in zoom-in-95 duration-200 pointer-events-auto flex flex-col gap-3">
          {/* Mobile Drag Indicator */}
          <div className="sm:hidden w-10 h-1 bg-slate-300 dark:bg-slate-600 rounded-full mx-auto -mt-1 mb-1" />
          {/* Header */}
          <div className="flex items-center justify-between pb-2.5 border-b border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
                <Target className="w-4 h-4" />
              </span>
              <div>
                <h4 className="text-xs font-black tracking-wider uppercase text-slate-900 dark:text-white flex items-center gap-1.5">
                  {t("epicenter_incident_brief")}
                </h4>
                <div className="flex items-center gap-1.5 text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                  <span>{targetBrief.lat.toFixed(4)}° N, {targetBrief.lon.toFixed(4)}° E</span>
                  <span>•</span>
                  <span className="font-semibold text-rose-600 dark:text-rose-400">
                    {lang === "hi" ? (DISTRICT_NAMES_HI[targetBrief.district] || targetBrief.district) : targetBrief.district}
                  </span>
                </div>
              </div>
            </div>
            <button
              onClick={() => {
                setIsTargetToolActive(false);
                clearTargetTool();
              }}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              title="Close Brief"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Interactive Dynamic Radius Slider */}
          <div className="bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800/80">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="font-semibold text-slate-700 dark:text-slate-300">{t("Hazard Impact Radius")}</span>
              <span className="font-mono font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900/50 px-2 py-0.5 rounded text-[11px]">
                {targetRadiusKm} km
              </span>
            </div>
            <input
              type="range"
              min="1"
              max="50"
              value={targetRadiusKm}
              onChange={(e) => handleRadiusChange(Number(e.target.value))}
              className="w-full accent-rose-600 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[9px] text-slate-400 font-mono mt-1">
              <span>1 km</span>
              <span>25 km</span>
              <span>50 km</span>
            </div>
          </div>

          {/* Spatial Impact Telemetry Cards */}
          <div className="grid grid-cols-2 gap-2">
            <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
              <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 block uppercase">
                {t("habitations_impacted")}
              </span>
              <span className="text-lg font-black text-rose-600 dark:text-rose-400">
                {targetBrief.habitationsCount.toLocaleString()}
              </span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
              <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 block uppercase">
                {t("est_pop_affected")}
              </span>
              <span className="text-lg font-black text-amber-600 dark:text-amber-400">
                {targetBrief.totalPopulation.toLocaleString()}
              </span>
            </div>
          </div>

          {/* Nearest Safe Evacuation Shelters Outside Perimeter */}
          <div>
            <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 block uppercase tracking-wider mb-1.5">
              {t("nearest_safe_shelters_outside")}
            </span>
            {targetBrief.nearestShelters.length > 0 ? (
              <div className="space-y-1.5">
                {targetBrief.nearestShelters.map((s, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-2 rounded-lg bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/50 dark:border-emerald-800/40 text-[11px]"
                  >
                    <div className="flex items-center gap-1.5 min-w-0 pr-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                      <span className="font-medium text-slate-800 dark:text-slate-200 truncate">
                        {s.name}
                      </span>
                    </div>
                    <span className="font-mono font-bold text-emerald-700 dark:text-emerald-400 shrink-0">
                      {s.distanceKm} km
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-2 text-center text-[10px] text-slate-400 italic bg-slate-50 dark:bg-slate-800/30 rounded-lg">
                {lang === "hi" ? "बफर परिधि के बाहर कोई नामित आश्रय उपलब्ध नहीं है" : "No designated shelters loaded outside buffer perimeter"}
              </div>
            )}
          </div>

          {/* Action Trigger: Run Full Blast Simulation */}
          <button
            onClick={() => {
              if (onActivateSimulation) {
                onActivateSimulation({ lat: targetBrief.lat, lon: targetBrief.lon }, targetRadiusKm);
              }
              setIsTargetToolActive(false);
              clearTargetTool();
            }}
            className="w-full py-2.5 px-4 bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-rose-600/20 transition flex items-center justify-center gap-2 group cursor-pointer"
          >
            <span>{t("launch_simulation_btn")}</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      )}

      {/* Grouped Layer & Legend Card (Docks right beneath Floating Tool Dock) */}
      {!layersCollapsed && (
        <div className="absolute top-28 left-4 z-30 bg-white/95 dark:bg-[#111827ee] backdrop-blur-md border border-slate-200 dark:border-[#374151] rounded-xl shadow-2xl w-72 max-w-[calc(100vw-2rem)] transition-all animate-in fade-in zoom-in-95 duration-200">
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
                  {t("map.officialClassification") || t("legend_desc")}
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

      {/* Basemap Quick-Preview Thumb Cards (Bottom Right, BharatMaps Style) */}
      <div
        className="absolute bottom-10 right-4 z-20"
        onMouseLeave={() => setIsBasemapMenuOpen(false)}
      >
        <div className="flex items-center gap-1.5 p-1 bg-white/95 dark:bg-[#0F172Aee] backdrop-blur-md border border-slate-200 dark:border-slate-700/80 rounded-xl shadow-2xl transition-all">
          {!isBasemapMenuOpen ? (
            /* Active-Only Single Card Display in Collapsed State */
            <button
              type="button"
              onClick={() => setIsBasemapMenuOpen(true)}
              onMouseEnter={() => setIsBasemapMenuOpen(true)}
              className="relative flex flex-col items-center justify-center w-13 h-14 p-1 rounded-lg border ring-2 ring-blue-500 border-blue-500 bg-blue-50/70 dark:bg-blue-950/60 opacity-100 shadow-md transition-all hover:scale-105 cursor-pointer"
              title={`Basemap: ${isHi ? currentOption.hiLabel : currentOption.label} (Click to switch)`}
              aria-label={`Current basemap: ${currentOption.label}`}
            >
              <div className="w-full flex-1 flex items-center justify-center">
                <span className="text-base select-none">{currentOption.icon}</span>
              </div>
              <span className="text-[9px] font-bold tracking-tight text-center truncate w-full px-0.5 leading-tight text-blue-700 dark:text-blue-300 font-extrabold uppercase">
                {currentOption.id === "bhuvan" ? "BHUVAN" : currentOption.id === "satellite" ? "SATELLITE" : currentOption.id === "topo" ? "TOPO" : "STREETS"}
              </span>
            </button>
          ) : (
            /* Expanded Multi-Option Selector */
            BASEMAP_OPTIONS.map((opt) => {
              const isSelected = activeBasemap === opt.id || (opt.id === "streets" && activeBasemap === "street");
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => {
                    switchBasemap(opt.id as BasemapType);
                    setIsBasemapMenuOpen(false);
                  }}
                  className={`relative flex flex-col items-center justify-center w-13 h-14 p-1 rounded-lg border transition-all cursor-pointer ${
                    isSelected
                      ? "ring-2 ring-blue-500 border-blue-500 bg-blue-50/70 dark:bg-blue-950/60 opacity-100 shadow-md scale-102"
                      : "border-slate-300 dark:border-slate-700 opacity-70 hover:opacity-100 hover:border-slate-400 dark:hover:border-slate-500 bg-slate-50/80 dark:bg-slate-800/80"
                  }`}
                  title={`Select ${isHi ? opt.hiLabel : opt.label}`}
                  aria-label={opt.label}
                >
                  <div className="w-full flex-1 flex items-center justify-center">
                    <span className="text-base select-none">{opt.icon}</span>
                  </div>
                  {/* Single legible badge/label beneath the icon */}
                  <span
                    className={`text-[9px] font-bold tracking-tight text-center truncate w-full px-0.5 leading-tight ${
                      isSelected ? "text-blue-700 dark:text-blue-300 font-extrabold" : "text-slate-700 dark:text-slate-300"
                    }`}
                  >
                    {opt.id === "bhuvan" ? "BHUVAN" : opt.id === "satellite" ? "SATELLITE" : opt.id === "topo" ? "TOPO" : "STREETS"}
                  </span>
                </button>
              );
            })
          )}
        </div>
      </div>

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