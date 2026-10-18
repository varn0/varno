## Feature: Performance Optimization

> **Status:** Approved design, pending implementation.
> **Supersedes context note:** The two-sided portfolio redesign (`docs/specs/two-sided-portfolio.md`) is **complete and merged into `main`**; that spec is now stale/deprecated and retained only for history. This spec targets the current `main` as shipped.

### Overview

Reduce load time on the two highest-traffic surfaces — the home page and the blog — by eliminating a serial fetch waterfall on `/blog`, removing the markdown renderer and unused route code from the home-page entry bundle, moving ~20 cross-origin icon requests same-origin, and right-sizing the oversized blog diagram image. The work is grouped into phases by impact-vs-effort: a measurement baseline, quick wins, the blog load path, app-wide delivery, and optional polish. All changes are design-level here; no implementation code is included.

### Components Affected

**Frontend (UI / hooks / routing)**
- [ ] `src/App.tsx` — route components converted to `React.lazy` + `<Suspense>` (code splitting); note `ReadingPage` is a top-level route *outside* `TechLayout` and needs its own boundary (see Phase 3.1)
- [ ] `src/hooks/useBlogList.ts` — stop fetching full article bodies; read preview metadata from manifest
- [ ] `src/hooks/useMarkdown.ts` — consult a module-scoped fetch cache before network
- [ ] `src/hooks/useTheme.ts` — refactor to a single `ThemeProvider` context (one source of truth)
- [ ] `src/components/tech/BlogIndex.tsx` — loading gate becomes near-instant; adjust if needed
- [ ] `src/components/tech/MicroCv.tsx` — icons rendered same-origin, colored via CSS using each icon's own hex (not a single accent)
- [ ] `src/components/shared/ProfileCard.tsx` — hero `<img>` gets explicit dimensions, `fetchpriority`, optional `srcset`/WebP
- [ ] `src/components/shared/SocialLinks.tsx`, `src/components/shared/ThemeToggle.tsx` — consume theme context
- [ ] `src/components/tech/ReadingPage.tsx` — optional `content-visibility` on flip cards (Phase 4)
- [ ] `src/data/micro-cv.ts` — icon entries point at local assets rather than CDN URLs (hex/darkHex retained as CSS color values)

**Backend / build**
- [ ] `package.json` — remove unused `simple-icons`; add a `prebuild` script hook for manifest generation
- [ ] `vite.config.ts` — fill in baseline config + `manualChunks` to isolate `marked`
- [ ] New: `scripts/generate-blog-manifest.mjs` (or a tiny Vite plugin) — generates `manifest.json` from frontmatter
- [ ] New/refactor: `src/lib/frontmatter.ts` — `parseFrontmatter` split out of `src/lib/markdown.ts` so the Node build script can import it without pulling in `marked`

**Infrastructure / static assets**
- [ ] `index.html` — preconnect hints (interim), self-hosted font/icon review
- [ ] `public/content/blog/manifest.json` — reshaped to carry preview metadata (generated artifact)
- [ ] `public/icons/` — **existing dir** (already holds `vmware.png`); extended with ~21 vendored icon SVGs
- [ ] `src/assets/profile-picture.jpeg` — explicit dimensions/`fetchpriority` (resize/WebP optional, low payoff — see Phase 3.4)
- [ ] `public/content/blog/modulith-diagram.png` — converted to WebP; `modulith.md:13` reference updated

**External services**
- [ ] Removal of runtime dependency on `cdn.simpleicons.org` and `cdn.jsdelivr.net` (icons move same-origin)

### Decisions Locked (from design review)

