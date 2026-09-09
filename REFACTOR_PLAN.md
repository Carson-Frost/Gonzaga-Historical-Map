# Gonzaga Historical Map Refactor Plan

## Objective

Turn the current prototype into a maintainable, tested, accessible, responsive application without
changing its historical behavior or inventing missing content. Preserve the period-driven selection
model and pure data rules while replacing the weak build, content-validation, UI, and map boundaries.

This is an incremental refactor, not a rewrite. Each phase must leave the application usable and
must be independently reviewable.

## Product behavior that must not change

- The selected period remains the application's navigation spine.
- Changing periods updates both sidebar locations and map markers, then closes an open location.
- Selecting a sidebar row or marker opens that location without changing the period and centers the
  map on its period-resolved coordinates.
- A location is visible when its lifespan overlaps the period's inclusive bounds.
- A null `builtYear` keeps a location hidden until its date is known.
- Snapshot values override location defaults only when the snapshot value is non-null.
- Missing introductions, descriptions, and images remain explicit empty states.
- Category order and alphabetical order within categories remain stable.
- Previous/next location navigation uses the displayed order and wraps at both ends.
- Same-site links include only peers visible in the current period.
- Stadia Maps, OpenMapTiles, OpenStreetMap, photograph, and archive attribution remains accurate.
- Historical image overlays remain disabled until real assets and calibrated bounds exist.

## Verified baseline

The baseline audit found:

- 5 periods, 70 locations, and 0 snapshots.
- No duplicate or malformed location IDs, invalid lifespans, invalid coordinates, duplicate
  snapshot pairs, or orphaned snapshot references.
- 5 locations have an intentionally null `builtYear` and are therefore hidden.
- Visible location counts by period are 9, 16, 34, 57, and 61.
- Desktop rendering at 1600x1000 is coherent and includes provider attribution.
- Mobile rendering at 390x844 is broken: the fixed sidebar consumes the viewport, content clips,
  and the map is unavailable.
- `npm run lint` fails with seven errors.
- `npm run build` succeeds but emits a malformed `font-family` warning.
- The production JavaScript bundle is approximately 416 KB before snapshot content is added.
- `npm audit --omit=dev` reports no known vulnerabilities.
- The coordinate-authoring tool is enabled in production.
- Sidebar selection pans to default coordinates even when a snapshot overrides marker coordinates.
- The repository contains substantial unused UI scaffolding and dependencies.
- Deleted Spokane raster maps remain in reachable Git history and account for roughly 77 MB of Git
  objects; history cleanup must be handled separately from application refactoring.

## Target architecture

```text
src/
  app/
    App.jsx
    HistoricalMapShell.jsx
    useHistoricalMapState.js

  domain/
    periods/
      periods.js
      periodSelectors.js
    locations/
      locations.js
      locationSelectors.js
    snapshots/
      snapshots.js
      snapshotSelectors.js
    categories.js
    contentSchema.js
    validateContent.js

  features/
    period-browser/
      PeriodOverview.jsx
      PeriodNavigation.jsx
    location-details/
      LocationDetails.jsx
      LocationNavigation.jsx
      SiteHistory.jsx
      SnapshotImage.jsx
    campus-map/
      CampusMap.jsx
      HistoricalOverlayLayer.jsx
      MapViewportController.jsx
      MarkerLayer.jsx
      MarkerTooltip.jsx
      mapConfig.js
    coordinate-authoring/
      CoordinatePicker.jsx

  shared/
    ui/
      IconButton.jsx
    styles/
      global.css
      tokens.css

tests/
  domain/
  interactions/
  e2e/

scripts/
  validate-content.mjs
```

Architectural rules:

- `domain` imports neither React nor Leaflet and is executable in Node-based tests.
- `features` import explicit domain APIs instead of a global configuration barrel.
- `campus-map` is the only Leaflet-aware boundary.
- `app` exclusively owns synchronized period/location selection and eventual URL state.
- `shared/ui` contains only primitives with at least two real consumers.
- Content is validated before the application or production build consumes it.
- Files should be split around stable behavior and ownership, not merely to reduce line counts.

## Phase 1: Establish a trustworthy quality gate

Complete this phase before structural movement.

1. Fix all current lint failures:
   - remove or render the unused coordinate-copy state;
   - move non-component exports out of component modules where needed;
   - eliminate impure render-time randomness in unused scaffold or remove the scaffold;
   - make Tailwind and Vite configurations valid ESM.
2. Correct the malformed Tailwind font-family definitions and remove duplicate Leaflet CSS imports.
3. Add scripts with unambiguous responsibilities:
   - `validate:data` for schema and cross-record invariants;
   - `test` for fast domain/component tests;
   - `test:e2e` for real interaction coverage;
   - `check` to run validation, tests, lint, and build.
