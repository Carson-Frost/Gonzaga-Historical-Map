# Gonzaga Historical Map

Interactive web app showing Gonzaga University's history through time. A
campus map paired with a scrollable timeline sidebar; each era reveals
which buildings stood when, with historical photos and notes.

Built with React, Vite, and Leaflet. Historical content lives in plain
data files — see [EDITING.md](./EDITING.md).

---

## Prerequisites

- **Node.js 18 or newer.** Installer includes `npm`. Available at
  [nodejs.org](https://nodejs.org).
- **Git** — only required for cloning the repo.

To verify the install:

```
node --version
npm --version
```

Both commands print a version number when Node is installed correctly.

---

## Setup

From a terminal, in the parent folder where the project should live:

1. Clone the repo:

   ```
   git clone <repo-url> gu-historical-map
   cd gu-historical-map
   ```

2. Install dependencies (one-time):

   ```
   npm install
   ```

3. Start the dev server:

   ```
   npm run dev
   ```

The terminal prints a local address (usually `http://localhost:5173`).
The app reloads automatically when data files change. `Ctrl+C` stops the
server.

---

## Commands

- `npm run dev` — local dev server with hot reload.
- `npm run build` — produces a static site in `dist/` for hosting.
- `npm run preview` — serves the built site locally.
- `npm run lint` — runs the code style checker.

---

## Editing the historical content

See [EDITING.md](./EDITING.md) for the data file structure and
instructions for adding buildings, periods, or photos.

---

## Project layout

- `src/data/` — historical content. The files edited by content
  maintainers.
- `public/` — static files (images, favicons).
- `src/components/` — UI code.
- `src/config/` — map bounds and dev-mode toggles.
- `src/lib/` — code that joins the three data files together.
