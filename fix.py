with open('frontend/src/components/MapView.tsx', 'r', encoding='utf-8') as f:
    code = f.read()

code = code.replace('import mapboxgl from "mapbox-gl";', 'import maplibregl from "maplibre-gl";')
code = code.replace('import "mapbox-gl/dist/mapbox-gl.css";', 'import "maplibre-gl/dist/maplibre-gl.css";')
code = code.replace('mapboxgl.', 'maplibregl.')

import re
code = re.sub(r'maplibregl\.accessToken[^;]+;', '', code)

with open('frontend/src/components/MapView.tsx', 'w', encoding='utf-8') as f:
    f.write(code)
print('Fixed Maplibre!')
