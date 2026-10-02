# Author Mosaic — Design

**Date:** 2026-10-02
**Branch:** `feature/author-mosaic`
**Status:** Approved design, ready for implementation plan

## Summary

A hidden "back page" at `/reading` showing a mosaic of flippable cards — one per author (and one book) that shaped Alexis. Each card shows a photo on the front; tapping/clicking flips it to reveal the author's name and a link to their English Wikipedia page. A personal note on the site, discoverable but not advertised in the main nav.

## Goals

- A 3-column mosaic of equal-width flip cards.
- Front: author portrait. Back: name + Wikipedia link.
- Reachable at `/reading` and via a subtle, understated footer link — not in the top nav.
- Match the site's existing minimal aesthetic and design tokens.
- Work on desktop, tablet, and mobile, including touch (no hover dependency).

## Non-Goals

- No intro text, heading, or descriptive copy on the page — the mosaic stands alone.
- No new navigation entry in the main `TechHeader`.
- No CMS/admin; the author list is a static typed array in the repo.
- No search, filtering, or sorting.

## Decisions (from brainstorming)

| Decision | Choice |
|---|---|
| Placement | Standalone hidden route `/reading`, no top-nav link; subtle footer link for discovery |
| Scope | All ~28 images in `~/personal-docs/authors/`, including `phoenix-project.jpg` (book cover) as its own card |
| Link targets | English Wikipedia for every author; the book links to its English Wikipedia page |
| Flip trigger | Click/tap to flip (works identically on desktop and touch); back link tappable once flipped |
| Columns | Exactly 3 equal-width columns; drop to 2 columns on narrow phones (≤ 480px) |
| Intro copy | None |

## Architecture

Implemented with the existing stack — **Vite + React 18 + React Router v7 + TypeScript** — and **no new dependencies**. The flip effect is pure CSS 3D transforms.

### Routing

- Add a `<Route path="reading" element={<ReadingPage />} />` inside the existing `TechLayout` route group in `src/App.tsx`, so the page inherits the header, theme toggle, and `data-side="tech"` styling.
- Not added to `TechHeader` nav.

### Discovery (footer link)

- Add a minimal footer to `TechLayout` (`src/components/tech/TechLayout.tsx`) containing a single low-contrast link to `/reading`. Understated label (e.g. a small `✦` glyph or the muted word `reading`). Styled with `--text-muted` and small font so it reads as an easter egg, not a nav item.
- The footer renders on every tech-side page (it lives in the shared layout). This is acceptable: the link is deliberately subtle.

### Components

Under `src/components/tech/`:

- **`ReadingPage.tsx`** — page wrapper. Renders a `<div className="reading-page">` containing the grid. Maps over the `reading` data array, rendering one `AuthorCard` per entry. No heading or intro text.
- **`AuthorCard.tsx`** — one flip card.
  - Props: `{ name: string; image: string; wikiUrl: string }`.
  - Local `useState<boolean>` `flipped`.
  - Rendered as a `<div>` acting as the flip control: `role="button"`, `tabIndex={0}`, `aria-pressed={flipped}`, `aria-label={name}`. A native `<button>` is **not** used because the back face contains an `<a>`, and nesting an interactive `<a>` inside a `<button>` is invalid HTML. The div gives us the same click/keyboard affordance without the nesting violation.
  - `onClick` toggles `flipped`. `onKeyDown` toggles `flipped` on Enter or Space (and calls `preventDefault` on Space to avoid page scroll).
  - Front face: `<img>` with `alt={name}`, `loading="lazy"`.
  - Back face: author `name` + an `<a href={wikiUrl} target="_blank" rel="noopener noreferrer">` labeled e.g. `Wikipedia ↗`.
  - Accessibility: the back-face link is present in the DOM but only visually revealed when flipped. To keep a hidden link out of the tab order, the link gets `tabIndex={flipped ? 0 : -1}` and `aria-hidden={!flipped}`.
  - Clicking the link must not re-toggle the card: the anchor's `onClick` calls `e.stopPropagation()` so the click does not bubble to the card div's toggle handler.

### Data

- **`src/data/reading.ts`** — exports `reading: ReadingEntry[]` where
  `type ReadingEntry = { name: string; image: string; wikiUrl: string }`.
- `image` is a root-relative URL into `public/` (e.g. `/authors/jane-austen.jpg`), since images are served statically.
- 28 entries. Author names and English Wikipedia URLs listed in the appendix below.

### Images

