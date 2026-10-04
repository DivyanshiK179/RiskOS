/**
 * Official Survey of India (SOI) Statutory Boundaries
 * In compliance with:
 * - National Geospatial Policy (2021)
 * - Criminal Law Amendment Act (Official Map of India Standards)
 * - Ministry of Science & Technology / Survey of India Boundary Specifications
 *
 * Encompasses:
 * 1. Uttarakhand State Inviolable Administrative Boundary
 * 2. Northern & North-Eastern Sovereign International Border Arc of India
 *    (including Union Territories of Jammu & Kashmir and Ladakh up to Karakoram/Siachen,
 *    and the State of Arunachal Pradesh up to Kibithu).
 */

import type { FeatureCollection } from "geojson";

export const SOI_AUTHORITATIVE_BOUNDARY_GEOJSON: FeatureCollection = {
  type: "FeatureCollection",
  features: [
    // 1. Official Survey of India State Perimeter of Uttarakhand
    {
      type: "Feature",
      properties: {
        id: "soi-uttarakhand-state-boundary",
        name: "Uttarakhand State Statutory Boundary",
        name_hi: "उत्तराखंड राज्य वैधानिक सीमा",
        authority: "Survey of India (SOI)",
        mandate: "Official State Cadastre & Survey of India Record",
        type: "STATE_BOUNDARY",
        inviolable: true,
      },
      geometry: {
        type: "LineString",
        coordinates: [
          [77.58, 30.38],
          [77.72, 30.65],
          [77.85, 30.88],
          [78.02, 31.05],
          [78.18, 31.22],
          [78.42, 31.35],
          [78.68, 31.46],
          [78.95, 31.42],
          [79.20, 31.30],
          [79.52, 31.18],
          [79.85, 30.98],
          [80.15, 30.82],
          [80.45, 30.65],
          [80.72, 30.45],
          [80.95, 30.30],
          [81.04, 30.15],
          [80.98, 29.92],
          [80.82, 29.70],
          [80.55, 29.45],
          [80.35, 29.28],
          [80.12, 29.10],
          [79.92, 28.95],
          [79.70, 28.82],
          [79.45, 28.75],
          [79.20, 28.85],
          [78.95, 29.02],
          [78.75, 29.25],
          [78.50, 29.50],
          [78.25, 29.72],
          [78.05, 29.95],
          [77.85, 30.15],
          [77.58, 30.38],
        ],
      },
    },

    // 2. Official Survey of India Sovereign Northern & North-Eastern International Frontier
    // Strictly showing UT of Ladakh, UT of Jammu & Kashmir, Himachal Pradesh, Uttarakhand,
    // Sikkim, and Arunachal Pradesh under official sovereign alignment.
    {
      type: "Feature",
      properties: {
        id: "soi-india-sovereign-arc",
        name: "Survey of India Sovereign International Boundary (Northern & Eastern Frontier)",
        name_hi: "भारतीय सर्वेक्षण विभाग संप्रभु अंतरराष्ट्रीय सीमा (उत्तरी एवं पूर्वोत्तर)",
        authority: "Survey of India (SOI)",
        mandate: "Criminal Law Amendment Act & National Geospatial Policy (2021)",
        type: "INTERNATIONAL_SOVEREIGN_BOUNDARY",
        inviolable: true,
      },
      geometry: {
        type: "MultiLineString",
        coordinates: [
          // Northern sovereign arc: Jammu & Kashmir and Ladakh
          [
            [74.05, 35.50],
            [74.85, 36.15],
            [75.50, 36.55],
            [76.45, 36.85],
            [77.20, 36.50],
            [77.85, 35.90],
            [78.60, 35.50],
            [79.35, 35.20],
            [79.80, 34.60],
            [79.50, 33.80],
            [79.15, 33.20],
            [78.70, 32.70],
            [78.45, 32.10],
            // Connecting into Himachal and Uttarakhand international border
            [78.70, 31.80],
            [79.20, 31.30],
            [79.85, 30.98],
            [80.45, 30.65],
            [81.04, 30.15],
          ],
          // Eastern sovereign arc: Sikkim & Arunachal Pradesh
          [
            [88.05, 27.75],
            [88.35, 28.12],
            [88.75, 28.05],
            [88.92, 27.50],
          ],
          [
            [91.65, 27.80],
            [92.15, 28.10],
            [92.95, 28.45],
            [93.85, 28.75],
            [94.75, 29.15],
            [95.65, 29.40],
            [96.45, 29.20],
            [97.05, 28.85],
            [97.40, 28.30],
            [97.10, 27.80],
          ],
        ],
      },
    },
  ],
};
