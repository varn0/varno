# Performance Optimization Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Cut load time on the home page and `/blog` by killing the serial blog fetch waterfall, code-splitting `marked` and routes out of the home entry bundle, serving icons same-origin with per-icon CSS coloring, and right-sizing the 454KB blog diagram.

**Architecture:** Current `main` (two-sided redesign already merged; creative side not routed). Vite + React 18 + TypeScript SPA, no router libs beyond `react-router-dom` v7, single-pass CSS with `data-theme`/`data-side` on `<html>`. Blog content is hand-written markdown in `public/content/blog/` with YAML-ish frontmatter parsed by a ~20-line `parseFrontmatter`. Tests run on `vitest` + Testing Library (`src/__tests__/`, jsdom).

**Tech Stack:** React 18, react-router-dom v7, Vite 5, `marked` 18, vitest 4, `@remixicon/react`. No new runtime or build dependencies are added by this plan.

---

## Resolved design choices (binding for this plan)

These settle the spec's Open Questions so the steps below are unambiguous:

1. **Manifest generation = a tiny inline Vite plugin** (the spec's "script _or_ a tiny Vite plugin" option), not a plain `.mjs` + `prebuild` hook. Reason: the generator must reuse `parseFrontmatter` from TypeScript without dragging in `marked`; a Vite plugin imports the `.ts` parser natively (esbuild) with **zero new dependencies**, and runs on both `vite dev` (via `buildStart`) and `vite build`. `public/content/blog/manifest.json` becomes a generated, git-ignored artifact.
2. **Icon coloring mechanism = CSS mask** (`mask-image` + `background-color`) for single-color Simple Icons glyphs, driven per-icon by the entry's own `hex`/`darkHex`. Multicolor/wordmark logos (AWS + Azure devicon SVGs) and the existing `vmware.png` stay as same-origin `<img>` with no recoloring.
3. **Hero image = dimension/priority hints only.** No WebP/`srcset` for the 130×130 hero (payoff tiny; YAGNI). Only the 454KB blog PNG is converted to WebP.
4. **Suspense = two boundaries.** One inside `TechLayout` around its `<Outlet/>` (keeps header/footer painted during nested-route loads) and one around the top-level `/reading` route element.

## File Structure

**New files**
- `src/lib/frontmatter.ts` — standalone `parseFrontmatter` (no `marked` import). Imported by the app and by the Vite manifest plugin.
- `src/lib/blogManifest.ts` — pure `buildManifest()` that maps raw markdown strings → manifest entries. Unit-tested; holds all frontmatter→metadata edge-case handling.
- `src/lib/fetchCache.ts` — module-scoped `Map<string, Promise<string>>` with `fetchText(url)`; de-dupes/caches post-body fetches.
- `src/components/shared/RouteFallback.tsx` — minimal Suspense fallback used by both boundaries.
- Tests: `src/__tests__/lib/frontmatter.test.ts`, `src/__tests__/lib/blogManifest.test.ts`, `src/__tests__/lib/fetchCache.test.ts`, `src/__tests__/hooks/useBlogList.test.tsx`, `src/__tests__/components/ProfileCard.test.tsx`, `src/__tests__/App.test.tsx`, `src/__tests__/hooks/useTheme.test.tsx`.
- `public/icons/*.svg` — ~20 vendored glyphs (alongside existing `vmware.png`).
- `public/content/blog/modulith-diagram.webp` — converted diagram.

**Modified files**
- `package.json` — drop `simple-icons`.
- `vite.config.ts` — baseline config + `manualChunks` (isolate `marked`) + inline `blogManifestPlugin`.
- `index.html` — interim preconnect (Task 2) then removed (Task 13).
- `src/lib/markdown.ts` — re-export `parseFrontmatter` from `frontmatter.ts`; keep `renderMarkdown`.
- `src/hooks/useBlogList.ts` — single manifest fetch, no per-post bodies.
- `src/hooks/useMarkdown.ts` — fetch via `fetchCache`.
- `src/hooks/useTheme.ts` → `src/hooks/useTheme.tsx` — `ThemeProvider` + context-backed `useTheme`.
- `src/main.tsx` — wrap in `<ThemeProvider>`.
- `src/App.tsx` — `React.lazy` routes + Suspense; drop the manual `useTheme()` call.
- `src/components/tech/TechLayout.tsx` — `<Suspense>` around `<Outlet/>`.
- `src/components/tech/MicroCv.tsx` — mask spans for single-color icons, `<img>` for src icons.
- `src/components/shared/ProfileCard.tsx` — `width`/`height`/`fetchpriority` on hero.
- `src/data/micro-cv.ts` — AWS/Azure `src` point at local `/icons/*.svg`.
- `src/styles/tech.css` — `.micro-cv-icon--mask` rule.
- `public/content/blog/modulith.md` — image reference → `.webp`.
- `.gitignore` — ignore generated `manifest.json`.
- Existing tests touched: `src/__tests__/components/MicroCv.test.tsx`, `src/__tests__/components/TechLayout.test.tsx` (wrap in `ThemeProvider`).
- `CLAUDE.md` — docs updates.

---

## Phase 0 — Baseline (measurement, no code)

### Task 0: Capture the "before" numbers

**Files:** none (records only).

- [ ] **Step 1: Record production bundle sizes**

Run:
```bash
npm ci
npm run build
```
Record the printed chunk list + gzipped sizes (especially the entry chunk and whether `marked` is inside it). Save to `docs/superpowers/plans/baseline-2026-10-18.md`.

- [ ] **Step 2: Capture /blog waterfall + Lighthouse**

Run `npm run preview`, open `/` and `/blog` in the browser DevTools:
- Note on `/blog`: the serial `.md` requests and the 454KB `modulith-diagram.png` on `/blog/modulith`.
- Run Lighthouse (mobile, throttled) on `/` and `/blog`; record LCP, TBT, total transfer, request count into the same baseline file.

- [ ] **Step 3: Commit the baseline notes**

```bash
git add docs/superpowers/plans/baseline-2026-10-18.md
git commit -m "docs: record performance baseline before optimization"
```

Expected: a committed baseline file. This gates and later proves Phase 2/3 impact.

---

## Phase 1 — Quick wins

### Task 1: Remove the unused `simple-icons` dependency

**Files:**
- Modify: `package.json:19`

- [ ] **Step 1: Confirm it is unused**

Run:
```bash
grep -rn "simple-icons" src/
```
Expected: no matches (icons come from the CDN, not this package).

- [ ] **Step 2: Remove the dependency line**

In `package.json`, delete the `"simple-icons": "^16.18.0"` entry from `dependencies` (remember to drop the trailing comma on the now-last line `"react-router-dom": "^7.14.2"`).

- [ ] **Step 3: Reinstall and build**

Run:
```bash
npm install
npm run build
```
Expected: install succeeds, `npm run build` (`tsc && vite build`) succeeds with no unresolved import.

- [ ] **Step 4: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore: remove unused simple-icons dependency"
```

### Task 2: Interim preconnect hints for the icon CDNs

**Files:**
- Modify: `index.html:47-49`

> **PERMANENT (scope change 2026-10-18).** Originally interim pending Task 12 self-hosting, but Task 12 was dropped (no network in the build env — see Task 12). These preconnect/dns-prefetch hints are now the final icon optimization and are KEPT.

- [ ] **Step 1: Add preconnect + dns-prefetch**

In `index.html`, immediately after the existing `fonts.gstatic.com` preconnect line (`:48`) and before the stylesheet `<link>` (`:49`), add:
```html
    <link rel="preconnect" href="https://cdn.simpleicons.org" crossorigin />
    <link rel="preconnect" href="https://cdn.jsdelivr.net" crossorigin />
    <link rel="dns-prefetch" href="https://cdn.simpleicons.org" />
    <link rel="dns-prefetch" href="https://cdn.jsdelivr.net" />
```

- [ ] **Step 2: Verify dev serves it**

Run `npm run dev`, load `/`, confirm in DevTools the two preconnects appear in the document head and icons still load.

- [ ] **Step 3: Commit**

```bash
git add index.html
git commit -m "perf: preconnect to icon CDNs (interim)"
```

### Task 3: Hero image dimension + priority hints

**Files:**
- Create: `src/__tests__/components/ProfileCard.test.tsx`
- Modify: `src/components/shared/ProfileCard.tsx:7-11`

- [ ] **Step 1: Write the failing test**

Create `src/__tests__/components/ProfileCard.test.tsx`:
```tsx
import { render, screen } from '@testing-library/react'
import { ProfileCard } from '../../components/shared/ProfileCard'

// ProfileCard renders SocialLinks, which consumes the theme context.
import { ThemeProvider } from '../../hooks/useTheme'

describe('ProfileCard', () => {
  it('gives the hero image explicit dimensions and high fetch priority', () => {
    render(
      <ThemeProvider>
        <ProfileCard />
      </ThemeProvider>,
    )
    const img = screen.getByAltText('Alexis Janero Moliner')
    expect(img).toHaveAttribute('width', '130')
    expect(img).toHaveAttribute('height', '130')
    expect(img).toHaveAttribute('fetchpriority', 'high')
  })
})
```

> Note: this test imports `ThemeProvider`, which is created in Task 12. If you implement Phase 1 before Phase 3, temporarily render `<ProfileCard />` without the wrapper and drop the import; re-add the wrapper after Task 12. The assertions on the image do not change.

- [ ] **Step 2: Run it to confirm it fails**

Run: `npm test -- ProfileCard`
Expected: FAIL — no `width`/`height`/`fetchpriority` on the image.

- [ ] **Step 3: Add the attributes**

In `src/components/shared/ProfileCard.tsx`, replace the `<img>` (lines 7-11) with:
```tsx
      <img
        src={profilePicture}
        alt="Alexis Janero Moliner"
        className="profile-picture"
        width={130}
        height={130}
        fetchPriority="high"
      />
```

- [ ] **Step 4: Run the test to confirm it passes**

Run: `npm test -- ProfileCard`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/components/shared/ProfileCard.tsx src/__tests__/components/ProfileCard.test.tsx
git commit -m "perf: add dimension and fetchpriority hints to hero image"
```

### Task 4: Baseline `vite.config.ts` with `marked` chunk isolation

**Files:**
- Modify: `vite.config.ts`

- [ ] **Step 1: Replace the bare config**

Replace the whole of `vite.config.ts` with:
```ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    target: 'es2020',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          marked: ['marked'],
        },
      },
    },
  },
})
```

> The `blogManifestPlugin` (Task 7) is added to `plugins` later; leave `plugins` as `[react()]` for now.

- [ ] **Step 2: Verify the build and chunking**

Run:
```bash
npm run build
```
Expected: build succeeds; the output chunk list now shows a separate `marked-*.js` chunk. (It is still pulled by the eager BlogPost import until Task 11 lazy-loads it; isolating it now is harmless.)

- [ ] **Step 3: Commit**

```bash
git add vite.config.ts
git commit -m "build: baseline vite config and isolate marked into its own chunk"
```

---

## Phase 2 — Blog load path

### Task 5: Split `parseFrontmatter` into `src/lib/frontmatter.ts`

**Files:**
- Create: `src/lib/frontmatter.ts`
- Create: `src/__tests__/lib/frontmatter.test.ts`
- Modify: `src/lib/markdown.ts`

- [ ] **Step 1: Write the failing test**

Create `src/__tests__/lib/frontmatter.test.ts`:
```ts
import { parseFrontmatter } from '../../lib/frontmatter'

describe('parseFrontmatter', () => {
  it('parses quoted strings and splits bracketed arrays', () => {
    const raw = '---\ntitle: "Hello World"\ntags: [devops, terraform]\n---\nBody text here'
    const { frontmatter, body } = parseFrontmatter(raw)
    expect(frontmatter.title).toBe('Hello World')
    expect(frontmatter.tags).toEqual(['devops', 'terraform'])
    expect(body).toBe('Body text here')
  })

  it('returns empty frontmatter and the raw body when no block is present', () => {
    const { frontmatter, body } = parseFrontmatter('no frontmatter here')
    expect(frontmatter).toEqual({})
    expect(body).toBe('no frontmatter here')
  })
})
```

- [ ] **Step 2: Run it to confirm it fails**

Run: `npm test -- frontmatter`
Expected: FAIL — `src/lib/frontmatter` does not exist.

- [ ] **Step 3: Create the standalone module**

Create `src/lib/frontmatter.ts` with the parser moved verbatim from `markdown.ts` (no `marked` import):
```ts
export interface Frontmatter {
  [key: string]: unknown
}

export function parseFrontmatter(raw: string): { frontmatter: Frontmatter; body: string } {
  const match = raw.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/)
  if (!match) {
    return { frontmatter: {}, body: raw }
  }

  const frontmatter: Frontmatter = {}
  for (const line of match[1].split('\n')) {
    const colonIndex = line.indexOf(':')
    if (colonIndex === -1) continue
    const key = line.slice(0, colonIndex).trim()
    let value: unknown = line.slice(colonIndex + 1).trim()

    // Remove surrounding quotes
    if (typeof value === 'string' && value.startsWith('"') && value.endsWith('"')) {
      value = value.slice(1, -1)
    }

    // Parse arrays: [tag1, tag2]
    if (typeof value === 'string' && value.startsWith('[') && value.endsWith(']')) {
      value = value.slice(1, -1).split(',').map(s => s.trim())
    }

    frontmatter[key] = value
  }

  return { frontmatter, body: match[2] }
}
```

- [ ] **Step 4: Re-export from `markdown.ts` and drop the duplicate**

Replace `src/lib/markdown.ts` with:
```ts
import { marked } from 'marked'

export { parseFrontmatter } from './frontmatter'
export type { Frontmatter } from './frontmatter'

export function renderMarkdown(body: string): string {
  return marked.parse(body, { async: false }) as string
}
```
(Existing imports `import { parseFrontmatter } from '../lib/markdown'` in `useMarkdown.ts` keep working via the re-export.)

- [ ] **Step 5: Run tests**

Run: `npm test -- frontmatter && npm run build`
Expected: frontmatter test PASS; type-check/build succeed.

- [ ] **Step 6: Commit**

```bash
git add src/lib/frontmatter.ts src/lib/markdown.ts src/__tests__/lib/frontmatter.test.ts
git commit -m "refactor: split parseFrontmatter into marked-free module"
```

### Task 6: `buildManifest()` pure function

**Files:**
- Create: `src/lib/blogManifest.ts`
- Create: `src/__tests__/lib/blogManifest.test.ts`

- [ ] **Step 1: Write the failing test**

Create `src/__tests__/lib/blogManifest.test.ts`:
```ts
import { buildManifest } from '../../lib/blogManifest'

const post = (fm: string) => `---\n${fm}\n---\nbody`

describe('buildManifest', () => {
  it('maps frontmatter to manifest entries with slug and file preserved', () => {
    const entries = buildManifest([
      { slug: 'a', file: 'a.md', raw: post('title: "A"\ndate: 2025-01-02\ndescription: "First"\ntags: [x, y]\nsource: linkedin') },
    ])
    expect(entries).toEqual([
      { slug: 'a', file: 'a.md', title: 'A', date: '2025-01-02', description: 'First', tags: ['x', 'y'], source: 'linkedin' },
    ])
  })

  it('defaults missing fields instead of crashing', () => {
    const entries = buildManifest([
      { slug: 'b', file: 'b.md', raw: post('title: "B"\ndate: 2025-01-01') },
    ])
    expect(entries[0]).toMatchObject({ slug: 'b', file: 'b.md', title: 'B', description: '', tags: [] })
    expect(entries[0].source).toBeUndefined()
  })

  it('normalizes a single tag value into an array', () => {
    const entries = buildManifest([
      { slug: 'c', file: 'c.md', raw: post('title: "C"\ndate: 2025-01-01\ntags: solo') },
    ])
    expect(entries[0].tags).toEqual(['solo'])
  })
})
```

- [ ] **Step 2: Run it to confirm it fails**

Run: `npm test -- blogManifest`
Expected: FAIL — module does not exist.

- [ ] **Step 3: Implement the pure function**

Create `src/lib/blogManifest.ts`:
```ts
import { parseFrontmatter } from './frontmatter'

export interface ManifestInput {
  slug: string
  file: string
  raw: string
}

export interface ManifestEntry {
  slug: string
  file: string
  title: string
  date: string
  description: string
  tags: string[]
  source?: 'linkedin' | 'medium' | 'original'
}

function toTags(value: unknown): string[] {
  if (Array.isArray(value)) return value as string[]
  if (typeof value === 'string' && value.length > 0) return [value]
  return []
}

export function buildManifest(inputs: ManifestInput[]): ManifestEntry[] {
  return inputs.map(({ slug, file, raw }) => {
    const { frontmatter } = parseFrontmatter(raw)
    return {
      slug,
      file,
      title: (frontmatter.title as string) ?? '',
      date: (frontmatter.date as string) ?? '',
      description: (frontmatter.description as string) ?? '',
      tags: toTags(frontmatter.tags),
      source: frontmatter.source as ManifestEntry['source'] | undefined,
    }
  })
}
```

- [ ] **Step 4: Run tests**

Run: `npm test -- blogManifest`
Expected: PASS (all three).

- [ ] **Step 5: Commit**

```bash
git add src/lib/blogManifest.ts src/__tests__/lib/blogManifest.test.ts
git commit -m "feat: add pure buildManifest that derives blog metadata from frontmatter"
```

### Task 7: Vite plugin that writes `manifest.json`

**Files:**
- Modify: `vite.config.ts`
- Modify: `.gitignore` (create if absent)

- [ ] **Step 1: Add the plugin to `vite.config.ts`**

Replace `vite.config.ts` with (keeps Task 4 settings, adds the plugin):
```ts
import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import { readFileSync, readdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { buildManifest } from './src/lib/blogManifest'

const BLOG_DIR = join(__dirname, 'public', 'content', 'blog')

function generateBlogManifest(): void {
  const files = readdirSync(BLOG_DIR).filter(f => f.endsWith('.md'))
  const inputs = files.map(file => ({
    slug: file.replace(/\.md$/, ''),
    file,
    raw: readFileSync(join(BLOG_DIR, file), 'utf8'),
  }))
  const entries = buildManifest(inputs).sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  )
  writeFileSync(join(BLOG_DIR, 'manifest.json'), JSON.stringify(entries, null, 2) + '\n')
}

function blogManifestPlugin(): Plugin {
  return {
    name: 'generate-blog-manifest',
    buildStart() {
      generateBlogManifest()
    },
  }
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), blogManifestPlugin()],
  build: {
    target: 'es2020',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          marked: ['marked'],
        },
      },
    },
  },
})
```

- [ ] **Step 2: Ignore the generated artifact**

Append to `.gitignore` (create the file if it does not exist):
```
# Generated at build from each post's frontmatter — edit the .md, not this file
public/content/blog/manifest.json
```
Then stop tracking the committed copy:
```bash
git rm --cached public/content/blog/manifest.json
```

- [ ] **Step 3: Regenerate and inspect**

Run:
```bash
npm run build
cat public/content/blog/manifest.json
```
Expected: the manifest now contains `slug`, `file`, `title`, `date`, `description`, `tags`, `source` for all four posts, sorted newest-first, matching each `.md`'s frontmatter.

- [ ] **Step 4: Confirm no `marked` in the plugin graph**

The plugin imports only `./src/lib/blogManifest` → `./frontmatter` (no `marked`). Confirm `npm run build` logs no error and the build is clean.

- [ ] **Step 5: Commit**

```bash
git add vite.config.ts .gitignore
git commit -m "build: generate blog manifest from frontmatter via vite plugin"
```

### Task 8: Rewrite `useBlogList` to read metadata from the manifest

**Files:**
- Create: `src/__tests__/hooks/useBlogList.test.tsx`
- Modify: `src/hooks/useBlogList.ts`

- [ ] **Step 1: Write the failing test**

Create `src/__tests__/hooks/useBlogList.test.tsx`:
```tsx
import { renderHook, waitFor } from '@testing-library/react'
import { useBlogList } from '../../hooks/useBlogList'

describe('useBlogList', () => {
  afterEach(() => vi.restoreAllMocks())

  it('fetches only the manifest and maps entries without per-post requests', async () => {
    const manifest = [
      { slug: 'old', file: 'old.md', title: 'Old', date: '2024-01-01', description: 'o', tags: [], source: 'original' },
      { slug: 'new', file: 'new.md', title: 'New', date: '2025-01-01', description: 'n', tags: ['t'], source: 'linkedin' },
    ]
    const fetchMock = vi.fn().mockResolvedValue({ json: () => Promise.resolve(manifest) })
    vi.stubGlobal('fetch', fetchMock)

    const { result } = renderHook(() => useBlogList())
    await waitFor(() => expect(result.current.loading).toBe(false))

    // Exactly one request — the manifest — and no per-post .md fetches.
    expect(fetchMock).toHaveBeenCalledTimes(1)
    expect(fetchMock).toHaveBeenCalledWith('/content/blog/manifest.json')
    // Sorted newest-first.
    expect(result.current.posts.map(p => p.slug)).toEqual(['new', 'old'])
    expect(result.current.posts[0].title).toBe('New')
  })
})
```

- [ ] **Step 2: Run it to confirm it fails**

Run: `npm test -- useBlogList`
Expected: FAIL — current hook calls `fetch` once per post (times called > 1).

- [ ] **Step 3: Rewrite the hook**

Replace `src/hooks/useBlogList.ts` with:
```ts
import { useState, useEffect } from 'react'
import type { BlogMeta } from '../types/blog'

interface ManifestEntry extends BlogMeta {
  file: string
}

export function useBlogList() {
  const [posts, setPosts] = useState<BlogMeta[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    fetch('/content/blog/manifest.json')
      .then(res => res.json())
      .then((manifest: ManifestEntry[]) => {
        if (cancelled) return
        const results: BlogMeta[] = manifest.map(entry => ({
          title: entry.title,
          date: entry.date,
          description: entry.description,
          tags: entry.tags ?? [],
          source: entry.source,
          slug: entry.slug,
        }))
        results.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        setPosts(results)
        setLoading(false)
      })
      .catch(() => {
        if (!cancelled) setLoading(false)
      })

    return () => { cancelled = true }
  }, [])

  return { posts, loading }
}
```

- [ ] **Step 4: Run the test + existing suite**

Run: `npm test -- useBlogList && npm run build`
Expected: PASS; build clean (note `parseFrontmatter` is no longer imported here — that is intended).

- [ ] **Step 5: Verify `/blog` loads from the manifest only**

Run `npm run dev`, open `/blog` with the Network tab: exactly one `manifest.json` request, zero per-post `.md` requests, cards render effectively immediately. The existing `BlogIndex` loading gate (`src/components/tech/BlogIndex.tsx:33`) now resolves after one fast request — no code change needed there.

- [ ] **Step 6: Commit**

```bash
git add src/hooks/useBlogList.ts src/__tests__/hooks/useBlogList.test.tsx
git commit -m "perf: read blog previews from manifest, removing the serial fetch waterfall"
```

### Task 9: Client-side fetch cache for post bodies

**Files:**
- Create: `src/lib/fetchCache.ts`
- Create: `src/__tests__/lib/fetchCache.test.ts`
- Modify: `src/hooks/useMarkdown.ts`

- [ ] **Step 1: Write the failing test**

Create `src/__tests__/lib/fetchCache.test.ts`:
```ts
import { fetchText, __clearFetchCache } from '../../lib/fetchCache'

describe('fetchText', () => {
  beforeEach(() => __clearFetchCache())
  afterEach(() => vi.restoreAllMocks())

  it('fetches a URL once and serves repeats from cache', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, text: () => Promise.resolve('hello') })
    vi.stubGlobal('fetch', fetchMock)

    const a = await fetchText('/x.md')
    const b = await fetchText('/x.md')

    expect(a).toBe('hello')
    expect(b).toBe('hello')
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  it('does not cache a rejected fetch', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({ ok: false })
      .mockResolvedValueOnce({ ok: true, text: () => Promise.resolve('ok') })
    vi.stubGlobal('fetch', fetchMock)

    await expect(fetchText('/y.md')).rejects.toThrow()
    await expect(fetchText('/y.md')).resolves.toBe('ok')
    expect(fetchMock).toHaveBeenCalledTimes(2)
  })
})
```

- [ ] **Step 2: Run it to confirm it fails**

Run: `npm test -- fetchCache`
Expected: FAIL — module does not exist.

- [ ] **Step 3: Implement the cache**

Create `src/lib/fetchCache.ts`:
```ts
const cache = new Map<string, Promise<string>>()

export function fetchText(url: string): Promise<string> {
  const cached = cache.get(url)
  if (cached) return cached

  const promise = fetch(url).then(res => {
    if (!res.ok) throw new Error(`Failed to fetch ${url}`)
    return res.text()
  })

  // Keep successful fetches; evict failures so they can be retried.
  promise.catch(() => cache.delete(url))
  cache.set(url, promise)
  return promise
}

// Test-only helper.
export function __clearFetchCache(): void {
  cache.clear()
}
```

- [ ] **Step 4: Wire it into `useMarkdown`**

In `src/hooks/useMarkdown.ts`, change the imports and the fetch call:
- Replace line 2 with:
```ts
import { parseFrontmatter, renderMarkdown } from '../lib/markdown'
import { fetchText } from '../lib/fetchCache'
```
- Replace the `fetch(url).then(...).then(raw => {...})` chain (lines 22-32) with:
```ts
    fetchText(url)
      .then(raw => {
        if (cancelled) return
        const { frontmatter, body } = parseFrontmatter(raw)
        const html = renderMarkdown(body)
        setState({ data: frontmatter as T, html, loading: false, error: null })
      })
```
(The `.catch` block at lines 33-36 stays unchanged.)

- [ ] **Step 5: Run tests + build**

Run: `npm test -- fetchCache && npm run build`
Expected: PASS; build clean.

- [ ] **Step 6: Verify in the browser**

Run `npm run dev`: open `/blog/modulith`, go back to `/blog`, reopen the post — the post `.md` is fetched **at most once** (second open is a cache hit in the Network tab).

- [ ] **Step 7: Commit**

```bash
git add src/lib/fetchCache.ts src/hooks/useMarkdown.ts src/__tests__/lib/fetchCache.test.ts
git commit -m "perf: cache blog post fetches to avoid re-downloads and dupe requests"
```

---

## Phase 3 — App-wide delivery

### Task 10: Shared theme context (do before Task 11 — Task 3's test and App depend on it)

**Files:**
- Rename/replace: `src/hooks/useTheme.ts` → `src/hooks/useTheme.tsx`
- Modify: `src/main.tsx`
- Modify: `src/App.tsx` (remove the manual `useTheme()` call)
- Create: `src/__tests__/hooks/useTheme.test.tsx`
- Modify: `src/__tests__/components/MicroCv.test.tsx`, `src/__tests__/components/TechLayout.test.tsx`

- [ ] **Step 1: Write the failing test**

Create `src/__tests__/hooks/useTheme.test.tsx`:
```tsx
import { render, screen, act } from '@testing-library/react'
import { ThemeProvider, useTheme } from '../../hooks/useTheme'

function Probe() {
  const { theme, toggleTheme } = useTheme()
  return <button onClick={toggleTheme}>theme:{theme}</button>
}

describe('ThemeProvider', () => {
  beforeEach(() => {
    localStorage.clear()
    document.documentElement.removeAttribute('data-theme')
  })

  it('applies the initial theme to <html> and shares one state across consumers', () => {
    render(
      <ThemeProvider>
        <Probe />
        <Probe />
      </ThemeProvider>,
    )
    expect(document.documentElement.getAttribute('data-theme')).toBe('light')
    expect(screen.getAllByText('theme:light')).toHaveLength(2)
  })

  it('toggles all consumers and writes data-theme + localStorage', () => {
    render(
      <ThemeProvider>
        <Probe />
        <Probe />
      </ThemeProvider>,
    )
    act(() => { screen.getAllByRole('button')[0].click() })
    expect(screen.getAllByText('theme:dark')).toHaveLength(2)
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark')
    expect(localStorage.getItem('theme')).toBe('dark')
  })
})
```

- [ ] **Step 2: Run it to confirm it fails**

Run: `npm test -- useTheme`
Expected: FAIL — `ThemeProvider` is not exported.

- [ ] **Step 3: Create the provider module**

Delete `src/hooks/useTheme.ts` and create `src/hooks/useTheme.tsx`:
```tsx
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'

type Theme = 'light' | 'dark'

interface ThemeContextValue {
  theme: Theme
  toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextValue | null>(null)

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>(() => {
    const savedTheme = localStorage.getItem('theme') as Theme | null
    if (savedTheme) return savedTheme
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark'
    }
    return 'light'
  })

  const toggleTheme = () => {
    const newTheme: Theme = theme === 'light' ? 'dark' : 'light'
    setTheme(newTheme)
    localStorage.setItem('theme', newTheme)
    document.documentElement.setAttribute('data-theme', newTheme)
  }

  useEffect(() => {
    // Initial apply — critical for correct first paint.
    document.documentElement.setAttribute('data-theme', theme)

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handleChange = (e: MediaQueryListEvent) => {
      if (!localStorage.getItem('theme')) {
        const newTheme: Theme = e.matches ? 'dark' : 'light'
        setTheme(newTheme)
        document.documentElement.setAttribute('data-theme', newTheme)
      }
    }
    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [theme])

  return <ThemeContext.Provider value={{ theme, toggleTheme }}>{children}</ThemeContext.Provider>
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used within a ThemeProvider')
  return ctx
}
```
(Consumers keep importing `{ useTheme } from '../../hooks/useTheme'`; the extension change does not affect import paths.)

- [ ] **Step 4: Wrap the app in the provider**

In `src/main.tsx`, add the import and wrap:
```tsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.tsx'
import { ThemeProvider } from './hooks/useTheme'
import './styles/base.css'
import './styles/shared.css'
import './styles/tech.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </ThemeProvider>
  </React.StrictMode>,
)
```

- [ ] **Step 5: Drop the manual theme call in `App.tsx`**

In `src/App.tsx`, remove `import { useTheme } from './hooks/useTheme'` (line 3) and remove the `useTheme()` call plus its two-line comment (lines 13-15). Keep `useSide()`. The provider now applies the theme on every route including `/reading`.

- [ ] **Step 6: Wrap the two existing tests that render theme consumers**

In `src/__tests__/components/MicroCv.test.tsx`, add the import and wrap every `render(<MicroCv />)` as `render(<ThemeProvider><MicroCv /></ThemeProvider>)`:
```tsx
import { ThemeProvider } from '../../hooks/useTheme'
```
In `src/__tests__/components/TechLayout.test.tsx`, wrap the `MemoryRouter` tree in the provider inside `renderLayout()`:
```tsx
import { ThemeProvider } from '../../hooks/useTheme'
// ...
  return render(
    <ThemeProvider>
      <MemoryRouter initialEntries={['/']}>
        <Routes>
          <Route element={<TechLayout />}>
            <Route path="/" element={<div>home content</div>} />
          </Route>
        </Routes>
      </MemoryRouter>
    </ThemeProvider>,
  )
```

- [ ] **Step 7: Run the full suite + build**

Run: `npm test && npm run build`
Expected: all tests PASS (including `useTheme`, `MicroCv`, `TechLayout`, `ProfileCard`); build clean.

- [ ] **Step 8: Verify `/reading` theme application**

Run `npm run dev`, deep-link to `/reading`, toggle nothing: `data-theme` is applied (page respects saved/system theme). Reload on `/reading` keeps the theme.

- [ ] **Step 9: Commit**

```bash
git add src/hooks/useTheme.tsx src/main.tsx src/App.tsx src/__tests__/hooks/useTheme.test.tsx src/__tests__/components/MicroCv.test.tsx src/__tests__/components/TechLayout.test.tsx
git commit -m "refactor: single ThemeProvider context as the source of truth for theme"
```

### Task 11: Route code-splitting with two Suspense boundaries

**Files:**
- Create: `src/components/shared/RouteFallback.tsx`
- Modify: `src/App.tsx`
- Modify: `src/components/tech/TechLayout.tsx`
- Create: `src/__tests__/App.test.tsx`

- [ ] **Step 1: Write the failing test**

Create `src/__tests__/App.test.tsx`:
```tsx
import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { ThemeProvider } from '../hooks/useTheme'
import App from '../App'

function renderAt(path: string) {
  return render(
    <ThemeProvider>
      <MemoryRouter initialEntries={[path]}>
        <App />
      </MemoryRouter>
    </ThemeProvider>,
  )
}

describe('App routing with lazy routes', () => {
  it('resolves a deep-link to a nested lazy route under TechLayout', async () => {
    renderAt('/blog')
    // The TechLayout chrome (forward dog-ear) stays mounted during the lazy load.
    expect(
      screen.getByRole('link', { name: 'Reading — authors and books I love' }),
    ).toBeInTheDocument()
    await waitFor(() => expect(document.querySelector('.blog-page')).toBeInTheDocument())
  })

  it('resolves a deep-link to the top-level lazy /reading route', async () => {
    renderAt('/reading')
    await waitFor(() => expect(document.querySelector('.reading-page')).toBeInTheDocument())
  })
})
```
(If `.reading-page` is not the ReadingPage root class, adjust the selector after checking `src/components/tech/ReadingPage.tsx`.)

- [ ] **Step 2: Run it to confirm it fails or is not yet meaningful**

Run: `npm test -- App`
Expected: PASS today (eager imports) — this test locks behavior so lazy loading must not regress it. Proceed; it must still pass after Step 3-4.

- [ ] **Step 3: Add the fallback component**

Create `src/components/shared/RouteFallback.tsx`:
```tsx
export function RouteFallback() {
  return <div className="route-fallback" aria-busy="true" />
}
```

- [ ] **Step 4: Lazy-load routes in `App.tsx`**

Replace `src/App.tsx` with:
```tsx
import { lazy, Suspense } from 'react'
import { Routes, Route } from 'react-router-dom'
import { useSide } from './hooks/useSide'
import { TechLayout } from './components/tech/TechLayout'
import { TechHome } from './components/tech/TechHome'
import { RouteFallback } from './components/shared/RouteFallback'

const CvPage = lazy(() => import('./components/tech/CvPage').then(m => ({ default: m.CvPage })))
const BlogIndex = lazy(() => import('./components/tech/BlogIndex').then(m => ({ default: m.BlogIndex })))
const BlogPost = lazy(() => import('./components/tech/BlogPost').then(m => ({ default: m.BlogPost })))
const ReadingPage = lazy(() => import('./components/tech/ReadingPage').then(m => ({ default: m.ReadingPage })))

function App() {
  useSide()

  return (
    <Routes>
      <Route element={<TechLayout />}>
        <Route index element={<TechHome />} />
        <Route path="cv" element={<CvPage />} />
        <Route path="blog" element={<BlogIndex />} />
        <Route path="blog/:slug" element={<BlogPost />} />
      </Route>
      <Route
        path="reading"
        element={
          <Suspense fallback={<RouteFallback />}>
            <ReadingPage />
          </Suspense>
        }
      />
    </Routes>
  )
}

export default App
```
`TechHome` stays eager (it is the `/` entry). The nested routes get their boundary inside `TechLayout` (next step); `/reading` gets its own boundary here.

- [ ] **Step 5: Add the Suspense boundary inside `TechLayout`**

In `src/components/tech/TechLayout.tsx`, import Suspense + the fallback and wrap the `<Outlet/>`:
```tsx
import { Suspense } from 'react'
import { Outlet } from 'react-router-dom'
import { TechHeader } from './TechHeader'
import { DogEar } from '../shared/DogEar'
import { RouteFallback } from '../shared/RouteFallback'
import { useAtBottom } from '../../hooks/useAtBottom'

export function TechLayout() {
  const { ref, atBottom } = useAtBottom()

  return (
    <div className="tech-layout">
      <TechHeader />
      <main className="tech-main">
        <Suspense fallback={<RouteFallback />}>
          <Outlet />
        </Suspense>
      </main>
      <DogEar
        to="/reading"
        label="Reading — authors and books I love"
        visible={atBottom}
      />
      {/* Marks the page's end; must be the last child. */}
      <div ref={ref} className="page-end-sentinel" aria-hidden="true" />
    </div>
  )
}
```

- [ ] **Step 6: Add minimal fallback styling**

Append to `src/styles/shared.css`:
```css
/* Suspense fallback for lazy routes — minimal, avoids layout jump */
.route-fallback {
  min-height: 40vh;
}
```

- [ ] **Step 7: Run tests + build + inspect chunks**

Run:
```bash
npm test -- App
npm run build
```
Expected: App tests PASS (both deep-links resolve, TechLayout chrome stays mounted on `/blog`). Build chunk list now shows `CvPage`, `BlogIndex`, `BlogPost`, `ReadingPage`, and `marked` in **separate** chunks; the entry chunk is smaller than the Phase 0 baseline.

- [ ] **Step 8: Verify deep-links in the browser**

Run `npm run preview`: hard-load `/blog/modulith` and `/reading` directly — brief fallback, then content; no blank screen or thrown-promise error.

- [ ] **Step 9: Commit**

```bash
git add src/App.tsx src/components/tech/TechLayout.tsx src/components/shared/RouteFallback.tsx src/styles/shared.css src/__tests__/App.test.tsx
git commit -m "perf: code-split routes and marked with two suspense boundaries"
```

### Task 12: Self-host icons and color them via CSS — ⛔ DROPPED (2026-10-18)

> **This task was dropped and NOT implemented.** The build/CI environment has no outbound network, so the ~20 brand SVGs could not be vendored from `cdn.simpleicons.org` / `cdn.jsdelivr.net`, and `simple-icons` was no longer installed to copy from. Per the owner's decision, icons stay on the CDN and the Task 2 preconnect hints become the permanent icon optimization. The original steps are retained below for reference only — do not execute them.

#### (Reference only — not executed)

**Files:**
- Create: `public/icons/*.svg` (vendored)
- Modify: `src/data/micro-cv.ts`
- Modify: `src/components/tech/MicroCv.tsx`
- Modify: `src/styles/tech.css`
- Modify: `src/__tests__/components/MicroCv.test.tsx`
- Modify: `index.html` (remove Task 2 preconnects)

- [ ] **Step 1: Vendor the single-color Simple Icons glyphs**

Run (fetches the 18 unique single-color glyphs used in `micro-cv.ts`; license: Simple Icons CC0):
```bash
cd public/icons
for s in react fastapi tauri googlecloud python terraform ansible docker gitlab kubernetes helm istio springboot ovh gnubash proxmox pfsense cisco; do
  curl -fsSL "https://cdn.simpleicons.org/${s}" -o "${s}.svg" || echo "FAILED: ${s}"
done
cd ../..
ls public/icons
```
Expected: 18 `.svg` files written, no `FAILED` lines. These are single-path glyphs — used as CSS masks, their fill color is irrelevant (the mask uses the shape's alpha).

- [ ] **Step 2: Vendor the two devicon wordmark/multicolor logos**

Run (license: devicon MIT). These stay as `<img>` (not recolored):
```bash
curl -fsSL "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/amazonwebservices/amazonwebservices-plain-wordmark.svg" -o public/icons/aws.svg
curl -fsSL "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/azure/azure-original.svg" -o public/icons/azure.svg
ls public/icons/aws.svg public/icons/azure.svg
```
Expected: both files written. (`vmware.png` already exists in `public/icons/`.)

- [ ] **Step 3: Point AWS/Azure data at local assets**

In `src/data/micro-cv.ts`, change the two AWS entries (`:35` and `:54`) and the Azure entry (`:55`) to local paths, marking the wide wordmarks:
- AWS (both occurrences): `{ slug: 'aws', label: 'AWS', src: '/icons/aws.svg', wide: true },`
- Azure: `{ slug: 'azure', label: 'Azure', src: '/icons/azure.svg' },`

Leave every other icon unchanged (they keep `slug` + `hex`/`darkHex`; `vmware` keeps `src: '/icons/vmware.png'`).

- [ ] **Step 4: Update the MicroCv test expectations**

In `src/__tests__/components/MicroCv.test.tsx`, replace the alt-text assertions (`renders icons with accessible alt text`) with role-based lookups that work for both mask spans and `<img>` icons, and assert no CDN URLs:
```tsx
  it('renders icons with accessible names', () => {
    render(<ThemeProvider><MicroCv /></ThemeProvider>)
    expect(screen.getByRole('img', { name: 'React' })).toBeInTheDocument()
    expect(screen.getByRole('img', { name: 'FastAPI' })).toBeInTheDocument()
    expect(screen.getByRole('img', { name: 'AWS' })).toBeInTheDocument()
  })

  it('serves every icon from a same-origin path, never a CDN', () => {
    const { container } = render(<ThemeProvider><MicroCv /></ThemeProvider>)
    // <img> icons: local src only.
    container.querySelectorAll('img').forEach(img => {
      expect(img.getAttribute('src')).toMatch(/^\/icons\//)
    })
    // mask icons: mask URL points at /icons, no cdn host anywhere.
    expect(container.innerHTML).not.toContain('cdn.simpleicons.org')
    expect(container.innerHTML).not.toContain('cdn.jsdelivr.net')
  })
```
(Keep the other two tests — the 6 periods and the ordering — but wrap their `render` calls in `<ThemeProvider>` from Task 10.)

- [ ] **Step 5: Run the updated test to confirm it fails**

Run: `npm test -- MicroCv`
Expected: FAIL — current `MicroCv` renders `cdn.simpleicons.org` URLs and all icons as `<img>`.

- [ ] **Step 6: Rewrite `MicroCv.tsx`**

Replace `src/components/tech/MicroCv.tsx` with:
```tsx
import { timelineEntries } from '../../data/micro-cv'
import type { TimelineIcon } from '../../data/micro-cv'
import { useTheme } from '../../hooks/useTheme'
import { TwoColumnRow } from '../shared/TwoColumnSection'

function TechIconThemed(props: TimelineIcon) {
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const className = props.wide ? 'micro-cv-icon micro-cv-icon--wide' : 'micro-cv-icon'

  // Multicolor / wordmark logos (AWS, Azure, VMware png): plain same-origin <img>, no recolor.
  if (props.src) {
    return (
      <span className={className} title={props.label}>
        <img src={props.src} alt={props.label} width={props.wide ? 36 : 20} height={20} />
      </span>
    )
  }

  // Single-color glyphs: same-origin SVG as a CSS mask, colored by the entry's own hex/darkHex.
  const color = `#${(isDark && props.darkHex ? props.darkHex : props.hex) || '000000'}`
  return (
    <span
      className={`${className} micro-cv-icon--mask`}
      role="img"
      aria-label={props.label}
      title={props.label}
      style={{
        ['--icon-mask' as string]: `url(/icons/${props.slug}.svg)`,
        ['--icon-color' as string]: color,
      }}
    />
  )
}

export function MicroCv() {
  return (
    <>
      {timelineEntries.map((entry) => (
        <TwoColumnRow key={entry.label} label={entry.label} muted>
          <div className="micro-cv-icons">
            {entry.icons.map((icon) => (
              <TechIconThemed key={icon.slug} {...icon} />
            ))}
          </div>
        </TwoColumnRow>
      ))}
    </>
  )
}
```

- [ ] **Step 7: Add the mask CSS**

In `src/styles/tech.css`, after the `.micro-cv-icon--wide` rule (`:110-112`), add:
```css
.micro-cv-icon--mask {
  -webkit-mask: var(--icon-mask) no-repeat center / contain;
  mask: var(--icon-mask) no-repeat center / contain;
  background-color: var(--icon-color);
}
```
(The existing `.micro-cv-icon svg { fill: var(--text) }` rule at `:118-122` is now dead but harmless; leave it or delete it.)

- [ ] **Step 8: Remove the interim preconnects (Task 2)**

In `index.html`, delete the four lines added in Task 2 (the two `preconnect` and two `dns-prefetch` for `cdn.simpleicons.org` / `cdn.jsdelivr.net`). The Google Fonts preconnects stay.

- [ ] **Step 9: Run tests + build**

Run: `npm test -- MicroCv && npm run build`
Expected: PASS; build clean.

- [ ] **Step 10: Verify colors + zero-network recolor in the browser**

Run `npm run dev`, open `/` with the Network tab:
- All timeline icons show their correct individual brand colors in light theme.
- The 4 `darkHex` icons (`helm`, `ovh`, `pfsense`, `cisco`) switch to their dark colors in dark theme; AWS/Azure/VMware render at correct widths.
- Toggle theme: icons recolor with **zero** network requests. Zero requests hit `cdn.simpleicons.org` / `cdn.jsdelivr.net` on load.

- [ ] **Step 11: Commit**

```bash
git add public/icons src/data/micro-cv.ts src/components/tech/MicroCv.tsx src/styles/tech.css src/__tests__/components/MicroCv.test.tsx index.html
git commit -m "perf: self-host timeline icons and color them via CSS mask"
```

### Task 13: Convert the blog diagram to WebP

**Files:**
- Create: `public/content/blog/modulith-diagram.webp`
- Modify: `public/content/blog/modulith.md:13`
- Delete: `public/content/blog/modulith-diagram.png`

- [ ] **Step 1: Convert the PNG**

Run (install `cwebp` if missing: `brew install webp`):
```bash
cwebp -q 80 public/content/blog/modulith-diagram.png -o public/content/blog/modulith-diagram.webp
ls -l public/content/blog/modulith-diagram.webp
```
Expected: a `.webp` dramatically smaller than 454KB.

- [ ] **Step 2: Update the markdown reference**

In `public/content/blog/modulith.md`, change line 13 from `modulith-diagram.png` to `modulith-diagram.webp`:
```markdown
![Monolith vs Modulith vs Microservices](/content/blog/modulith-diagram.webp)
```

- [ ] **Step 3: Remove the PNG**

```bash
git rm public/content/blog/modulith-diagram.png
```
(WebP is universally supported on current targets; no `<picture>` fallback needed.)

- [ ] **Step 4: Verify in the browser**

Run `npm run dev`, open `/blog/modulith`: the diagram renders correctly and its transfer size is far below 454KB.

- [ ] **Step 5: Commit**

```bash
git add public/content/blog/modulith-diagram.webp public/content/blog/modulith.md
git commit -m "perf: convert the 454KB blog diagram to webp"
```

### Task 14: Font-loading audit (verification only)

**Files:** none expected.

- [ ] **Step 1: Confirm Playfair/Lora are unused at runtime**

Run:
```bash
grep -n "Playfair\|Lora" src/styles/base.css
grep -rn "creative" src/App.tsx
```
`base.css:36-37` references Playfair/Lora for the creative side, but `App.tsx` routes no `/creative` paths — the creative side is unreachable on current `main`, so those families never load. `index.html` loads only Inter + JetBrains Mono (already `display=swap`).

- [ ] **Step 2: Decision**

Leave font loading untouched (nothing to fix on the routed tech side). Record this in the final notes. No commit.

---

## Phase 4 — Polish (only if Phase 0 / profiling flagged reading-page jank)

### Task 15 (optional): `content-visibility` on reading flip cards

**Files:**
- Modify: `src/styles/tech.css` (the `.author-card` / reading-card rule)

- [ ] **Step 1: Gate on evidence**

Only do this if Phase 0 profiling showed scroll jank on `/reading`. Otherwise skip (YAGNI).

- [ ] **Step 2: Add the containment**

Add to the reading card rule in `tech.css`:
```css
  content-visibility: auto;
  contain-intrinsic-size: 180px; /* ≈ the card's rendered height; tune to avoid scroll jumps */
```

- [ ] **Step 3: Verify the flip still works**

Run `npm run dev`, open `/reading`: off-screen cards skip paint, the 3D flip/backface still renders correctly on hover, no scrollbar jump.

- [ ] **Step 4: Commit**

```bash
git add src/styles/tech.css
git commit -m "perf: skip off-screen paint on reading cards with content-visibility"
```

---

## Task 16: Update CLAUDE.md

**Files:**
- Modify: `CLAUDE.md`

- [ ] **Step 1: Commands section**

- Correct "No linter or test runner is configured" → note the `vitest` harness: `npm test` (`vitest run`) and `npm run test:watch`, tests in `src/__tests__/`.
- Note that `public/content/blog/manifest.json` is a **generated artifact** (produced from each post's frontmatter by a Vite plugin at dev/build; edit the `.md` frontmatter, not the manifest).

- [ ] **Step 2: Architecture section**

- Routes are **code-split** via `React.lazy` with **two Suspense boundaries** (one inside `TechLayout`, one around the top-level `/reading` route); `marked` is isolated in its own chunk.
- Timeline/tech icons are **self-hosted in `public/icons/`** and colored via CSS mask using each icon's own hex (AWS/Azure/VMware stay as `<img>`); they are no longer fetched from `cdn.simpleicons.org`.
- Theme is managed by a single **`ThemeProvider` context** (`src/hooks/useTheme.tsx`), replacing the per-component `useTheme` state.
- Blog previews come from the generated `manifest.json`; article bodies are fetched lazily through a client-side cache (`src/lib/fetchCache.ts`).
- `parseFrontmatter` now lives in `src/lib/frontmatter.ts` (re-exported by `markdown.ts`).
- Static assets: extended `public/icons/` and the WebP diagram.
- Remove any implication that `simple-icons` is a used dependency.

- [ ] **Step 2b: Deprecate the old spec pointer (if referenced)**

If any memory/doc points at `docs/specs/two-sided-portfolio.md` as current, note it is deprecated (redesign merged).

- [ ] **Step 3: Commit**

```bash
git add CLAUDE.md
git commit -m "docs: update CLAUDE.md for perf changes (manifest, icons, theme, code-splitting)"
```

---

## Task 17: Final verification against the spec's Verification Plan

**Files:** none (verification only).

- [ ] **Step 1: Full suite + build**

Run:
```bash
npm test && npm run build
```
Expected: all tests PASS; build succeeds; chunk list shows `marked` + lazy route chunks separated from the entry; entry chunk gzip smaller than the Phase 0 baseline.

- [ ] **Step 2: Behavioral checks (browser, `npm run preview`)**

- `/blog`: one `manifest.json` request, zero per-post `.md` requests on index load; cards appear effectively instantly with correct titles/dates/descriptions/"Originally on…" labels.
- Open a post → back to `/blog` → reopen: post `.md` fetched at most once.
- Home page fires **zero** requests to `cdn.simpleicons.org` / `cdn.jsdelivr.net`.
- Theme persists across reload and across routes including `/reading`.

- [ ] **Step 3: Visual + edge cases**

- Home at 375px and 1280px: hero crisp at 130×130, no layout shift; icons show correct brand colors; dark theme swaps the 4 `darkHex` icons; AWS/Azure/Cisco/VMware correct widths.
- Toggle theme: icons recolor with no network.
- Deep-link `/blog/modulith` and `/reading` fresh: brief fallback then content, no blank/error.
- Rapid theme toggling: no wrong-colored icon flash, no header↔MicroCv desync.
- `/blog/modulith` diagram renders and is far smaller than 454KB.

- [ ] **Step 4: Re-run Lighthouse and compare**

Run Lighthouse (mobile) on `/` and `/blog`; confirm LCP/TBT improved vs. `baseline-2026-10-18.md`. Record the after-numbers.

- [ ] **Step 5: Final commit if any notes/docs changed**

```bash
git add -A
git commit -m "docs: record post-optimization performance numbers" || true
```

---

## Self-Review (completed during planning)

- **Spec coverage:** Phase 0 (Task 0), Phase 1.1-1.4 (Tasks 1-4), Phase 2.1-2.5 (Tasks 5-9; the BlogIndex loading gate is a verified no-op folded into Task 8 Step 5), Phase 3.1-3.5 (Tasks 11, 10, 12, 13, 14), Phase 4 (Task 15), CLAUDE.md (Task 16), Verification Plan (Task 17). All mapped.
- **Deliberate deviations from the spec's open options, with rationale stated inline:** manifest generation is a Vite plugin rather than a `prebuild` `.mjs` (clean TS reuse, dev+build coverage, zero new deps); the generated `manifest.json` is git-ignored rather than committed. Icon coloring uses CSS mask. These resolve the spec's explicitly-open questions; the locked decisions (per-icon color, build-time generation, WebP for the diagram, two Suspense boundaries) are all honored.
- **Ordering note:** Task 10 (ThemeProvider) is sequenced before Task 11 and is a prerequisite for Task 3's test wrapper and the MicroCv/App tests — do Phase 3's Task 10 even if cherry-picking.
- **Type consistency:** `BlogMeta` (existing) is reused by `useBlogList`; `ManifestEntry` extends it with `file`. `fetchText`, `buildManifest`, `ThemeProvider`/`useTheme`, `RouteFallback` names are consistent across tasks and tests.
