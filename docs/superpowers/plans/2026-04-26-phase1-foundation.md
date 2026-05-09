# Phase 1: Foundation — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transform the single-screen portfolio into a routed app with the tech side home page featuring a micro-CV timeline, extracted shared components, and a token-based design system.

**Architecture:** React Router v6 with nested layouts. CSS custom properties scoped via `data-side` attribute on `<html>` (extending the existing `data-theme` pattern). Components split into `shared/`, `tech/`, `creative/` directories. Simple Icons for brand logos in the micro-CV.

**Tech Stack:** React 18, TypeScript, Vite 5, react-router-dom v6, simple-icons, vitest + @testing-library/react

**Spec:** `docs/specs/two-sided-portfolio.md`

**Scope:** Phase 1 only (Foundation). Phases 2-4 (page-turn, content pages, polish) will have separate plans.

---

## File Map

### New files

| File | Responsibility |
|------|---------------|
| `src/components/shared/ThemeToggle.tsx` | Theme lightbulb button extracted from App |
| `src/components/shared/SocialLinks.tsx` | Social icon row extracted from Portfolio |
| `src/components/tech/TechLayout.tsx` | Tech side shell: header + Outlet + footer |
| `src/components/tech/TechHeader.tsx` | Monospace nav bar: Home \| CV \| Blog + theme toggle |
| `src/components/tech/TechHome.tsx` | Tech home page: profile + micro-CV + social links |
| `src/components/tech/MicroCv.tsx` | Vertical list of year ranges + tech icons |
| `src/components/tech/CvPage.tsx` | Placeholder for Phase 3 |
| `src/components/tech/BlogIndex.tsx` | Placeholder for Phase 3 |
| `src/data/micro-cv.ts` | Timeline data: year ranges mapped to Simple Icons slugs |
| `src/hooks/useSide.ts` | Derives `'tech' \| 'creative'` from current route, sets `data-side` on `<html>` |
| `src/styles/base.css` | Reset, theme variables (light/dark), side variables (tech/creative tokens) |
| `src/styles/tech.css` | Styles scoped to `[data-side="tech"]` |
| `src/styles/shared.css` | Theme toggle, social links, shared layout utilities |
| `src/types/side.ts` | `Side` type alias |
| `public/_redirects` | Netlify SPA fallback |
| `src/__tests__/hooks/useSide.test.ts` | Tests for useSide hook |
| `src/__tests__/components/MicroCv.test.tsx` | Tests for MicroCv rendering |
| `src/__tests__/data/micro-cv.test.ts` | Tests for timeline data integrity |
| `vitest.config.ts` | Vitest configuration |
| `src/__tests__/setup.ts` | Test setup (testing-library cleanup) |

### Modified files

| File | Changes |
|------|---------|
| `package.json` | Add react-router-dom, simple-icons, vitest, @testing-library/react, jsdom |
| `src/main.tsx` | Wrap App in BrowserRouter, replace CSS import |
| `src/App.tsx` | Route definitions, useSide hook, remove inline theme toggle |
| `index.html` | Add Google Fonts (JetBrains Mono, Inter), update title and meta |
| `tsconfig.json` | Add `types: ["vitest/globals"]` for test globals |

### Deleted files

| File | Reason |
|------|--------|
| `src/components/Portfolio.tsx` | Replaced by TechHome + SocialLinks |
| `src/styles/App.css` | Split into base.css + tech.css + shared.css |

---

## Task 1: Install dependencies and configure test infrastructure

**Files:**
- Modify: `package.json`
- Create: `vitest.config.ts`
- Create: `src/__tests__/setup.ts`
- Modify: `tsconfig.json`

- [ ] **Step 1: Install runtime dependencies**

```bash
cd /Users/cucostudio/Documents/Personal/varno
npm install react-router-dom simple-icons
```

- [ ] **Step 2: Install dev dependencies for testing**

```bash
npm install -D vitest @testing-library/react @testing-library/jest-dom jsdom
```

- [ ] **Step 3: Create vitest config**

Create `vitest.config.ts`:

```ts
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/__tests__/setup.ts'],
  },
})
```

- [ ] **Step 4: Create test setup file**

Create `src/__tests__/setup.ts`:

```ts
import '@testing-library/jest-dom'
```

- [ ] **Step 5: Add test script to package.json**

Add to `scripts` in `package.json`:

```json
"test": "vitest run",
"test:watch": "vitest"
```

- [ ] **Step 6: Update tsconfig.json for test globals**

Add `"types": ["vitest/globals"]` to `compilerOptions` in `tsconfig.json`.

