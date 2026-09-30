const fs = require('fs');
let code = fs.readFileSync('frontend/src/components/MapView.tsx', 'utf8');
code = code.replace(/map\.setTerrain/g, '// map.setTerrain');
code = code.replace(/map\.addSource\(['"]mapbox-dem['"]/g, '// map.addSource("mapbox-dem"');
fs.writeFileSync('frontend/src/components/MapView.tsx', code);
console.log('Done');
