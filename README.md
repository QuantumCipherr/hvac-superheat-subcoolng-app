# The Gauge Bench — Superheat & Subcooling Trainer

A single self-contained HTML teaching tool for HVAC students learning **superheat**
and **subcooling** across four refrigerants (R-22, R-410A, R-32, R-454B). Built for a
trade-school class, so technical accuracy is the whole job.

Open `superheat-subcooling-trainer.html` by double-clicking it — no build step, no
server, no network (runs fully offline; the one Google Fonts `<link>` is optional).

## Tabs

1. **The Cycle** — where the two numbers live on the refrigeration loop.
2. **PT Lookup** — pressure ↔ saturation temperature, bubble and dew for blends.
3. **Calculator** — superheat / subcooling workbench with the four-corner read.
4. **Scenarios** — free-play generated service calls.
5. **Practice** — *graded problem sets with worked solutions* (see below).
6. **Reference** — the four refrigerants, the four corners, charging method, data sources.

## Practice problems

A structured, graded problem-set experience layered on top of the existing PT data and
helpers — no refrigerant data or physics is invented. Every reading and every answer is
computed from the same curves the rest of the bench uses, and the answer key is always
recomputed from the **displayed, rounded** inputs so the student's arithmetic matches.

- **Seven problem types:** chart reading, superheat, subcooling, predict-the-reading,
  charging decision (TXV → subcooling, fixed orifice → superheat), four-corner diagnosis,
  and the R-454B blend/glide column trap.
- **Three levels:** Apprentice (±3 °F, hints), Journeyman (±2 °F, fewer hints),
  Master (±1.5 °F, no hints). Pressure answers use a curve-slope tolerance.
- **Set flow:** choose 5/10/20 problems, level, types, and refrigerants; progress and
  running score; immediate worked solution after each submit; end-of-set summary with a
  missed-by-concept breakdown and **Retry missed concepts**.
- **Seedable / reproducible:** set a seed and the whole set (and its answer key) is
  identical for the entire class. Generation routes through a seeded mulberry32 PRNG.
- **Printable worksheet + matching answer key** (via the browser print dialog and a
  "Copy as text" option — no PDF library). The two always agree because they share a seed.
- **Progress persistence** to `localStorage`, wrapped in `try/catch`, degrading to
  session-only if storage is unavailable. Includes a reset control.

## Self-test (acceptance criteria)

`practice-selftest.js` loads the real inline `<script>` from the HTML under a minimal DOM
shim (one source of truth — it does not re-implement any logic) and runs the in-file
`runSelfTest()`:

```
node practice-selftest.js
```

It verifies: PT-curve monotonicity, no `NaN` across ~14,000 generated problems, answer-key
self-consistency, distinct four-corner fault signatures, grader tolerance behavior,
seed reproducibility, and a clean load. You can also call `runSelfTest()` from the browser
console.

## Constraints honored

Single self-contained file · inline CSS/JS · no frameworks, bundler, or CDN scripts ·
PT data arrays and the `interp` / `tempFromP` / `pFromTemp` / `satTemp` helpers are
unchanged · existing tabs unchanged · instrument-panel design language and technician
voice preserved · A2L / EPA 608 / defer-to-data-plate safety notes intact.
