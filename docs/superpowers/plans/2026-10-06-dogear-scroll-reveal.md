# Dog-ear Scroll-to-Bottom Reveal Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reveal the dog-ear navigation corner only when the reader scrolls to the bottom of a page, and anchor it to the content column's right edge instead of the viewport edge.

**Architecture:** A new `useAtBottom` hook uses an `IntersectionObserver` on a zero-height sentinel rendered at the end of each page; the observed boolean drives a `visible` prop on `DogEar`, which toggles a `.dogear--hidden` class. CSS anchors the dog-ear's right edge to a shared `--content-max` (800px) column width and fades it in/out with a delayed `visibility` transition.

**Tech Stack:** Vite + React 18 + TypeScript, React Router 7, Vitest + @testing-library/react.

**Spec:** `docs/superpowers/specs/2026-10-06-dogear-scroll-reveal-design.md`

---

## File Structure

- **Create** `src/hooks/useAtBottom.ts` — the IntersectionObserver hook (callback ref + `atBottom` boolean).
- **Create** `src/__tests__/hooks/useAtBottom.test.tsx` — hook unit tests.
- **Create** `src/__tests__/components/TechLayout.test.tsx` — layout wiring test.
- **Modify** `src/__tests__/setup.ts` — add a no-op global `IntersectionObserver` mock so components that render the hook don't crash under jsdom.
- **Modify** `src/components/shared/DogEar.tsx` — add required `visible: boolean` prop → `.dogear--hidden` class.
- **Modify** `src/__tests__/components/DogEar.test.tsx` — pass the new prop; assert class toggling.
- **Modify** `src/components/tech/TechLayout.tsx` — call hook, render sentinel, pass `visible`.
- **Modify** `src/components/tech/ReadingPage.tsx` — call hook, render sentinel, pass `visible`.
- **Modify** `src/__tests__/components/ReadingPage.test.tsx` — assert the sentinel is present (existing tests keep passing).
- **Modify** `src/styles/base.css` — define `--content-max: 800px` on `:root[data-side="tech"]`.
- **Modify** `src/styles/tech.css` — dog-ear horizontal anchoring, hidden-state fade, sentinel rule, reduced-motion.

---

## Task 1: Add a global IntersectionObserver mock to the test harness

jsdom has no `IntersectionObserver`. Without a mock, any component test that renders the `useAtBottom` hook (e.g. `ReadingPage.test.tsx`) throws. This no-op mock makes all tests safe; the dedicated hook test (Task 2) installs its own instrumented mock on top.

**Files:**
- Modify: `src/__tests__/setup.ts`

- [ ] **Step 1: Replace the contents of `setup.ts` with the mock**

```ts
import '@testing-library/jest-dom'
import { vi } from 'vitest'

// jsdom has no IntersectionObserver. Provide a no-op global so components that
// render useAtBottom don't crash. Tests that need to drive intersection
// callbacks install their own instrumented mock (see useAtBottom.test.tsx).
class NoopIntersectionObserver {
  observe = vi.fn()
  unobserve = vi.fn()
  disconnect = vi.fn()
  takeRecords = vi.fn(() => [])
  root = null
  rootMargin = ''
  thresholds = []
}

vi.stubGlobal('IntersectionObserver', NoopIntersectionObserver)
```

- [ ] **Step 2: Run the existing suite to confirm nothing breaks**

Run: `npm test`
Expected: PASS — same test count as before (the mock is inert; no component uses the hook yet).

- [ ] **Step 3: Commit**

```bash
git add src/__tests__/setup.ts
git commit -m "test: add no-op IntersectionObserver mock to jsdom setup"
```

---

## Task 2: `useAtBottom` hook

**Files:**
- Create: `src/hooks/useAtBottom.ts`
- Test: `src/__tests__/hooks/useAtBottom.test.tsx`

- [ ] **Step 1: Write the failing test**

Create `src/__tests__/hooks/useAtBottom.test.tsx`:

