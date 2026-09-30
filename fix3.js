const fs = require('fs');
let code = fs.readFileSync('frontend/src/components/MapView.tsx', 'utf8');

const oldPaint = `          paint: {
            "line-color": "#facc15",
            "line-width": 2,
            "line-dasharray": [2, 2],
          },`;
const newPaint = `          paint: {
            "line-color": "#10b981",
            "line-width": 3,
            "line-opacity": 0.6,
          },`;
code = code.replace(oldPaint, newPaint);

const oldLogic = `      const lineFeatures = affected_habitations
        .filter((h) => h.assigned_safe_site)
        .map((h) => {
          return turf.lineString([
            [h.lon, h.lat],
            [h.assigned_safe_site!.lon, h.assigned_safe_site!.lat]
          ]);
        });`;
const newLogic = `      const siteCounts = new Map<number, { site: any, count: number }>();
      affected_habitations.forEach((h: any) => {
        if (h.assigned_safe_site) {
          const s = h.assigned_safe_site;
          if (!siteCounts.has(s.id)) siteCounts.set(s.id, { site: s, count: 0 });
          siteCounts.get(s.id)!.count += h.population;
        }
      });
      const lineFeatures = Array.from(siteCounts.values()).map(({ site, count }) => {
        return turf.lineString([
          [epicenter.lon, epicenter.lat],
          [site.lon, site.lat]
        ]);
      });`;
code = code.replace(oldLogic, newLogic);
fs.writeFileSync('frontend/src/components/MapView.tsx', code);
console.log('Done');
