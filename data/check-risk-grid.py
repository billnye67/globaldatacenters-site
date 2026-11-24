"""Spot-check coarse grid tiles against the source power-line geometry."""

import json
import math
import random
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT / "data/risk-sources/python-safe"))

from pyogrio.raw import read  # noqa: E402
from shapely import from_wkb  # noqa: E402
from shapely.geometry import Point  # noqa: E402
from shapely.ops import transform  # noqa: E402

SOURCE = ROOT / "data/risk-sources/grid.gpkg"
TILES = ROOT / "data/risk-lookup/grid"
WIDTH = 7200


def lookup(lat, lng):
    cos = max(0.05, math.cos(math.radians(lat)))
    x0 = max(0, math.floor((lng - 50 / (111.195 * cos) + 180) * 20))
    x1 = min(WIDTH - 1, math.floor((lng + 50 / (111.195 * cos) + 180) * 20))
    y0 = max(0, math.floor((lat - 50 / 111.195 + 90) * 20))
    y1 = min(3599, math.floor((lat + 50 / 111.195 + 90) * 20))
    tiles = {}
    result = {"openstreetmap": None, "gridfinder": None}
    for y in range(y0, y1 + 1):
        for x in range(x0, x1 + 1):
            name = f"{x // 200}_{y // 200}"
            if name not in tiles:
                path = TILES / f"{name}.bin"
                tiles[name] = path.read_bytes() if path.exists() else bytes(10000)
            cell = (y % 200) * 200 + (x % 200)
            north = (y + 0.5) / 20 - 90
            east = (x + 0.5) / 20 - 180
            km = math.hypot((north - lat) * 111.195, (east - lng) * 111.195 * cos)
            if km > 50:
                continue
            for source, offset in (("openstreetmap", 0), ("gridfinder", 5000)):
                if tiles[name][offset + (cell >> 3)] & (1 << (cell & 7)):
                    old = result[source]
                    result[source] = km if old is None else min(km, old)
    return result


def reference(lat, lng):
    cos = max(0.05, math.cos(math.radians(lat)))
    dlat = 55 / 111.195
    dlon = 55 / (111.195 * cos)
    _, _, geoms, columns = read(
        SOURCE, layer="grid", columns=["source"],
        bbox=(lng - dlon, lat - dlat, lng + dlon, lat + dlat),
    )
    point = Point(lng * cos, lat)
    result = {"openstreetmap": None, "gridfinder": None}
    for source, wkb in zip(columns[0], geoms):
        if source not in result or wkb is None:
            continue
        geometry = transform(lambda x, y, z=None: (x * cos, y), from_wkb(wkb))
        km = point.distance(geometry) * 111.195
        if km <= 50:
            old = result[source]
            result[source] = km if old is None else min(km, old)
    return result


def main():
    projects = json.loads((ROOT / "data/projects.json").read_text(encoding="utf-8"))["projects"]
    points = [(p["lat"], p["lng"], p["name"]) for p in projects if isinstance(p.get("lat"), (int, float)) and isinstance(p.get("lng"), (int, float)) and abs(p["lat"]) < 70]
    bad = []
    for lat, lng, name in random.Random(41).sample(points, min(20, len(points))):
        tile = lookup(lat, lng)
        source = reference(lat, lng)
        for kind in source:
            a, b = tile[kind], source[kind]
            if (a is None) != (b is None) or (a is not None and abs(a - b) > 8):
                bad.append((name, kind, round(b, 1) if b is not None else None, round(a, 1) if a is not None else None))
    print(f"Checked 20 worldwide sites against original grid lines; {len(bad)} mismatches above 8 km")
    for item in bad[:10]:
        print(item)
    if bad:
        raise SystemExit(1)


if __name__ == "__main__":
    main()
