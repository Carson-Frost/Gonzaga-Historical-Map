# Gonzaga Historical Map

An interactive web app showing Gonzaga University's history through time. A
map of campus paired with a scrollable timeline sidebar; click through eras
to see which buildings stood when, with historical photos and notes.

Built with React, Vite, and Leaflet. The historical content lives in plain
data files that anyone can edit — see [EDITING.md](./EDITING.md).

---

## What you need installed

You only need two things on your computer:

1. **Node.js (version 18 or newer).** Download from
   [nodejs.org](https://nodejs.org). The installer includes `npm`, which is
   what runs the project. Pick the "LTS" version if you're unsure.
2. **Git** — only if you want to clone the project from GitHub. Otherwise
   you can download a zip from the project page. Get it from
   [git-scm.com](https://git-scm.com).

To check that Node is installed, open a terminal (Terminal on Mac, Command
Prompt or PowerShell on Windows) and run:

```
node --version
npm --version
```

Both commands should print a version number. If they don't, Node isn't
installed correctly yet.

---

## Getting it running

From a terminal, in the folder where you want the project to live:

1. **Get the code.**

   ```
   git clone <repo-url> gu-historical-map
   cd gu-historical-map
   ```

   Or download the zip from GitHub, unzip it, and `cd` into the folder.

2. **Install dependencies (one-time, takes a minute or two).**

   ```
   npm install
   ```

3. **Start the app.**

   ```
   npm run dev
   ```

   The terminal will print a local address (usually
   `http://localhost:5173`). Open that in your browser. The app reloads
   automatically when you save changes to data files.

When you're done, stop the server with `Ctrl+C` in the terminal.

---

## Other commands

- `npm run build` — produces a static site in the `dist/` folder, ready to
  upload to a host.
- `npm run preview` — serves the built site locally, so you can check it
  before deploying.
- `npm run lint` — runs the code style checker. Useful for engineers; not
  needed for editing content.

---

## Editing the historical content

If you're here to add a building, change a year, or attach a photo to a
period, head to [EDITING.md](./EDITING.md). It walks through the three
data files in plain language, with copy-paste examples.

---

## Project layout

For orientation:

- `src/data/` — the historical content. **This is where editors work.**
- `public/` — static files (images you host yourself, favicons, etc.).
- `src/components/` — the user interface. Engineers only.
- `src/config/` — map bounds and dev-mode toggles.
- `src/lib/` — the code that joins the three data files together.