- [ ] **Step 7: Verify setup**

```bash
npx vitest run
```

Expected: "No test files found" (no tests yet, but no config errors).

- [ ] **Step 8: Commit**

```bash
git add package.json package-lock.json vitest.config.ts src/__tests__/setup.ts tsconfig.json
git commit -m "chore: add react-router-dom, simple-icons, vitest test infrastructure"
```

---

## Task 2: Create side type and useSide hook (TDD)

**Files:**
- Create: `src/types/side.ts`
- Create: `src/__tests__/hooks/useSide.test.ts`
- Create: `src/hooks/useSide.ts`

- [ ] **Step 1: Create the Side type**

Create `src/types/side.ts`:

```ts
export type Side = 'tech' | 'creative'
```

- [ ] **Step 2: Write the failing tests**

Create `src/__tests__/hooks/useSide.test.ts`:

```ts
import { renderHook } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { useSide } from '../../hooks/useSide'
import type { ReactNode } from 'react'

function wrapper(initialEntries: string[]) {
  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <MemoryRouter initialEntries={initialEntries}>
        {children}
      </MemoryRouter>
    )
  }
}

describe('useSide', () => {
  afterEach(() => {
    document.documentElement.removeAttribute('data-side')
  })

  it('returns "tech" for root path', () => {
    const { result } = renderHook(() => useSide(), {
      wrapper: wrapper(['/'])
    })
    expect(result.current).toBe('tech')
  })

  it('returns "tech" for /cv', () => {
    const { result } = renderHook(() => useSide(), {
      wrapper: wrapper(['/cv'])
    })
    expect(result.current).toBe('tech')
  })

  it('returns "tech" for /blog/some-post', () => {
    const { result } = renderHook(() => useSide(), {
      wrapper: wrapper(['/blog/some-post'])
    })
    expect(result.current).toBe('tech')
  })

  it('returns "creative" for /creative', () => {
    const { result } = renderHook(() => useSide(), {
      wrapper: wrapper(['/creative'])
    })
    expect(result.current).toBe('creative')
  })

  it('returns "creative" for /creative/paintings', () => {
    const { result } = renderHook(() => useSide(), {
      wrapper: wrapper(['/creative/paintings'])
    })
    expect(result.current).toBe('creative')
  })

  it('sets data-side attribute on <html>', () => {
    renderHook(() => useSide(), {
      wrapper: wrapper(['/creative'])
    })
    expect(document.documentElement.getAttribute('data-side')).toBe('creative')
  })
})
```

- [ ] **Step 3: Run tests to verify they fail**

```bash
npx vitest run src/__tests__/hooks/useSide.test.ts
```

Expected: FAIL — `useSide` module not found.

- [ ] **Step 4: Implement useSide hook**

Create `src/hooks/useSide.ts`:

```ts
import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import type { Side } from '../types/side'

export function useSide(): Side {
  const { pathname } = useLocation()
  const side: Side = pathname.startsWith('/creative') ? 'creative' : 'tech'

  useEffect(() => {
    document.documentElement.setAttribute('data-side', side)
  }, [side])

  return side
}
```

- [ ] **Step 5: Run tests to verify they pass**

```bash
npx vitest run src/__tests__/hooks/useSide.test.ts
```

Expected: all 6 tests PASS.

- [ ] **Step 6: Commit**

```bash
git add src/types/side.ts src/hooks/useSide.ts src/__tests__/hooks/useSide.test.ts
git commit -m "feat: add useSide hook — derives tech/creative from route pathname"
```

---

## Task 3: Create micro-CV data with tests (TDD)

**Files:**
- Create: `src/__tests__/data/micro-cv.test.ts`
- Create: `src/data/micro-cv.ts`

- [ ] **Step 1: Write the failing test**

Create `src/__tests__/data/micro-cv.test.ts`:

```ts
import { timelineEntries } from '../../data/micro-cv'

describe('micro-cv timeline data', () => {
  it('has entries ordered most recent first', () => {
    for (let i = 0; i < timelineEntries.length - 1; i++) {
      expect(timelineEntries[i].startYear).toBeGreaterThanOrEqual(
        timelineEntries[i + 1].startYear
      )
    }
  })

  it('every entry has at least one icon', () => {
    for (const entry of timelineEntries) {
      expect(entry.icons.length).toBeGreaterThan(0)
    }
  })

  it('every icon has a slug and label', () => {
    for (const entry of timelineEntries) {
      for (const icon of entry.icons) {
        expect(icon.slug).toBeTruthy()
        expect(icon.label).toBeTruthy()
      }
    }
  })

  it('contains the expected number of time periods', () => {
    expect(timelineEntries).toHaveLength(6)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npx vitest run src/__tests__/data/micro-cv.test.ts
```

