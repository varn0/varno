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
rendered in `ReadingPage`).

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

## Components

### `src/hooks/useAtBottom.ts` (new)

```ts
function useAtBottom(): { ref: RefObject<HTMLDivElement>; atBottom: boolean }
```

- Creates an `IntersectionObserver` with `rootMargin: '0px 0px -8px 0px'`.
- Observes the element attached to `ref` (the sentinel).
- Sets `atBottom` to the sentinel's `isIntersecting` value.
- Cleans up the observer on unmount / ref change.
- Guards against environments without `IntersectionObserver` (defaults
  `atBottom` to `true` so the dog-ear is never permanently unreachable).

### `src/components/shared/DogEar.tsx` (modified)

- Add a `visible: boolean` prop.
- When `visible` is `false`, add a `dogear--hidden` class.
- SVG markup, `to`, and `label` are unchanged.

```tsx
type DogEarProps = { to: string; label: string; visible: boolean }
```

### `src/components/tech/TechLayout.tsx` (modified)

- Call `useAtBottom()`.
- Render the sentinel `<div ref={ref} className="page-end-sentinel" />` after
  `<main>` (so it sits at the document's end).
- Pass `visible={atBottom}` to `DogEar`.

### `src/components/tech/ReadingPage.tsx` (modified)

- Call `useAtBottom()`.
- Render the sentinel after the `.reading-grid`.
- Pass `visible={atBottom}` to `DogEar`.

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
- Reuse `--content-max` for the `max-width: 800px` column rules where practical,
  so the column and dog-ear share one value.

**Hidden state.**

```css
.dogear {
  opacity: 1;
  transition: transform 0.2s ease, opacity 0.3s ease;
}

.dogear--hidden {
  opacity: 0;
  visibility: hidden; /* removes it from the tab order and the a11y tree */
  pointer-events: none;
}
```

Using `visibility: hidden` (rather than only `opacity: 0`) ensures the hidden
link is neither focusable nor announced by assistive tech, while still being
transition-able via opacity.

**Reduced motion.** Extend the existing `prefers-reduced-motion: reduce` rule so
the dog-ear has `transition: none` — the visible/hidden toggle becomes instant,
no fade.

## Accessibility

- Hidden dog-ear is fully removed from keyboard and screen-reader interaction
  via `visibility: hidden`.
- Hover (`scale(1.12)`) and `:focus-visible` outline behavior are unchanged.

## Testing

- **`useAtBottom`** (`src/__tests__/hooks/useAtBottom.test.tsx`): mock
  `IntersectionObserver`; assert `atBottom` flips to `true` on intersect and
  `false` on un-intersect; assert the observer is disconnected on unmount.
- **`DogEar`** (`src/__tests__/components/DogEar.test.tsx`, extended):
  - `visible={true}` → link is present and has no `dogear--hidden` class.
  - `visible={false}` → has `dogear--hidden` class.
  - Existing test updated to pass the new required `visible` prop.
- **`ReadingPage` / layout**: existing tests updated for the new sentinel and
  `visible` prop as needed (no behavioral assertions on scroll beyond the hook's
  own tests).

## Out of scope

- No change to the dog-ear's SVG artwork, hover scale, theming variables, or the
  destinations it links to.
- No change to the creative side (the dog-ear is tech-side only today).