4. Add CI that runs `npm ci` and `npm run check` on every proposed change.
5. Add characterization tests for:
   - inclusive lifespan boundaries;
   - null `builtYear` behavior;
   - snapshot fallback and override semantics;
   - duplicate IDs and duplicate snapshot pairs;
   - snapshot foreign keys and period indexes;
   - coordinates, categories, colors, zooms, and year ordering;
   - category/alphabetical ordering;
   - wrapped previous/next navigation;
   - same-site peer filtering.
6. Add browser tests for period navigation, sidebar-to-map selection, marker-to-sidebar selection,
   location drill-down, wrapped location navigation, same-site links, image failure, and first/last
   period states.

Acceptance criteria:

- `npm run check` exits successfully with no lint errors or build warnings.
- Invalid content fails with a precise record and field error.
- Existing behavior is covered before modules are moved.
- Desktop and mobile screenshots are captured as explicit baselines.

## Phase 2: Correct production behavior and accessibility

1. Replace the hard-coded development flag with `import.meta.env.DEV` plus an optional explicit
   local environment switch. Exclude authoring behavior from production builds.
2. Resolve a location once for the selected period and use that resolved latitude, longitude, and
   zoom for marker placement, marker selection, and sidebar selection.
3. Give each marker a location-specific accessible name and make its label available on keyboard
   focus as well as pointer hover.
4. Add consistent `focus-visible` styles to every interactive control.
5. Add accurate labels to icon-only copy controls, render copy success, and handle clipboard failure.
6. Manage focus when opening and closing location details.
7. Communicate selected-marker state without relying on opacity alone.
8. Respect reduced-motion preferences for map and panel animation.

Acceptance criteria:

- Snapshot coordinate overrides cannot produce a marker/pan mismatch.
- A production build cannot expose the coordinate picker.
- The entire browsing flow is keyboard operable with visible focus and meaningful names.
- Pointer, keyboard, and assistive-technology interaction share the same state model.

## Phase 3: Build the responsive application shell

1. Retain the persistent sidebar-plus-map layout on sufficiently wide screens.
2. Use a map-first mobile layout with one accessible sheet or panel for period browsing and location
   details. Do not connect the existing unused generic sidebar wholesale.
3. Preserve the same App-owned selection when crossing breakpoints.
4. Make long titles, category lists, year ranges, footer navigation, and drill-down navigation wrap
   or truncate intentionally.
5. Use modern viewport units and safe-area padding where appropriate.
6. Confirm that map controls and attribution remain reachable and visible at every supported size.

Acceptance criteria:

- At 390x844, both the map and all historical content are reachable without horizontal clipping.
- At 768px and 1600x1000, navigation, map controls, attribution, and content remain usable.
- Opening or closing the mobile panel does not reset period or location state.
- Dense modern-period lists and unusually long labels remain usable.

## Phase 4: Establish explicit domain boundaries

1. Move periods, locations, snapshots, and their selectors under `domain` without changing their
   public behavior.
2. Remove `src/config/index.js`; import explicit APIs from their owning modules.
3. Create a composite-key snapshot index alongside period and location indexes.
4. Centralize category metadata: stable key, display label, order, and default marker color.
5. Give periods a stable ID/slug separate from their mutable display name.
6. Model the final period as open-ended while preserving the displayed `2011-present` label.
7. Remove or rewrite `adjacentPeriodWithLocation` so navigation follows period array order rather
   than assuming contiguous numeric indexes.
8. Decide and document `yearsNote` behavior. Either render it appropriately or retain it as
   editorial metadata without claiming the UI displays it.
9. Keep stable published location IDs unchanged throughout the migration.

Acceptance criteria:

- Domain tests run without Vite, React, a DOM, or Leaflet.
- No feature imports through a catch-all config/data barrel.
- Period renaming cannot break historical overlay asset lookup.
- The application has exactly one implementation for every lookup, merge, and ordering rule.

## Phase 5: Decompose features and remove obsolete code

1. Split the production sidebar into period browsing, period navigation, location details, snapshot
   image, adjacent navigation, and site-history components.
2. Split the map into viewport control, tile/base layer, historical overlay, marker layer, tooltip,
   and development-tool boundaries.
3. Keep selection orchestration in `app`; feature components receive domain values and event
   callbacks rather than reaching into unrelated modules.
4. Remove unused shadcn sidebar, select, sheet, separator, skeleton, tooltip, mobile-hook, starter
   CSS, and starter image files unless a module gained a verified production consumer.
