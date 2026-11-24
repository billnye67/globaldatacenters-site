# Risk globe rendering change

The risk globe now selects nearby tile records instead of building global octrees
at levels 4–7. The original distance/frustum selection is retained at those levels.
Longitude wraps at the date line and Mercator latitude bounds are clamped. At
street detail, conservative tile bounds avoid edge gaps present in the original
five-point visibility test.

Mesh construction and texture uploads run through `risk-render-budget.js` with a
2 ms cooperative batch budget, at most four construction/upload operations and
at most two texture uploads per animation callback. A single allocation or driver
call cannot be preempted, so this is not a guaranteed 2 ms upper limit. Obsolete
levels are skipped and clearing the tile engine also clears queued work.

The optional hooks in the vendored `globe.gl.js` are in `Dm` (lazy records), `Lm`
(selection and scheduled mesh construction), `updatePov` (conservative street tile
bounds), and the image completion callback (scheduled uploads and stale-load
disposal). The homepage uses the original library path without a scheduler.
Preserve these hooks when updating the vendored library.

The risk globe reuses the homepage's prepared satellite pin buffers in three
meshes. Independent material uniforms retain growth and zoom scaling. Preparation
uploads the buffers before the open animation. Screen-coordinate picking supports
pin taps without raycasting thousands of meshes every frame.

## Verification

- `node tools/profile-risk-pipeline.cjs --baseline tools/risk-perf-before.json`
- `node tools/profile-risk-pipeline.cjs tools/risk-perf-after.json`
- `node tools/check-risk-render-pipeline.cjs --webkit`
- `node tools/check-risk-render-pipeline.cjs --flow --live`
- `node tools/check-address-layout.cjs`

The profile uses Chromium with 4x CPU throttling, blocks satellite image requests,
and measures two passes through levels 1–13. It isolates CPU tile selection and
creation; it does not emulate iPhone Low Power Mode or measure displayed frames.
The baseline serves the committed, unmodified vendor bundle. The worst synchronous
step in the saved runs was 65.6 ms before and 14.9 ms after. The new scheduler's
largest construction batch in that run was 11.2 ms, including uninterruptible work.

WebKit checked 81 visible screen samples at each of six location/level combinations,
including the date line and 70 degrees north: no missing tiles. Its full-globe
check reported three pin meshes, nine scene draw calls, no individual point meshes,
correct pin picking, zero page overflow after closing, and no JavaScript errors.
Chromium's real-imagery open/pick/close check also passed. The WebKit address check
returned an 85/100 Ashburn score with page width equal to the 390 px viewport.

These results verify local workload reductions and functional behavior. Actual
iPhone visible smoothness with Low Power Mode enabled has not yet been verified.
