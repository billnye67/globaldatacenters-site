"""Build compact global power-line proximity tiles from the World Bank Gridfinder map.

The source GeoPackage is ignored under data/risk-sources/. It is a 2020 modeled
network, with OpenStreetMap lines distinguished by the source field. A line near
an address is not evidence of available electrical capacity.
"""

import hashlib
import json
import math
import sys
from datetime import date
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SOURCE = ROOT / "data/risk-sources/grid.gpkg"
OUTPUT = ROOT / "data/risk-lookup/grid"
sys.path.insert(0, str(ROOT / "data/risk-sources/python-safe"))

from pyogrio import read_info  # noqa: E402
from pyogrio.raw import read  # noqa: E402
from shapely import from_wkb  # noqa: E402

SCALE = 20  # 0.05 degree cells; around 5.6 km latitude by up to 5.6 km longitude.
WIDTH = 360 * SCALE
HEIGHT = 180 * SCALE
ROW_BYTES = WIDTH // 8
TILE_CELLS = 10 * SCALE
TILE_ROW_BYTES = TILE_CELLS // 8
SOURCE_MD5 = "e5d0e9bd8ce4de851e65c6adae1af386"


def mark(mask, x, y):
    if 0 <= x < WIDTH and 0 <= y < HEIGHT:
        bit = y * WIDTH + x
        mask[bit >> 3] |= 1 << (bit & 7)


def raster_line(mask, coords):
    previous = None
    for lon, lat in coords:
        if not (math.isfinite(lon) and math.isfinite(lat)):
            previous = None
            continue
        x = min(WIDTH - 1, max(0, math.floor((lon + 180) * SCALE)))
        y = min(HEIGHT - 1, max(0, math.floor((lat + 90) * SCALE)))
        if previous is not None:
            px, py, plon = previous
            if abs(lon - plon) <= 180:
                steps = 2 * max(abs(x - px), abs(y - py))
                if steps:
                    for k in range(steps + 1):
                        mark(mask, round(px + (x - px) * k / steps), round(py + (y - py) * k / steps))
                else:
                    mark(mask, x, y)
            else:
                # Do not draw a spurious line across the map at the antimeridian.
                mark(mask, px, py)
                mark(mask, x, y)
        else:
            mark(mask, x, y)
        previous = (x, y, lon)


def extract_tile(mask, x, y):
    parts = []
    first_byte = x * TILE_ROW_BYTES
    for row in range(y * TILE_CELLS, (y + 1) * TILE_CELLS):
        start = row * ROW_BYTES + first_byte
        parts.append(mask[start:start + TILE_ROW_BYTES])
    return b"".join(parts)


def main():
    if not SOURCE.is_file():
        raise SystemExit("Missing source GeoPackage: data/risk-sources/grid.gpkg")
    digest = hashlib.md5()
    with SOURCE.open("rb") as f:
        for block in iter(lambda: f.read(4 * 1024 * 1024), b""):
            digest.update(block)
    if digest.hexdigest() != SOURCE_MD5:
        raise SystemExit("Grid source checksum does not match the published Zenodo file")

    total = read_info(SOURCE, layer="grid")["features"]
    osm = bytearray(WIDTH * HEIGHT // 8)
    modeled = bytearray(WIDTH * HEIGHT // 8)
    counts = {"openstreetmap": 0, "gridfinder": 0, "other": 0}
    for offset in range(0, total, 100000):
        _, _, geometries, columns = read(
            SOURCE, layer="grid", columns=["source"],
            skip_features=offset, max_features=100000,
        )
        for source, wkb in zip(columns[0], geometries):
            if wkb is None:
                continue
            source = str(source or "").lower()
            kind = source if source in ("openstreetmap", "gridfinder") else "other"
            counts[kind] += 1
            mask = osm if kind == "openstreetmap" else modeled
            geom = from_wkb(wkb)
            if geom.geom_type == "LineString":
                raster_line(mask, geom.coords)
            elif geom.geom_type == "MultiLineString":
                for line in geom.geoms:
                    raster_line(mask, line.coords)
        print(f"grid: {min(offset + 100000, total)}/{total}", flush=True)

    OUTPUT.mkdir(parents=True, exist_ok=True)
    nonempty = 0
    for y in range(18):
        for x in range(36):
            # First 5000 bytes are observed OSM line cells; next 5000 are modeled cells.
            observed = extract_tile(osm, x, y)
            predicted = extract_tile(modeled, x, y)
            if not any(observed) and not any(predicted):
                continue
            (OUTPUT / f"{x}_{y}.bin").write_bytes(observed + predicted)
            nonempty += 1
    metadata = {
        "source": "Arderne et al., Predictive mapping of the global power system using open data, version 1.1.1 (2020)",
        "url": "https://zenodo.org/records/3628142",
        "catalogUrl": "https://datacatalog.worldbank.org/search/dataset/0038055/derived-map-of-global-electricity-transmission-and-distribution-lines",
        "sourceMd5": SOURCE_MD5,
        "license": "CC BY 4.0; OpenStreetMap-sourced portions also require OSM/ODbL attribution",
        "accessed": date.today().isoformat(),
        "sourceFeatures": counts,
        "resolutionDegrees": 1 / SCALE,
        "tileDegrees": 10,
        "tileBytes": 2 * TILE_ROW_BYTES * TILE_CELLS,
        "tiles": nonempty,
        "limitations": "Line locations include modeled predictions. Proximity does not establish voltage, spare grid capacity, or service availability.",
    }
    (OUTPUT / "metadata.json").write_text(json.dumps(metadata, indent=2) + "\n", encoding="utf-8")
    print(f"grid: wrote {nonempty} tiles, {nonempty * 10000 / 1e6:.1f} MB")


if __name__ == "__main__":
    main()