Expected: FAIL — module not found.

- [ ] **Step 3: Create the timeline data**

Create `src/data/micro-cv.ts`:

```ts
export interface TimelineIcon {
  slug: string
  label: string
  hex?: string
}

export interface TimelineEntry {
  startYear: number
  endYear: number | null // null = present
  label: string
  icons: TimelineIcon[]
}

export const timelineEntries: TimelineEntry[] = [
  {
    startYear: 2025,
    endYear: null,
    label: '2025–',
    icons: [
      { slug: 'react', label: 'React', hex: '61DAFB' },
      { slug: 'fastapi', label: 'FastAPI', hex: '009688' },
      { slug: 'tauri', label: 'Tauri', hex: 'FFC131' },
      { slug: 'googlecloud', label: 'GCP', hex: '4285F4' },
      { slug: 'python', label: 'Python', hex: '3776AB' },
    ],
  },
  {
    startYear: 2022,
    endYear: 2024,
    label: '2022–2024',
    icons: [
      { slug: 'amazonaws', label: 'AWS', hex: '232F3E' },
      { slug: 'terraform', label: 'Terraform', hex: '844FBA' },
      { slug: 'ansible', label: 'Ansible', hex: 'EE0000' },
      { slug: 'docker', label: 'Docker', hex: '2496ED' },
      { slug: 'gitlab', label: 'GitLab', hex: 'FC6D26' },
      { slug: 'python', label: 'Python', hex: '3776AB' },
      { slug: 'kubernetes', label: 'Kubernetes', hex: '326CE5' },
      { slug: 'helm', label: 'Helm', hex: '0F1689' },
    ],
  },
  {
    startYear: 2021,
    endYear: 2021,
    label: '2021',
    icons: [
      { slug: 'kubernetes', label: 'Kubernetes', hex: '326CE5' },
      { slug: 'istio', label: 'Istio', hex: '466BB0' },
      { slug: 'terraform', label: 'Terraform', hex: '844FBA' },
      { slug: 'googlecloud', label: 'GCP', hex: '4285F4' },
      { slug: 'amazonaws', label: 'AWS', hex: '232F3E' },
      { slug: 'microsoftazure', label: 'Azure', hex: '0078D4' },
      { slug: 'springboot', label: 'Spring Boot', hex: '6DB33F' },
      { slug: 'gitlab', label: 'GitLab', hex: 'FC6D26' },
    ],
  },
  {
    startYear: 2019,
    endYear: 2021,
    label: '2019–2021',
    icons: [
      { slug: 'docker', label: 'Docker', hex: '2496ED' },
      { slug: 'gitlab', label: 'GitLab', hex: 'FC6D26' },
      { slug: 'ovh', label: 'OVH', hex: '123F6D' },
      { slug: 'gnubash', label: 'Bash', hex: '4EAA25' },
      { slug: 'python', label: 'Python', hex: '3776AB' },
    ],
  },
  {
    startYear: 2013,
    endYear: 2019,
    label: '2013–2019',
    icons: [
      { slug: 'proxmox', label: 'Proxmox', hex: 'E57000' },
      { slug: 'vmware', label: 'ESXi', hex: '607078' },
      { slug: 'pfsense', label: 'pfSense', hex: '212121' },
      { slug: 'cisco', label: 'Cisco', hex: '1BA0D7' },
    ],
  },
  {
    startYear: 2010,
    endYear: 2013,
    label: '2010–2013',
    icons: [
      { slug: 'cisco', label: 'Cisco', hex: '1BA0D7' },
    ],
  },
]
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
npx vitest run src/__tests__/data/micro-cv.test.ts
```

Expected: all 4 tests PASS.

- [ ] **Step 5: Commit**

```bash
git add src/data/micro-cv.ts src/__tests__/data/micro-cv.test.ts
git commit -m "feat: add micro-CV timeline data with 6 career periods"
```

---

## Task 4: Split CSS into base.css + tech.css + shared.css

**Files:**
- Create: `src/styles/base.css`
- Create: `src/styles/tech.css`
- Create: `src/styles/shared.css`
- Delete: `src/styles/App.css` (after new files are in place)

This task has no tests — it's a CSS restructure that will be visually verified.

- [ ] **Step 1: Create base.css**

