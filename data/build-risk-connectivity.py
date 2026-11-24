"""Import explicitly mapped Internet exchange points from OpenStreetMap.

Presence is a weak regional connectivity signal. Missing OSM mapping says
nothing about actual fiber, peering, latency, capacity, or service availability.
"""

import json
import urllib.parse
import urllib.request
from datetime import date
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
RAW = ROOT / "data/risk-sources/osm-ixp.json"
OUTPUT = ROOT / "data/risk-lookup/ixp.json"
QUERY = '[out:json][timeout:120];(nwr["telecom"="internet_exchange"];nwr["telecom"="exchange"]["telecom:medium"~"fibre|fiber",i];);out center tags;'


def main():
    request = urllib.request.Request(
        "https://overpass-api.de/api/interpreter",
        data=urllib.parse.urlencode({"data": QUERY}).encode("ascii"),
        headers={"User-Agent": "FloridaDCResearch/1.0 (public-interest site research)"},
    )
    with urllib.request.urlopen(request, timeout=180) as response:
        payload = json.load(response)
    RAW.parent.mkdir(parents=True, exist_ok=True)
    RAW.write_text(json.dumps(payload, ensure_ascii=False), encoding="utf-8")
    points = {}
    for element in payload.get("elements", []):
        center = element.get("center", element)
        lat, lng = center.get("lat"), center.get("lon")
        if not isinstance(lat, (int, float)) or not isinstance(lng, (int, float)):
            continue
        tags = element.get("tags") or {}
        key = f"{element['type']}/{element['id']}"
        kind = "ixp" if tags.get("telecom") == "internet_exchange" else "fiber_exchange"
        points[key] = [key, tags.get("name") or ("Mapped Internet exchange point" if kind == "ixp" else "Mapped fiber telecom exchange"), round(lat, 5), round(lng, 5), kind]
    if not points:
        raise SystemExit("No OSM Internet exchange points returned")
    result = {
        "source": "OpenStreetMap telecom=internet_exchange and telecom=exchange + telecom:medium=fibre/fiber via Overpass API",
        "url": "https://wiki.openstreetmap.org/wiki/Telecoms",
        "license": "ODbL 1.0; © OpenStreetMap contributors",
        "accessed": date.today().isoformat(),
        "limitations": "Sparse volunteered mappings; fiber telecom exchanges can be subscriber-loop facilities and are not equivalent to data-center-grade connectivity. No nearby record means unknown, not no connectivity.",
        "points": sorted(points.values()),
    }
    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    OUTPUT.write_text(json.dumps(result, separators=(",", ":"), ensure_ascii=False) + "\n", encoding="utf-8")
    print(f"connectivity: wrote {len(points)} OSM-mapped IXP/fiber-exchange points")


if __name__ == "__main__":
    main()
