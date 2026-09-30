import urllib.request
import json
import os

overpass_url = "https://overpass-api.de/api/interpreter"
query = """
[out:json][timeout:90];
area["name"="Uttarakhand"]["admin_level"="4"]->.searchArea;
node["place"~"village|hamlet|town"](area.searchArea);
out center;
"""
target = "d:/Study Area/RiskSetu/data/census/osm_villages.json"
print("Fetching Uttarakhand villages from OSM...")
req = urllib.request.Request(overpass_url, data=query.encode('utf-8'), headers={'User-Agent': 'RiskSetu'})
with urllib.request.urlopen(req, timeout=90) as resp, open(target, 'wb') as f:
    f.write(resp.read())
print("Downloaded OSM villages! Size:", os.path.getsize(target), "bytes")
