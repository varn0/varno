# Author Mosaic Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a hidden `/reading` back page showing a 3-column mosaic of 31 flippable cards (27 authors + 4 books); each card flips on click/tap/keyboard to reveal a name and an external link.

**Architecture:** A new `ReadingPage` route inside the existing `TechLayout`, a reusable `AuthorCard` flip-card component (pure CSS 3D transform), and a typed static data array `reading.ts`. Images are served statically from `public/authors/`. No new dependencies.

**Tech Stack:** Vite + React 18 + React Router v7 + TypeScript; Vitest + @testing-library/react; CSS custom properties in `src/styles/`.

**Design spec:** `docs/superpowers/specs/2026-10-02-author-mosaic-design.md`

---

### Task 1: Copy & normalize author images into the repo

**Files:**
- Create: `public/authors/*` (31 image files, normalized names)

The 31 source images live outside the repo at `~/personal-docs/authors/` with inconsistent names (spaces, mixed case). Copy them into `public/authors/` with lowercase kebab-case names. This is a one-time setup task (no unit test; verified by file count and names).

- [ ] **Step 1: Run the copy+rename script**

```bash
mkdir -p /Users/cucostudio/Documents/Personal/varno/public/authors
SRC="$HOME/personal-docs/authors"
DST="/Users/cucostudio/Documents/Personal/varno/public/authors"
# "source filename::destination filename"
pairs=(
  "robert_graves.jpg::robert-graves.jpg"
  "alexandre_dumas.jpg::alexandre-dumas.jpg"
  "noah_gordon.jpg::noah-gordon.jpg"
  "ken_follett.jpg::ken-follett.jpg"
  "arturo_perez_reverte.jpg::arturo-perez-reverte.jpg"
  "alejo_carpentier.jpg::alejo-carpentier.jpg"
  "malcolm_guite.jpg::malcolm-guite.jpg"
  "dashiell_hammett.jpg::dashiell-hammett.jpg"
  "agatha_christie.jpg::agatha-christie.jpg"
  "jane_austen.jpg::jane-austen.jpg"
  "Isaac-Asimov-1979.webp::isaac-asimov.webp"
  "knut_hamsun.webp::knut-hamsun.webp"
  "JRR-Tolkien15.jpg::jrr-tolkien.jpg"
  "Ursula_Le_Guin.jpg::ursula-k-le-guin.jpg"
  "jose_marti.jpg::jose-marti.jpg"
  "Conan_doyle.jpg::arthur-conan-doyle.jpg"
  "hortensia pichardo.jpeg::hortensia-pichardo.jpeg"
  "carlos-alberto-montaner.jpg::carlos-alberto-montaner.jpg"
  "George_R._R._Martin.jpg::george-rr-martin.jpg"
  "George_Orwell.webp::george-orwell.webp"
  "Anne_Rice.jpg::anne-rice.jpg"
  "H._P._Lovecraft,_June_1934.jpg::hp-lovecraft.jpg"
  "jk-rowling.jpg::jk-rowling.jpg"
  "Edgar_Allan_Poe.jpg::edgar-allan-poe.jpg"
  "Pablo_Neruda_1963.jpg::pablo-neruda.jpg"
  "Emilio_Salgari_ritratto.jpg::emilio-salgari.jpg"
  "Horacio_Quiroga.jpg::horacio-quiroga.jpg"
  "phoenix-project.jpg::the-phoenix-project.jpg"
  "sinuhe-el-egipcio_796_r2500.jpg::the-egyptian.jpg"
  "martin-fierro-34534sf-8.jpg::martin-fierro.jpg"
  "la_cienaga_de_los_hipopotamos.jpg::la-cienaga-de-los-hipopotamos.jpg"
)
for p in "${pairs[@]}"; do
  src="${p%%::*}"; dst="${p##*::}"
  cp "$SRC/$src" "$DST/$dst" || echo "MISSING SOURCE: $src"
done
```

- [ ] **Step 2: Verify 31 files landed**

