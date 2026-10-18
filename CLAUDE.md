# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Personal portfolio site for Alexis Janero Moliner, hosted at varno.dev. A React app with a tech side (profile/micro-CV, narrative CV, blog) and a `/reading` page, with a light/dark theme toggle.

## Commands

- `npm run dev` — Start Vite dev server
- `npm run build` — Type-check with `tsc` then build with Vite. The build also runs a small Vite plugin that generates `public/content/blog/manifest.json` from each post's frontmatter.
- `npm run preview` — Preview production build locally
- `npm test` — Run the test suite once (`vitest run`)
- `npm run test:watch` — Run tests in watch mode

Tests use **vitest** + Testing Library (jsdom); they live in `src/__tests__/`. No linter is configured.

## Architecture

- **Vite + React 18 + TypeScript** — Routing via `react-router-dom` v7 (`/`, `/cv`, `/blog`, `/blog/:slug`, and the top-level `/reading`). No state-management library.
- **Code splitting** — Non-home routes are loaded with `React.lazy` behind **two Suspense boundaries**: one inside `TechLayout` (wrapping its `<Outlet/>`, so header/dog-ear stay painted) and one around the top-level `/reading` route. `marked` is isolated into its own chunk (`vite.config.ts` `manualChunks`), keeping it out of the home entry bundle.
- **CSS** (`src/styles/`: `base.css`, `shared.css`, `tech.css`) — Theme/side switching via CSS custom properties on the `[data-theme]` and `[data-side]` attributes on `<html>`.
- **Theme** — A single **`ThemeProvider` context** (`src/hooks/useTheme.tsx`) is the source of truth for light/dark, with localStorage persistence and system-preference detection; it writes `data-theme` on `<html>`. Consumers call `useTheme()` (throws outside the provider).
- **Blog** — Posts are markdown in `public/content/blog/` with YAML-ish frontmatter. Preview metadata (title/date/description/tags/source) lives in a **generated** `manifest.json` (produced at build by a Vite plugin from each post's frontmatter; **git-ignored** — edit the `.md` frontmatter, not the manifest). The index (`useBlogList`) fetches only the manifest; article bodies are fetched lazily and cached in-memory (`src/lib/fetchCache.ts`). `parseFrontmatter` lives in `src/lib/frontmatter.ts` (marked-free, so the build script can reuse it); `renderMarkdown` (which imports `marked`) stays in `src/lib/markdown.ts`.
- **Icons** — `@remixicon/react` for the social links (line/fill variants swap by theme). The MicroCv timeline icons are fetched from `cdn.simpleicons.org` (single-color glyphs, colored via the URL's hex/`darkHex`) and `cdn.jsdelivr.net` (AWS/Azure devicon wordmarks); `index.html` preconnects to both CDNs. VMware uses a local `public/icons/vmware.png`. (Self-hosting these icons was considered but dropped — see `docs/specs/performance-optimization.md`.)
- **Static assets** — Profile image in `src/assets/` (with explicit dimensions + `fetchpriority` as the LCP element); blog images (incl. the WebP diagram) and SEO files (`llm.txt`, `robots.txt`, `sitemap.xml`) in `public/`.
