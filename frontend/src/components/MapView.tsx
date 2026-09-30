import { useEffect, useRef, useState } from "react";
import * as maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { getHabitations } from "../api/habitations";
import { getSafeSites } from "../api/safesites";
import * as turf from "@turf/turf";
import type { SimulationResult } from "../api/stats";



interface MapViewProps {
  district?: string;
  hazardLevel?: string;
  onSelectHabitation?: (id: number) => void;
  selectedHabitationId?: number | null;
  showSafeSites?: boolean;
  simulationMode?: boolean;
  onMapClick?: (lat: number, lon: number) => void;
  simulationResults?: SimulationResult | null;
}

export default function MapView({
  district,
  hazardLevel,
  onSelectHabitation,
  showSafeSites = true,
  simulationMode = false,
  onMapClick,
  simulationResults,
}: MapViewProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const epicenterMarkerRef = useRef<maplibregl.Marker | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [showHabs, setShowHabs] = useState(true);
  const [showSites, setShowSites] = useState(showSafeSites);

  const simulationModeRef = useRef(simulationMode);
  const onMapClickRef = useRef(onMapClick);

  useEffect(() => {
    simulationModeRef.current = simulationMode;
    onMapClickRef.current = onMapClick;
    
    // Clear marker if exiting simulation mode
    if (!simulationMode && epicenterMarkerRef.current) {
      epicenterMarkerRef.current.remove();
      epicenterMarkerRef.current = null;
    }
  }, [simulationMode, onMapClick]);

  useEffect(() => {
    if (!mapContainer.current || mapRef.current) return;

    const map = new maplibregl.Map({
      container: mapContainer.current,
      style: {
        version: 8,
        sources: {
          "esri-satellite": {
            type: "raster",
            tiles: ["https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"],
            tileSize: 256
          }
        },
        layers: [
          {
            id: "satellite",
            type: "raster",
            source: "esri-satellite",
            minzoom: 0,
            maxzoom: 22
          }
        ]
      },
      center: [78.9629, 29.6],
      zoom: 7,
      attributionControl: false,
    });

    map.addControl(new maplibregl.NavigationControl(), "bottom-right");
    map.addControl(new maplibregl.ScaleControl({ maxWidth: 120, unit: "metric" }), "bottom-left");

    map.on("load", () => {
      // 3D Terrain disabled
      // Sources
      map.addSource("habitations", { 
        type: "geojson", 
        data: { type: "FeatureCollection", features: [] },
        cluster: true,
        clusterMaxZoom: 10,
        clusterRadius: 50
      });
      map.addSource("safesites", { type: "geojson", data: { type: "FeatureCollection", features: [] } });
      map.addSource("simulation-circle", { type: "geojson", data: { type: "FeatureCollection", features: [] } });
      map.addSource("simulation-lines", { type: "geojson", data: { type: "FeatureCollection", features: [] } });

      // Safe sites layer (render below habitations)
      map.addLayer({
        id: "safesites-layer",
        type: "circle",
        source: "safesites",
        paint: {
          "circle-radius": ["interpolate", ["linear"], ["zoom"], 6, 5, 10, 9, 14, 16],
          "circle-color": "#10b981",
          "circle-stroke-width": 2,
          "circle-stroke-color": "#064e3b",
          "circle-opacity": 0.85,
        },
      });

      // Simulation circle
      map.addLayer({
        id: "simulation-circle-layer",
        type: "fill",
        source: "simulation-circle",
        paint: {
          "fill-color": "#ef4444",
          "fill-opacity": 0.3,
        },
      });
      map.addLayer({
        id: "simulation-circle-outline",
        type: "line",
        source: "simulation-circle",
        paint: {
          "line-color": "#ef4444",
          "line-width": 2,
        },
      });

      // Simulation lines
      map.addLayer({
        id: "simulation-lines-layer",
        type: "line",
        source: "simulation-lines",
        paint: {
          "line-color": "#10b981",
          "line-width": 4,
          "line-opacity": 0.8,
        },
      });

      // Clusters
      map.addLayer({
        id: "habitations-clusters",
        type: "circle",
        source: "habitations",
        filter: ["has", "point_count"],
        paint: {
          "circle-color": [
            "step",
            ["get", "point_count"],
            "#3b82f6",
            100,
            "#eab308",
            500,
            "#ef4444"
          ],
          "circle-radius": [
            "step",
            ["get", "point_count"],
            15,
            100,
            20,
            500,
            25
          ],
          "circle-stroke-width": 2,
          "circle-stroke-color": "#fff"
        }
      });

      map.addLayer({
        id: "habitations-cluster-count",
        type: "symbol",
        source: "habitations",
        filter: ["has", "point_count"],
        layout: {
          "text-field": "{point_count_abbreviated}",
          "text-font": ["DIN Offc Pro Medium", "Arial Unicode MS Bold"],
          "text-size": 12
        },
        paint: {
          "text-color": "#ffffff"
        }
      });

      // Habitations halo (glow for high risk) — subtle shadow ring
      map.addLayer({
        id: "habitations-halo",
        type: "circle",
        source: "habitations",
        filter: ["all", ["!", ["has", "point_count"]], ["in", ["get", "hazard_level"], ["literal", ["RED", "HIGH"]]]],
        paint: {
          "circle-radius": ["interpolate", ["linear"], ["zoom"], 6, 12, 10, 18, 14, 26],
          "circle-color": [
            "match", ["get", "hazard_level"],
            "RED", "#ef4444",
            "HIGH", "#f97316",
            "#00000000",
          ],
          "circle-opacity": 0.12,
          "circle-blur": 1,
          "circle-stroke-width": 0,
        },
      });

      // Habitations main dots
      map.addLayer({
        id: "habitations-layer",
        type: "circle",
        source: "habitations",
        filter: ["!", ["has", "point_count"]],
        paint: {
          "circle-radius": ["interpolate", ["linear"], ["zoom"], 6, 5, 10, 8, 14, 14],
          "circle-color": [
            "case",
            ["==", ["get", "sim_affected"], true], "#ef4444",
            ["match", ["get", "hazard_level"],
              "RED", "#ef4444",
              "HIGH", "#f97316",
              "MODERATE", "#eab308",
              "SAFE", "#22c55e",
              "#6366f1"
            ]
          ],
          "circle-stroke-width": 1.5,
          "circle-stroke-color": "#0f172a",
          "circle-opacity": 0.92,
        },
      });

      // Click handlers
      map.on("click", (e: any) => {
        if (simulationModeRef.current && onMapClickRef.current) {
          const lat = e.lngLat.lat;
          const lon = e.lngLat.lng;
          
          if (!epicenterMarkerRef.current) {
            const el = document.createElement('div');
            el.innerHTML = `<svg class="w-6 h-6 text-red-600 drop-shadow-md" viewBox="0 0 24 24" fill="currentColor" stroke="white" stroke-width="2"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 010-5 2.5 2.5 0 010 5z"/></svg>`;
            el.style.transform = 'translate(-50%, -100%)';
            epicenterMarkerRef.current = new maplibregl.Marker({ element: el })
              .setLngLat([lon, lat])
              .addTo(map);
          } else {
            epicenterMarkerRef.current.setLngLat([lon, lat]);
          }

          onMapClickRef.current(lat, lon);
        }
      });

      map.on("click", "habitations-layer", (e: any) => {
        if (simulationModeRef.current) return; // Prevent selection in sim mode
        const feat = e.features?.[0];
        if (!feat) return;
        const props = feat.properties as any;
        const id = parseInt(String(props.id ?? (feat.id ?? 0)));
        const coords = (feat.geometry as any).coordinates.slice();

        const levelColors: Record<string, string> = {
          RED: "#ef4444", HIGH: "#f97316", MODERATE: "#eab308", SAFE: "#22c55e",
        };
        const levelColor = levelColors[props.hazard_level] || "#6366f1";

        const popup = new maplibregl.Popup({ offset: 10, closeButton: true, maxWidth: "280px" })
          .setLngLat(coords as maplibregl.LngLatLike)
          .setHTML(`
            <div style="font-family:'Inter',sans-serif;">
              <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px;">
                <div style="width:8px;height:8px;border-radius:50%;background:${levelColor};flex-shrink:0;"></div>
                <span style="font-weight:600;color:#f1f5f9;font-size:13px;">${props.name}</span>
              </div>
              <table style="width:100%;font-size:12px;color:#94a3b8;border-collapse:collapse;">
                <tr><td style="padding:2px 0;color:#64748b;">District</td><td style="padding:2px 0;color:#cbd5e1;font-weight:500;text-align:right;">${props.district || "—"}</td></tr>
                <tr><td style="padding:2px 0;color:#64748b;">Population</td><td style="padding:2px 0;color:#cbd5e1;font-weight:500;text-align:right;">${Number(props.population || 0).toLocaleString()}</td></tr>
                <tr><td style="padding:2px 0;color:#64748b;">Hazard Score</td><td style="padding:2px 0;font-weight:600;text-align:right;color:${levelColor};">${Number(props.hazard_score || 0).toFixed(1)}</td></tr>
                <tr><td style="padding:2px 0;color:#64748b;">Vulnerability</td><td style="padding:2px 0;color:#cbd5e1;font-weight:500;text-align:right;">${Number(props.vulnerability_score || 0).toFixed(1)}</td></tr>
              </table>
              <button
                onclick="window.__rsSelectHab(${id})"
                style="margin-top:10px;width:100%;padding:6px;background:#2563eb;color:white;border:none;border-radius:5px;font-size:12px;font-weight:500;cursor:pointer;font-family:inherit;"
              >Open risk profile →</button>
            </div>
          `)
          .addTo(map);

        (window as any).__rsSelectHab = (hid: number) => {
          popup.remove();
          onSelectHabitation?.(hid);
        };
        if (onSelectHabitation) onSelectHabitation(id);
      });

      map.on("click", "safesites-layer", (e: any) => {
        const feat = e.features?.[0];
        if (!feat) return;
        const props = feat.properties as any;
        const coords = (feat.geometry as any).coordinates.slice();
        const rem = props.remaining_capacity ?? props.estimated_capacity;

        new maplibregl.Popup({ offset: 10, closeButton: true, maxWidth: "260px" })
          .setLngLat(coords as maplibregl.LngLatLike)
          .setHTML(`
            <div style="font-family:'Inter',sans-serif;">
              <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px;">
                <div style="width:8px;height:8px;border-radius:50%;background:#10b981;flex-shrink:0;"></div>
                <span style="font-weight:600;color:#f1f5f9;font-size:13px;">${props.name}</span>
              </div>
              <div style="font-size:11px;font-weight:500;color:#10b981;text-transform:uppercase;letter-spacing:0.05em;margin-bottom:8px;">Safe Relocation Site</div>
              <table style="width:100%;font-size:12px;border-collapse:collapse;">
                <tr><td style="padding:2px 0;color:#64748b;">District</td><td style="padding:2px 0;color:#cbd5e1;font-weight:500;text-align:right;">${props.district}</td></tr>
                <tr><td style="padding:2px 0;color:#64748b;">Total capacity</td><td style="padding:2px 0;color:#cbd5e1;font-weight:500;text-align:right;">${Number(props.estimated_capacity).toLocaleString()}</td></tr>
                <tr><td style="padding:2px 0;color:#64748b;">Available</td><td style="padding:2px 0;color:#10b981;font-weight:600;text-align:right;">${Number(rem).toLocaleString()}</td></tr>
                <tr><td style="padding:2px 0;color:#64748b;">Road access</td><td style="padding:2px 0;text-align:right;">${props.road_access ? '<span style="color:#10b981;">Yes</span>' : '<span style="color:#ef4444;">No</span>'}</td></tr>
                <tr><td style="padding:2px 0;color:#64748b;">Water supply</td><td style="padding:2px 0;text-align:right;">${props.water_availability ? '<span style="color:#10b981;">Yes</span>' : '<span style="color:#ef4444;">No</span>'}</td></tr>
              </table>
            </div>
          `)
          .addTo(map);
      });

      // Cursors
      for (const layer of ["habitations-layer", "safesites-layer"]) {
        map.on("mouseenter", layer, () => { map.getCanvas().style.cursor = "pointer"; });
        map.on("mouseleave", layer, () => { map.getCanvas().style.cursor = ""; });
      }

      setMapLoaded(true);
    });

    mapRef.current = map;

    return () => {
      delete (window as any).__rsSelectHab;
      map.remove();
      mapRef.current = null;
    };
  }, [onSelectHabitation]);

  // Refresh habitations data
  useEffect(() => {
    if (!mapLoaded || !mapRef.current) return;
    let alive = true;
    getHabitations({ district, hazard_level: hazardLevel }).then((geojson) => {
      if (!alive || !mapRef.current) return;
      (mapRef.current.getSource("habitations") as any)?.setData(geojson);
    });
    return () => { alive = false; };
  }, [district, hazardLevel, mapLoaded]);

  // Refresh safe sites
  useEffect(() => {
    if (!mapLoaded || !mapRef.current) return;
    let alive = true;
    getSafeSites().then((geojson) => {
      if (!alive || !mapRef.current) return;
      (mapRef.current.getSource("safesites") as any)?.setData(geojson);
    });
    return () => { alive = false; };
  }, [mapLoaded]);

  // Layer visibility
  useEffect(() => {
    if (!mapLoaded || !mapRef.current) return;
    const vis = showHabs ? "visible" : "none";
    for (const l of ["habitations-layer", "habitations-halo"]) {
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

  // Handle simulation results rendering
  useEffect(() => {
    if (!mapLoaded || !mapRef.current) return;

    let isActive = true;

    if (!simulationResults) {
      // Clear simulation data
      (mapRef.current.getSource("simulation-circle") as any)?.setData({ type: "FeatureCollection", features: [] });
      (mapRef.current.getSource("simulation-lines") as any)?.setData({ type: "FeatureCollection", features: [] });
      
      // Reset habitations (refetch to clear sim_affected)
      getHabitations({ district, hazard_level: hazardLevel }).then((geojson) => {
        if (!isActive || !mapRef.current) return;
        (mapRef.current.getSource("habitations") as any)?.setData(geojson);
      });
      return () => { isActive = false; };
    }

    const { epicenter, affected_habitations } = simulationResults;

    // Draw circle
    const circle = turf.circle([epicenter.lon, epicenter.lat], epicenter.radius_km, { steps: 64, units: "kilometers" });
    (mapRef.current.getSource("simulation-circle") as any)?.setData({ type: "FeatureCollection", features: [circle] });

    // Update habitations to show RED
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

    // Aggregate by Safe Site
    const utilizedSites = new Map<number, { site: any, population: number }>();
    for (const h of affected_habitations) {
      if (h.assigned_safe_site) {
        const existing = utilizedSites.get(h.assigned_safe_site.id);
        if (existing) {
          existing.population += h.population || 0;
        } else {
          utilizedSites.set(h.assigned_safe_site.id, {
            site: h.assigned_safe_site,
            population: h.population || 0
          });
        }
      }
    }

    // Fetch routes via OSRM
    const fetchRoutes = async () => {
      try {
        const routeFeatures = [];
        for (const { site, population } of utilizedSites.values()) {
          const res = await fetch(`https://router.project-osrm.org/route/v1/driving/${epicenter.lon},${epicenter.lat};${site.lon},${site.lat}?overview=full&geometries=geojson`);
          const data = await res.json();
          if (data.routes && data.routes.length > 0) {
            const routeGeojson = data.routes[0].geometry;
            routeFeatures.push({
              type: "Feature",
              geometry: routeGeojson,
              properties: {
                population_routed: population,
                site_name: site.name
              }
            });
          }
        }
        if (isActive && mapRef.current) {
          (mapRef.current.getSource("simulation-lines") as any)?.setData({ type: "FeatureCollection", features: routeFeatures });
        }
      } catch (e) {
        console.error("Failed to fetch routes", e);
      }
    };

    fetchRoutes();

    return () => { isActive = false; };
  }, [simulationResults, mapLoaded, district, hazardLevel]);

  return (
    <div className="relative w-full h-full">
      <div ref={mapContainer} className="w-full h-full" />

      {/* Layer control — top left, compact */}
      <div className="absolute top-3 left-3 z-10 bg-[#0f172a] border border-slate-800 rounded-md shadow-xl p-3 min-w-[160px]">
        <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-2">Layers</p>
        <div className="space-y-2">
          <label className="flex items-center gap-2 cursor-pointer group">
            <input type="checkbox" checked={showHabs} onChange={(e: any) => setShowHabs(e.target.checked)}
              className="w-3.5 h-3.5 rounded border-slate-600 bg-slate-800 accent-blue-500 cursor-pointer" />
            <span className="flex items-center gap-1.5 text-xs text-slate-400 group-hover:text-slate-300">
              <span className="w-2 h-2 rounded-full bg-red-500 flex-shrink-0" />
              At-risk settlements
            </span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer group">
            <input type="checkbox" checked={showSites} onChange={(e: any) => setShowSites(e.target.checked)}
              className="w-3.5 h-3.5 rounded border-slate-600 bg-slate-800 accent-blue-500 cursor-pointer" />
            <span className="flex items-center gap-1.5 text-xs text-slate-400 group-hover:text-slate-300">
              <span className="w-2 h-2 rounded-full bg-emerald-500 flex-shrink-0" />
              Safe relocation sites
            </span>
          </label>
        </div>

        {/* Severity legend */}
        <div className="mt-3 pt-3 border-t border-slate-800">
          <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Severity</p>
          <div className="space-y-1">
            {([
              ["bg-red-500",    "Red zone (extreme)"],
              ["bg-orange-500", "High risk"],
              ["bg-yellow-500", "Moderate risk"],
              ["bg-green-500",  "Safe zone"],
            ] as const).map(([dot, label]) => (
              <div key={label} className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full flex-shrink-0 ${dot}`} />
                <span className="text-[11px] text-slate-500">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}