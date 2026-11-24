# Site assessment data

This directory contains browser-ready derivatives, not the original source archives. The raw downloads and local GIS wheels live in `data/risk-sources/`, which is git-ignored.

## Water stress

`water/{x}_{y}.json` contains WRI Aqueduct 4.0 baseline annual water-stress basins clipped to 10-degree tiles. Tile coordinates are `x = floor((longitude + 180) / 10)` and `y = floor((latitude + 90) / 10)`. Each feature is `[pfaf_id, bws_score, bws_cat, bws_label, is_multi_polygon, coordinates]`. Coordinates are longitude, latitude, rounded to 0.001 degree after a 0.001-degree topology-preserving simplification. Missing WRI coverage must remain **unknown**, not zero stress.

The score is a *basin-level water-stress indicator*, not a water-rights, cooling-water availability, permit, or site-level water-supply measurement. WRI's indicator is 0–5, with higher values meaning more stressed. Source: [WRI Aqueduct 4.0](https://www.wri.org/data/aqueduct-global-maps-40-data), CC BY 4.0. Attribute WRI wherever this indicator is displayed.

Build with `python data/build-risk-water.py` after placing the WRI Aqueduct 4.0 geodatabase and GIS wheels under `data/risk-sources/`. Check with `python data/check-risk-water.py`; it compares tile results against the original polygons at 100 sampled worldwide project coordinates.

## Power-network proximity

`grid/{x}_{y}.bin` contains two bitmaps of 0.05-degree cells in each 10-degree tile: 5,000 bytes for **OpenStreetMap-observed** lines, then 5,000 bytes for **Gridfinder-modeled** lines. Both come from the 2020 [World Bank global grid map](https://zenodo.org/records/3628142), with 3.68 million source line features compressed into 231 nonempty tiles (2.3 MB total). The source GeoPackage's MD5 is checked before building. `grid.js` loads tiles around an address and returns proximity and mapped-cell counts within 50 km. Cell counts are a regional infrastructure proxy, not spare electricity capacity, a connection offer, or a substation count. Absence from this older map does not prove there is no grid.

Build with `python data/build-risk-grid.py`. Check with `python data/check-risk-grid.py`; it compares 20 worldwide project coordinates with original line geometry, allowing for the roughly 5.6 km raster cells. Attribute Arderne et al./World Bank, and OpenStreetMap contributors for observed lines. The World Bank catalog marks the dataset CC BY 4.0; OSM-derived content also carries ODbL obligations.

## Other factors and scoring

The project's own tracked data-center locations come from `data/globe.json`. `ixp.json` holds OSM-mapped internet exchanges and fiber telecom exchanges, but neither contributes to the risk score. `land/{x}_{y}.bin` holds broad 2021 MODIS IGBP land cover at 0.05-degree resolution. The lookup uses the most common land class in a 3-by-3 neighborhood, preferring land cells near coastlines. This is broad regional context, not zoning or parcel availability.

The address score reads the same project pins from `data/globe.json` that feed the homepage globe. A pin is a tracker location and may be approximate. Inactive statuses are shown on the globe but do not add to the development activity score.

`assessment.js` adapts the Florida calculator's four weighted factors to a worldwide comparative regional index: power infrastructure 30 points, basin water stress 15, broad land cover 15, and known data-center activity 40. The address result shows each factor's mapped or tracked finding; the full score adds the nearest tracked site and map year. Missing or failed water and land layers use disclosed neutral baseline points; no nearby grid line or project uses the stated low baseline. The score does not measure spare grid capacity, water rights, vacant acreage, or zoning. See `sources.html#risk-scoring` for the point bands and `tools/check-risk-assessment.cjs` for the regression check.

## Address lookup

`functions/api/geocode.js` calls Geoapify Geocoding from Cloudflare Pages. Configure `GEOAPIFY_KEY` as an encrypted secret in the Pages project before deploying. For local provider checks, put the key in `.dev.vars`; that file is ignored by Git. The browser receives at most five location candidates and never receives the provider key. A confirmed street number can score immediately. Lower-confidence or ambiguous matches require the visitor to choose the mapped location first; the score is then labeled as a selected location whose exact address was not verified. No result leaves the old score on screen.

`node tools/check-risk-result.cjs` covers the browser score and ambiguous-address choice with mocked geocoding. `node tools/check-live-world-search.cjs customer-new` calls the live provider through the same server function for 15 worldwide customer addresses and checks the four-factor math. The local test requires `.dev.vars` and a static server on port 8787.