- Copy all images from `~/personal-docs/authors/` into `public/authors/` in the repo.
- **Normalize filenames** to lowercase kebab-case, fixing the current inconsistencies (spaces, mixed case, `.webp`/`.jpeg`/`.jpg`). Keep original extensions (`.webp` is fine for the browser). Examples:
  - `hortensia pichardo.jpeg` → `hortensia-pichardo.jpeg`
  - `Isaac-Asimov-1979.webp` → `isaac-asimov.webp`
  - `JRR-Tolkien15.jpg` → `jrr-tolkien.jpg`
  - `H._P._Lovecraft,_June_1934.jpg` → `hp-lovecraft.jpg`
- The `reading.ts` `image` paths reference the normalized names.

### Styling

New block in `src/styles/tech.css`, using existing CSS custom properties (`--bg`, `--text`, `--text-muted`, `--border`, `--accent`, `--radius`, `--font-heading`, `--font-mono`).

- `.reading-page` — `width: 100%; max-width: 800px; padding: 2rem 0 4rem;` (consistent with other pages).
- `.reading-grid` — `display: grid; grid-template-columns: repeat(3, 1fr); gap: ~0.75rem;`
- `.author-card` — the flip container. Fixed `aspect-ratio: 3 / 4`; `perspective` on the grid/card; reset button styles (no default border/background/padding), `cursor: pointer`.
- `.author-card-inner` — `position: relative; width/height: 100%; transition: transform 0.5s; transform-style: preserve-3d;` toggled to `transform: rotateY(180deg)` when flipped (via a `.is-flipped` class).
- `.author-card-face` — `position: absolute; inset: 0; backface-visibility: hidden; border-radius: var(--radius); overflow: hidden;`
- `.author-card-front img` — `width/height: 100%; object-fit: cover;`
- `.author-card-back` — `transform: rotateY(180deg);` centered flex column; `background: var(--bg); border: 1px solid var(--border);` name in `--font-heading`, link in `--font-mono` muted with hover to `--text`.
- Mobile: `@media (max-width: 480px) { .reading-grid { grid-template-columns: repeat(2, 1fr); } }`.
- `prefers-reduced-motion`: disable the flip transition (instant state change) for users who request reduced motion.

### Book cover card

`phoenix-project.jpg` is a landscape-ish book cover, not a portrait. It renders in the same 3:4 cell with `object-fit: cover` for grid consistency (slight crop accepted). Its back label is the book title; the link points to the book's English Wikipedia page.

## Error / edge handling

- Missing image file → browser shows broken `alt` text; low risk since images are committed with the feature. No runtime fetch, so no network error states.
- All links open in a new tab with `rel="noopener noreferrer"`.
- Reduced-motion users get instant flips.

## Testing (vitest + @testing-library/react)

New `src/__tests__/components/ReadingPage.test.tsx` and/or `AuthorCard.test.tsx`:

1. `ReadingPage` renders one card per entry in `reading` (assert count = data length).
2. A card starts showing the front (name/back link not visible / `aria-pressed=false`).
3. Clicking a card flips it (`aria-pressed=true`); the author name and a Wikipedia link become active.
4. The back link has the correct `href` (from data), `target="_blank"`, and `rel="noopener noreferrer"`.
5. Clicking the Wikipedia link does not toggle the card back (stopPropagation).

A small data test may assert every `reading` entry has non-empty `name`, `image`, and a `https://en.wikipedia.org/` (or book) `wikiUrl`.

## Licensing note (follow-up, not blocking)

Publishing these portraits makes them public. Several (living authors, archive photos) are likely CC-BY/CC-BY-SA requiring attribution. Recommended follow-up: add a `public/authors/CREDITS.txt` and/or a tiny attribution link, sourced from each image's Wikimedia Commons page. Tracked separately from this feature.

## Appendix — author list

27 authors (English Wikipedia) + 1 book = 28 cards. Exact Wikipedia URLs are finalized during implementation in `reading.ts`.

New (downloaded 2026-10-02): Robert Graves, Alexandre Dumas, Noah Gordon, Ken Follett, Arturo Pérez-Reverte, Alejo Carpentier, Malcolm Guite, Dashiell Hammett, Agatha Christie, Jane Austen.

Existing: Isaac Asimov, Knut Hamsun, J.R.R. Tolkien, Ursula K. Le Guin, José Martí, Arthur Conan Doyle, Hortensia Pichardo, Carlos Alberto Montaner, George R. R. Martin, George Orwell, Anne Rice, H. P. Lovecraft, J.K. Rowling, Edgar Allan Poe, Pablo Neruda, Emilio Salgari, Horacio Quiroga.

Book: The Phoenix Project (→ English Wikipedia page for the novel).