5. Remove dependencies that no longer have production or tooling consumers, including the obsolete
   spreadsheet-parser path.
6. Normalize component naming, import style, line endings, and formatting through repository tools.

Acceptance criteria:

- The Vite entry import graph contains no obsolete implementation path.
- Every retained dependency and shared component has a real consumer.
- No broken dormant imports remain for a future contributor to discover.
- Feature files have one clear behavioral responsibility.

## Phase 6: Make historical content sustainable

1. Add runtime validation at the content boundary even if compile-time types are introduced.
2. Add provenance fields sufficient to trace historical dates, descriptions, images, and coordinate
   decisions back to a source.
3. Choose one canonical editing workflow:
   - validated source modules; or
   - a version-reviewable source format with a deterministic import/build step.
4. Do not treat the binary XLSX/DOCX files and runtime JavaScript as two undocumented sources of
   truth. If spreadsheets remain part of the workflow, make the import direction explicit and
   reproducible.
5. Validate image URLs, credit requirements, and snapshot foreign keys without inventing missing
   content.
6. Keep missing snapshot fields as explicit empty states.
7. Add historical overlays only after each image exists, returns the expected MIME type, and has
   independently calibrated bounds.

Acceptance criteria:

- Every published historical assertion can be traced to its source.
- Content editors receive precise validation failures before deployment.
- Generated runtime content, if any, is reproducible and never hand-edited in parallel.
- No fallback silently substitutes content from another period.

## Phase 7: Add durable navigation and asset reliability

1. Encode selected period and optional location in the URL using stable IDs.
2. Support direct links, refresh, browser back/forward, and invalid-URL recovery without introducing
   duplicate state ownership.
3. Add explicit map-tile and image failure states.
4. Evaluate self-hosting fonts and marker assets; otherwise pin and document external providers.
5. Keep provider attribution visible and verify production-domain tile access.
6. Measure bundle composition before adding lazy loading or manual chunking. Optimize only observed
   costs and establish a documented size budget.
7. Add deployment smoke checks for the application route and required network-backed assets.

Acceptance criteria:

- A period/location URL restores the exact view and participates correctly in browser history.
- External asset failure does not create a blank or misleading interface.
- The production host can load tiles under its actual origin and retains required attribution.
- Performance decisions are backed by repeatable measurements.

## Separate repository-history task

Do not rewrite Git history as part of the application phases. After the refactor is stable, evaluate
removing the deleted Spokane raster maps from history or migrating retained large assets to an
appropriate binary store. History rewriting requires a backup, collaborator coordination, explicit
approval, and force-push/reclone instructions.

## Verification required for every phase

From the workspace root and project directory as appropriate:

1. Run content validation and focused tests for the changed boundary.
2. Run the full test suite, lint, and production build.
3. Start Vite on the exact printed loopback URL.
4. Exercise relevant pointer and keyboard interactions in the running application.
5. Check browser console and network failures.
6. Capture and inspect 1600x1000, tablet, and 390x844 states when presentation changes.
7. Verify required images and network assets return HTTP 200 with the expected MIME types.
8. Review the complete diff for behavioral parity, dead parallel paths, documentation drift, and
   repository hygiene.
9. Update `README.md` and `EDITING.md` whenever setup, structure, schema, or editorial workflow
   changes.
10. Run the project guard before each commit and before reporting completion.

## Final definition of done

- All seven phases are complete; no phase is represented only by placeholders or future notes.
- `npm run check` is the single documented, passing local and CI quality gate.
- Domain invariants and critical interactions have automated regression coverage.
- Desktop, tablet, and mobile layouts are visually verified and fully operable.
- Selection, URL state, map position, and sidebar content remain synchronized.
- Accessibility is verified for keyboard operation, focus, naming, and non-color-only states.
- Development-only tools cannot ship accidentally.
- Historical data has validation and an explicit provenance/editing workflow.
- Dead code, broken scaffold imports, starter assets, and unused dependencies are gone.
- README and editing documentation describe the final implementation rather than the prototype.
- Provider and source attribution remains correct.
- The working tree is clean, the final commits are pushed, and any genuine limitation is stated
  plainly.

## Guardrails against unnecessary complexity

- Do not add Redux or another global-state library while App-owned state remains sufficient.
- Do not add a backend or CMS without a concrete editorial or publishing requirement.
- Do not retain generic UI scaffolding for hypothetical future use.
- Do not split files mechanically; split only at stable responsibility boundaries.
- Do not combine Git-history rewriting with product changes.
- Do not fabricate historical descriptions, dates, images, coordinates, or attribution.