Run: `ls -1 public/authors | wc -l`
Expected: `31`

Run: `ls -1 public/authors`
Expected: all lowercase kebab-case names, no spaces, no "MISSING SOURCE" printed in Step 1.

- [ ] **Step 3: Commit**

```bash
git add public/authors
git commit -m "assets: add normalized author/book images for reading page"
```

---

### Task 2: Reading data module

**Files:**
- Create: `src/data/reading.ts`
- Test: `src/__tests__/data/reading.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
import { reading } from '../../data/reading'

describe('reading data', () => {
  it('has 31 entries', () => {
    expect(reading).toHaveLength(31)
  })

  it('every entry has a name, an /authors/ image path, and an https url', () => {
    for (const entry of reading) {
      expect(entry.name.trim().length).toBeGreaterThan(0)
      expect(entry.image.startsWith('/authors/')).toBe(true)
      expect(entry.url.startsWith('https://')).toBe(true)
    }
  })

  it('has unique image paths', () => {
    const paths = reading.map((e) => e.image)
    expect(new Set(paths).size).toBe(paths.length)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- reading.test`
Expected: FAIL — cannot resolve `'../../data/reading'`.

- [ ] **Step 3: Write the data module**

```ts
export type ReadingEntry = {
  name: string
  image: string
  url: string
}

export const reading: ReadingEntry[] = [
  // Authors (27)
  { name: 'Robert Graves', image: '/authors/robert-graves.jpg', url: 'https://en.wikipedia.org/wiki/Robert_Graves' },
  { name: 'Alexandre Dumas', image: '/authors/alexandre-dumas.jpg', url: 'https://en.wikipedia.org/wiki/Alexandre_Dumas' },
  { name: 'Noah Gordon', image: '/authors/noah-gordon.jpg', url: 'https://en.wikipedia.org/wiki/Noah_Gordon' },
  { name: 'Ken Follett', image: '/authors/ken-follett.jpg', url: 'https://en.wikipedia.org/wiki/Ken_Follett' },
  { name: 'Arturo Pérez-Reverte', image: '/authors/arturo-perez-reverte.jpg', url: 'https://en.wikipedia.org/wiki/Arturo_Pérez-Reverte' },
  { name: 'Alejo Carpentier', image: '/authors/alejo-carpentier.jpg', url: 'https://en.wikipedia.org/wiki/Alejo_Carpentier' },
  { name: 'Malcolm Guite', image: '/authors/malcolm-guite.jpg', url: 'https://en.wikipedia.org/wiki/Malcolm_Guite' },
  { name: 'Dashiell Hammett', image: '/authors/dashiell-hammett.jpg', url: 'https://en.wikipedia.org/wiki/Dashiell_Hammett' },
  { name: 'Agatha Christie', image: '/authors/agatha-christie.jpg', url: 'https://en.wikipedia.org/wiki/Agatha_Christie' },
  { name: 'Jane Austen', image: '/authors/jane-austen.jpg', url: 'https://en.wikipedia.org/wiki/Jane_Austen' },
  { name: 'Isaac Asimov', image: '/authors/isaac-asimov.webp', url: 'https://en.wikipedia.org/wiki/Isaac_Asimov' },
  { name: 'Knut Hamsun', image: '/authors/knut-hamsun.webp', url: 'https://en.wikipedia.org/wiki/Knut_Hamsun' },
  { name: 'J. R. R. Tolkien', image: '/authors/jrr-tolkien.jpg', url: 'https://en.wikipedia.org/wiki/J._R._R._Tolkien' },
  { name: 'Ursula K. Le Guin', image: '/authors/ursula-k-le-guin.jpg', url: 'https://en.wikipedia.org/wiki/Ursula_K._Le_Guin' },
  { name: 'José Martí', image: '/authors/jose-marti.jpg', url: 'https://en.wikipedia.org/wiki/José_Martí' },
  { name: 'Arthur Conan Doyle', image: '/authors/arthur-conan-doyle.jpg', url: 'https://en.wikipedia.org/wiki/Arthur_Conan_Doyle' },
  { name: 'Hortensia Pichardo', image: '/authors/hortensia-pichardo.jpeg', url: 'https://www.ecured.cu/Hortensia_Pichardo' },
  { name: 'Carlos Alberto Montaner', image: '/authors/carlos-alberto-montaner.jpg', url: 'https://en.wikipedia.org/wiki/Carlos_Alberto_Montaner' },
  { name: 'George R. R. Martin', image: '/authors/george-rr-martin.jpg', url: 'https://en.wikipedia.org/wiki/George_R._R._Martin' },
  { name: 'George Orwell', image: '/authors/george-orwell.webp', url: 'https://en.wikipedia.org/wiki/George_Orwell' },
  { name: 'Anne Rice', image: '/authors/anne-rice.jpg', url: 'https://en.wikipedia.org/wiki/Anne_Rice' },
  { name: 'H. P. Lovecraft', image: '/authors/hp-lovecraft.jpg', url: 'https://en.wikipedia.org/wiki/H._P._Lovecraft' },
  { name: 'J. K. Rowling', image: '/authors/jk-rowling.jpg', url: 'https://en.wikipedia.org/wiki/J._K._Rowling' },
  { name: 'Edgar Allan Poe', image: '/authors/edgar-allan-poe.jpg', url: 'https://en.wikipedia.org/wiki/Edgar_Allan_Poe' },
  { name: 'Pablo Neruda', image: '/authors/pablo-neruda.jpg', url: 'https://en.wikipedia.org/wiki/Pablo_Neruda' },
  { name: 'Emilio Salgari', image: '/authors/emilio-salgari.jpg', url: 'https://en.wikipedia.org/wiki/Emilio_Salgari' },
  { name: 'Horacio Quiroga', image: '/authors/horacio-quiroga.jpg', url: 'https://en.wikipedia.org/wiki/Horacio_Quiroga' },
  // Books (4)
  { name: 'The Phoenix Project', image: '/authors/the-phoenix-project.jpg', url: 'https://www.goodreads.com/book/show/17255186-the-phoenix-project' },
  { name: 'The Egyptian', image: '/authors/the-egyptian.jpg', url: 'https://en.wikipedia.org/wiki/The_Egyptian' },
  { name: 'Martín Fierro', image: '/authors/martin-fierro.jpg', url: 'https://en.wikipedia.org/wiki/Martín_Fierro' },
  { name: 'La Ciénaga de los Hipopótamos', image: '/authors/la-cienaga-de-los-hipopotamos.jpg', url: 'https://en.wikipedia.org/wiki/Pauline_Gedge' },
]
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- reading.test`
Expected: PASS (3 tests).