- **A → build-time manifest generation.** `manifest.json` is generated from each post's frontmatter; frontmatter stays the single source of truth.
- **B → ~~self-host icons~~ DROPPED (2026-10-18): icons remain on the CDN.** Originally the plan was to vendor the ~21 glyphs to `public/icons/` and color them via CSS mask. During implementation the build/CI environment turned out to have **no outbound network** (the `cdn.simpleicons.org` / `cdn.jsdelivr.net` fetches time out) and `simple-icons` was no longer installed to copy from, so vendoring was not possible here. Per the owner's decision, icon self-hosting is **dropped from scope**: timeline icons continue to be fetched from `cdn.simpleicons.org` (single-color glyphs, colored via the CDN URL's hex/`darkHex`) and `cdn.jsdelivr.net` (AWS/Azure devicon wordmarks). The **preconnect/dns-prefetch hints (Phase 1.1) are now the PERMANENT icon optimization** (not interim) and are retained. The per-theme-toggle icon refetch for the 4 `darkHex` icons remains a known, accepted cost. Revisit only if a networked build environment becomes available.
- **C → manual image pre-generation (no new build dependency).** The 454KB blog PNG is converted to WebP by hand and committed; the hero gets dimension/priority hints only (its payoff is small — see Phase 3.4). Rationale: only two images exist and the hero is already ~52KB; a `vite-imagetools` dependency is not justified (YAGNI). **Revisit trigger:** if the site grows to roughly a dozen+ content images, reconsider an automated pipeline.
- **D → single initiative, no sequencing hold.** The redesign is merged, so all phases ship as one effort.

### Data Flow

**Blog index — before**
```
BlogIndex -> useBlogList
  fetch manifest.json  (slug, file only)
  for each post (SERIAL):
    fetch /content/blog/<file>  -> full article body
    parseFrontmatter            -> keep title/date/desc, DISCARD body
  gate UI until the LAST fetch resolves -> render all cards
```

**Blog index — after**
```
BlogIndex -> useBlogList
  fetch manifest.json  (slug, title, date, description, tags, source)  [1 small request]
  render cards immediately (no per-post fetch, no body download, no client parse)

Build time:
  scripts/generate-blog-manifest.mjs
    read every public/content/blog/*.md
    parseFrontmatter (from src/lib/frontmatter.ts, no marked dependency)
    write manifest.json  (metadata embedded)
```

**Blog post — before/after**
```
Before: BlogPost -> useMarkdown(url) -> fetch(url) every visit (re-downloads even what the index fetched)
After:  BlogPost -> useMarkdown(url) -> fetchCache.get(url) ?? fetch(url); cache the Promise
        (instant back-nav / repeat views; de-dupes in-flight + StrictMode double-fetch)
```

**Home bundle — before/after**
```
Before: entry bundle = App + all routes + marked (~35-50KB gz) -> parsed on home even though marked only runs on a blog post
After:  entry bundle = App + home route; BlogPost/Blog/CV/Reading routes + marked in lazy chunks fetched on navigation
```

**Icons — before/after**
```
Before: MicroCv -> <img src="https://cdn.simpleicons.org/<slug>/<hex>"> (cross-origin; ~20 unique URLs;
        the 4 icons with darkHex refetch a different URL on theme toggle)
After:  MicroCv -> same-origin SVG from /public/icons, colored via CSS using the entry's hex/darkHex
        (cached; theme recolor = 0 network for all icons)
```

**Theme state — before/after**
```
Before: useTheme() called independently in App, MicroCv, SocialLinks, ThemeToggle -> N copies of useState;
        toggle writes DOM+localStorage but sibling React state can desync
After:  <ThemeProvider> holds one state; writes data-theme on <html> exactly as today; all consumers read context
```

### Implementation Plan

#### Phase 0 — Baseline (measurement, no code)
1. Record production `vite build` chunk list + gzipped sizes ("before" for code splitting).
2. Lighthouse (mobile, throttled) on `/` and `/blog`: capture LCP, TBT, total transfer, request count.
3. Capture `/blog` network waterfall confirming serial `.md` fetches and the 454KB PNG on the modulith post.
   - *Gate:* these numbers justify Phase 3 effort and prove impact afterward.

