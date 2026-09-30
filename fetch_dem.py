import requests
import os

url = "https://portal.opentopography.org/API/globaldem?demtype=SRTMGL1&south=28.7&north=31.5&west=77.5&east=81.1&outputFormat=GTiff"
target = "d:/Study Area/RiskSetu/data/dem/uttarakhand_dem.tif"

print("Fetching DEM from OpenTopography API...")
r = requests.get(url, stream=True)
if r.status_code == 200:
    with open(target, 'wb') as f:
        for chunk in r.iter_content(chunk_size=1024*1024):
            if chunk:
                f.write(chunk)
    print("Downloaded DEM! Size:", os.path.getsize(target), "bytes")
else:
    print("Error fetching DEM:", r.status_code, r.text)