- [ ] **Step 5: Commit**

```bash
git add src/data/reading.ts src/__tests__/data/reading.test.ts
git commit -m "feat: add reading data module for author mosaic"
```

---

### Task 3: AuthorCard flip-card component

**Files:**
- Create: `src/components/tech/AuthorCard.tsx`
- Test: `src/__tests__/components/AuthorCard.test.tsx`

The card is a `role="button"` **div** (not a `<button>`) because the back face holds an `<a>`, and nesting an interactive `<a>` inside a `<button>` is invalid HTML. The back link is hidden from the accessibility tree (`aria-hidden`) and out of the tab order (`tabIndex=-1`) until the card is flipped.

- [ ] **Step 1: Write the failing test**

```tsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AuthorCard } from '../../components/tech/AuthorCard'

const props = {
  name: 'Jane Austen',
  image: '/authors/jane-austen.jpg',
  url: 'https://en.wikipedia.org/wiki/Jane_Austen',
}

describe('AuthorCard', () => {
  it('renders the front image and starts unflipped with the link hidden', () => {
    render(<AuthorCard {...props} />)
    const card = screen.getByRole('button', { name: 'Jane Austen' })
    expect(card).toHaveAttribute('aria-pressed', 'false')
    expect(screen.getByAltText('Jane Austen')).toBeInTheDocument()
    // link is aria-hidden while unflipped, so it is absent from the a11y tree
    expect(screen.queryByRole('link')).not.toBeInTheDocument()
  })

  it('flips on click and exposes the external link with correct attributes', async () => {
    const user = userEvent.setup()
    render(<AuthorCard {...props} />)
    const card = screen.getByRole('button', { name: 'Jane Austen' })

    await user.click(card)

    expect(card).toHaveAttribute('aria-pressed', 'true')
    const link = screen.getByRole('link')
    expect(link).toHaveAttribute('href', props.url)
    expect(link).toHaveAttribute('target', '_blank')
    expect(link).toHaveAttribute('rel', 'noopener noreferrer')
  })

  it('flips with the keyboard (Enter)', async () => {
    const user = userEvent.setup()
    render(<AuthorCard {...props} />)
    const card = screen.getByRole('button', { name: 'Jane Austen' })
    card.focus()
    await user.keyboard('{Enter}')
    expect(card).toHaveAttribute('aria-pressed', 'true')
  })

  it('clicking the link does not flip the card back (stopPropagation)', async () => {
    const user = userEvent.setup()
    render(<AuthorCard {...props} />)
    const card = screen.getByRole('button', { name: 'Jane Austen' })
    await user.click(card)
    const link = screen.getByRole('link')
    await user.click(link)
    expect(card).toHaveAttribute('aria-pressed', 'true')
  })
})
```

