# Editing the historical content

This guide walks through the three data files that drive the map and
timeline. You don't need to know JavaScript to edit them — they are
structured lists of entries, like spreadsheets in code form.

If you haven't run the app yet, start with the [README](./README.md).

---

## Before you edit

- **Open the project in a text editor.** Anything works; [VS
  Code](https://code.visualstudio.com) is a good free option and will
  highlight syntax errors as you type.
- **Run the app while you edit:** in a terminal, `npm run dev`. The page
  refreshes the moment you save a file, so you'll see your edits
  immediately.
- **Watch your punctuation.** Each entry is wrapped in `{ ... }` and
  separated from the next by a comma. The whole list is wrapped in `[
  ... ]`. If the page goes blank after a save, the terminal will show the
  exact line where a comma or quote went missing.

---

## The three files

All three live in `src/data/`.

| File | What it holds | How often you'll edit it |
|---|---|---|
| `timePeriods.js` | The eras shown in the sidebar (e.g. "1887–1940", "Modern GU"). | Rarely. |
| `locations.js` | Every building, statue, and landmark on campus, past and present. | The main file. |
| `snapshots.js` | Period-specific descriptions and photos for a given location. | Whenever you have new content to attach. |

### How they fit together

A **location** appears on the map in any period where it existed — that
is, built before the period ends and not yet demolished when the period
starts. The location alone gets it onto the map.

A **snapshot** is an optional layer on top: the description, photo, and
caption that show in the sidebar for one specific location in one specific
period. Without a snapshot, the location still shows up on the map; the
sidebar just won't have a photo or write-up for that era.

---

## `timePeriods.js` — the eras

There are five periods today; you usually won't change them. Each entry
has these fields:

| Field | Meaning |
|---|---|
| `index` | A number (1–5) used to link snapshots to this period. Don't reuse or skip numbers. |
| `name` | The era's display name (e.g. "Modern GU"). |
| `years` | The display label for the year range (e.g. "2011–present"). |
| `startYear` | The first year (inclusive) of the period. |
| `endYear` | The last year (inclusive) of the period. |
| `intro` | Optional intro paragraph for the period. `null` if none. |

`startYear` and `endYear` are what the app uses to decide whether a
location was standing during this period. Display labels are separate so
you can write "1887–1940" or "Pre-1900" however you like.

---

## `locations.js` — buildings, statues, landmarks

The biggest file you'll edit. Each entry looks like this:

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

Field reference:

| Field | Meaning |
|---|---|
| `id` | A short, lowercase, hyphenated name (e.g. `'college-hall'`). Used internally to link snapshots. **Do not change an `id` after publishing** — it would break any snapshots pointing at it. |
| `title` | The display name shown to users. |
| `type` | What kind of thing it is. Most entries are `'Building'`. |
| `category` | Used for grouping and pin colors. One of: `Academic`, `Residence`, `Service`, `Athletic`, `Religious`, `Landmark`, `Statue`. |
| `builtYear` | Year it first appeared on this site, as a number. Use `null` only as a placeholder — entries with `null` here are hidden from the map. |
| `demolishedYear` | Year it was removed, as a number. Use `null` if it's still standing. |
| `yearsNote` | Free-form text for renovations, renames, fires, etc. Kept in the data for editorial reference. |
| `address` | Street address as a string, or `null`. |
| `latitude` / `longitude` | Map coordinates. For demolished buildings, use the historical site. See "Finding coordinates" below. |
| `pinColor` | The map pin color. One of: `blue`, `gold`, `red`, `green`, `orange`, `yellow`, `violet`, `grey`, `black`. |
| `zoom` | The map's zoom level when this location is selected. Use the shared `ZOOM` constant at the top of the file. |
| `siteGroup` | Optional. A short label (e.g. `'college-hall-site'`) shared by buildings that occupied the same plot over time. Lets the UI link "what was here before / after". `null` for most entries. |

### Finding coordinates

Set `DEV_MODE = true` in `src/config/app.js` (it's on by default). When
the dev server is running, click anywhere on the map and the app will
print the latitude and longitude — paste those into the entry.

---

## `snapshots.js` — period-specific photos and descriptions

Each snapshot ties one location to one time period and adds rich content
for that combination. Example:

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

Field reference:

| Field | Meaning |
|---|---|
| `locationId` | The `id` of the location this snapshot is for (must match an entry in `locations.js`). |
| `periodIndex` | The `index` of the period this snapshot is for (1–5). |
| `description` | Long-form sidebar text. |
| `image` | URL to the photo. |
| `imageCaption` | Short caption shown above the photo. |
| `imageDate` | When the photo was taken (e.g. `'1923'`, `'c. 1905'`). |
| `imageCredit` | Attribution text. **Always fill in if known.** |
| `imageCreditLink` | Optional clickable URL for the credit. `null` if none. |
| `address` | Optional. Override the location's address for just this period (e.g. building moved). `null` to keep the default. |
| `latitude` / `longitude` | Optional overrides for this period only. `null` to keep the location's defaults. |

`locationId` plus `periodIndex` together identify a snapshot — there
should only be one snapshot per location per period.

---

## Worked example: adding a new building

Say you want to add a new academic building called "East Hall," built in
1995 and still standing.

1. Open `src/data/locations.js` in your text editor.
2. Find a sensible spot in the list (entries are loosely grouped by type).
3. Paste this template, just before a closing `]`, making sure there's a
   comma after the previous entry:

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

4. Replace the latitude and longitude with the real coordinates (use the
   in-app coordinate picker, see above).
5. Save the file.
6. The dev server will reload automatically. Switch to a period from 1995
   onward — your new pin should appear.

---

## Worked example: adding a photo and description

To attach a 1923 photo and write-up of the Administration Building to the
"Founding to WWII" period (period index 1):

1. Open `src/data/snapshots.js`.
2. Inside the `[ ]`, add this entry (with a comma between it and any
   neighboring entry):

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

3. Save. Switch to "Founding to WWII" in the app, click the
   Administration Building — the photo and description appear in the
   sidebar.

---

## Image and credit rules

This is an educational/archival project, so attribution matters.

- **Always fill in `imageCredit` when you know it.** Leave `null` only
  when the source genuinely isn't known.
- **Don't invent or copy-paste credits between photos.** If you're not
  sure, ask before publishing.
- **Don't remove an existing credit.** If something needs correcting,
  flag it rather than silently editing.
- **Prefer images already cleared for educational use** — Gonzaga
  Archives, public-domain collections, sources that explicitly permit
  reuse. When in doubt, flag it before adding.

---

## When something breaks

- **Page goes blank after saving.** Check the terminal where `npm run
  dev` is running — it will show the file and line where a syntax error
  is. Most often it's a missing comma between entries, or a stray quote
  inside a `description` string.
- **A building doesn't appear when you expect it to.** Compare its
  `builtYear` and `demolishedYear` against the period's `startYear` /
  `endYear` in `timePeriods.js`. A location is shown only when
  `builtYear ≤ endYear` and `demolishedYear` is either `null` or `≥
  startYear`. A `null` `builtYear` hides it everywhere.
- **The pin is in the wrong spot.** Re-check `latitude` and `longitude`.
  The coordinate picker (with `DEV_MODE = true`) is the easiest way to
  refine.
- **A snapshot doesn't show up.** Make sure `locationId` exactly matches
  a `id` in `locations.js`, and that `periodIndex` is one of 1–5.

If you're stuck, save your work, note what you tried, and ask for help.
