# CV Notes Two-Column Redesign

## Summary

Replace the current per-role expandable stories (`+`/`-` toggle) with a single global "SHOW PERSONAL NOTES" button that reveals notes alongside the CV. The layout adapts by viewport:

- **Desktop**: Two-column grid — CV on the left, italic notes on the right, aligned to their parent role.
- **Mobile**: Full content swap — the CV hides entirely and notes are displayed grouped by role.

Content stays centered in both states and both viewports.

## Current State

- `CvPage.tsx` renders roles with per-role `useState` expand/collapse for stories.
- Stories live in `work-history.ts` as `Story[]` per role (title + paragraphs).
- Styles in `tech.css` (`.cv-story`, `.cv-role-expanded`, `.cv-role-header--expandable`, `.cv-role-toggle`).
- Current max-width: 800px, centered.

## Design

### Global Toggle Button

- A single `<button>` at the top of the CV page, centered, above the subtitle.
- Default label: **SHOW PERSONAL NOTES** (uppercase, monospace, letter-spacing 0.08em).
- Active label: **HIDE PERSONAL NOTES**.
- Style: minimal border button matching the existing tech aesthetic — `background: transparent`, `border: 1px solid var(--border)`, muted text that brightens on active state.
- Controls a single `notesVisible` boolean via `useState` in `CvPage`.

### Desktop Layout (above breakpoint, e.g. 768px)

**Notes hidden (default):**
- Single-column CV, same as current layout but without per-role expand toggles.
- Max-width remains 800px, centered.

**Notes visible:**
- Each role row becomes a two-column CSS grid: `grid-template-columns: 1fr 1fr`.
- Left column: role header (title, company, period, location) + summary.
- Right column: notes for that role, styled as italic pull-quotes with a left border (`1px solid var(--border)`).
- Note titles rendered in slightly brighter text (e.g. `var(--text-muted)` vs body at lower opacity).
- Note body text: italic, monospace, matching the subtitle style.
- Roles without stories: right column is empty (no placeholder).
- Max-width expands (e.g. 1000px) to accommodate two columns, stays centered.

### Mobile Layout (below breakpoint)

**Notes hidden (default):**
- Single-column CV, identical to current mobile view minus per-role toggles.

**Notes visible:**
- CV content is completely hidden.
- Notes are displayed as a single-column list, grouped by role.
- Each group has a role label (company name, uppercase, small, muted) followed by the notes with left border.
- The subtitle remains visible above the notes.

### What Gets Removed

- Per-role `useState` open/close logic in `RoleSection`.
- The `+`/`-` toggle span (`.cv-role-toggle`).
- CSS classes: `.cv-role-header--expandable`, `.cv-role-header--open`, `.cv-role-toggle`, `.cv-role-expanded`.
- The `<button>` wrapper on role headers becomes a plain `<div>` (no longer interactive).

### What Gets Added

- Single `notesVisible` state in `CvPage`.
- Global toggle button component at page top.
- Desktop: CSS grid on each role row when notes are visible.
- Mobile: notes-only view component with role group labels.
- CSS media query at 768px for the layout switch.
- New CSS classes for the notes column, toggle button, role group labels, and note items.

### Notes Styling

All notes use the same typographic treatment as the existing `.cv-subtitle`:
- `font-family: var(--font-mono)`
- `font-style: italic`
- `color: var(--text-muted)`
- Left border: `1px solid var(--border)` with padding-left

Note titles are rendered inline before the note body, slightly brighter than the body text.

### Data Model

No changes to `work-history.ts` types or data. Stories already contain `title` and `paragraphs[]` — the notes view renders the title inline followed by all paragraphs in italic. The full story content is always shown; there is no condensing or truncation.

### Education Section

Education section remains unchanged — it sits below the roles and is not affected by the notes toggle.

## Responsive Breakpoint

- `768px` — standard tablet/mobile breakpoint already implied by the site's existing layout patterns.
- Above 768px: two-column grid behavior.
- Below 768px: full swap behavior.

## Accessibility

- Toggle button has `aria-pressed` reflecting state.
- Notes column uses `aria-live="polite"` so screen readers announce when notes appear.
- Mobile swap uses conditional rendering (not `display: none`) so hidden content is truly removed from the DOM for screen readers.
