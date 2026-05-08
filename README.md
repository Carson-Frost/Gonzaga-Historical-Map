# Gonzaga Historical Map

Interactive map showing Gonzaga University's campus in five different
time periods.

Built with React, Vite, and Leaflet.

## First-time setup

Install [Node.js](https://nodejs.org) (the LTS version is fine). Then,
in a terminal:

1. Clone the repo:

   ```
   git clone <repo-url> gu-historical-map
   cd gu-historical-map
   ```

2. Install dependencies (one-time):

   ```
   npm install
   ```

## Running the app

```
npm run dev
```

The terminal prints a local address (usually `http://localhost:5173`).
Open that in a browser. The page reloads automatically when content
files are edited. `Ctrl+C` in the terminal stops it.

## Adding or editing content

See [EDITING.md](./EDITING.md).

## Project layout

- `src/data/` — historical content and data.
- `public/` — static files (images, favicons).
- `src/components/` — UI code.
- `src/config/` — map bounds and dev-mode toggles.
- `src/lib/` — code that joins the data files together.