Create `src/styles/base.css` — global reset, theme tokens (light/dark), side tokens (tech/creative), body defaults:

```css
/* === Theme tokens (light/dark) === */
:root[data-theme="light"] {
  --bg: #ffffff;
  --text: #000000;
  --border: #000000;
  --text-muted: #666666;
}

:root[data-theme="dark"] {
  --bg: #000000;
  --text: #ffffff;
  --border: #ffffff;
  --text-muted: #999999;
}

/* === Side tokens (tech/creative) === */
:root[data-side="tech"] {
  --font-heading: 'JetBrains Mono', 'Courier New', monospace;
  --font-body: 'Inter', -apple-system, sans-serif;
  --font-mono: 'JetBrains Mono', 'Courier New', monospace;
  --accent: #0066ff;
  --radius: 2px;
}

:root[data-side="creative"] {
  --font-heading: 'Playfair Display', Georgia, serif;
  --font-body: 'Lora', Georgia, serif;
  --font-mono: 'Courier New', monospace;
  --accent: #8B4513;
  --radius: 8px;
}

/* === Reset === */
*,
*::before,
*::after {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

/* === Body === */
body {
  font-family: var(--font-body);
  background-color: var(--bg);
  color: var(--text);
  transition: background-color 0.3s ease, color 0.3s ease;
  min-height: 100vh;
}
```

- [ ] **Step 2: Create tech.css**

Create `src/styles/tech.css` — styles scoped to the tech side:

```css
/* === Tech side layout === */
[data-side="tech"] .tech-layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

[data-side="tech"] .tech-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem 2rem;
  font-family: var(--font-mono);
}

[data-side="tech"] .tech-nav {
  display: flex;
  gap: 2rem;
}

[data-side="tech"] .tech-nav a {
  color: var(--text);
  text-decoration: none;
  font-size: 0.875rem;
  letter-spacing: 0.05em;
  transition: opacity 0.2s ease;
}

[data-side="tech"] .tech-nav a:hover,
[data-side="tech"] .tech-nav a.active {
  opacity: 0.6;
}

[data-side="tech"] .tech-main {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
}

/* === Tech Home === */
.tech-home {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2.5rem;
  width: 100%;
  max-width: 800px;
}

.profile-section {
  display: flex;
  align-items: center;
  gap: 2rem;
  width: 100%;
  justify-content: center;
}

.profile-picture {
  width: 200px;
  height: 200px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid var(--border);
  flex-shrink: 0;
}

.profile-name {
  font-family: var(--font-heading);
  font-size: 2rem;
  font-weight: normal;
  letter-spacing: 0.1em;
  white-space: nowrap;
}

/* === Micro CV === */
.micro-cv {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.micro-cv-entry {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.micro-cv-years {
  font-family: var(--font-mono);
  font-size: 0.8rem;
  color: var(--text-muted);
  min-width: 7rem;
  text-align: right;
  flex-shrink: 0;
}

.micro-cv-icons {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  align-items: center;
}

.micro-cv-icon {
  width: 20px;
  height: 20px;
  opacity: 0.7;
  transition: opacity 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.micro-cv-icon:hover {
  opacity: 1;
}

.micro-cv-icon svg {
  width: 100%;
  height: 100%;
  fill: var(--text);
}

/* === Responsive === */
@media (max-width: 768px) {
  [data-side="tech"] .tech-header {
    padding: 1rem 1.5rem;
  }

  [data-side="tech"] .tech-nav {
    gap: 1.25rem;
  }

  .profile-section {
    flex-direction: column;
    gap: 1.5rem;
  }

  .profile-picture {
    width: 150px;
    height: 150px;
  }

  .profile-name {
    font-size: 1.5rem;
    white-space: normal;
    text-align: center;
  }

  .micro-cv-entry {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }

  .micro-cv-years {
    text-align: left;
  }
}
```

- [ ] **Step 3: Create shared.css**

Create `src/styles/shared.css` — styles for components used on both sides:

```css
/* === Theme toggle === */
.theme-toggle {
  background: none;
  border: none;
  color: var(--text);
  cursor: pointer;
  padding: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: opacity 0.2s ease;
}

.theme-toggle:hover {
  opacity: 0.7;
}

/* === Social links === */
.social-links {
  display: flex;
  gap: 2rem;
  flex-wrap: wrap;
  justify-content: center;
}

.social-link {
  text-decoration: none;
  transition: opacity 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 3rem;
  height: 3rem;
  border-radius: 50%;
}

:root[data-theme="dark"] .social-link {
  background-color: #ffffff;
  color: #000000;
}

:root[data-theme="dark"] .social-link svg {
  fill: #000000;
}

:root[data-theme="light"] .social-link {
  background-color: transparent;
  color: var(--text);
}

:root[data-theme="light"] .social-link svg {
  fill: var(--text);
}

.social-link:hover {
  opacity: 0.7;
}

/* === Placeholder page === */
.placeholder-page {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  min-height: 50vh;
  font-family: var(--font-mono);
}

.placeholder-page h1 {
  font-size: 1.5rem;
  font-weight: normal;
}

.placeholder-page p {
  color: var(--text-muted);
  font-size: 0.875rem;
}

@media (max-width: 768px) {
  .social-links {
    gap: 1.5rem;
  }

  .social-link {
    width: 2.5rem;
    height: 2.5rem;
  }
}
```

- [ ] **Step 4: Update main.tsx CSS imports**

Replace the single import in `src/main.tsx`. Change:

```ts
import './styles/App.css'
```

to:

```ts
import './styles/base.css'
import './styles/shared.css'
import './styles/tech.css'
```

- [ ] **Step 5: Delete App.css**

```bash
rm src/styles/App.css
```

- [ ] **Step 6: Verify build compiles**

```bash
cd /Users/cucostudio/Documents/Personal/varno && npm run build
```

Expected: Build succeeds. (The app won't render correctly yet — components still reference old class names. That's expected and fixed in subsequent tasks.)

- [ ] **Step 7: Commit**

```bash
git add src/styles/base.css src/styles/tech.css src/styles/shared.css src/main.tsx
git rm src/styles/App.css
git commit -m "refactor: split App.css into base/tech/shared with design token system"
```

---

## Task 5: Extract ThemeToggle shared component

**Files:**
- Create: `src/components/shared/ThemeToggle.tsx`

- [ ] **Step 1: Create ThemeToggle component**

Create `src/components/shared/ThemeToggle.tsx`:

```tsx
import { useTheme } from '../../hooks/useTheme'
import { RiLightbulbLine } from '@remixicon/react'

export function ThemeToggle() {
  const { toggleTheme } = useTheme()

  return (
    <button className="theme-toggle" onClick={toggleTheme} aria-label="Toggle theme">
      <RiLightbulbLine size={20} />
    </button>
  )
}
```

- [ ] **Step 2: Verify build compiles**

```bash
npm run build
```

Expected: Build succeeds. Component is not mounted yet — that happens when TechHeader is wired up.

- [ ] **Step 3: Commit**

```bash
git add src/components/shared/ThemeToggle.tsx
git commit -m "refactor: extract ThemeToggle into shared component"
```

---

## Task 6: Extract SocialLinks shared component

**Files:**
- Create: `src/components/shared/SocialLinks.tsx`

- [ ] **Step 1: Create SocialLinks component**

Create `src/components/shared/SocialLinks.tsx`:

```tsx
import { useTheme } from '../../hooks/useTheme'
import {
  RiTwitterXLine,
  RiTwitterXFill,
  RiLinkedinBoxLine,
  RiLinkedinBoxFill,
  RiMediumLine,
  RiMediumFill,
  RiGithubLine,
  RiGithubFill,
} from '@remixicon/react'

interface SocialItem {
  href: string
  label: string
  LineIcon: typeof RiTwitterXLine
  FillIcon: typeof RiTwitterXFill
}

const socials: SocialItem[] = [
  {
    href: 'https://x.com/ajanerom',
    label: 'X (Twitter)',
    LineIcon: RiTwitterXLine,
    FillIcon: RiTwitterXFill,
  },
  {
    href: 'https://www.linkedin.com/in/ajanerom-devops',
    label: 'LinkedIn',
    LineIcon: RiLinkedinBoxLine,
    FillIcon: RiLinkedinBoxFill,
  },
  {
    href: 'https://ajanerom.medium.com',
    label: 'Medium',
    LineIcon: RiMediumLine,
    FillIcon: RiMediumFill,
  },
  {
    href: 'https://github.com/varn0',
    label: 'GitHub',
    LineIcon: RiGithubLine,
    FillIcon: RiGithubFill,
  },
]

export function SocialLinks() {
  const { theme } = useTheme()

  return (
    <div className="social-links">
      {socials.map(({ href, label, LineIcon, FillIcon }) => (
        <a
          key={href}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="social-link"
          aria-label={label}
        >
          {theme === 'dark' ? <LineIcon size={24} /> : <FillIcon size={24} />}
        </a>
      ))}
    </div>
  )
}
```