#### Phase 1 — Quick wins (low effort, no structural/visual risk)
1. **Preconnect icon CDNs** (`index.html`): add `preconnect` + `dns-prefetch` for `cdn.simpleicons.org` and `cdn.jsdelivr.net`. *Interim measure — removed once Phase 3 self-hosts icons.*
2. **Remove `simple-icons`** (`package.json`): verified no `src/` import. Confirm with a clean `npm run build`.
3. **Hero image hints** (`ProfileCard.tsx`): explicit `width`/`height` + `fetchpriority="high"` on the LCP image.
4. **Baseline `vite.config.ts`**: set `build.target`, source-map policy, scaffold `manualChunks`.
   - *Not done:* StrictMode double-fetch (`main.tsx:10`) is dev-only — left in place. Playfair/Lora font loading is unchanged (audited in Phase 3.5).

#### Phase 2 — Blog load path (high impact on /blog)
1. **Split out `parseFrontmatter`** (`src/lib/markdown.ts` -> new `src/lib/frontmatter.ts`): move the frontmatter parser into a standalone module with no `marked` import, re-exported from `markdown.ts` for existing callers. This lets the Node build script reuse it without bundling the markdown renderer.
2. **Build-time manifest generation** (`scripts/generate-blog-manifest.mjs` + `prebuild` hook): read every `public/content/blog/*.md`, parse frontmatter via `src/lib/frontmatter.ts`, emit `manifest.json` with `slug`, `file`, `title`, `date`, `description`, `tags`, `source`.
3. **Rewrite `useBlogList.ts`**: fetch only `manifest.json`; map entries straight to `BlogMeta`; keep the date sort. Remove the per-post fetch loop and client-side frontmatter parsing.
4. **Loading gate** (`BlogIndex.tsx`): with a single fast request the gate is near-instant; retain a minimal fallback for the one in-flight request.
5. **Fetch cache for post bodies** (new module + `useMarkdown.ts`): module-scoped `Map<url, Promise<string>>`; `useMarkdown` consults it before fetching. In-memory only (per session); browser HTTP cache + immutable headers cover cross-reload.

#### Phase 3 — App-wide delivery
1. **Route code splitting** (`App.tsx`, `vite.config.ts`): `React.lazy` + dynamic `import()` for `CvPage`, `BlogIndex`, `BlogPost`, `ReadingPage`; `manualChunks` isolates `marked`. Keep `TechHome` eager.
   - **Two Suspense boundaries are required** because of the current route shape in `App.tsx`: the nested routes (`cv`, `blog`, `blog/:slug`) live under `<Route element={<TechLayout/>}>`, while `reading` is a **sibling top-level route outside** `TechLayout`. Put one `<Suspense>` inside the `TechLayout` outlet for the nested routes, and a **second `<Suspense>`** wrapping the `ReadingPage` route element (or a single boundary around the whole `<Routes>` tree). A boundary only inside `TechLayout` would NOT catch a fresh deep-link to `/reading` and would throw.
2. **Shared theme context** (`useTheme.ts` -> `ThemeProvider`): single state. Must continue writing `data-theme` on `<html>` at all three current write-sites — `useTheme.ts:21` (toggle), `useTheme.ts:26` (**initial apply in the effect — critical for correct first paint**), and `useTheme.ts:35` (system-preference handler) — and preserve the localStorage override + system-preference logic. Consumers (`App`, `MicroCv`, `SocialLinks`, `ThemeToggle`) read context.
3. **Self-host + CSS-color icons** (`public/icons/`, `micro-cv.ts`, `MicroCv.tsx`): vendor the ~21 unique glyphs (Simple Icons CC0, devicon MIT; `vmware.png` already local). Render single-color glyphs via CSS mask with each entry's own `hex`/`darkHex` as the mask color, so every icon keeps its brand color and theme toggle recolors with **zero network**. Remove the Phase 1 preconnect hints once complete.
   - **Multicolor / wordmark logos that cannot be single-color masks** (the AWS and Azure devicon wordmarks from `cdn.jsdelivr.net`, and any glyph whose identity depends on multiple colors) stay as plain same-origin `<img>` without recoloring. Enumerate these during implementation.
4. **Image handling (manual)**:
   - Blog PNG (`public/content/blog/modulith-diagram.png` -> WebP): convert and update the reference in `modulith.md:13`. This is the real asset win (454KB). Keep the PNG only if a fallback is needed.
   - Hero (`src/assets/profile-picture.jpeg`, ~52KB for a 130×130 target): dimension/`fetchpriority` hints from Phase 1 are the main benefit. A resized WebP `srcset` is *optional* and low-payoff; include only if Phase 0 LCP data shows the hero is a bottleneck.