```tsx
import { renderHook, act } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useAtBottom } from '../../hooks/useAtBottom'

type IOCallback = (entries: Array<{ isIntersecting: boolean }>) => void

// Instrumented mock: records each created instance so the test can fire
// the callback and assert disconnect().
let instances: Array<{
  callback: IOCallback
  observe: ReturnType<typeof vi.fn>
  disconnect: ReturnType<typeof vi.fn>
  trigger: (isIntersecting: boolean) => void
}>

beforeEach(() => {
  instances = []
  class MockIO {
    callback: IOCallback
    observe = vi.fn()
    unobserve = vi.fn()
    disconnect = vi.fn()
    takeRecords = vi.fn(() => [])
    constructor(cb: IOCallback) {
      this.callback = cb
      instances.push({
        callback: cb,
        observe: this.observe,
        disconnect: this.disconnect,
        trigger: (isIntersecting: boolean) =>
          cb([{ isIntersecting }]),
      })
    }
  }
  vi.stubGlobal('IntersectionObserver', MockIO)
})

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('useAtBottom', () => {
  it('starts not-at-bottom and observes the attached node', () => {
    const { result } = renderHook(() => useAtBottom())
    expect(result.current.atBottom).toBe(false)

    act(() => {
      result.current.ref(document.createElement('div'))
    })

    expect(instances).toHaveLength(1)
    expect(instances[0].observe).toHaveBeenCalledTimes(1)
  })

  it('flips atBottom true then false as the sentinel intersects and leaves', () => {
    const { result } = renderHook(() => useAtBottom())
    act(() => {
      result.current.ref(document.createElement('div'))
    })

    act(() => instances[0].trigger(true))
    expect(result.current.atBottom).toBe(true)

    act(() => instances[0].trigger(false))
    expect(result.current.atBottom).toBe(false)
  })

  it('disconnects the observer on unmount', () => {
    const { result, unmount } = renderHook(() => useAtBottom())
    act(() => {
      result.current.ref(document.createElement('div'))
    })
    const observer = instances[0]
    unmount()
    expect(observer.disconnect).toHaveBeenCalledTimes(1)
  })
})
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npx vitest run src/__tests__/hooks/useAtBottom.test.tsx`
Expected: FAIL — `Failed to resolve import "../../hooks/useAtBottom"` (file does not exist yet).

- [ ] **Step 3: Write the hook**

Create `src/hooks/useAtBottom.ts`:

```ts
import { useCallback, useEffect, useState } from 'react'

type UseAtBottom = {
  /** Callback ref — attach to the zero-height sentinel at the page's end. */
  ref: (node: HTMLDivElement | null) => void
  /** True when the sentinel is in the viewport (reader is at the bottom). */
  atBottom: boolean
}

export function useAtBottom(): UseAtBottom {
  const [node, setNode] = useState<HTMLDivElement | null>(null)
  const [atBottom, setAtBottom] = useState(false)

  const ref = useCallback((next: HTMLDivElement | null) => {
    setNode(next)
  }, [])

  useEffect(() => {
    // No IntersectionObserver (e.g. jsdom, very old browsers): never leave the
    // dog-ear permanently unreachable.
    if (typeof IntersectionObserver === 'undefined') {
      setAtBottom(true)
      return
    }
    if (!node) return

    const observer = new IntersectionObserver(
      (entries) => {
        setAtBottom(entries[0]?.isIntersecting ?? false)
      },
      { rootMargin: '0px 0px -8px 0px' },
    )
    observer.observe(node)
    return () => observer.disconnect()
  }, [node])

  return { ref, atBottom }
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npx vitest run src/__tests__/hooks/useAtBottom.test.tsx`
Expected: PASS — all 3 tests green.

- [ ] **Step 5: Commit**

```bash
git add src/hooks/useAtBottom.ts src/__tests__/hooks/useAtBottom.test.tsx
git commit -m "feat: add useAtBottom hook (IntersectionObserver sentinel)"
```

---

## Task 3: `DogEar` gains a `visible` prop

**Files:**
- Modify: `src/components/shared/DogEar.tsx`
- Test: `src/__tests__/components/DogEar.test.tsx`

- [ ] **Step 1: Update the test to require and exercise `visible`**

