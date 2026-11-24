"""Build small, static Aqueduct water-stress lookups from WRI's 4.0 geodatabase.

The source archive and GIS wheels live in data/risk-sources/ and are intentionally
not published. Run from the repository root with: python data/build-risk-water.py
"""

import json
import math
import sys
from datetime import date
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SOURCE = ROOT / "data/risk-sources/Aqueduct40_waterrisk_download_Y2023M07D05/GDB/Aq40_Y2023D07M05.gdb"
OUTPUT = ROOT / "data/risk-lookup/water"
sys.path.insert(0, str(ROOT / "data/risk-sources/python-safe"))

from pyogrio import read_info  # noqa: E402
from pyogrio.raw import read  # noqa: E402
from shapely import from_wkb, make_valid  # noqa: E402
from shapely.geometry import box  # noqa: E402


def rounded(value):
    if isinstance(value, (tuple, list)):
        return [rounded(item) for item in value]
    return round(value, 3)


def tile_range(lo, hi, origin, count):
    start = max(0, min(count - 1, math.floor((lo - origin) / 10)))
    stop = max(0, min(count - 1, math.floor((hi - origin) / 10)))
    return range(start, stop + 1)


def main():
    if not SOURCE.is_dir():
        raise SystemExit("Missing WRI geodatabase in data/risk-sources")
    total = read_info(SOURCE, layer="baseline_annual")["features"]
    tiles = {}
    included = 0
    for offset in range(0, total, 2000):
        meta, _, geometries, columns = read(
            SOURCE,
            layer="baseline_annual",
            columns=["pfaf_id", "bws_score", "bws_cat", "bws_label"],
            skip_features=offset,
            max_features=2000,
        )
        for pfaf, score, category, label, wkb in zip(*columns, geometries):
            if wkb is None or score is None or not math.isfinite(float(score)):
                continue
            geom = from_wkb(wkb)
            if geom.is_empty:
                continue
            if not geom.is_valid:
                geom = make_valid(geom)
            geom = geom.simplify(0.001, preserve_topology=True)
            if not geom.is_valid:
                geom = make_valid(geom)
            if geom.is_empty:
                continue
            included += 1
            west, south, east, north = geom.bounds
            for x in tile_range(west, east, -180, 36):
                for y in tile_range(south, north, -90, 18):
                    cell = box(-180 + x * 10, -90 + y * 10, -170 + x * 10, -80 + y * 10)
                    try:
                        part = geom if cell.covers(geom) else geom.intersection(cell)
                    except Exception:
                        part = make_valid(geom).intersection(cell)
                    if part.is_empty:
                        continue
                    pieces = [part] if part.geom_type != "GeometryCollection" else list(part.geoms)
                    for piece in pieces:
                        if piece.geom_type not in ("Polygon", "MultiPolygon"):
                            continue
                        tiles.setdefault((x, y), []).append([
                            int(pfaf), round(float(score), 3),
                            int(category) if category is not None and math.isfinite(float(category)) else None,
                            str(label) if label is not None else "",
                            1 if piece.geom_type == "MultiPolygon" else 0,
                            rounded(piece.__geo_interface__["coordinates"]),
                        ])
        print(f"water: {min(offset + 2000, total)}/{total}", flush=True)

    OUTPUT.mkdir(parents=True, exist_ok=True)
    bytes_written = 0
    for (x, y), features in tiles.items():
        path = OUTPUT / f"{x}_{y}.json"
        body = json.dumps(features, separators=(",", ":"), ensure_ascii=False)
        path.write_text(body, encoding="utf-8")
        bytes_written += path.stat().st_size
    metadata = {
        "source": "WRI Aqueduct 4.0 baseline annual water risk",
        "url": "https://www.wri.org/data/aqueduct-global-maps-40-data",
        "license": "CC BY 4.0; attribution required",
        "accessed": date.today().isoformat(),
        "indicator": "bws_score (baseline water stress, 0-5)",
        "tileDegrees": 10,
        "geometrySimplificationDegrees": 0.001,
        "sourceFeatures": included,
        "tiles": len(tiles),
    }
    (OUTPUT / "metadata.json").write_text(json.dumps(metadata, indent=2) + "\n", encoding="utf-8")
    print(f"water: wrote {len(tiles)} tiles, {bytes_written / 1e6:.1f} MB")


if __name__ == "__main__":
    main()
