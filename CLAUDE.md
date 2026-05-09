# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Personal portfolio site for Alexis Janero Moliner, hosted at varno.dev. A minimal single-page React app showing profile info and social links with a light/dark theme toggle.

## Commands

- `npm run dev` — Start Vite dev server
- `npm run build` — Type-check with `tsc` then build with Vite
- `npm run preview` — Preview production build locally

No linter or test runner is configured.

## Architecture

- **Vite + React 18 + TypeScript** — No router, no state management library
- **Single CSS file** (`src/styles/App.css`) — Theme switching via CSS custom properties on `[data-theme]` attribute on `<html>`
- **`useTheme` hook** (`src/hooks/useTheme.ts`) — Manages light/dark theme with localStorage persistence and system preference detection
- **Icons** — `@remixicon/react` (Remix Icon). Social links swap between line/fill icon variants based on theme
- **Static assets** — Profile image in `src/assets/`, SEO files (`llm.txt`, `robots.txt`, `sitemap.xml`) in `public/`
