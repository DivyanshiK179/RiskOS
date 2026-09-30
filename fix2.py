with open('frontend/src/components/MapView.tsx', 'r', encoding='utf-8') as f:
    code = f.read()

code = code.replace('import maplibregl from "maplibre-gl";', 'import * as maplibregl from "maplibre-gl";')
code = code.replace('(e) =>', '(e: any) =>')

with open('frontend/src/components/MapView.tsx', 'w', encoding='utf-8') as f:
    f.write(code)
print('Fixed TS errors')