5. **Font loading audit** (`index.html`, `base.css:36-37`): confirm whether Playfair/Lora are actually loaded where the creative side uses them; apply `font-display: swap` and add any missing preloads. `index.html` currently loads only Inter + JetBrains Mono. If Playfair/Lora remain unreferenced at runtime, leave untouched.

#### Phase 4 — Polish (only if Phase 0 / profiling flags it)
1. **Reading flip cards** (`ReadingPage.tsx`): add `content-visibility: auto` + `contain-intrinsic-size` to skip off-screen layout/paint; verify it does not break the flip animation's backface rendering.
2. **Off-main-thread markdown** — explicitly declined (parse is sub-frame for these posts; a Worker adds complexity for no felt benefit).

### Verification Plan

#### Visual Checks
- [ ] Home `/` at 375px and 1280px: hero image renders crisp at 130×130, no layout shift on load; name + social links positioned as before.
- [ ] Home `/`: all MicroCv timeline icons render with their correct **individual brand colors** in light theme, and the 4 `darkHex` icons (`helm`, `ovh`, `pfsense`, `cisco`) switch to their dark-mode colors in dark theme; the wide icons (AWS and Azure wordmarks, Cisco, VMware) render at their correct widths.
- [ ] Toggle theme on `/`: icons recolor correctly with **no network request** fired (verify in DevTools Network while toggling).
- [ ] `/blog`: cards appear effectively immediately (no multi-second "Loading…"); titles, descriptions, dates, and "Originally on…" labels match the posts.
- [ ] A blog post (`/blog/modulith`): the diagram image renders correctly and is visibly smaller in transfer size than 454KB.

#### Behavioral Checks
- [ ] `npm run build` succeeds after removing `simple-icons`; no unresolved import.
- [ ] `prebuild` generates `manifest.json` containing `title`/`date`/`description`/`tags`/`source` for all four posts, matching each `.md`'s frontmatter exactly.
- [ ] The manifest build script imports only `src/lib/frontmatter.ts` (no transitive `marked` import).
- [ ] `/blog` network tab shows **one** request to `manifest.json` and **zero** per-post `.md` requests on index load.
- [ ] Opening a post then navigating back to `/blog` and reopening the post fires the post `.md` fetch **at most once** (fetch cache hit on the repeat).
- [ ] Production build chunk list shows `marked` in a separate chunk, not the entry bundle; home entry bundle gzipped size is smaller than the Phase 0 baseline.
- [ ] Home page fires **zero** requests to `cdn.simpleicons.org` / `cdn.jsdelivr.net` after Phase 3.3.
- [ ] Theme choice persists across reload and across routes (including `/reading`) via the shared context, identical to pre-refactor behavior.
- [ ] Lighthouse on `/` and `/blog` shows improved LCP/TBT vs. the Phase 0 baseline.

