# Dog-ear: scroll-to-bottom reveal + content-aligned placement

**Date:** 2026-10-06
**Status:** Approved design, ready for implementation plan

## Problem

The dog-ear navigation corner (`DogEar`) is `position: fixed` at the viewport's
bottom-right corner, so it is:

1. **Always visible**, regardless of scroll position. A dog-ear is the fold at
   the *end* of a page — it should be reached by reading to the bottom, not
   float permanently.
2. **Stranded in the right-hand whitespace** on wide screens. The content lives
   in a centered 800px column, but `right: 0` pins the dog-ear to the window
   edge, far from the content it belongs to.

## Goal

- Reveal the dog-ear only when the reader has scrolled to the bottom of the
  page; fade it back out when they scroll away from the bottom.
- Anchor the dog-ear's right edge to the content column's right edge, not the
  viewport edge.
- Keep the existing fixed-corner feel, hover/focus affordances, theming, and
  reduced-motion handling.

## Behavior

| Situation | Dog-ear state |
|-----------|---------------|
| Page taller than viewport, reader not at bottom | Hidden |
| Reader scrolled to the bottom | Visible (fades in) |
| Reader scrolls back up away from bottom | Hidden again (fades out) |
| Page shorter than viewport (no scroll possible) | Visible — reader is already "at the bottom" |

**Scope:** applies to **both** dog-ears — the forward one (tech pages →
`/reading`, rendered in `TechLayout`) and the back one (`/reading` → home,
rendered in `ReadingPage`). Note these two contexts are **mutually exclusive**:
`/reading` is a standalone route, *not* a child of `TechLayout` (`src/App.tsx`),
so the two dog-ears never render on the same page — no coordination between them
is needed.

## Approach: IntersectionObserver + bottom sentinel

A zero-height sentinel `<div>` is rendered at the very end of the page content.
A `useAtBottom` hook observes it with an `IntersectionObserver`; when the
sentinel enters the viewport, the reader is at the bottom and the dog-ear
becomes visible.

**Why this over the alternatives:**

- vs. a **scroll listener** (`scrollY + innerHeight >= scrollHeight`): no
  throttling, no sub-pixel/resize bookkeeping, and the short-page case falls out
  for free — a sentinel that is already on-screen simply reports "intersecting",
  so the dog-ear shows with no scrolling required.
- vs. **CSS scroll-driven animations** (`animation-timeline: view()`):
  inconsistent browser support, and awkward to express "only at the very
  bottom".

A small negative `rootMargin` (`0px 0px -8px 0px`) makes the trigger fire at the
genuine bottom rather than a hair early.

**Assumption — navigation stability.** `TechLayout` persists across tech routes,
so its sentinel/observer are stable DOM nodes; the observer re-evaluates on the
layout shift when navigating a tall → short page. React Router does not reset
scroll position by default — this is existing behavior and out of scope here.

## Components

### `src/hooks/useAtBottom.ts` (new)

```ts
function useAtBottom(): { ref: (node: HTMLDivElement | null) => void; atBottom: boolean }
```

- Returns a **callback ref** (not a `RefObject`). The callback stores the node
  in state; the observer effect is keyed on that node so it correctly attaches
  when the sentinel mounts and tears down if it ever unmounts. (A plain
  `RefObject` does not notify React when its target changes, so it cannot honor
  a "re-observe on ref change" contract — hence the callback-ref form.)
- The observer effect **guards before constructing** the observer:
  `if (typeof IntersectionObserver === 'undefined') { setAtBottom(true); return }`.
  This default of `true` means the dog-ear is never permanently unreachable, and
  — importantly — it keeps the hook safe under jsdom, which has no
  `IntersectionObserver`, so components that render the real hook in tests do not
  throw. (See Testing: `setup.ts` also gets an IO mock for tests that assert
  toggling.)
- When supported: creates an `IntersectionObserver` with
  `rootMargin: '0px 0px -8px 0px'`, observes the node, sets `atBottom` to the
  entry's `isIntersecting` value, and disconnects on cleanup.

### `src/components/shared/DogEar.tsx` (modified)

- Add a `visible: boolean` prop.
- When `visible` is `false`, add a `dogear--hidden` class.
- SVG markup, `to`, and `label` are unchanged.

```tsx
type DogEarProps = { to: string; label: string; visible: boolean }
```

### `src/components/tech/TechLayout.tsx` (modified)

- Call `useAtBottom()`.
- Render the sentinel `<div ref={ref} className="page-end-sentinel" />` as the
  **last child** of `.tech-layout`, after `<main>` (so it marks the document's
  end — the fixed `DogEar`'s DOM position is irrelevant to layout, but the
  sentinel must come last).
- Pass `visible={atBottom}` to `DogEar`.

### `src/components/tech/ReadingPage.tsx` (modified)

- Call `useAtBottom()`.
- Render the sentinel as the **last child** of `.reading-page`, after both the
  `.reading-grid` and the `DogEar`.
