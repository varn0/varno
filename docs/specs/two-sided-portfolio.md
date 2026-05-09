# Two-Sided Portfolio — Architectural Spec

**Author:** Architect review for Alexis Janero Moliner (varno.dev)
**Date:** 2026-04-26
**Status:** Draft — answers integrated 2026-04-26

---

## Problem Statement

The current site at varno.dev is a single-screen React app: profile photo, name, four social links, and a light/dark toggle. It needs to evolve into a two-sided personal portfolio that expresses both a professional/technical identity and a creative/artistic identity, connected by a physical page-turn interaction.

## Constraints

- Must remain a static site (no server, no SSR requirement). Vite + React 18 + TypeScript.
- Must be deployable wherever it is today with SPA fallback routing.
- Zero runtime backend. All content is baked into the build or loaded from static files.
- Keep dependencies minimal. This is a personal site, not a product.
- The two sides must feel like distinct visual worlds while clearly belonging to the same person.

---

## 1. Routing Strategy

**Decision: react-router-dom v6 with hash-free browser history.**

Rationale:
- The site now has 5+ distinct URLs (tech home, CV, blog, creative home, individual posts). A router is unavoidable.
- react-router-dom v6 is the React ecosystem standard, has a tiny bundle, and supports lazy loading out of the box.
- Alternative considered: **wouter** (1.5 KB). Simpler, but react-router's `<Outlet>` pattern for nested layouts (tech layout vs creative layout) is worth the extra ~8 KB.
- Alternative rejected: **TanStack Router** — overkill type-safe file routing for a personal site.

**Route map:**

```
/                   Tech side — Home (micro-CV + social links)
/cv                 Tech side — Narrative work history
/blog               Tech side — Blog index
/blog/:slug         Tech side — Individual blog post
/creative           Creative side — Gallery landing
/creative/writing   Creative side — Short stories index
/creative/writing/:slug   Creative side — Individual story
/creative/paintings Creative side — iPad paintings gallery
/creative/carvings  Creative side — Carvings video/photo gallery
/creative/outdoors  Creative side — Outdoor adventures photo gallery
```

Both sides share a common root layout that owns the page-turn mechanism and the theme toggle. Each side then has its own nested layout providing side-specific chrome (header, navigation style, typography).

**SPA fallback:** The static host must be configured to serve `index.html` for all paths (standard SPA config).

---

## 2. Component Architecture

```
<App>
  ├── ThemeProvider (context: light/dark + current side)
  ├── PageTurnButton (fixed position, always visible)
  └── <Routes>
       ├── <TechLayout>          ← /
       │    ├── TechHeader       (monospace nav: Home | CV | Blog)
       │    ├── <Outlet>
       │    │    ├── TechHome        /
       │    │    ├── CvPage          /cv
       │    │    ├── BlogIndex       /blog
       │    │    └── BlogPost        /blog/:slug
       │    └── TechFooter       (minimal)
       │
       └── <CreativeLayout>      ← /creative
            ├── CreativeHeader   (different typography, warmer nav)
            ├── <Outlet>
            │    ├── CreativeHome    /creative
            │    ├── WritingIndex    /creative/writing
            │    ├── WritingPiece    /creative/writing/:slug
            │    ├── PaintingsGallery /creative/paintings
            │    ├── CarvingsGallery /creative/carvings
            │    └── OutdoorsGallery /creative/outdoors
            └── CreativeFooter
```

**Shared components** (used on both sides):
- `ThemeToggle` — the existing lightbulb button, repositioned into each layout's header
- `SocialLinks` — the existing social icon row, reusable
- `MarkdownRenderer` — renders blog posts and writing pieces from markdown
- `ImageGallery` — lightbox-style image grid (paintings, carvings, outdoors)
- `PageTurnButton` — the folded-corner element (lives outside both layouts, at app root)

**Side-specific components:**
- `MicroCv` — year-range timeline with tech icons (tech home) — see Appendix A for data
- `NarrativeSection` — styled prose block for the CV page
- `BlogCard` — preview card for blog index
- `StoryCard` — preview card for writing index

---