Replace the contents of `src/__tests__/components/DogEar.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { DogEar } from '../../components/shared/DogEar'

describe('DogEar', () => {
  it('renders an accessible link to the given destination', () => {
    render(
      <MemoryRouter>
        <DogEar to="/reading" label="Open the reading page" visible />
      </MemoryRouter>,
    )
    const link = screen.getByRole('link', { name: 'Open the reading page' })
    expect(link).toHaveAttribute('href', '/reading')
    expect(link).toHaveClass('dogear')
  })

  it('is not hidden when visible', () => {
    render(
      <MemoryRouter>
        <DogEar to="/reading" label="Open the reading page" visible />
      </MemoryRouter>,
    )
    expect(screen.getByRole('link')).not.toHaveClass('dogear--hidden')
  })

  it('has the hidden class when not visible', () => {
    render(
      <MemoryRouter>
        <DogEar to="/reading" label="Open the reading page" visible={false} />
      </MemoryRouter>,
    )
    expect(screen.getByRole('link')).toHaveClass('dogear--hidden')
  })
})
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npx vitest run src/__tests__/components/DogEar.test.tsx`
Expected: FAIL — TypeScript/`tsc` is not run by vitest, so the `visible` prop is ignored at runtime and the `dogear--hidden` test FAILS with "expected element to have class dogear--hidden".

- [ ] **Step 3: Implement the prop**

Replace the contents of `src/components/shared/DogEar.tsx`:

```tsx
import { Link } from 'react-router-dom'

type DogEarProps = {
  to: string
  label: string
  /** When false, the dog-ear is faded out and removed from the tab order. */
  visible: boolean
}

export function DogEar({ to, label, visible }: DogEarProps) {
  return (
    <Link
      to={to}
      className={visible ? 'dogear' : 'dogear dogear--hidden'}
      aria-label={label}
    >
      <svg viewBox="0 0 56 56" aria-hidden="true" focusable="false">
        {/* folded bottom-right corner: filled underside flap + lift shadow */}
        <path className="dogear-flap" d="M56 10 L10 56 L10 10 Z" />
      </svg>
    </Link>
  )
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npx vitest run src/__tests__/components/DogEar.test.tsx`
Expected: PASS — all 3 tests green.

- [ ] **Step 5: Commit**

```bash
git add src/components/shared/DogEar.tsx src/__tests__/components/DogEar.test.tsx
git commit -m "feat: add visible prop to DogEar"
```

---

## Task 4: Wire the dog-ear into `TechLayout`

**Files:**
- Modify: `src/components/tech/TechLayout.tsx`
- Test: `src/__tests__/components/TechLayout.test.tsx` (create)

- [ ] **Step 1: Write the failing test**

Create `src/__tests__/components/TechLayout.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { TechLayout } from '../../components/tech/TechLayout'

function renderLayout() {
  return render(
    <MemoryRouter initialEntries={['/']}>
      <Routes>
        <Route element={<TechLayout />}>
          <Route path="/" element={<div>home content</div>} />
        </Route>
      </Routes>
    </MemoryRouter>,
  )
}

describe('TechLayout', () => {
  it('renders the forward dog-ear, hidden by default', () => {
    renderLayout()
    const link = screen.getByRole('link', {
      name: 'Reading — authors and books I love',
    })
    expect(link).toHaveAttribute('href', '/reading')
    // Not at bottom on mount → hidden.
    expect(link).toHaveClass('dogear--hidden')
  })

  it('renders a page-end sentinel as the last child of the layout', () => {
    const { container } = renderLayout()
    const layout = container.querySelector('.tech-layout')
    expect(layout?.lastElementChild).toHaveClass('page-end-sentinel')
  })
})
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npx vitest run src/__tests__/components/TechLayout.test.tsx`
Expected: FAIL — the sentinel test fails (`.tech-layout` has no `.page-end-sentinel` last child). The hidden-by-default test may already pass by accident, because the not-yet-updated `TechLayout` passes no `visible` prop and `undefined` is falsy (→ `dogear--hidden`); the sentinel failure is what proves this task is incomplete.

- [ ] **Step 3: Update `TechLayout`**

Replace the contents of `src/components/tech/TechLayout.tsx`:

```tsx
import { Outlet } from 'react-router-dom'
import { TechHeader } from './TechHeader'
import { DogEar } from '../shared/DogEar'
import { useAtBottom } from '../../hooks/useAtBottom'

export function TechLayout() {
  const { ref, atBottom } = useAtBottom()

  return (
    <div className="tech-layout">
      <TechHeader />
      <main className="tech-main">
        <Outlet />
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

- [ ] **Step 4: Run the test to verify it passes**

Run: `npx vitest run src/__tests__/components/TechLayout.test.tsx`
Expected: PASS — both tests green.

- [ ] **Step 5: Commit**

```bash
git add src/components/tech/TechLayout.tsx src/__tests__/components/TechLayout.test.tsx
git commit -m "feat: reveal TechLayout dog-ear at page bottom"
```

---

## Task 5: Wire the dog-ear into `ReadingPage`

**Files:**
- Modify: `src/components/tech/ReadingPage.tsx`
- Test: `src/__tests__/components/ReadingPage.test.tsx`

- [ ] **Step 1: Add the failing sentinel assertion**

In `src/__tests__/components/ReadingPage.test.tsx`, add this test inside the `describe('ReadingPage', ...)` block (after the existing "renders a dog-ear link back" test):

```tsx
  it('renders a page-end sentinel as the last child of the page', () => {
    const { container } = renderPage()
    const page = container.querySelector('.reading-page')
    expect(page?.lastElementChild).toHaveClass('page-end-sentinel')
  })
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npx vitest run src/__tests__/components/ReadingPage.test.tsx`
Expected: FAIL — the new test fails (`.reading-page` has no `.page-end-sentinel` last child). The existing tests still pass (the back dog-ear link is still accessible; jsdom does not apply the external `.dogear--hidden` stylesheet, so `getByRole('link')` still finds it).

- [ ] **Step 3: Update `ReadingPage`**

Replace the contents of `src/components/tech/ReadingPage.tsx`:

```tsx
import { useState } from 'react'
import { reading } from '../../data/reading'
import { AuthorCard } from './AuthorCard'
import { DogEar } from '../shared/DogEar'
import { useAtBottom } from '../../hooks/useAtBottom'