- Pass `visible={atBottom}` to `DogEar`.
- Note: `.reading-page` has `4rem` bottom padding, so a last-child sentinel sits
  ~4rem above the true page bottom and the reveal fires slightly early. This is
  intentional/harmless, not a bug.

## Styling (`src/styles/tech.css`)

**Horizontal anchoring.** Introduce a single source of truth for the content
width and align the dog-ear's right edge to the content column's right edge:

```css
:root { --content-max: 800px; }

.dogear {
  position: fixed;
  bottom: 0;
  right: max(0px, calc(50% - var(--content-max) / 2));
  /* ...existing width/height/z-index/vars/transition... */
}
```

- Wide screens: `calc(50% - 400px)` equals the right-hand gutter, landing the
  dog-ear's outer corner on the content column's bottom-right corner.
- Narrow screens (viewport ≤ 800px): the term goes ≤ 0, `max()` clamps it to
  `0`, and the dog-ear sits in the true corner as it does today.
- **Scope the `--content-max` refactor narrowly:** define the variable and use
  it in the dog-ear `calc`; optionally swap it into the `max-width: 800px`
  column rules (tech-home, cv-page, blog-page, blog-post-page, reading-page).
  **Leave the `1000px` cv-notes rule alone** — it is deliberately wider and must
  not be unified under `--content-max`.
- Known minor imprecisions (cosmetic, accepted — not bugs):
  - In the **800–864px** band, `.tech-main`'s `2rem` side padding shrinks the
    column below 800px while `calc(50% - 400px)` keeps shrinking toward 0, so
    the dog-ear and content edge diverge by up to ~32px.
  - On `/reading`, the dog-ear anchors to the 800px **box** edge, which is
    `1.5rem` outside the card columns' inner padding. Anchoring to the box edge
    is the intended, simpler choice.

**Hidden state.** The hidden state must still *fade* out, so `visibility` has to
be transitioned (delayed) rather than flipped instantly — otherwise the element
vanishes before the opacity animation plays (the classic visibility+opacity
gotcha):

```css
.dogear {
  opacity: 1;
  visibility: visible;
  transition: transform 0.2s ease, opacity 0.3s ease, visibility 0s;
}

.dogear--hidden {
  opacity: 0;
  visibility: hidden; /* removes it from the tab order and the a11y tree */
  pointer-events: none;
  /* delay the visibility flip until after the opacity fade completes */
  transition: transform 0.2s ease, opacity 0.3s ease, visibility 0s linear 0.3s;
}
```

Using `visibility: hidden` (rather than only `opacity: 0`) ensures the hidden
link is neither focusable nor announced by assistive tech; delaying its flip by
the fade duration lets the fade-out play first.

**Reduced motion.** Extend the existing `prefers-reduced-motion: reduce` rule so
the dog-ear has `transition: none` — the visible/hidden toggle becomes instant,
no fade.

## Accessibility

- Hidden dog-ear is fully removed from keyboard and screen-reader interaction
  via `visibility: hidden`.
- Hover (`scale(1.12)`) and `:focus-visible` outline behavior are unchanged.

## Testing

**Test harness prerequisite.** `src/__tests__/setup.ts` currently only imports
`@testing-library/jest-dom`; jsdom has no `IntersectionObserver`. Add a global
IO mock to `setup.ts` (constructor capturing the callback, no-op
`observe`/`unobserve`/`disconnect`) so tests that render the real hook work and
can drive intersection callbacks. The hook's own IO guard already makes the
undefined-IO path safe, but the mock is needed to *assert toggling*.

- **`useAtBottom`** (`src/__tests__/hooks/useAtBottom.test.tsx`): with the IO
  mock, attach the callback ref to a node; assert `atBottom` flips to `true`
  when the captured callback fires with `isIntersecting: true` and `false` when
  it fires `false`; assert `disconnect` is called on unmount.
- **`DogEar`** (`src/__tests__/components/DogEar.test.tsx`, extended):
  - `visible={true}` → link is present and has no `dogear--hidden` class.
  - `visible={false}` → has `dogear--hidden` class.
  - Existing test updated to pass the new required `visible` prop.
- **`ReadingPage` / `TechLayout`**: existing tests updated for the new sentinel
  and `visible` prop as needed (no behavioral assertions on scroll beyond the
  hook's own tests).

**Manual / visual checks** (the fade and the pixel alignment are not observable
in jsdom, so verify by eye):
- Wide desktop viewport: the dog-ear's corner aligns to the content column's
  right edge, not the window edge.
- Scrolling to the bottom reveals the dog-ear with a visible fade-in; scrolling
  back up fades it out (confirms the delayed-`visibility` fix).
- A short page (content fits the viewport) shows the dog-ear immediately.

## Out of scope

- No change to the dog-ear's SVG artwork, hover scale, theming variables, or the
  destinations it links to.
- No change to the creative side (the dog-ear is tech-side only today).
