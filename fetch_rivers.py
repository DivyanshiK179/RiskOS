import urllib.request
import os

overpass_url = "https://overpass-api.de/api/interpreter"
query = """
[out:json][timeout:90];
area["name"="Uttarakhand"]["admin_level"="4"]->.searchArea;
(
  way["waterway"~"river|stream"](area.searchArea);
);
out geom;
"""
target = "d:/Study Area/RiskSetu/data/rivers/uttarakhand_rivers.json"
print("Fetching Uttarakhand rivers from Overpass API...")
req = urllib.request.Request(overpass_url, data=query.encode('utf-8'), headers={'User-Agent': 'RiskSetu-GIS-Collector'})
with urllib.request.urlopen(req, timeout=90) as resp, open(target, 'wb') as f:
    f.write(resp.read())
print("Downloaded rivers! Size:", os.path.getsize(target), "bytes")