export function ReadingPage() {
  const [flippedKey, setFlippedKey] = useState<string | null>(null)
  const { ref, atBottom } = useAtBottom()

  return (
    <div className="reading-page">
      <div className="reading-grid">
        {reading.map((entry) => (
          <AuthorCard
            key={entry.image}
            {...entry}
            flipped={flippedKey === entry.image}
            onToggle={() =>
              setFlippedKey((current) =>
                current === entry.image ? null : entry.image,
              )
            }
          />
        ))}
      </div>
      <DogEar to="/" label="Back to the main page" visible={atBottom} />
      {/* Marks the page's end; must be the last child. */}
      <div ref={ref} className="page-end-sentinel" aria-hidden="true" />
    </div>
  )
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npx vitest run src/__tests__/components/ReadingPage.test.tsx`
Expected: PASS — all tests (existing + new sentinel test) green.

- [ ] **Step 5: Commit**

```bash
git add src/components/tech/ReadingPage.tsx src/__tests__/components/ReadingPage.test.tsx
git commit -m "feat: reveal ReadingPage dog-ear at page bottom"
```

---

## Task 6: Styling — content-aligned placement, fade, sentinel

CSS is not unit-tested; verification is `tsc`/build plus manual visual checks (Task 7).

**Files:**
- Modify: `src/styles/base.css`
- Modify: `src/styles/tech.css`

- [ ] **Step 1: Define `--content-max` on the tech side**

In `src/styles/base.css`, inside the `:root[data-side="tech"]` block, add the variable. Change:

```css
:root[data-side="tech"] {
  --font-heading: 'JetBrains Mono', 'Courier New', monospace;
  --font-body: 'Inter', -apple-system, sans-serif;
  --font-mono: 'JetBrains Mono', 'Courier New', monospace;
  --accent: #0066ff;
  --radius: 2px;
}
```

to:

```css
:root[data-side="tech"] {
  --font-heading: 'JetBrains Mono', 'Courier New', monospace;
  --font-body: 'Inter', -apple-system, sans-serif;
  --font-mono: 'JetBrains Mono', 'Courier New', monospace;
  --accent: #0066ff;
  --radius: 2px;
  --content-max: 800px;
}
```

- [ ] **Step 2: Anchor the dog-ear and add the fade transition**

In `src/styles/tech.css`, replace the `.dogear` rule (currently starting `.dogear {` with `right: 0;`) with:

```css
.dogear {
  position: fixed;
  /* Align the dog-ear's right edge to the content column's right edge.
     Below --content-max the term goes <= 0 and max() clamps to the corner. */
  right: max(0px, calc(50% - var(--content-max) / 2));
  bottom: 0;
  width: 56px;
  height: 56px;
  z-index: 20;
  --dogear-fold: #ececec;
  --dogear-shadow: rgba(0, 0, 0, 0.22);
  opacity: 1;
  visibility: visible;
  transition: transform 0.2s ease, opacity 0.3s ease, visibility 0s;
}
```

- [ ] **Step 3: Add the hidden state and the sentinel rule**

In `src/styles/tech.css`, immediately after the `.dogear:focus-visible { ... }` rule, add:

```css
.dogear--hidden {
  opacity: 0;
  visibility: hidden; /* removes it from the tab order and the a11y tree */
  pointer-events: none;
  /* Delay the visibility flip until the opacity fade finishes, so it fades out. */
  transition: transform 0.2s ease, opacity 0.3s ease, visibility 0s linear 0.3s;
}

.page-end-sentinel {
  width: 100%;
  height: 0;
}
```

- [ ] **Step 4: Make the hidden state instant under reduced motion**

In `src/styles/tech.css`, replace the existing reduced-motion dog-ear rule:

```css
@media (prefers-reduced-motion: reduce) {
  .dogear {
    transition: none;
  }
}
```

with:

```css
@media (prefers-reduced-motion: reduce) {
  .dogear,
  .dogear--hidden {
    transition: none;
  }
}
```

- [ ] **Step 5: Type-check and build**

Run: `npm run build`
Expected: PASS — `tsc` reports no errors (confirms the `visible` prop types line up across `DogEar`, `TechLayout`, `ReadingPage`) and Vite builds successfully.

- [ ] **Step 6: Commit**

```bash
git add src/styles/base.css src/styles/tech.css
git commit -m "style: anchor dog-ear to content edge and fade on scroll reveal"
```

---

## Task 7: Full verification

- [ ] **Step 1: Run the whole test suite**

Run: `npm test`
Expected: PASS — all suites green (hook, DogEar, TechLayout, ReadingPage, and all pre-existing tests).

- [ ] **Step 2: Manual visual check (dev server)**

Run: `npm run dev`, open the site, and verify (these behaviors are not observable in jsdom):

- On a **wide desktop** window, the dog-ear's corner sits on the content column's right edge, not the window's far-right edge.
- On a page taller than the viewport (e.g. `/cv` or a long `/reading`), the dog-ear is **hidden** on load; scrolling to the bottom **fades it in**; scrolling back up **fades it out**.
- On a **short** page that fits the viewport, the dog-ear is visible immediately.
- On `/reading`, scrolling to the bottom reveals the **back** dog-ear the same way.
- With OS "reduce motion" enabled, the dog-ear appears/disappears instantly (no fade).

- [ ] **Step 3: No commit** — verification only. If any check fails, fix in the relevant task's files and re-run `npm test` / `npm run build`.

---

## Notes / accepted caveats (from the spec)

- `/reading` sentinel sits ~4rem above the true bottom (page has 4rem bottom padding); reveal fires slightly early — intentional, not a bug.
- Between 800–864px viewport width the dog-ear and content edge can diverge by up to ~32px (`.tech-main` side padding); cosmetic, accepted.
- The dog-ear anchors to the 800px content **box** edge; on `/reading` that is 1.5rem outside the card columns — the intended, simpler choice.
- `--content-max` is introduced only for the dog-ear here; do **not** unify the 1000px cv-notes rule under it.
