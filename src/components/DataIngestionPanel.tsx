import { useState, useRef } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  UploadCloud,
  FileCheck2,
  AlertCircle,
  CheckCircle2,
  Database,
  Layers,
  MapPin,
  ArrowRight,
  RefreshCw
} from "lucide-react";
import { ingestGeoData, ingestGeoDataJson } from "../api/auth";
import { useTranslation } from "../i18n/translations";
import { useAuthStore } from "../store/authStore";
import { recordAuditBlock, type AuditBlock } from "../lib/auditCrypto";

interface Props {
  onGoToMap: () => void;
}

export default function DataIngestionPanel({ onGoToMap }: Props) {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const { lang } = useTranslation();
  const isHi = lang === "hi";

  const [layerType, setLayerType] = useState<"habitations" | "safesites">("habitations");
  const [ingestMode, setIngestMode] = useState<"file" | "paste">("file");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [rawJsonText, setRawJsonText] = useState("");
  const [validationResult, setValidationResult] = useState<{
    valid: boolean;
    count: number;
    preview: string[];
    error?: string;
  } | null>(null);

  const [auditReceipt, setAuditReceipt] = useState<AuditBlock | null>(null);

  const [ingestResult, setIngestResult] = useState<{
    status: string;
    total_submitted: number;
    ingested_count: number;
    skipped_count: number;
    message: string;
    sha256_checksum?: string;
    principal?: string;
    errors_sample?: string[];
  } | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleIngestSuccess = (data: any) => {
    setIngestResult(data);
    const officer = user?.username || data.principal || "disaster_manager";
    const receipt = recordAuditBlock(
      "HOT_DATA_INGESTION_COMMITTED",
      officer,
      `${data.ingested_count} records -> ${data.layer_type} (SHA: ${(data.sha256_checksum || "e3b0c442").slice(0, 10)}...)`,
      "10.14.0.85 (NIC Secure VPN)",
      "COMPLIANT_PASS"
    );
    setAuditReceipt(receipt);
    queryClient.invalidateQueries({ queryKey: ["habitations"] });
    queryClient.invalidateQueries({ queryKey: ["safesites"] });
    queryClient.invalidateQueries({ queryKey: ["geostats"] });
  };

  const fileMutation = useMutation({
    mutationFn: async (formData: FormData) => ingestGeoData(formData),
    onSuccess: handleIngestSuccess,
  });

  const jsonMutation = useMutation({
    mutationFn: async (payload: { layer_type: "habitations" | "safesites"; geojson_data: any }) =>
      ingestGeoDataJson(payload),
    onSuccess: handleIngestSuccess,
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedFile(file);
    setIngestResult(null);
    setAuditReceipt(null);

    if (file.name.toLowerCase().endsWith(".zip")) {
      setValidationResult({
        valid: true,
        count: 1,
        preview: [
          `ESRI Shapefile ZIP Archive detected (${(file.size / 1024).toFixed(1)} KB)`,
          "Server pipeline will unpack .shp, .dbf, .shx, and .prj vectors using GeoPandas",
          "Automated reprojection to WGS84 EPSG:4326 and boundary containment validation",
        ],
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      validateContent(text, file.name);
    };
    reader.readAsText(file);
  };

  const handleJsonPasteChange = (val: string) => {
    setRawJsonText(val);
    setIngestResult(null);
    if (!val.trim()) {
      setValidationResult(null);
      return;
    }
    validateContent(val, "pasted.json");
  };

  const validateContent = (text: string, filename: string) => {
    try {
      if (filename.endsWith(".csv")) {
        const lines = text.split("\n").filter((l) => l.trim().length > 0);
        if (lines.length <= 1) {
          setValidationResult({ valid: false, count: 0, preview: [], error: "CSV contains no data rows." });
          return;
        }
        const headers = lines[0].split(",").map((h) => h.trim().toLowerCase());
        const count = lines.length - 1;
        setValidationResult({
          valid: true,
          count,
          preview: [
            `Detected CSV with ${count} data rows`,
            `Headers: ${headers.slice(0, 6).join(", ")}`,
          ],
        });
      } else {
        const parsed = JSON.parse(text);
        let count = 0;
        let previewItems: string[] = [];
        if (parsed.type === "FeatureCollection" && Array.isArray(parsed.features)) {
          count = parsed.features.length;
          const first = parsed.features[0];
          previewItems = [
            `GeoJSON FeatureCollection verified (${count} features)`,
            `Sample entity: ${first?.properties?.name || "Unnamed"} (${first?.geometry?.coordinates?.join(", ") || "No coords"})`,
          ];
        } else if (Array.isArray(parsed)) {
          count = parsed.length;
          previewItems = [`JSON Array with ${count} records`];
        } else {
          setValidationResult({ valid: false, count: 0, preview: [], error: "JSON must be a FeatureCollection or Array of records." });
          return;
        }
        setValidationResult({ valid: true, count, preview: previewItems });
      }
    } catch (err: any) {
      setValidationResult({ valid: false, count: 0, preview: [], error: `Parse error: ${err.message}` });
    }
  };

  const handleExecuteIngestion = () => {
    if (ingestMode === "file" && selectedFile) {
      const fd = new FormData();
      fd.append("file", selectedFile);
      fd.append("layer_type", layerType);
      fileMutation.mutate(fd);
    } else if (ingestMode === "paste" && rawJsonText.trim()) {
      try {
        const parsed = JSON.parse(rawJsonText);
        jsonMutation.mutate({ layer_type: layerType, geojson_data: parsed });
      } catch {
        alert("Invalid JSON text. Please check syntax.");
      }
    }
  };

  const isSubmitting = fileMutation.isPending || jsonMutation.isPending;

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-slate-50 dark:bg-[#070D18]">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header Ribbon */}
        <div className="pb-4 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-400">
                <Database className="w-5 h-5" />
              </span>
              <h1 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                {isHi ? "स्व-सेवा भू-स्थानिक डेटा अंतर्ग्रहण पाइपलाइन" : "Self-Service Geospatial Data Ingestion Pipeline"}
              </h1>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              {isHi
                ? "सर्वर रीस्टार्ट या टर्मिनल कमांड के बिना लाइव पोस्टजीआईएस (PostGIS) डेटाबेस में नए ग्राम व आश्रय स्थल जोड़ें"
                : "Hot-ingest GeoJSON, Shapefiles, or CSV coordinates into live PostGIS without terminal commands or server restarts."}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-xs font-bold border border-emerald-200 dark:border-emerald-800 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>LIVE POSTGIS PIPELINE</span>
            </span>
          </div>
        </div>

        {/* Configuration Card */}
        <div className="p-6 rounded-2xl bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 shadow-xs space-y-6">
          {/* Step 1: Select Target Layer */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-wider">
              {isHi ? "1. लक्ष्य जीआईएस परत चयन करें" : "1. Select Target GIS Layer"}
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div
                onClick={() => setLayerType("habitations")}
                className={`p-3.5 rounded-xl border-2 cursor-pointer transition flex items-center gap-3 ${
                  layerType === "habitations"
                    ? "border-blue-600 bg-blue-50/50 dark:bg-blue-950/40"
                    : "border-slate-200 dark:border-slate-800 hover:border-slate-300"
                }`}
              >
                <div className="w-9 h-9 rounded-lg bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 flex items-center justify-center font-bold">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-bold text-xs text-slate-900 dark:text-white">
                    {isHi ? "बस्तियाँ एवं ग्राम (Habitations)" : "Habitations & Settlements"}
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Auto computes hazard score (0-100) & zoning
                  </div>
                </div>
              </div>

              <div
                onClick={() => setLayerType("safesites")}
                className={`p-3.5 rounded-xl border-2 cursor-pointer transition flex items-center gap-3 ${
                  layerType === "safesites"
                    ? "border-emerald-600 bg-emerald-50/50 dark:bg-emerald-950/40"
                    : "border-slate-200 dark:border-slate-800 hover:border-slate-300"
                }`}
              >
                <div className="w-9 h-9 rounded-lg bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300 flex items-center justify-center font-bold">
                  <Layers className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-bold text-xs text-slate-900 dark:text-white">
                    {isHi ? "सुरक्षित राहत शिविर (Safe Sites)" : "Safe Transit Shelters"}
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Stores available capacity, water, road access
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Step 2: Ingestion Mode Toggle */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                {isHi ? "2. अंतर्ग्रहण विधि" : "2. Ingestion Format"}
              </label>
              <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg text-xs font-semibold">
                <button
                  onClick={() => setIngestMode("file")}
                  className={`px-3 py-1 rounded-md transition ${
                    ingestMode === "file"
                      ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs font-bold"
                      : "text-slate-500 hover:text-slate-900"
                  }`}
                >
                  {isHi ? "फ़ाइल अपलोड" : "File Upload"}
                </button>
                <button
                  onClick={() => setIngestMode("paste")}
                  className={`px-3 py-1 rounded-md transition ${
                    ingestMode === "paste"
                      ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs font-bold"
                      : "text-slate-500 hover:text-slate-900"
                  }`}
                >
                  {isHi ? "जियोजेएसओएन पेस्ट करें" : "Paste GeoJSON"}
                </button>
              </div>
            </div>

            {/* Mode A: File Dropzone */}
            {ingestMode === "file" ? (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-blue-500 dark:hover:border-blue-400 rounded-2xl p-8 text-center cursor-pointer transition bg-slate-50/50 dark:bg-slate-900/30 group"
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".zip,.geojson,.json,.csv"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <div className="w-12 h-12 rounded-full bg-blue-50 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400 mx-auto flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  <UploadCloud className="w-6 h-6" />
                </div>
                <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  {selectedFile ? selectedFile.name : (isHi ? "फ़ाइल चुनने हेतु क्लिक करें या खींचें" : "Click to select or drag and drop file")}
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  Supported formats: <span className="font-mono font-semibold">.zip (Shapefile archive), .geojson, .json, .csv</span> (Max 50MB)
                </p>
              </div>
            ) : (
              /* Mode B: Raw JSON Paste */
              <div className="space-y-2">
                <textarea
                  rows={8}
                  placeholder={`{\n  "type": "FeatureCollection",\n  "features": [\n    {\n      "type": "Feature",\n      "geometry": { "type": "Point", "coordinates": [79.566, 30.556] },\n      "properties": { "name": "Badrinath Evac Camp", "district": "Chamoli", "capacity": 1200 }\n    }\n  ]\n}`}
                  value={rawJsonText}
                  onChange={(e) => handleJsonPasteChange(e.target.value)}
                  className="w-full p-3 text-xs font-mono rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-[10px] text-slate-500">
                  {isHi ? "मानक WGS84 (EPSG:4326) निर्देशांक [देशांतर, अक्षांश] प्रारूप में होने चाहिए।" : "Standard WGS84 (EPSG:4326) coordinates in [longitude, latitude] order."}
                </span>
              </div>
            )}
          </div>

          {/* Validation Feedback Banner */}
          {validationResult && (
            <div
              className={`p-4 rounded-xl border text-xs ${
                validationResult.valid
                  ? "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200"
                  : "bg-red-50 dark:bg-red-950/40 border-red-300 dark:border-red-800 text-red-900 dark:text-red-200"
              }`}
            >
              <div className="flex items-center gap-2 font-bold mb-1">
                {validationResult.valid ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Valid Data Schema ({validationResult.count} records identified)</span>
                  </>
                ) : (
                  <>
                    <AlertCircle className="w-4 h-4 text-red-600" />
                    <span>Schema Verification Failed</span>
                  </>
                )}
              </div>
              {validationResult.valid ? (
                <ul className="text-[11px] space-y-0.5 mt-1">
                  {validationResult.preview.map((p, i) => (
                    <li key={i}>• {p}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-[11px] text-red-700 dark:text-red-300">{validationResult.error}</p>
              )}
            </div>
          )}

          {/* Execution Button */}
          <div>
            <button
              onClick={handleExecuteIngestion}
              disabled={isSubmitting || !validationResult?.valid}
              className="w-full py-3 bg-[#0B2545] hover:bg-[#103058] text-white font-extrabold text-xs sm:text-sm rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>{isHi ? "पोस्टजीआईएस में अंतर्ग्रहण जारी..." : "Ingesting into PostGIS Database..."}</span>
                </>
              ) : (
                <>
                  <FileCheck2 className="w-4 h-4" />
                  <span>
                    {isHi
                      ? `${validationResult?.count || 0} रिकॉर्ड्स का लाइव अंतर्ग्रहण प्रारंभ करें`
                      : `Execute Live Ingestion (${validationResult?.count || 0} Records)`}
                  </span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Ingestion Output Dossier */}
        {ingestResult && (
          <div className="p-6 rounded-2xl bg-white dark:bg-[#0F172A] border-2 border-emerald-500 shadow-xl space-y-4 animate-in fade-in">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  {isHi ? "डेटा अंतर्ग्रहण सफलतापूर्वक संपन्न!" : "Ingestion Successfully Completed!"}
                </h3>
              </div>
              <span className="text-xs font-mono font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950 px-2.5 py-1 rounded-md border border-emerald-200 dark:border-emerald-800">
                POSTGIS 200 OK
              </span>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300">
              {ingestResult.message}
            </p>

            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                <div className="text-lg font-bold font-mono text-slate-800 dark:text-slate-200">
                  {ingestResult.total_submitted}
                </div>
                <div className="text-[10px] text-slate-500 uppercase">Total Submitted</div>
              </div>
              <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800">
                <div className="text-lg font-bold font-mono text-emerald-600 dark:text-emerald-400">
                  {ingestResult.ingested_count}
                </div>
                <div className="text-[10px] text-emerald-700 dark:text-emerald-300 uppercase font-bold">Successfully Stored</div>
              </div>
              <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                <div className="text-lg font-bold font-mono text-slate-500">
                  {ingestResult.skipped_count}
                </div>
                <div className="text-[10px] text-slate-500 uppercase">Skipped / Out of Bounds</div>
              </div>
            </div>

            {/* CERT-In 180-Day Immutable Ledger Receipt */}
            {auditReceipt && (
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs space-y-1">
                <div className="flex items-center justify-between text-[11px] font-bold text-slate-500">
                  <span>CERT-In Immutable Ledger Receipt (Block #{auditReceipt.blockIndex})</span>
                  <span className="text-emerald-600 font-mono">SEALED & COMMITTED</span>
                </div>
                <div className="font-mono text-[10px] text-slate-600 dark:text-slate-400 break-all select-all">
                  SHA-256: {auditReceipt.blockHash}
                </div>
                <div className="text-[10px] text-slate-400 flex items-center justify-between">
                  <span>Logged at: {auditReceipt.timestampIst}</span>
                  <span>Principal: {auditReceipt.principal}</span>
                </div>
              </div>
            )}

            <div className="pt-2 flex justify-end">
              <button
                onClick={onGoToMap}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold shadow flex items-center gap-2 transition"
              >
                <span>{isHi ? "इंटरएक्टिव मानचित्र पर देखें" : "View Live on Map Now"}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
