import re
with open('backend/risksetu/settings.py', 'r', encoding='utf-8') as f:
    code = f.read()

# Let's completely wipe the hardcoded OSGEO4W stuff and replace it with a safe Windows check
old_osgeo = """OSGEO4W = r"C:\\Users\\adity\\AppData\\Local\\Programs\\OSGeo4W"
if os.name == 'nt':
    os.add_dll_directory(os.path.join(OSGEO4W, 'bin'))

# 3. Set environment variables for GDAL to find its projection files
os.environ['OSGEO4W_ROOT'] = OSGEO4W
os.environ['GDAL_DATA'] = os.path.join(OSGEO4W, 'share', 'gdal')
os.environ['PROJ_LIB'] = os.path.join(OSGEO4W, 'share', 'proj')
os.environ['PATH'] = os.path.join(OSGEO4W, 'bin') + ';' + os.environ['PATH']

# 4. Point directly to the exact gdal313.dll file
GDAL_LIBRARY_PATH = os.path.join(OSGEO4W, 'bin', 'gdal313.dll')
GEOS_LIBRARY_PATH = os.path.join(OSGEO4W, 'bin', 'geos_c.dll')"""

new_osgeo = """import os
if os.name == 'nt':
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

if old_osgeo in code:
    code = code.replace(old_osgeo, new_osgeo)
else:
    # If exact match fails, use regex to remove anything defining GDAL_LIBRARY_PATH globally
    print("Regex fallback")
    code = re.sub(r'OSGEO4W\s*=\s*r"C:\\[^"]+".*?GEOS_LIBRARY_PATH\s*=\s*os\.path\.join\([^)]+\)', new_osgeo, code, flags=re.DOTALL)

with open('backend/risksetu/settings.py', 'w', encoding='utf-8') as f:
    f.write(code)
print('Fixed OSGeo settings')
