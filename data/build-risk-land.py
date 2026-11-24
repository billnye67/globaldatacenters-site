"""Resample the 2021 global MODIS IGBP land-cover mosaic to small lookup tiles.

This is broad landscape context only. It is too coarse/old for parcel zoning,
buildability, or a claim that vacant land is available to a developer.
"""

import hashlib
import json
import sys
from datetime import date
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SOURCE = ROOT / "data/risk-sources/landcover-2021.tif"
OUTPUT = ROOT / "data/risk-lookup/land"
sys.path.insert(0, str(ROOT / "data/risk-sources/python-safe"))

import numpy as np  # noqa: E402
import rasterio  # noqa: E402
from rasterio.enums import Resampling  # noqa: E402
from rasterio.transform import from_origin  # noqa: E402
from rasterio.vrt import WarpedVRT  # noqa: E402

SOURCE_MD5 = "862010ec14d621333126336a65ee01c5"
WIDTH = 7200
HEIGHT = 3600
TILE_CELLS = 200


def main():
    if not SOURCE.is_file():
        raise SystemExit("Missing source raster: data/risk-sources/landcover-2021.tif")
    digest = hashlib.md5()
    with SOURCE.open("rb") as f:
        for block in iter(lambda: f.read(4 * 1024 * 1024), b""):
            digest.update(block)
    if digest.hexdigest() != SOURCE_MD5:
        raise SystemExit("Land-cover source checksum does not match the published Zenodo file")

    OUTPUT.mkdir(parents=True, exist_ok=True)
    if ROOT.resolve() not in OUTPUT.resolve().parents:
        raise SystemExit("Refusing to clean land tiles outside the repository")
    for old_tile in OUTPUT.glob("*.bin"):
        old_tile.unlink()
    counts = np.zeros(256, dtype=np.int64)
    tiles = 0
    with rasterio.open(SOURCE) as src:
        if str(src.crs) != "EPSG:4326" or src.count != 1:
            raise SystemExit("Unexpected land-cover raster geometry")
        with WarpedVRT(
            src, crs="EPSG:4326", transform=from_origin(-180, 90, .05, .05),
            width=WIDTH, height=HEIGHT, src_nodata=0, nodata=0,
            resampling=Resampling.mode,
        ) as vrt:
            # Read ten-degree strips rather than a world raster to bound memory.
            for tile_y in range(18):
                window = rasterio.windows.Window(0, tile_y * TILE_CELLS, WIDTH, TILE_CELLS)
                strip = vrt.read(1, window=window)
                counts += np.bincount(strip.ravel(), minlength=256)
                for tile_x in range(36):
                    tile = strip[:, tile_x * TILE_CELLS:(tile_x + 1) * TILE_CELLS]
                    if not np.any(tile):
                        continue
                    # Keep the same south-to-north tile and row numbering as
                    # the water and power-grid lookups.
                    south_y = 17 - tile_y
                    (OUTPUT / f"{tile_x}_{south_y}.bin").write_bytes(np.flipud(tile).tobytes())
                    tiles += 1
                print(f"land: {tile_y + 1}/18 latitude strips", flush=True)

    metadata = {
        "source": "NASA MODIS MCD12Q1 v6.1, 2021 LC_Type1 (IGBP), global COG mosaic by OpenGeoHub",
        "url": "https://zenodo.org/records/8367523",
        "nasaUrl": "https://doi.org/10.5067/MODIS/MCD12Q1.061",
        "sourceMd5": SOURCE_MD5,
        "accessed": date.today().isoformat(),
        "year": 2021,
        "sourceResolutionMeters": 500,
        "lookupResolutionDegrees": .05,
        "tileDegrees": 10,
        "tileBytes": TILE_CELLS * TILE_CELLS,
        "tiles": tiles,
        "classCounts": {str(i): int(n) for i, n in enumerate(counts) if n},
        "limitations": "Mode of 2021 land-cover pixels in a roughly 5 km cell; not a current parcel survey, zoning map, or evidence of buildable land.",
    }
    (OUTPUT / "metadata.json").write_text(json.dumps(metadata, indent=2) + "\n", encoding="utf-8")
    print(f"land: wrote {tiles} tiles, {tiles * 40000 / 1e6:.1f} MB")


if __name__ == "__main__":
    main()