> Note: clicking an `<a target="_blank">` in jsdom logs a "Not implemented: navigation" console message. This is expected and does not fail the test.

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- AuthorCard.test`
Expected: FAIL — cannot resolve `'../../components/tech/AuthorCard'`.

- [ ] **Step 3: Write the component**

```tsx
import { useState, type KeyboardEvent } from 'react'
import type { ReadingEntry } from '../../data/reading'

export function AuthorCard({ name, image, url }: ReadingEntry) {
  const [flipped, setFlipped] = useState(false)

  function toggle() {
    setFlipped((f) => !f)
  }

  function handleKeyDown(e: KeyboardEvent<HTMLDivElement>) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      toggle()
    }
  }

  return (
    <div
      className={`author-card${flipped ? ' is-flipped' : ''}`}
      role="button"
      tabIndex={0}
      aria-pressed={flipped}
      aria-label={name}
      onClick={toggle}
      onKeyDown={handleKeyDown}
    >
      <div className="author-card-inner">
        <div className="author-card-face author-card-front">
          <img src={image} alt={name} loading="lazy" />
        </div>
        <div className="author-card-face author-card-back">
          <span className="author-card-name">{name}</span>
          <a
            className="author-card-link"
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            tabIndex={flipped ? 0 : -1}
            aria-hidden={!flipped}
            onClick={(e) => e.stopPropagation()}
          >
            Read ↗
          </a>
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- AuthorCard.test`
Expected: PASS (4 tests).

- [ ] **Step 5: Commit**

```bash
git add src/components/tech/AuthorCard.tsx src/__tests__/components/AuthorCard.test.tsx
git commit -m "feat: add AuthorCard flip-card component"
```

---

### Task 4: ReadingPage component

**Files:**
- Create: `src/components/tech/ReadingPage.tsx`
- Test: `src/__tests__/components/ReadingPage.test.tsx`

- [ ] **Step 1: Write the failing test**

```tsx
import { render, screen } from '@testing-library/react'
import { ReadingPage } from '../../components/tech/ReadingPage'
import { reading } from '../../data/reading'

describe('ReadingPage', () => {
  it('renders one card per reading entry', () => {
    render(<ReadingPage />)
    expect(screen.getAllByRole('button')).toHaveLength(reading.length)
  })

  it('renders a card for a known author', () => {
    render(<ReadingPage />)
    expect(screen.getByRole('button', { name: 'Jane Austen' })).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- ReadingPage.test`
Expected: FAIL — cannot resolve `'../../components/tech/ReadingPage'`.

- [ ] **Step 3: Write the component**

```tsx
import { reading } from '../../data/reading'
import { AuthorCard } from './AuthorCard'

export function ReadingPage() {
  return (
    <div className="reading-page">
      <div className="reading-grid">
        {reading.map((entry) => (
          <AuthorCard key={entry.image} {...entry} />
        ))}
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- ReadingPage.test`
Expected: PASS (2 tests).

- [ ] **Step 5: Commit**

```bash
git add src/components/tech/ReadingPage.tsx src/__tests__/components/ReadingPage.test.tsx
git commit -m "feat: add ReadingPage author mosaic"
```

---

### Task 5: Wire the `/reading` route and footer link

**Files:**
- Modify: `src/App.tsx`
- Modify: `src/components/tech/TechLayout.tsx`

Routing is verified by build + manual check (existing tests do not cover routing).

- [ ] **Step 1: Add the route in `src/App.tsx`**

Add the import alongside the other page imports:

```tsx
import { ReadingPage } from './components/tech/ReadingPage'
```

Add the route inside the `<Route element={<TechLayout />}>` group, after the blog routes:

```tsx
        <Route path="reading" element={<ReadingPage />} />
```

The relevant block becomes:

```tsx
      <Route element={<TechLayout />}>
        <Route index element={<TechHome />} />
        <Route path="cv" element={<CvPage />} />
        <Route path="blog" element={<BlogIndex />} />
        <Route path="blog/:slug" element={<BlogPost />} />
        <Route path="reading" element={<ReadingPage />} />
      </Route>
```

- [ ] **Step 2: Add the subtle footer link in `src/components/tech/TechLayout.tsx`**

Replace the file contents with:

```tsx
import { Outlet, Link } from 'react-router-dom'
import { TechHeader } from './TechHeader'

export function TechLayout() {
  return (
    <div className="tech-layout">
      <TechHeader />
      <main className="tech-main">
        <Outlet />
      </main>
      <footer className="tech-footer">
        <Link to="/reading" className="tech-footer-link" aria-label="reading">
          ✦
        </Link>
      </footer>
    </div>
  )
}
```

- [ ] **Step 3: Type-check / build to confirm wiring compiles**

Run: `npm run build`
Expected: `tsc` passes and Vite build succeeds with no errors.

- [ ] **Step 4: Commit**

```bash
git add src/App.tsx src/components/tech/TechLayout.tsx
git commit -m "feat: add /reading route and subtle footer link"
```

---

### Task 6: Styles — mosaic grid, flip animation, footer

**Files:**
- Modify: `src/styles/tech.css`

Append a new block. Uses existing tokens (`--bg`, `--text`, `--text-muted`, `--border`, `--accent`, `--radius`, `--font-heading`, `--font-mono`). The `.tech-layout` is already `display:flex; flex-direction:column; min-height:100vh` with `.tech-main { flex:1 }`, so the footer naturally sits at the bottom.

- [ ] **Step 1: Append the reading-page styles to `src/styles/tech.css`**

Insert this block immediately before the `/* === Responsive === */` section (so the new mobile rules can join that section in Step 2, or keep them here — both work; this block is self-contained):

```css
/* === Reading (author mosaic) page === */
.reading-page {
  width: 100%;
  max-width: 800px;
  padding: 2rem 0 4rem;
}

.reading-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.75rem;
}

.author-card {
  width: 100%;
  aspect-ratio: 3 / 4;
  perspective: 1000px;
  cursor: pointer;
}

.author-card:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 2px;
}

.author-card-inner {
  position: relative;
  width: 100%;
  height: 100%;
  transition: transform 0.5s ease;
  transform-style: preserve-3d;
}

.author-card.is-flipped .author-card-inner {
  transform: rotateY(180deg);
}

.author-card-face {
  position: absolute;
  inset: 0;
  backface-visibility: hidden;
  -webkit-backface-visibility: hidden;
  border-radius: var(--radius);
  overflow: hidden;
}

.author-card-front img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.author-card-back {
  transform: rotateY(180deg);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  padding: 1rem;
  text-align: center;
  background: var(--bg);
  border: 1px solid var(--border);
}

.author-card-name {
  font-family: var(--font-heading);
  font-size: 0.9rem;
  line-height: 1.3;
  color: var(--text);
}

.author-card-link {
  font-family: var(--font-mono);
  font-size: 0.75rem;
  letter-spacing: 0.05em;
  color: var(--text-muted);
  text-decoration: none;
  transition: color 0.2s ease;
}

.author-card-link:hover {
  color: var(--text);
}

/* Subtle back-page footer link */
.tech-footer {
  display: flex;
  justify-content: center;
  padding: 1.5rem;
}

.tech-footer-link {
  color: var(--text-muted);
  opacity: 0.4;
  font-size: 0.9rem;
  text-decoration: none;
  transition: opacity 0.2s ease;
}

.tech-footer-link:hover {
  opacity: 1;
}

@media (prefers-reduced-motion: reduce) {
  .author-card-inner {
    transition: none;
  }
}
```

- [ ] **Step 2: Add the 2-column mobile rule inside the existing responsive block**

Inside the existing `@media (max-width: 768px) { ... }` block in `src/styles/tech.css`, add a nested-free rule by adding a NEW media query right after that block for the 480px breakpoint:

```css
@media (max-width: 480px) {
  .reading-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
```

- [ ] **Step 3: Build to confirm CSS is valid and bundles**

Run: `npm run build`
Expected: build succeeds, no errors.

- [ ] **Step 4: Commit**

```bash
git add src/styles/tech.css
git commit -m "style: add author mosaic grid, flip animation, and footer link"
```

---

### Task 7: Full verification

**Files:** none (verification only)

- [ ] **Step 1: Run the full test suite**

Run: `npm test`
Expected: all tests pass, including the new `reading`, `AuthorCard`, and `ReadingPage` suites, and the pre-existing suites.

- [ ] **Step 2: Production build**

Run: `npm run build`
Expected: `tsc` clean, Vite build succeeds.

- [ ] **Step 3: Manual / visual check**

Run: `npm run dev`, then in a browser:
- Visit `/reading` directly → a 3-column mosaic of 31 photos renders.
- Click/tap a card → it flips, showing the name + "Read ↗"; the link opens the correct page in a new tab.
- Tab to a card and press Enter/Space → it flips; the "Read ↗" link is reachable by Tab only when flipped.
- The `/reading` link is NOT in the top nav; a faint `✦` appears in the footer and navigates to `/reading`.
- Narrow the window below 480px → grid drops to 2 columns.
- Toggle light/dark theme → card backs and footer link adapt.

- [ ] **Step 4: Confirm completion**

Report test + build output. Do not claim success without the passing output in hand (see superpowers:verification-before-completion).

---

## Self-Review notes

- **Spec coverage:** route + no-nav + footer link (Task 5), 31 cards / books / fallback links (Task 2 data), flip via click+keyboard with valid HTML (Task 3), 3-col grid + 2-col ≤480px + reduced-motion (Task 6), tests for render/flip/link/data (Tasks 2–4), licensing note is a documented follow-up (out of scope here). All covered.
- **Type consistency:** `ReadingEntry = { name, image, url }` defined in Task 2 and consumed unchanged by `AuthorCard` (Task 3) and `ReadingPage` (Task 4). Field is `url` throughout (not `wikiUrl`). CSS class names (`author-card`, `author-card-inner`, `is-flipped`, `author-card-face/front/back`, `author-card-name`, `author-card-link`, `reading-page`, `reading-grid`, `tech-footer`, `tech-footer-link`) match between Task 3/5 markup and Task 6 styles.
- **No placeholders:** every code/command step shows exact content.
