# Risk assessment data status

**Launch status: not ready for public traffic.** The address checker reads the same project pins as the homepage globe from `data/globe.json`, with the same colocation exclusion. Inactive projects do not add to the activity score. The assessment map shows only the searched-address pin; its full-globe view reuses the homepage tracker. Two separate 15-address worldwide browser checks each produced 15 scores. In the fresh set, six exact inputs were confirmed and nine were transparently scored as nearby areas because the geocoder returned a different number, street, or locality, or could not find the exact input. Equinix TY12x was repinned to Equinix's published Inzai coordinates, and an AirTrunk TOK2 pin was removed because its exact location is undisclosed. The nearby count represents tracker pins, not a verified count of separate physical facilities. The current browser-side public Nominatim lookup is subject to a site-wide 1 request/second limit and needs a production geocoder before public launch. Current changes are local and not deployed.

The live address checker uses tracked data-center sites, mapped power lines, WRI water stress, and broad land cover for an approximate regional score. It does not measure spare electricity, water rights, or buildable parcels at an address. See `sources.html#risk-scoring` for the public methodology and limitations.

| Layer | Built output | Validation | Limitation |
| --- | --- | --- | --- |
| Tracked projects | Existing `data/globe.json`, with the same project selection as `globe-init.js` | 10-location score regression; two distinct 15-address worldwide browser checks; homepage pin-count comparison | Tracker pins can be approximate, duplicate, or represent a cloud region rather than a separate facility. |
| Water stress | 463 WRI Aqueduct 4.0 JSON tiles | 100 worldwide sites checked against source polygons, 0 mismatches | Basin stress is not site water availability. |
| Electricity lines | 231 World Bank grid bitset tiles | 20 worldwide sites checked against source geometry; none beyond 8 km raster tolerance | Modeled lines and mapped lines are distinct; proximity is not capacity. |
| Connectivity | 3,565 OSM telecom landmarks in `ixp.json` | Sampled locations checked | Not used in the current score. |
| Land cover | 524 2021 MODIS tiles | Four worldwide sample cells checked against source raster | ~5.6 km cells cannot establish zoning or parcel suitability. |

Raw source archives and local GIS packages are ignored under `data/risk-sources/`. Public lookup output remains in this directory.