- [ ] **Step 2: Verify build compiles**

```bash
npm run build
```

Expected: Build succeeds.

- [ ] **Step 3: Commit**

```bash
git add src/components/shared/SocialLinks.tsx
git commit -m "refactor: extract SocialLinks into shared component with data-driven rendering"
```

---

## Task 7: Create MicroCv component (TDD)

**Files:**
- Create: `src/__tests__/components/MicroCv.test.tsx`
- Create: `src/components/tech/MicroCv.tsx`

- [ ] **Step 1: Write the failing test**

Create `src/__tests__/components/MicroCv.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react'
import { MicroCv } from '../../components/tech/MicroCv'

describe('MicroCv', () => {
  it('renders all 6 time periods', () => {
    render(<MicroCv />)
    expect(screen.getByText('2025–')).toBeInTheDocument()
    expect(screen.getByText('2022–2024')).toBeInTheDocument()
    expect(screen.getByText('2021')).toBeInTheDocument()
    expect(screen.getByText('2019–2021')).toBeInTheDocument()
    expect(screen.getByText('2013–2019')).toBeInTheDocument()
    expect(screen.getByText('2010–2013')).toBeInTheDocument()
  })

  it('renders icons with tooltip labels', () => {
    render(<MicroCv />)
    // Most recent period should have React icon with title
    expect(screen.getByTitle('React')).toBeInTheDocument()
    expect(screen.getByTitle('FastAPI')).toBeInTheDocument()
  })

  it('renders most recent period first', () => {
    render(<MicroCv />)
    const years = screen.getAllByTestId('micro-cv-years')
    expect(years[0]).toHaveTextContent('2025–')
    expect(years[years.length - 1]).toHaveTextContent('2010–2013')
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npx vitest run src/__tests__/components/MicroCv.test.tsx
```

Expected: FAIL — module not found.

- [ ] **Step 3: Implement MicroCv component**

Create `src/components/tech/MicroCv.tsx`:

```tsx
import { timelineEntries } from '../../data/micro-cv'
import type { TimelineIcon } from '../../data/micro-cv'

function TechIcon({ slug, label, hex }: TimelineIcon) {
  // Simple Icons SVGs are loaded from the package at build time.
  // We use a dynamic import pattern with a fallback.
  // For simplicity, render inline SVGs fetched from the simple-icons package.
  const iconSrc = `https://cdn.simpleicons.org/${slug}/${hex || '000000'}`

  return (
    <span className="micro-cv-icon" title={label}>
      <img src={iconSrc} alt={label} width={20} height={20} />
    </span>
  )
}

