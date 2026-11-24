"""Compare compact water tiles with the original WRI polygons at real project sites."""

import json
import math
import random
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT / "data/risk-sources/python-safe"))

from pyogrio.raw import read  # noqa: E402
from shapely import from_wkb  # noqa: E402
from shapely.geometry import Point, shape  # noqa: E402

SOURCE = ROOT / "data/risk-sources/Aqueduct40_waterrisk_download_Y2023M07D05/GDB/Aq40_Y2023D07M05.gdb"
TILES = ROOT / "data/risk-lookup/water"


def lookup(lat, lng):
    x = max(0, min(35, math.floor((lng + 180) / 10)))
    y = max(0, min(17, math.floor((lat + 90) / 10)))
    path = TILES / f"{x}_{y}.json"
    if not path.exists():
        return None
    point = Point(lng, lat)
    for pfaf, score, category, label, multi, coords in json.loads(path.read_text(encoding="utf-8")):
        geom = shape({"type": "MultiPolygon" if multi else "Polygon", "coordinates": coords})
        if geom.covers(point):
            return int(pfaf), float(score)
    return None


def reference(lat, lng):
    _, _, geoms, cols = read(SOURCE, layer="baseline_annual", columns=["pfaf_id", "bws_score"], bbox=(lng, lat, lng, lat))
    point = Point(lng, lat)
    for pfaf, score, wkb in zip(*cols, geoms):
        if wkb and score is not None and from_wkb(wkb).covers(point):
            return int(pfaf), round(float(score), 3)
    return None


def main():
    projects = json.loads((ROOT / "data/projects.json").read_text(encoding="utf-8"))["projects"]
    points = [(p["lat"], p["lng"], p["name"]) for p in projects if isinstance(p.get("lat"), (int, float)) and isinstance(p.get("lng"), (int, float))]
    rng = random.Random(41)
    mismatches = []
    covered = 0
    for lat, lng, name in rng.sample(points, min(100, len(points))):
        actual = lookup(lat, lng)
        expected = reference(lat, lng)
        covered += expected is not None
        if actual != expected:
            mismatches.append((name, lat, lng, expected, actual))
    print(f"Checked 100 worldwide project coordinates; {covered} covered by WRI; {len(mismatches)} mismatches")
    for mismatch in mismatches[:10]:
        print(mismatch)
    if len(mismatches) > 2:
        raise SystemExit(1)


if __name__ == "__main__":
    main()
