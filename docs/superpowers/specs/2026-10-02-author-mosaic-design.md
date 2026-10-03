# Author Mosaic — Design

**Date:** 2026-10-02
**Branch:** `feature/author-mosaic`
**Status:** Approved design, ready for implementation plan

## Summary

A hidden "back page" at `/reading` showing a mosaic of flippable cards — one per author and book that shaped Alexis (31 total: 27 authors + 4 books). Each card shows a photo/cover on the front; tapping/clicking flips it to reveal the name and a link (English Wikipedia where available, with documented fallbacks). A personal note on the site, discoverable but not advertised in the main nav.

## Goals

- A 3-column mosaic of equal-width flip cards.
- Front: author portrait. Back: name + Wikipedia link.
- Reachable at `/reading` and via a **dog-ear** (folded page corner) in the bottom-right — not in the top nav.
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
| Placement | Standalone **bare** route `/reading` — NO header and NO footer, just the mosaic. Reachable directly, and via a **dog-ear** (folded page corner, bottom-right) on the *other* tech pages (home/cv/blog) |
| Navigation | A `DogEar` folded-corner link: on home/cv/blog it folds to `/reading`; a mirrored one on `/reading` folds back to `/` (the only way back from the bare page). Lifts/enlarges on hover. Replaces the earlier ✦ footer link |
| Scope | All 31 images in `~/personal-docs/authors/` — 27 author portraits + 4 book covers — each its own card |
| Link targets | English Wikipedia where it exists; documented fallbacks otherwise (see "Link map rules") |
| Flip trigger | Click/tap to flip (works identically on desktop and touch); back link tappable once flipped |
| Flip exclusivity | Only one card is flipped at a time — opening a card closes the previously open one |
| Layout | Masonry: exactly 3 equal-width columns (2 on phones ≤ 480px). Same column width, **variable card height** (each card keeps its image's natural aspect ratio — no cropping), cards pack vertically with no aligned rows |
| Intro copy | None |

## Architecture

Implemented with the existing stack — **Vite + React 18 + React Router v7 + TypeScript** — and **no new dependencies**. The flip effect is pure CSS 3D transforms.

### Routing

- Add a top-level `<Route path="reading" element={<ReadingPage />} />` in `src/App.tsx` **outside** the `TechLayout` route group, so the page renders with NO header and NO footer — just the mosaic. `useSide()` runs at the `App` level (not inside the layout), so `data-side="tech"` is still set on `<html>` for `/reading` and all theme/side tokens apply.
- Not added to `TechHeader` nav.
- Because `.reading-page` no longer sits inside `.tech-main` (which centred it), it centres itself with `margin: 0 auto` and carries its own horizontal padding.

### Navigation — the dog-ear

- **`DogEar.tsx`** (`src/components/shared/`) — a reusable component: a `<Link to={to} className="dogear" aria-label={label}>` wrapping a small inline `<svg>`. The fold is drawn as a **filled folded corner with a lift shadow** (chosen from mockups): a grey underside triangle with a thin outline and a soft shadow so the corner looks lifted off the page.
- `TechLayout` renders `<DogEar to="/reading" ... />`, so the dog-ear appears on home/cv/blog (the discovery entry points).
- `ReadingPage` renders a mirrored `<DogEar to="/" ... />` — the fold-back, and the only way back from the otherwise bare page.
- **SVG**: a single `.dogear-flap` triangle path (`viewBox 0 0 56 56`, `M56 10 L10 56 L10 10 Z`) — the folded-up corner. `fill: var(--dogear-fold)` (a light grey underside; darker grey in dark theme), `stroke: var(--text)` thin, and `filter: drop-shadow(-2px -2px …)` casts the lifted corner's shadow up-left onto the page.
- **CSS (`.dogear` in `tech.css`)**: `position: fixed; right/bottom: 0;` ~56px. Fold/shadow colours are theme tokens (`--dogear-fold`, `--dogear-shadow`) redefined under `[data-theme="dark"]`. On `:hover` the whole thing `transform: scale(1.12)` — the lift. `:focus-visible` shows an accent outline. `prefers-reduced-motion` disables the scale transition.
- **Theme on the bare page**: because `/reading` has no header, it has no `ThemeToggle` — and `useTheme()` (which applies the saved/system theme to `<html data-theme>`) only ran inside header/profile components. So `App` now also calls `useTheme()` (alongside `useSide()`), ensuring the chosen theme is applied on every route, including the bare `/reading`. Without this, `/reading` was stuck on the `data-theme="light"` hardcoded in `index.html`.

### Components

Under `src/components/tech/` (and `src/components/shared/` for `DogEar`):

- **`ReadingPage.tsx`** — page wrapper and **owner of the flip state**. Holds `flippedKey: string | null` (the `image` of the open card, or `null`). Renders a `<div className="reading-page">` containing the grid, mapping over `reading` and rendering one `AuthorCard` per entry. For each card it passes `flipped={flippedKey === entry.image}` and an `onToggle` that sets `flippedKey` to that card's image (or back to `null` if it was already open). This centralised state is what enforces **one card flipped at a time**. No heading or intro text.
- **`AuthorCard.tsx`** — one flip card. **Controlled** (holds no state of its own).
  - Props: `{ name: string; image: string; url: string; flipped: boolean; onToggle: () => void }`.
  - Rendered as a `<div>` acting as the flip control: `role="button"`, `tabIndex={0}`, `aria-pressed={flipped}`, `aria-label={name}`. A native `<button>` is **not** used because the back face contains an `<a>`, and nesting an interactive `<a>` inside a `<button>` is invalid HTML. The div gives us the same click/keyboard affordance without the nesting violation.
  - `onClick` calls `onToggle`. `onKeyDown` calls `onToggle` on Enter or Space (and calls `preventDefault` on Space to avoid page scroll).
  - Front face: `<img>` with `alt={name}`, `loading="lazy"`.
  - Back face: `name` + an `<a href={url} target="_blank" rel="noopener noreferrer">` labeled `Read ↗` (neutral label since not every link is Wikipedia).
  - Accessibility: the back-face link is present in the DOM but only visually revealed when flipped. To keep a hidden link out of the tab order, the link gets `tabIndex={flipped ? 0 : -1}` and `aria-hidden={!flipped}`.
  - Clicking the link must not re-toggle the card: the anchor's `onClick` calls `e.stopPropagation()` so the click does not bubble to the card div's toggle handler.

### Data

- **`src/data/reading.ts`** — exports `reading: ReadingEntry[]` where
  `type ReadingEntry = { name: string; image: string; url: string }`.
  (Field named `url`, not `wikiUrl`, since a few links are not Wikipedia — EcuRed, Goodreads.)
- `image` is a root-relative URL into `public/` (e.g. `/authors/jane-austen.jpg`), since images are served statically.
- 31 entries. Names and exact link URLs listed in the appendix below.

### Link map rules

Every card links to the best available canonical page:
- **Authors with an English Wikipedia page (26):** link to it.
- **Hortensia Pichardo** — no Wikipedia page (English or Spanish). Fallback: EcuRed, `https://www.ecured.cu/Hortensia_Pichardo`.
- **Books with their own English Wikipedia page:** *The Egyptian* → `/wiki/The_Egyptian`; *Martín Fierro* → `/wiki/Martín_Fierro`.
- **La Ciénaga de los Hipopótamos** — no book page; fallback to its author Pauline Gedge → `/wiki/Pauline_Gedge`.
- **The Phoenix Project** — no Wikipedia page; link to Goodreads.

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

- `.reading-page` — `width: 100%; max-width: 800px; margin: 0 auto; padding: 2rem 1.5rem 4rem;` (centres itself and carries horizontal padding, since the bare route has no `.tech-main` wrapper).
- `.reading-grid` — **masonry via CSS multi-column**: `column-count: 3; column-gap: ~0.75rem;`. Fixed column width, variable card height, cards pack vertically with no aligned rows. (Column layout flows cards top-to-bottom per column, which is expected for a photo wall.)
- `.author-card` — the flip container, one masonry item. `width: 100%; margin-bottom: 0.75rem; break-inside: avoid;` (keep a card whole within a column); `perspective`; `cursor: pointer`. **No fixed aspect-ratio** — the card's height follows its front image.
- `.author-card-inner` — `position: relative; width: 100%; transition: transform 0.5s; transform-style: preserve-3d;` toggled to `transform: rotateY(180deg)` when flipped (via a `.is-flipped` class). Its height is set by the front face (in normal flow).
- `.author-card-face` — `backface-visibility: hidden; border-radius: var(--radius); overflow: hidden;`
- `.author-card-front img` — `width: 100%; height: auto; display: block;` → **natural aspect ratio, no cropping**. This is what gives each card its variable height.
- `.author-card-back` — `position: absolute; inset: 0;` (overlays the front, matching its height) `transform: rotateY(180deg);` centered flex column; `background: var(--bg); border: 1px solid var(--border);` name in `--font-heading`, link in `--font-mono` muted with hover to `--text`.
- Mobile: `@media (max-width: 480px) { .reading-grid { column-count: 2; } }`.
- `prefers-reduced-motion`: disable the flip transition (instant state change) for users who request reduced motion.

### Book cover cards

Four cards are book covers, not author portraits: *The Phoenix Project*, *The Egyptian*, *Martín Fierro*, *La Ciénaga de los Hipopótamos*. In the masonry layout they display at their natural aspect ratio like every other card, so covers are shown **in full, uncropped** (a landscape cover simply makes a shorter card). Their front has no portrait; the back shows the book title and the link per the Link map rules above. No separate component — a book is just a `ReadingEntry` whose `name` is a title.

## Error / edge handling

- Missing image file → browser shows broken `alt` text; low risk since images are committed with the feature. No runtime fetch, so no network error states.
- All links open in a new tab with `rel="noopener noreferrer"`.
- Reduced-motion users get instant flips.

## Testing (vitest + @testing-library/react)

`AuthorCard` (controlled component — `flipped`/`onToggle` passed in):

1. Unflipped (`flipped=false`): shows the front image, `aria-pressed=false`, link absent from the a11y tree.
2. Flipped (`flipped=true`): `aria-pressed=true`; the back link has the correct `href` (from data), `target="_blank"`, `rel="noopener noreferrer"`.
3. Clicking the card calls `onToggle`; pressing Enter calls `onToggle`.
4. Clicking the link itself does NOT call `onToggle` (stopPropagation).

`ReadingPage` (owns the flip state):

5. Renders one card per entry in `reading` (assert count = data length, i.e. 31).
6. **Only one card flipped at a time**: clicking card A sets A `aria-pressed=true` and B `false`; then clicking card B flips B on and A back off.
7. Clicking the same card twice flips it back to the front.

A small data test asserts every `reading` entry has non-empty `name`, `image`, and an `https://` `url`.

## Licensing note (follow-up, not blocking)

Publishing these portraits makes them public. Several (living authors, archive photos) are likely CC-BY/CC-BY-SA requiring attribution. Recommended follow-up: add a `public/authors/CREDITS.txt` and/or a tiny attribution link, sourced from each image's Wikimedia Commons page. Tracked separately from this feature.

## Appendix — card list (31)

Each row: source filename → normalized `public/authors/` filename → display name → link. These are the exact values for `reading.ts`.

### Authors (27)

| Source file | Normalized | Name | Link |
|---|---|---|---|
| robert_graves.jpg | robert-graves.jpg | Robert Graves | https://en.wikipedia.org/wiki/Robert_Graves |
| alexandre_dumas.jpg | alexandre-dumas.jpg | Alexandre Dumas | https://en.wikipedia.org/wiki/Alexandre_Dumas |
| noah_gordon.jpg | noah-gordon.jpg | Noah Gordon | https://en.wikipedia.org/wiki/Noah_Gordon |
| ken_follett.jpg | ken-follett.jpg | Ken Follett | https://en.wikipedia.org/wiki/Ken_Follett |
| arturo_perez_reverte.jpg | arturo-perez-reverte.jpg | Arturo Pérez-Reverte | https://en.wikipedia.org/wiki/Arturo_Pérez-Reverte |
| alejo_carpentier.jpg | alejo-carpentier.jpg | Alejo Carpentier | https://en.wikipedia.org/wiki/Alejo_Carpentier |
| malcolm_guite.jpg | malcolm-guite.jpg | Malcolm Guite | https://en.wikipedia.org/wiki/Malcolm_Guite |
| dashiell_hammett.jpg | dashiell-hammett.jpg | Dashiell Hammett | https://en.wikipedia.org/wiki/Dashiell_Hammett |
| agatha_christie.jpg | agatha-christie.jpg | Agatha Christie | https://en.wikipedia.org/wiki/Agatha_Christie |
| jane_austen.jpg | jane-austen.jpg | Jane Austen | https://en.wikipedia.org/wiki/Jane_Austen |
| Isaac-Asimov-1979.webp | isaac-asimov.webp | Isaac Asimov | https://en.wikipedia.org/wiki/Isaac_Asimov |
| knut_hamsun.webp | knut-hamsun.webp | Knut Hamsun | https://en.wikipedia.org/wiki/Knut_Hamsun |
| JRR-Tolkien15.jpg | jrr-tolkien.jpg | J. R. R. Tolkien | https://en.wikipedia.org/wiki/J._R._R._Tolkien |
| Ursula_Le_Guin.jpg | ursula-k-le-guin.jpg | Ursula K. Le Guin | https://en.wikipedia.org/wiki/Ursula_K._Le_Guin |
| jose_marti.jpg | jose-marti.jpg | José Martí | https://en.wikipedia.org/wiki/José_Martí |
| Conan_doyle.jpg | arthur-conan-doyle.jpg | Arthur Conan Doyle | https://en.wikipedia.org/wiki/Arthur_Conan_Doyle |
| hortensia pichardo.jpeg | hortensia-pichardo.jpeg | Hortensia Pichardo | https://www.ecured.cu/Hortensia_Pichardo |
| carlos-alberto-montaner.jpg | carlos-alberto-montaner.jpg | Carlos Alberto Montaner | https://en.wikipedia.org/wiki/Carlos_Alberto_Montaner |
| George_R._R._Martin.jpg | george-rr-martin.jpg | George R. R. Martin | https://en.wikipedia.org/wiki/George_R._R._Martin |
| George_Orwell.webp | george-orwell.webp | George Orwell | https://en.wikipedia.org/wiki/George_Orwell |
| Anne_Rice.jpg | anne-rice.jpg | Anne Rice | https://en.wikipedia.org/wiki/Anne_Rice |
| H._P._Lovecraft,_June_1934.jpg | hp-lovecraft.jpg | H. P. Lovecraft | https://en.wikipedia.org/wiki/H._P._Lovecraft |
| jk-rowling.jpg | jk-rowling.jpg | J. K. Rowling | https://en.wikipedia.org/wiki/J._K._Rowling |
| Edgar_Allan_Poe.jpg | edgar-allan-poe.jpg | Edgar Allan Poe | https://en.wikipedia.org/wiki/Edgar_Allan_Poe |
| Pablo_Neruda_1963.jpg | pablo-neruda.jpg | Pablo Neruda | https://en.wikipedia.org/wiki/Pablo_Neruda |
| Emilio_Salgari_ritratto.jpg | emilio-salgari.jpg | Emilio Salgari | https://en.wikipedia.org/wiki/Emilio_Salgari |
| Horacio_Quiroga.jpg | horacio-quiroga.jpg | Horacio Quiroga | https://en.wikipedia.org/wiki/Horacio_Quiroga |

### Books (4)

| Source file | Normalized | Name | Link |
|---|---|---|---|
| phoenix-project.jpg | the-phoenix-project.jpg | The Phoenix Project | https://www.goodreads.com/book/show/17255186-the-phoenix-project |
| sinuhe-el-egipcio_796_r2500.jpg | the-egyptian.jpg | The Egyptian | https://en.wikipedia.org/wiki/The_Egyptian |
| martin-fierro-34534sf-8.jpg | martin-fierro.jpg | Martín Fierro | https://en.wikipedia.org/wiki/Martín_Fierro |
| la_cienaga_de_los_hipopotamos.jpg | la-cienaga-de-los-hipopotamos.jpg | La Ciénaga de los Hipopótamos | https://en.wikipedia.org/wiki/Pauline_Gedge |

> URLs contain UTF-8 characters (accents). In `reading.ts` they are written as literal strings; the browser encodes them on navigation. Verified reachable 2026-10-02.