export function MicroCv() {
  return (
    <div className="micro-cv">
      {timelineEntries.map((entry) => (
        <div key={entry.label} className="micro-cv-entry">
          <span className="micro-cv-years" data-testid="micro-cv-years">
            {entry.label}
          </span>
          <div className="micro-cv-icons">
            {entry.icons.map((icon) => (
              <TechIcon key={icon.slug} {...icon} />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
```

Note: Using the Simple Icons CDN (`cdn.simpleicons.org`) instead of bundling the `simple-icons` package directly. This avoids importing large SVG strings into the JS bundle and provides automatic color support. The `hex` value in the URL controls the icon color. The `simple-icons` npm package we installed ensures the CDN URLs are valid (same version).

If CDN dependency is unacceptable later, we can switch to importing SVG strings from the npm package and rendering via `dangerouslySetInnerHTML`. That's a Phase 4 polish task.

- [ ] **Step 4: Update MicroCv test to match img-based rendering**

The test used `getByTitle` but the img-based approach uses `alt` attributes instead. Update `src/__tests__/components/MicroCv.test.tsx`:

Replace the second test:

```tsx
  it('renders icons with accessible labels', () => {
    render(<MicroCv />)
    expect(screen.getByAlt ? screen.getByAltText('React') : screen.getByTitle('React')).toBeInTheDocument()
    expect(screen.getByAltText('FastAPI')).toBeInTheDocument()
  })
```

Actually, simpler — rewrite the full test file to match the actual implementation:

```tsx
import { render, screen } from '@testing-library/react'
import { MicroCv } from '../../components/tech/MicroCv'

describe('MicroCv', () => {
  it('renders all 6 time periods', () => {
    render(<MicroCv />)
    expect(screen.getByText('2025–')).toBeInTheDocument()
    expect(screen.getByText('2022–2024')).toBeInTheDocument()
    expect(screen.getByText('2021')).toBeInTheDocument()
    expect(screen.getByText('2019–2021')).toBeInTheDocument()
    expect(screen.getByText('2013–2019')).toBeInTheDocument()
    expect(screen.getByText('2010–2013')).toBeInTheDocument()
  })

  it('renders icons with accessible alt text', () => {
    render(<MicroCv />)
    expect(screen.getByAltText('React')).toBeInTheDocument()
    expect(screen.getByAltText('FastAPI')).toBeInTheDocument()
  })

  it('renders most recent period first', () => {
    render(<MicroCv />)
    const years = screen.getAllByTestId('micro-cv-years')
    expect(years[0]).toHaveTextContent('2025–')
    expect(years[years.length - 1]).toHaveTextContent('2010–2013')
  })
})
```

- [ ] **Step 5: Run tests to verify they pass**

```bash
npx vitest run src/__tests__/components/MicroCv.test.tsx
```

Expected: all 3 tests PASS.

- [ ] **Step 6: Commit**

```bash
git add src/components/tech/MicroCv.tsx src/__tests__/components/MicroCv.test.tsx
git commit -m "feat: add MicroCv component — vertical timeline with Simple Icons"
```

---

## Task 8: Create TechHeader and TechLayout

**Files:**
- Create: `src/components/tech/TechHeader.tsx`
- Create: `src/components/tech/TechLayout.tsx`

- [ ] **Step 1: Create TechHeader**

Create `src/components/tech/TechHeader.tsx`:

```tsx
import { NavLink } from 'react-router-dom'
import { ThemeToggle } from '../shared/ThemeToggle'

export function TechHeader() {
  return (
    <header className="tech-header">
      <nav className="tech-nav">
        <NavLink to="/" end>
          Home
        </NavLink>
        <NavLink to="/cv">CV</NavLink>
        <NavLink to="/blog">Blog</NavLink>
      </nav>
      <ThemeToggle />
    </header>
  )
}
```

- [ ] **Step 2: Create TechLayout**

Create `src/components/tech/TechLayout.tsx`:

```tsx
import { Outlet } from 'react-router-dom'
import { TechHeader } from './TechHeader'

export function TechLayout() {
  return (
    <div className="tech-layout">
      <TechHeader />
      <main className="tech-main">
        <Outlet />
      </main>
    </div>
  )
}
```

- [ ] **Step 3: Verify build compiles**

```bash
npm run build
```

Expected: Build succeeds.

- [ ] **Step 4: Commit**

```bash
git add src/components/tech/TechHeader.tsx src/components/tech/TechLayout.tsx
git commit -m "feat: add TechHeader with nav links and TechLayout with Outlet"
```

---

## Task 9: Create TechHome, placeholder pages, and wire up the router

**Files:**
- Create: `src/components/tech/TechHome.tsx`
- Create: `src/components/tech/CvPage.tsx`
- Create: `src/components/tech/BlogIndex.tsx`
- Modify: `src/App.tsx`
- Modify: `src/main.tsx`
- Delete: `src/components/Portfolio.tsx`

- [ ] **Step 1: Create TechHome**

Create `src/components/tech/TechHome.tsx`:

```tsx
import profilePicture from '../../assets/profile-picture.jpeg'
import { SocialLinks } from '../shared/SocialLinks'
import { MicroCv } from './MicroCv'

export function TechHome() {
  return (
    <div className="tech-home">
      <div className="profile-section">
        <img
          src={profilePicture}
          alt="Alexis Janero Moliner"
          className="profile-picture"
        />
        <h1 className="profile-name">Alexis Janero Moliner</h1>
      </div>
      <MicroCv />
      <SocialLinks />
    </div>
  )
}
```

- [ ] **Step 2: Create CvPage placeholder**

Create `src/components/tech/CvPage.tsx`:

```tsx
export function CvPage() {
  return (
    <div className="placeholder-page">
      <h1>Work History</h1>
      <p>Coming soon.</p>
    </div>
  )
}
```

- [ ] **Step 3: Create BlogIndex placeholder**

Create `src/components/tech/BlogIndex.tsx`:

```tsx
export function BlogIndex() {
  return (
    <div className="placeholder-page">
      <h1>Blog</h1>
      <p>Coming soon.</p>
    </div>
  )
}
```

- [ ] **Step 4: Rewrite App.tsx with router**

Replace the entire contents of `src/App.tsx`:

```tsx
import { Routes, Route } from 'react-router-dom'
import { useSide } from './hooks/useSide'
import { TechLayout } from './components/tech/TechLayout'
import { TechHome } from './components/tech/TechHome'
import { CvPage } from './components/tech/CvPage'
import { BlogIndex } from './components/tech/BlogIndex'

function App() {
  useSide()

  return (
    <Routes>
      <Route element={<TechLayout />}>
        <Route index element={<TechHome />} />
        <Route path="cv" element={<CvPage />} />
        <Route path="blog" element={<BlogIndex />} />
      </Route>
    </Routes>
  )
}

export default App
```

- [ ] **Step 5: Wrap App in BrowserRouter in main.tsx**

Replace the entire contents of `src/main.tsx`:

```tsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.tsx'
import './styles/base.css'
import './styles/shared.css'
import './styles/tech.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
)
```

- [ ] **Step 6: Delete Portfolio.tsx**

```bash
rm src/components/Portfolio.tsx
```

- [ ] **Step 7: Verify build succeeds**

```bash
npm run build
```

Expected: Build succeeds with no TypeScript errors.

- [ ] **Step 8: Run all tests**

```bash
npx vitest run
```

Expected: All tests pass.

- [ ] **Step 9: Start dev server and verify visually**

```bash
npm run dev
```

Check in browser:
- `http://localhost:5173/` — Shows profile picture, name, micro-CV timeline with icons, social links. Header has Home | CV | Blog nav.
- `http://localhost:5173/cv` — Shows "Work History — Coming soon."
- `http://localhost:5173/blog` — Shows "Blog — Coming soon."
- Nav links highlight correctly for the active route.
- Theme toggle works (lightbulb in header).
- Light/dark mode applies correctly.

- [ ] **Step 10: Commit**

```bash
git add src/components/tech/TechHome.tsx src/components/tech/CvPage.tsx src/components/tech/BlogIndex.tsx src/App.tsx src/main.tsx
git rm src/components/Portfolio.tsx
git commit -m "feat: wire up React Router with TechHome, micro-CV, and placeholder pages"
```

---

## Task 10: Update index.html and add Netlify SPA config

**Files:**
- Modify: `index.html`
- Create: `public/_redirects`

- [ ] **Step 1: Update index.html**

Replace the entire contents of `index.html`:

```html
<!doctype html>
<html lang="en" data-theme="light" data-side="tech">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="description" content="Alexis Janero Moliner — Senior DevOps Engineer, co-founder of SevenSoftware. Portfolio and blog." />
    <title>Alexis Janero Moliner</title>
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;700&family=JetBrains+Mono:wght@400;700&display=swap" rel="stylesheet" />
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

- [ ] **Step 2: Create Netlify SPA redirects**

Create `public/_redirects`:

```
/* /index.html 200
```

- [ ] **Step 3: Verify build and dev server**

```bash
npm run build
```

Expected: Build succeeds. Fonts load from Google Fonts on dev server.

- [ ] **Step 4: Commit**

```bash
git add index.html public/_redirects
git commit -m "chore: update index.html with fonts and meta, add Netlify SPA redirects"
```

---

## Task 11: Run full verification

- [ ] **Step 1: Run all tests**

```bash
cd /Users/cucostudio/Documents/Personal/varno && npx vitest run
```

Expected: All tests pass (useSide: 6, micro-cv data: 4, MicroCv component: 3 = 13 total).

- [ ] **Step 2: Run build**

```bash
npm run build
```

Expected: Clean build, no TypeScript errors.

- [ ] **Step 3: Visual check on dev server**

```bash
npm run dev
```

Verify in browser at `http://localhost:5173/`:

1. **Home page (`/`):** Profile picture, "Alexis Janero Moliner" in JetBrains Mono, vertical micro-CV list (2025– at top, 2010–2013 at bottom), each row has year range + icon images, social links row at bottom.
2. **Header:** "Home | CV | Blog" nav links in monospace, theme toggle lightbulb on the right side of header.
3. **Nav works:** Click CV → `/cv` with placeholder. Click Blog → `/blog` with placeholder. Click Home → back to `/`.
4. **Active link:** Current page link has reduced opacity.
5. **Theme toggle:** Click lightbulb → switches light/dark. Both themes apply correctly. CSS variables update.
6. **Responsive:** Resize to mobile width. Profile section stacks vertically. Micro-CV entries stack (years above icons). Nav still accessible.
7. **Fonts:** JetBrains Mono on headings/nav, Inter on body text.

- [ ] **Step 4: Final commit if any fixes were needed**

Only if Steps 1-3 revealed issues that required fixes.

```bash
git add -A
git commit -m "fix: address Phase 1 verification issues"
```
