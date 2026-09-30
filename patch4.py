import re
with open('backend/risksetu/settings.py', 'r', encoding='utf-8') as f:
    code = f.read()

match = re.search(r'OSGEO4W\s*=\s*r"C:\\[^"]+".*?GEOS_LIBRARY_PATH\s*=\s*os\.path\.join\([^)]+\)', code, re.DOTALL)
if match:
    old = match.group(0)
    new_osgeo = """import os
if os.name == "nt":
    OSGEO4W = r"C:\\Users\\adity\\AppData\\Local\\Programs\\OSGeo4W"
    try:
        os.add_dll_directory(os.path.join(OSGEO4W, 'bin'))
    except:
        pass
    os.environ['OSGEO4W_ROOT'] = OSGEO4W
    os.environ['GDAL_DATA'] = os.path.join(OSGEO4W, 'share', 'gdal')
    os.environ['PROJ_LIB'] = os.path.join(OSGEO4W, 'share', 'proj')
    os.environ['PATH'] = os.path.join(OSGEO4W, 'bin') + ';' + os.environ.get('PATH', '')
    GDAL_LIBRARY_PATH = os.path.join(OSGEO4W, 'bin', 'gdal313.dll')
    GEOS_LIBRARY_PATH = os.path.join(OSGEO4W, 'bin', 'geos_c.dll')"""
    code = code.replace(old, new_osgeo)
    with open('backend/risksetu/settings.py', 'w', encoding='utf-8') as f:
        f.write(code)
    print("Fixed!")
else:
    print("Not found")