#### Edge Cases
- [ ] A post with a missing/empty frontmatter field (e.g. no `description`): manifest generation emits a sensible empty/default rather than crashing; card renders without breaking layout.
- [ ] A post with `tags` as a single value vs. a bracketed list: parsed consistently (matches current `parseFrontmatter` array handling).
- [ ] Direct deep-link to a lazy route under `TechLayout` (load `/blog/modulith` fresh): Suspense fallback shows briefly, then content; no blank screen or error.
- [ ] Direct deep-link to the **top-level** lazy route (load `/reading` fresh): the dedicated Suspense boundary catches the lazy import; fallback shows briefly, then content; no thrown promise / blank screen. *(This specifically validates Phase 3.1's two-boundary requirement.)*
- [ ] Rapid theme toggling: no flash of wrong-colored icons, no desync between header toggle and MicroCv icons (validates single context source of truth).
- [ ] Icon SVG missing from `public/icons/`: `alt` text / graceful gap rather than a broken-image layout jump.
- [ ] `manifest.json` fetch fails on `/blog`: existing `.catch` path still clears loading and shows an empty/graceful state.

### CLAUDE.md Updates

`CLAUDE.md` (root — the only CLAUDE.md in the repo) needs updates once implemented:
- **Commands:** note the new `prebuild` manifest-generation step and that `manifest.json` is a **generated artifact** (edit frontmatter, not the manifest). Correct the stale "No linter or test runner is configured" line — a `vitest` harness already exists (`npm test` / `npm run test:watch`, with `src/__tests__/`).
- **Architecture:**
  - Record that routes are **code-split** via `React.lazy` (two Suspense boundaries — one in `TechLayout`, one for the top-level `/reading` route) and that `marked` is isolated in its own chunk.
  - Replace the "Icons — `@remixicon/react`… Social links swap between line/fill" CDN detail: timeline/tech icons are now **self-hosted in `public/icons/`** and colored via CSS using each icon's own hex, not fetched from `cdn.simpleicons.org`.
  - Note the new **`ThemeProvider` context** as the single source of truth for theme (replacing the per-component `useTheme` calls).
  - Note that **blog metadata lives in generated `manifest.json`**; article bodies are fetched lazily with a client-side cache.
  - Note the `parseFrontmatter` move to `src/lib/frontmatter.ts`.
  - Update "Static assets" to mention the extended `public/icons/` and the WebP diagram.
- **Removed dependency:** drop any implication that `simple-icons` is used.

No other CLAUDE.md files exist, so no further files are affected.

### Open Questions

- Icon coloring **mechanism** (CSS `mask` with `background-color` vs inline `<svg>` with `fill` vs `<img>` + filter) — settled at implementation. The **decision that each icon keeps its own `hex`/`darkHex`** (not a single accent) is locked in Decision B; only the mechanism is open. Mask-with-per-icon-color is the leading candidate for single-color glyphs.
- Whether to keep a `<picture>`/JPEG fallback for the hero if a resized WebP is added (WebP support is universal on current targets; likely unnecessary).
- Exact Suspense fallback styling so both boundaries read consistently with the dog-ear/scroll-reveal transitions on the tech side.

### Risks & Mitigations

- **Theme refactor regressions (3.2).** The `data-theme` attribute on `<html>` drives all CSS tokens and the dog-ear/paper visuals. *Mitigation:* the provider must write the attribute at all three sites — `useTheme.ts:21`, `:26` (initial apply, most important for first paint), and `:35` — and preserve the localStorage override + system-preference behavior; verify `/reading` (which relies on `App`-level theme application) explicitly.
- **Top-level lazy route without a boundary (3.1).** `ReadingPage` sits outside `TechLayout` in `App.tsx:25`; a Suspense boundary only inside the layout outlet would not catch its lazy import and `/reading` deep-links would throw. *Mitigation:* the explicit two-boundary requirement in Phase 3.1 plus the `/reading` deep-link edge case.
- **Icon color flattening (3.3).** Icons carry 20 distinct brand hexes plus 4 `darkHex` overrides; a naive `currentColor`/single-accent approach would destroy the palette and fail the visual check. *Mitigation:* Decision B mandates per-icon color; multicolor/wordmark logos excepted and kept as `<img>`.
- **Manifest drift / generation bugs (2.2).** A broken generator silently ships a wrong index. *Mitigation:* generator reuses the shared `parseFrontmatter`; add a unit test (vitest harness exists); fail the build on malformed frontmatter.
- **Build-script bundling marked (2.1).** Importing the old `markdown.ts` into a Node script drags in `marked`. *Mitigation:* the `parseFrontmatter` split into `src/lib/frontmatter.ts` is a required (not optional) step.
- **WebP-only images.** Dropping fallbacks could break ancient browsers. *Mitigation:* WebP is universally supported on current targets; keep the original PNG as a fallback for the diagram if any doubt.
- **StrictMode double-invoke.** Dev-only; the fetch cache (2.5) incidentally de-dupes it. No production impact.

### Deprecated Spec Note

`docs/specs/two-sided-portfolio.md` is retained for history but is **deprecated** — the two-sided redesign it describes is complete and merged into `main`. This performance spec targets that merged state.
