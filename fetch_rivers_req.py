import requests
import json
import os

overpass_url = "https://overpass-api.de/api/interpreter"
query = """
[out:json][timeout:180];
area["name"="Uttarakhand"]["admin_level"="4"]->.searchArea;
(
  way["waterway"="river"](area.searchArea);
);
out geom;
"""
target = "d:/Study Area/RiskSetu/data/rivers/uttarakhand_rivers.json"
print("Fetching Uttarakhand rivers using requests (river only)...")
r = requests.post(overpass_url, data=query.encode('utf-8'), headers={'User-Agent': 'RiskSetu'}, stream=True)
with open(target, 'wb') as f:
    for chunk in r.iter_content(chunk_size=1024*1024):
        if chunk:
            f.write(chunk)
print("Downloaded rivers! Size:", os.path.getsize(target), "bytes")
