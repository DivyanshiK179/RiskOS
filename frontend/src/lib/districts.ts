export const UTTARAKHAND_DISTRICTS = [
  "Almora",
  "Bageshwar",
  "Chamoli",
  "Champawat",
  "Dehradun",
  "Haridwar",
  "Nainital",
  "Pauri Garhwal",
  "Pithoragarh",
  "Rudraprayag",
  "Tehri Garhwal",
  "Udham Singh Nagar",
  "Uttarkashi"
] as const;

export type UttarakhandDistrict = typeof UTTARAKHAND_DISTRICTS[number];

export const DISTRICT_NAMES_HI: Record<string, string> = {
  "Almora": "अल्मोड़ा",
  "Bageshwar": "बागेश्वर",
  "Chamoli": "चमोली",
  "Champawat": "चंपावत",
  "Dehradun": "देहरादून",
  "Haridwar": "हरिद्वार",
  "Nainital": "नैनीताल",
  "Pauri Garhwal": "पौड़ी गढ़वाल",
  "Pithoragarh": "पिथौरागढ़",
  "Rudraprayag": "रुद्रप्रयाग",
  "Tehri Garhwal": "टिहरी गढ़वाल",
  "Udham Singh Nagar": "उधम सिंह नगर",
  "Uttarkashi": "उत्तरकाशी"
};

/**
 * Authoritative geographic centroids and recommended inspection zoom levels
 * for the 13 Revenue Districts of Uttarakhand.
 */
export const DISTRICT_CENTROIDS: Record<string, { lat: number; lon: number; zoom: number }> = {
  "Almora": { lat: 29.597, lon: 79.659, zoom: 10 },
  "Bageshwar": { lat: 29.838, lon: 79.771, zoom: 10 },
  "Chamoli": { lat: 30.400, lon: 79.560, zoom: 9.5 },
  "Champawat": { lat: 29.335, lon: 80.106, zoom: 10 },
  "Dehradun": { lat: 30.316, lon: 78.032, zoom: 10 },
  "Haridwar": { lat: 29.945, lon: 78.164, zoom: 10 },
  "Nainital": { lat: 29.391, lon: 79.454, zoom: 10 },
  "Pauri Garhwal": { lat: 30.150, lon: 78.780, zoom: 9.5 },
  "Pithoragarh": { lat: 29.583, lon: 80.218, zoom: 9.5 },
  "Rudraprayag": { lat: 30.284, lon: 78.981, zoom: 10 },
  "Tehri Garhwal": { lat: 30.380, lon: 78.480, zoom: 10 },
  "Udham Singh Nagar": { lat: 28.980, lon: 79.450, zoom: 10 },
  "Uttarkashi": { lat: 30.726, lon: 78.435, zoom: 9.5 },
};

export const UTTARAKHAND_DEFAULT_CENTER = {
  lat: 30.0668,
  lon: 79.0193,
  zoom: 7.8,
};

/**
 * Normalizes raw district string by trimming, filtering nulls/"Unknown",
 * resolving common aliases (e.g., Hardwar -> Haridwar), and canonicalizing casing.
 */
export function normalizeDistrict(raw?: string | null): string | null {
  if (!raw) return null;
  const trimmed = raw.trim();
  if (
    !trimmed ||
    trimmed.toLowerCase() === "unknown" ||
    trimmed.toLowerCase() === "null" ||
    trimmed.toLowerCase() === "undefined"
  ) {
    return null;
  }
  const lower = trimmed.toLowerCase();
  if (lower === "hardwar" || lower === "haridwar") return "Haridwar";
  if (lower.includes("pauri")) return "Pauri Garhwal";
  if (lower.includes("tehri")) return "Tehri Garhwal";
  if (lower.includes("udham") || lower.includes("us nagar") || lower.includes("u.s. nagar")) {
    return "Udham Singh Nagar";
  }

  // Exact or case-insensitive match against official list
  const match = UTTARAKHAND_DISTRICTS.find((d) => d.toLowerCase() === lower);
  if (match) return match;

  // Title-case fallback
  return trimmed
    .split(" ")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");
}

/**
 * Deduplicates, normalizes, filters, and sorts a list of districts.
 * Guarantees all 13 official revenue districts of Uttarakhand are cleanly represented.
 */
export function extractCleanDistricts(rawList?: (string | null | undefined)[]): string[] {
  const set = new Set<string>();
  if (rawList && rawList.length) {
    for (const item of rawList) {
      const norm = normalizeDistrict(item);
      if (norm) {
        set.add(norm);
      }
    }
  }
  // Ensure the 13 canonical districts are always included
  for (const d of UTTARAKHAND_DISTRICTS) {
    set.add(d);
  }
  return Array.from(set).sort();
}