## 3. Page-Turn Interaction

This is the signature element. It needs to feel physical.

**The button:** A fixed-position element in the bottom-left corner that looks like a folded page corner (a triangle with a subtle paper curl shadow). It sits at `position: fixed; bottom: 0; left: 0` and is always visible on both sides.

**Implementation approach: Pure CSS 3D transform + React transition.**

No library needed. The technique:

1. The entire viewport is wrapped in a container with `perspective: 1500px`.
2. When the user clicks the corner, the current "page" (the entire side's content) rotates on its right edge (`transform-origin: right center`) via `rotateY(-180deg)` with a ~600ms `ease-in-out` transition.
3. The incoming side's content is positioned "behind" the current page (using `backface-visibility: hidden` or z-index swapping).
4. During the transition, a subtle shadow gradient sweeps across to simulate a page fold.
5. On completion, react-router navigates to `/` or `/creative` (the root of the target side).

**Detailed CSS mechanics:**

```css
.page-container {
  perspective: 1500px;
  position: relative;
  overflow: hidden;
}

.page-side {
  transform-style: preserve-3d;
  backface-visibility: hidden;
  transition: transform 0.7s cubic-bezier(0.645, 0.045, 0.355, 1);
  transform-origin: right center;
}

.page-side--flipping {
  transform: rotateY(-180deg);
}
```

**The folded corner itself** is a CSS triangle (`border` trick or `clip-path`) with a gradient to simulate paper depth. On hover, it lifts slightly (scale + shadow increase) to invite interaction.

**State flow:**
1. User clicks corner button.
2. State: `isFlipping = true`, `targetSide = 'creative' | 'tech'`.
3. CSS transition runs on the outgoing page.
4. On `transitionend` event: navigate to target route, set `isFlipping = false`, reset transforms.
5. The incoming page appears without animation (it was "behind" the flip).

**Alternative considered:** turn.js / StPageFlip. Rejected — heavy (40KB+), jQuery-dependent or canvas-based, solve a harder problem (multi-page books). We only need a single page-turn between two states.

**Alternative considered:** Framer Motion `AnimatePresence`. Would work, but adds ~30KB for one animation. The CSS approach is zero-dependency and sufficient.

**Fallback:** If `prefers-reduced-motion` is set, skip the 3D animation entirely and do a simple crossfade (opacity transition, 300ms).

---

## 4. Styling Approach

**Decision: CSS custom properties with side-scoped variable sets, in a small number of CSS files (not CSS modules).**

Rationale:
- The current codebase uses a single CSS file with `data-theme` attribute switching. Extend this pattern rather than replacing it.
- CSS modules add file proliferation and `styles.className` boilerplate not worth it for this size.
- Tailwind rejected: would change the entire authoring model for a site that has ~500 lines of CSS total.

**Variable structure:**

```css
/* Axis 1: light/dark (existing) */
:root[data-theme="light"] { --bg: #fff; --text: #000; ... }
:root[data-theme="dark"]  { --bg: #000; --text: #fff; ... }

/* Axis 2: side-specific overrides */
:root[data-side="tech"] {
  --font-heading: 'JetBrains Mono', 'Courier New', monospace;
  --font-body: 'Inter', -apple-system, sans-serif;
  --accent: #0066ff;
  --surface: var(--bg);
  --radius: 2px;            /* sharp, techy */
}

:root[data-side="creative"] {
  --font-heading: 'Playfair Display', Georgia, serif;
  --font-body: 'Lora', Georgia, serif;
  --accent: #8B4513;        /* warm brown */
  --surface: var(--bg);
  --radius: 8px;            /* softer, organic */
}
```

The `data-side` attribute is set on `<html>` alongside `data-theme`, managed by a `useSide` hook that reads the current route prefix.

**File organization:**

```
src/styles/
  base.css          Global reset, CSS variables (both axes), body defaults
  tech.css          Styles scoped under [data-side="tech"]
  creative.css      Styles scoped under [data-side="creative"]
  shared.css        Page-turn button, theme toggle, markdown prose, gallery
  page-turn.css     All flip animation styles isolated here
```

All imported from `main.tsx` in order. No build-time CSS tooling needed.

**Fonts:**
- Tech side: JetBrains Mono (headings/nav) + Inter (body). Both available via Google Fonts or self-hosted.
- Creative side: Playfair Display (headings) + Lora (body). Both on Google Fonts.
- Load via `<link>` in `index.html` with `display=swap`. Only load the weights actually used (400, 700 max).

---

## 5. Content Management

**Decision: Markdown files in the repo, fetched at runtime, parsed client-side.**

This is a personal site. A CMS adds authentication, API keys, a deploy hook, and a runtime dependency for what amounts to 20-50 pieces of content. Markdown in the repo is simpler, version-controlled, and zero-cost.

**Blog posts and writing pieces:**

```
content/
  blog/
    2025-03-15-infrastructure-as-code.md
    2025-06-01-debugging-pipelines.md
  writing/
    the-lighthouse.md
    three-winters.md
```

Each markdown file has YAML frontmatter:

```yaml
---
title: "Infrastructure as Code: Why I Stopped Using Click-Ops"
date: 2025-03-15
tags: [devops, terraform]
description: "A short summary for the card preview."
# For writing pieces:
type: short-story
---
```

**Approach:** Store markdown files in `public/content/`, fetch them at runtime with `fetch()`, parse client-side with `marked`. Move to build-time processing if the content library grows beyond ~30 items.

**Images for creative side:**

```
public/gallery/
  paintings/
    painting-01.jpg
    painting-01-thumb.jpg
    manifest.json
  carvings/
    carving-01.jpg           (or .mp4 for video)
    carving-01-thumb.jpg
    manifest.json
  outdoors/
    outdoors-01.jpg
    outdoors-01-thumb.jpg
    manifest.json
```

Manifest example:
```json
[
  {
    "file": "painting-01.jpg",
    "thumb": "painting-01-thumb.jpg",
    "title": "Untitled, 2024",
    "medium": "iPad / Procreate",
    "type": "image"
  },
  {
    "file": "carving-01.mp4",
    "thumb": "carving-01-thumb.jpg",
    "title": "Oak relief, 2025",
    "type": "video"
  }
]
```

**LinkedIn post aggregation:** Blog posts will be grabbed from LinkedIn (content is available). Store as markdown files with `source: linkedin` frontmatter field. Render a small "Originally posted on LinkedIn" badge on those entries.

**Carvings:** May include short videos alongside or instead of photos. The gallery component needs to handle both `<img>` and `<video>` elements based on file extension in the manifest.

**Outdoors:** A collection of outdoor adventure photos. Same gallery pattern as paintings — images in `public/gallery/outdoors/` with a `manifest.json`.

---

## 6. State Management

**No state library needed.**

| State | Scope | Mechanism |
|-------|-------|-----------|
| Theme (light/dark) | Global | `useTheme` hook + `data-theme` attribute (existing) |
| Current side (tech/creative) | Global | Derived from route via `useLocation().pathname` |
| Flip animation in progress | App root | `useState<boolean>` in App component |
| Blog post list | BlogIndex page | `useState` + `useEffect` fetch |
| Gallery manifest | Gallery pages | Same fetch pattern |
| Lightbox open/selected image | Gallery pages | Local `useState` in gallery component |

No Redux, no Zustand, no context beyond theme.

---

## 7. File Structure

```
varno/
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
├── CLAUDE.md
├── content/
│   ├── blog/
│   │   └── *.md
│   └── writing/
│       └── *.md
├── public/
│   ├── gallery/
│   │   ├── paintings/
│   │   │   ├── manifest.json
│   │   │   └── *.jpg
│   │   └── carvings/
│   │       ├── manifest.json
│   │       └── *.jpg
│   ├── fonts/                  (if self-hosting)
│   ├── llm.txt
│   ├── robots.txt
│   └── sitemap.xml
├── docs/
│   └── specs/
│       └── two-sided-portfolio.md
└── src/
    ├── main.tsx
    ├── App.tsx
    ├── assets/
    │   └── profile-picture.jpeg
    ├── components/
    │   ├── shared/
    │   │   ├── PageTurnButton.tsx
    │   │   ├── ThemeToggle.tsx
    │   │   ├── MarkdownRenderer.tsx
    │   │   ├── ImageGallery.tsx
    │   │   ├── Lightbox.tsx
    │   │   └── SocialLinks.tsx
    │   ├── tech/
    │   │   ├── TechLayout.tsx
    │   │   ├── TechHeader.tsx
    │   │   ├── TechHome.tsx
    │   │   ├── MicroCv.tsx
    │   │   ├── CvPage.tsx
    │   │   ├── BlogIndex.tsx
    │   │   └── BlogPost.tsx
    │   └── creative/
    │       ├── CreativeLayout.tsx
    │       ├── CreativeHeader.tsx
    │       ├── CreativeHome.tsx
    │       ├── WritingIndex.tsx
    │       ├── WritingPiece.tsx
    │       ├── PaintingsGallery.tsx
    │       ├── CarvingsGallery.tsx
    │       └── OutdoorsGallery.tsx
    ├── hooks/
    │   ├── useTheme.ts
    │   ├── useSide.ts
    │   ├── useMarkdown.ts
    │   └── useGallery.ts
    ├── lib/
    │   └── markdown.ts
    ├── types/
    │   ├── blog.ts
    │   ├── gallery.ts
    │   └── writing.ts
    └── styles/
        ├── base.css
        ├── tech.css
        ├── creative.css
        ├── shared.css
        └── page-turn.css
```

---

## 8. New Dependencies

| Package | Size | Purpose |
|---------|------|---------|
| `react-router-dom` ^6.x | ~14 KB gzipped | Client-side routing |
| `marked` ^12.x | ~7 KB gzipped | Markdown to HTML |
| `simple-icons` ^13.x | tree-shakeable | Brand/tech logos for micro-CV (Docker, AWS, Terraform, etc.) |

**Three packages.** Write a minimal frontmatter parser (~20 lines) instead of bundling `gray-matter`.

**Rejected:** framer-motion (30KB for one animation), MDX (unnecessary), any CSS framework, any state library, any CMS.

---

## 9. Migration Path

1. **Add router without changing visuals** — existing Portfolio becomes the `/` route
2. **Split CSS file** — extract into `base.css` + `tech.css` + `shared.css`, add `data-side` logic
3. **Build tech side pages** — TechLayout, TechHeader, TechHome (refactored Portfolio), CV and Blog routes
4. **Build page-turn mechanism** — folded corner button + flip animation + minimal creative shell
5. **Build creative side** — gallery components, writing pages, populate content

---

## 10. Implementation Phases

### Phase 1 — Foundation
Router, restructured layout, tech side home with micro-CV.

### Phase 2 — Page Turn + Creative Shell
The signature page-turn interaction, creative side visual identity and landing.

### Phase 3 — Content Pages
All content pages functional: blog, CV, writing, galleries with real content.

### Phase 4 — Polish
Transitions, OG meta tags, responsive audit, performance (lazy loading, code splitting), accessibility, 404 page, favicon.

---

## Resolved Questions

1. **Hosting platform** — Currently Netlify. May move later. For now, add `public/_redirects` with `/* /index.html 200` for SPA fallback.
2. **Content readiness** — All content is available: blog posts from LinkedIn, paintings as images, carvings as short videos, stories written, outdoor adventure photos in a folder. Ready to populate.
3. **Tech icon set** — Use Simple Icons for brand logos. No custom SVGs needed.
4. **Creative side palette** — Accept warm browns/serifs as starting point. Will refine later. **Key requirement: design system must be token-based (CSS custom properties) so either side's visual style can be changed independently without touching component code.**
5. **Mobile page-turn** — A regular button (not gesture-based), just triggers the flip animation. Exact placement on mobile to be decided during implementation.

## Deferred Decisions

- Hosting platform migration (may move off Netlify later)
- Creative side exact color palette (will iterate after seeing real content)
- Mobile page-turn button placement details

---

## Appendix A — Micro-CV Timeline Data

The micro-CV on the tech home page shows year ranges with technology icons only — no job titles, no company names, no text descriptions. The visitor sees a timeline of experience hinted through icons. Source: `~/personal-docs/applications/templates/_work_history.md`.

```
2010–2013  Cisco, networking (MPLS, ASA)
2013–2019  Proxmox, ESXi, pfSense, Cisco, Active Directory, SIEM
2019–2021  Docker, GitLab CI/CD, OVH, Bash, OWASP ZAP, NestJS, Angular, PHP, Python
2021        Kubernetes, Istio, Terraform, GCP, AWS, Azure, Spring Boot, GitLab CI/CD
2022–2024  AWS (EKS, EC2, Lambda, S3, CloudFront), Terraform, Ansible, Docker, GitLab CI/CD, Python, Kubernetes, Helm
2025–       React, FastAPI, Tauri, GCP (Cloud Functions, Pub/Sub), Python
```

Icon mapping (Simple Icons slugs):
- `cisco`, `proxmox`, `vmware`, `pfsense`, `docker`, `gitlab`, `ovh`, `gnubash`
- `kubernetes`, `istio`, `terraform`, `googlecloud`, `amazonaws`, `microsoftazure`
- `springboot`, `helm`, `ansible`, `python`, `aws-lambda` (use AWS icon)
- `react`, `fastapi`, `tauri`
- `owasp` (if available, otherwise omit)

Display: vertical list, most recent on top. Each row is a year range on the left and a cluster of icons on the right. Like styled bullet points — no connecting lines, no timeline decorations. Monospace year labels. Icons at ~20px, muted color, hover to reveal icon name tooltip.

---

## Appendix B — CV Page Content Structure

The `/cv` page is a **narrative work history**, not a traditional CV. Each role gets a section with:

1. **Role + company + dates** (header)
2. **Key accomplishments** as concise bullets
3. **Stories** — expanded anecdotes that explain debugging incidents, architectural decisions, and reasoning (the long-form paragraphs from the work history)

### Roles (chronological, most recent first):

**Co-Founder — SevenSoftware** (Jan 2025–present)
- Built two products in 14 months: SaaS platform + desktop app (CucoStudio)
- Owns full technical and product roadmap

**Senior DevOps Engineer, Team Lead — Topcon Mirage Technologies** (Sep 2023–Jan 2025)
- Key bullets: cycle time reduction (2h→20min), cost reduction (8%), EKS+Karpenter runners, DRP from scratch, cross-timezone coordination
- Stories to feature:
  - CloudFront signed URL debugging (the Base64 encoding mismatch after distribution recreation)
  - Production incident post-mortem (unauthorized deployment, GitLab protected environments fix)
  - Docker image optimization (2GB coordinate file → EFS mount)

**DevOps Engineer — Topcon Mirage Technologies** (Mar 2022–Oct 2023)
- Manifest-based deployment system, self-hosted GitLab hardening

**DevOps Engineer — GSoft Innovation** (Mar 2021–Oct 2021)
- Kubernetes + Istio + TSB across three clouds, Terraform plugin collaboration

**Senior Sysadmin/DevOps — Pyxel Solutions** (Sep 2019–Mar 2021)
- On-prem to OVH migration, feedback cycle 3-4 days→1 day, DAST automation

**Senior Sysadmin — Ministry of Foreign Trade** (Sep 2013–Jul 2019)
- Full datacenter redesign (20 servers, 1200 users, ESXi→Proxmox, zero downtime)

**Earlier:** Lecturer at CUJAE (2018–2020), Intern at Datacimex (2010–2013)

### Education:
- MSc Cloud Computing — University of Valencia (2021–2022)
- Telecommunications Engineering — CUJAE, Havana (2008–2013)

### Skills summary (for reference, not displayed as a separate section):
AWS, GCP, Azure, Terraform, Ansible, Kubernetes, Docker, Istio, Helm, GitLab CI/CD, GitHub Actions, Python, Bash, React, FastAPI, ELK, Grafana, Prometheus, PCI-DSS, networking (TCP/IP, OSPF, VLAN, MPLS)
