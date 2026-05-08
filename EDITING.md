# Editing the historical content

The map and timeline are driven by three data files in `src/data/`. The
files are JavaScript but contain only structured lists of entries — no
programming required for routine edits.

---

## Setup

- Files can be edited in any text editor;
  [VS Code](https://code.visualstudio.com) flags syntax errors inline.
- Running `npm run dev` in a terminal during editing reloads the page on
  every save.
- Each entry is wrapped in `{ ... }` and separated by a comma; the whole
  list is wrapped in `[ ... ]`. A missing comma or quote causes a blank
  page; the dev-server terminal prints the offending line.

---

## The three files

All in `src/data/`.

| File | Contents | Edit frequency |
|---|---|---|
| `timePeriods.js` | Eras shown in the sidebar (e.g. "1887–1940"). | Rarely. |
| `locations.js` | Every building, statue, and landmark on campus, past and present. | Most edits happen here. |
| `snapshots.js` | Period-specific descriptions and photos for a location. | When new content is added. |

### How they fit together

A **location** appears on the map in any period where it existed — built
before the period ends and not yet demolished when the period starts.
The location alone is enough to put a pin on the map.

A **snapshot** is an optional layer: the description, photo, and caption
shown in the sidebar for one specific location in one specific period.
Without a snapshot, the location still appears on the map; the sidebar
simply lacks rich content for that era.

---

## `timePeriods.js`

Five fixed periods. Fields:

| Field | Meaning |
|---|---|
| `index` | Number 1–5; referenced by snapshots. Numbers must not be reused or skipped. |
| `name` | Era display name. |
| `years` | Display label for the year range. |
| `startYear` | First year of the period (inclusive). |
| `endYear` | Last year of the period (inclusive). |
| `intro` | Optional intro paragraph. `null` if none. |

`startYear` and `endYear` determine extant calculations. Display labels
are independent of those numbers.

---

## `locations.js`

Each entry:

```js
{
  id: 'administration',
  title: 'Administration Building',
  type: 'Building',
  category: 'Service',
  builtYear: 1899,
  demolishedYear: 2007,
  yearsNote: null,
  address: null,
  latitude: 47.6680837,
  longitude: -117.4026839,
  pinColor: 'grey',
  zoom: ZOOM,
  siteGroup: 'college-hall-site'
}
```

| Field | Meaning |
|---|---|
| `id` | Short, lowercase, hyphenated identifier. Referenced by snapshots. **Stable after publishing** — changing it breaks any snapshot pointing at it. |
| `title` | Display name. |
| `type` | Kind of entity. Most entries are `'Building'`. |
| `category` | One of: `Academic`, `Residence`, `Service`, `Athletic`, `Religious`, `Landmark`, `Statue`. |
| `builtYear` | Year the entry first appeared on this site. `null` is a placeholder; entries with `null` are hidden from the map. |
| `demolishedYear` | Year removed. `null` if still standing. |
| `yearsNote` | Free-form text for renovations, renames, fires. Stored for editorial reference; not displayed in the UI. |
| `address` | Street address as a string, or `null`. |
| `latitude` / `longitude` | Map coordinates. Demolished buildings are placed at the historical site. |
| `pinColor` | One of: `blue`, `gold`, `red`, `green`, `orange`, `yellow`, `violet`, `grey`, `black`. |
| `zoom` | Map zoom level when the entry is selected. The shared `ZOOM` constant at the top of the file is used by all entries. |
| `siteGroup` | Optional. A short label shared by buildings that occupied the same plot over time. Enables "what was here before / after" UI. `null` for most entries. |

### Finding coordinates

With `DEV_MODE = true` in `src/config/app.js` (the default) and the dev
server running, clicking the map prints latitude and longitude.

---

## `snapshots.js`

Each entry pairs one location with one period:

```js
{
  locationId: 'administration',
  periodIndex: 1,
  description: 'The Administration Building anchored campus from its 1899 opening...',
  image: 'https://example.org/photos/admin-1905.jpg',
  imageCaption: 'The Administration Building shortly after completion',
  imageDate: 'c. 1905',
  imageCredit: 'Gonzaga University Archives',
  imageCreditLink: 'https://example.org/archives/admin-1905',
  address: null,
  latitude: null,
  longitude: null
}
```

| Field | Meaning |
|---|---|
| `locationId` | Matches an `id` in `locations.js`. |
| `periodIndex` | Matches an `index` in `timePeriods.js` (1–5). |
| `description` | Long-form sidebar text. |
| `image` | URL to the photo. |
| `imageCaption` | Short caption above the photo. |
| `imageDate` | When the photo was taken. |
| `imageCredit` | Attribution text. Filled in when the source is known. |
| `imageCreditLink` | Optional URL for the credit. `null` if none. |
| `address` | Optional override of the location's address for this period only. `null` keeps the default. |
| `latitude` / `longitude` | Optional overrides for this period only. `null` keeps the defaults. |

`locationId` plus `periodIndex` together identify a snapshot — at most
one snapshot per location per period.

---

## Example: adding a new building

A new academic building called "East Hall," built in 1995, still
standing:

1. Open `src/data/locations.js`.
2. Locate a sensible position in the list (entries are loosely grouped).
3. Insert this template, with a comma after the previous entry:

   ```js
   {
     id: 'east-hall',
     title: 'East Hall',
     type: 'Building',
     category: 'Academic',
     builtYear: 1995,
     demolishedYear: null,
     yearsNote: null,
     address: null,
     latitude: 47.6680000,
     longitude: -117.4000000,
     pinColor: 'blue',
     zoom: ZOOM,
     siteGroup: null
   }
   ```

4. Replace the coordinates with real values (in-app coordinate picker,
   see above).
5. Save the file.

The dev server reloads. The pin appears in periods from 1995 onward.

---

## Example: adding a photo and description

Attaching a 1923 photo of the Administration Building to "Founding to
WWII" (period index 1):

1. Open `src/data/snapshots.js`.
2. Inside the `[ ]`, add:

   ```js
   {
     locationId: 'administration',
     periodIndex: 1,
     description: 'The Administration Building was the heart of campus through the early decades...',
     image: 'https://example.org/photos/admin-1923.jpg',
     imageCaption: 'Administration Building, viewed from Boone Avenue',
     imageDate: '1923',
     imageCredit: 'Gonzaga University Archives',
     imageCreditLink: 'https://example.org/archives/admin-1923',
     address: null,
     latitude: null,
     longitude: null
   }
   ```

3. Save.

In "Founding to WWII", clicking the Administration Building shows the
photo and description in the sidebar.

---

## Image and credit rules

- `imageCredit` is filled in whenever the source is known. `null` is
  used only when the source is genuinely unknown.
- Credits are not invented or copied between photos.
- Existing credits are not removed; corrections are flagged before
  editing.
- Preferred sources: Gonzaga Archives, public-domain collections,
  sources that explicitly permit reuse.

---

## Troubleshooting

- **Blank page after saving.** The dev-server terminal prints the file
  and line of the syntax error. Most often a missing comma or stray
  quote inside a `description` string.
- **Building doesn't appear in a period.** Compare its `builtYear` and
  `demolishedYear` against `startYear` / `endYear` in `timePeriods.js`.
  A location is shown when `builtYear ≤ endYear` and `demolishedYear` is
  `null` or `≥ startYear`. A `null` `builtYear` hides the entry
  everywhere.
- **Pin in the wrong spot.** Verify `latitude` and `longitude`. The
  coordinate picker is the easiest way to refine.
- **Snapshot not appearing.** Verify `locationId` matches an `id` in
  `locations.js` and that `periodIndex` is 1–5.
