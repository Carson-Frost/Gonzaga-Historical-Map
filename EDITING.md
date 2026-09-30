# Editing content

The map's content lives in `src/data/locations.js` — every building,
statue, and landmark, along with its photo and description.

Open it in any text editor. With `npm run dev` running, the page
reloads on save.

---

## Adding a building, statue, or landmark

In `src/data/locations.js`, add a new entry inside the `[ ]` brackets,
with a comma after the previous entry:

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

| Field | Notes |
|---|---|
| `id` | Lowercase, hyphenated. Doesn't change after publishing. |
| `title` | Display name. |
| `type` | Usually `'Building'`. |
| `category` | One of: `Academic`, `Residence`, `Service`, `Athletic`, `Religious`, `Landmark`, `Statue`. |
| `builtYear` | Year built. `null` hides the entry from the map. |
| `demolishedYear` | Year removed, or `null` if still standing. |
| `yearsNote` | Free-form notes about renovations, renames, fires. |
| `address` | Street address, or `null`. |
| `latitude` / `longitude` | Coordinates. Clicking the map in the running app copies them. |
| `pinColor` | One of: `blue`, `gold`, `red`, `green`, `orange`, `yellow`, `violet`, `grey`, `black`. |
| `zoom` | Always `ZOOM` (the constant at the top of the file). |
| `siteGroup` | Short label shared by buildings that occupied the same plot over time. `null` for most entries. Buildings sharing one link to each other under "See Also". |

Buildings appear on the map in any era between their built and
demolished years.

---

## Adding a photo or description

Add any of these fields to a location's entry. Leave out the ones you
don't have.

```js
  description: 'The Administration Building was the heart of campus through the early decades...',
  image: 'https://example.org/photos/admin-1923.jpg',
  imageCaption: 'Administration Building, viewed from Boone Avenue',
  imageDate: '1923',
  imageCredit: 'Gonzaga University Archives',
  imageCreditLink: 'https://example.org/archives/admin-1923',
```

| Field | Notes |
|---|---|
| `description` | Sidebar text. |
| `image` | Photo URL. |
| `imageCaption` | Caption above the photo. |
| `imageDate` | When the photo was taken. |
| `imageCredit` | Attribution. Required whenever `image` is set. |
| `imageCreditLink` | Optional URL for the credit. |

---

## Troubleshooting

- **Blank page after saving.** The terminal running `npm run dev` prints
  the file and line of the syntax error. Most often a missing comma or
  a stray quote inside a `description` string.
- **Building doesn't appear in the era expected.** Compare its
  `builtYear` and `demolishedYear` against the era's year range.
