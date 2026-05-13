# CV Notes Two-Column Redesign — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace per-role expandable stories with a single global "SHOW PERSONAL NOTES" toggle that shows notes in a two-column layout on desktop and swaps to a notes-only view on mobile.

**Architecture:** Single `notesVisible` state in `CvPage` controls all layout changes. CSS grid handles the two-column desktop layout. A media query at 768px switches to the mobile full-swap behavior. The `RoleSection` component is simplified (no per-role state), and a new `NotesView` component handles the mobile notes-only rendering.

**Tech Stack:** React 18, TypeScript, CSS custom properties, Vitest + Testing Library

**Spec:** `docs/superpowers/specs/2026-05-13-cv-notes-two-column-design.md`

---

## File Map

| Action | File | Responsibility |
|--------|------|----------------|
| Modify | `src/components/tech/CvPage.tsx` | Remove per-role expand, add global toggle + two-column layout |
| Modify | `src/styles/tech.css` | Remove old expand styles, add toggle button + notes column + responsive styles |
| Create | `src/__tests__/components/CvPage.test.tsx` | Component tests for toggle, desktop notes, mobile swap |

---

### Task 1: Clean up old expand styles from CSS

**Files:**
- Modify: `src/styles/tech.css:125-211`

- [ ] **Step 1: Remove obsolete CSS classes**

Remove the following class blocks from `tech.css`:

```css
/* DELETE these blocks: */

.cv-role-header--expandable {
  cursor: pointer;
  transition: opacity 0.2s ease;
}

.cv-role-header--expandable:hover {
  opacity: 0.7;
}

.cv-role-header:disabled {
  cursor: default;
}

.cv-role-toggle {
  font-family: var(--font-mono);
  font-size: 1.2rem;
  color: var(--text-muted);
  flex-shrink: 0;
  margin-left: 1rem;
  line-height: 1;
}

.cv-role-expanded {
  margin-top: 1rem;
}
```

Also simplify `.cv-role-header` — it no longer needs to be a flex row with space-between (no toggle on the right). Replace it with:

```css
.cv-role-header {
  margin-bottom: 0.75rem;
}
```

- [ ] **Step 2: Verify build still works**

Run: `npm run build`
Expected: Compiles without errors (CSS is not type-checked, but ensures no syntax issues in the file).

- [ ] **Step 3: Commit**

```bash
git add src/styles/tech.css
git commit -m "refactor: remove per-role expand CSS from CV page"
```

---

### Task 2: Add toggle button and notes column CSS

**Files:**
- Modify: `src/styles/tech.css`

- [ ] **Step 1: Add toggle button styles**

Add after the `.cv-subtitle` block:

```css
.cv-notes-toggle {
  display: block;
  margin: 0 auto 1.5rem;
  background: transparent;
  border: 1px solid var(--border);
  color: var(--text-muted);
  font-family: var(--font-mono);
  font-size: 0.75rem;
  letter-spacing: 0.08em;
  padding: 0.5rem 1.25rem;
  cursor: pointer;
  transition: color 0.2s ease, border-color 0.2s ease;
}

.cv-notes-toggle:hover {
  color: var(--text);
}

.cv-notes-toggle[aria-pressed="true"] {
  color: var(--text);
  border-color: var(--text);
}
```

- [ ] **Step 2: Add desktop two-column role row styles**

Add after the toggle styles:

```css
.cv-role--with-notes {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  align-items: start;
}

.cv-notes-column {
  padding-left: 1rem;
  border-left: 1px solid var(--border);
}

.cv-note {
  margin-bottom: 1rem;
  font-family: var(--font-mono);
  font-style: italic;
  font-size: 0.85rem;
  line-height: 1.6;
  color: var(--text-muted);
}

.cv-note:last-child {
  margin-bottom: 0;
}

.cv-note-title {
  color: var(--text);
  font-weight: 400;
}
```

- [ ] **Step 3: Add mobile notes-only view styles**

Add after the note styles:

```css
.cv-notes-mobile {
  display: none;
}

.cv-notes-group {
  margin-bottom: 2rem;
}

.cv-notes-group-label {
  font-family: var(--font-mono);
  font-size: 0.75rem;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.08em;
  margin-bottom: 0.75rem;
}
```

- [ ] **Step 4: Add max-width expansion when notes are visible**

Add after the mobile notes styles:

```css
.cv-page--notes-visible {
  max-width: 1000px;
}
```

- [ ] **Step 5: Update the responsive media query**

Inside the existing `@media (max-width: 768px)` block, add:

```css
  .cv-page--notes-visible {
    max-width: 800px;
  }

  .cv-role--with-notes {
    display: block;
  }

  .cv-notes-column {
    display: none;
  }

  .cv-notes-mobile {
    display: block;
  }

  .cv-page--notes-visible .cv-role,
  .cv-page--notes-visible .cv-section-divider,
  .cv-page--notes-visible .cv-education {
    display: none;
  }
```

- [ ] **Step 6: Verify build**

Run: `npm run build`
Expected: Compiles without errors.

- [ ] **Step 7: Commit**

```bash
git add src/styles/tech.css
git commit -m "style: add CV notes toggle, two-column, and mobile styles"
```

---

### Task 3: Rewrite CvPage component

**Files:**
- Modify: `src/components/tech/CvPage.tsx`

- [ ] **Step 1: Write the failing test — toggle button renders and toggles**

Create `src/__tests__/components/CvPage.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { CvPage } from '../../components/tech/CvPage'

describe('CvPage', () => {
  it('renders the notes toggle button with default label', () => {
    render(<CvPage />)
    const button = screen.getByRole('button', { name: 'SHOW PERSONAL NOTES' })
    expect(button).toBeInTheDocument()
    expect(button).toHaveAttribute('aria-pressed', 'false')
  })

  it('toggles button label and aria-pressed on click', async () => {
    const user = userEvent.setup()
    render(<CvPage />)
    const button = screen.getByRole('button', { name: 'SHOW PERSONAL NOTES' })

    await user.click(button)
    expect(button).toHaveTextContent('HIDE PERSONAL NOTES')
    expect(button).toHaveAttribute('aria-pressed', 'true')

    await user.click(button)
    expect(button).toHaveTextContent('SHOW PERSONAL NOTES')
    expect(button).toHaveAttribute('aria-pressed', 'false')
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/__tests__/components/CvPage.test.tsx`
Expected: FAIL — current CvPage has no toggle button.

- [ ] **Step 3: Rewrite CvPage.tsx**

Replace the entire contents of `src/components/tech/CvPage.tsx` with:

```tsx
import { useState } from 'react'
import { roles, education } from '../../data/work-history'
import type { Role } from '../../data/work-history'

function RoleSection({ role, notesVisible }: { role: Role; notesVisible: boolean }) {
  const hasNotes = role.stories.length > 0

  return (
    <section className={`cv-role ${notesVisible && hasNotes ? 'cv-role--with-notes' : ''}`}>
      <div>
        <div className="cv-role-header">
          <h3 className="cv-role-title">
            {role.title} — {role.company}
          </h3>
          <div className="cv-role-meta">
            {role.period} · {role.location}
          </div>
        </div>
        <p className="cv-summary">{role.summary}</p>
      </div>
      {notesVisible && hasNotes && (
        <div className="cv-notes-column" aria-live="polite">
          {role.stories.map((story, i) => (
            <div key={i} className="cv-note">
              <span className="cv-note-title">{story.title}</span>
              {' — '}
              {story.paragraphs.map((p, j) => (
                <span key={j}>
                  {j > 0 && ' '}
                  {p}
                </span>
              ))}
            </div>
          ))}
        </div>
      )}
    </section>
  )
}

function MobileNotesView() {
  const rolesWithStories = roles.filter((r) => r.stories.length > 0)

  return (
    <div className="cv-notes-mobile" aria-live="polite">
      {rolesWithStories.map((role, i) => (
        <div key={i} className="cv-notes-group">
          <div className="cv-notes-group-label">{role.company}</div>
          <div className="cv-notes-column">
            {role.stories.map((story, j) => (
              <div key={j} className="cv-note">
                <span className="cv-note-title">{story.title}</span>
                {' — '}
                {story.paragraphs.map((p, k) => (
                  <span key={k}>
                    {k > 0 && ' '}
                    {p}
                  </span>
                ))}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

export function CvPage() {
  const [notesVisible, setNotesVisible] = useState(false)

  return (
    <div className={`cv-page ${notesVisible ? 'cv-page--notes-visible' : ''}`}>
      <button
        className="cv-notes-toggle"
        aria-pressed={notesVisible}
        onClick={() => setNotesVisible(!notesVisible)}
      >
        {notesVisible ? 'HIDE PERSONAL NOTES' : 'SHOW PERSONAL NOTES'}
      </button>
      <p className="cv-subtitle">Notes from years of building and breaking infrastructure.</p>
      {notesVisible && <MobileNotesView />}
      {roles.map((role, i) => (
        <RoleSection key={i} role={role} notesVisible={notesVisible} />
      ))}
      <hr className="cv-section-divider" />
      <div className="cv-education">
        {education.map((entry, i) => (
          <div key={i} className="cv-education-entry">
            <div className="cv-education-degree">{entry.degree}</div>
            <div className="cv-education-meta">
              {entry.institution} · {entry.period}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run src/__tests__/components/CvPage.test.tsx`
Expected: 2 tests PASS.

- [ ] **Step 5: Commit**

```bash
git add src/components/tech/CvPage.tsx src/__tests__/components/CvPage.test.tsx
git commit -m "feat: replace per-role expand with global notes toggle"
```

---

### Task 4: Add tests for notes visibility and mobile view

**Files:**
- Modify: `src/__tests__/components/CvPage.test.tsx`

- [ ] **Step 1: Add test — notes are hidden by default**

Append to the `describe('CvPage')` block:

```tsx
  it('does not show notes column by default', () => {
    render(<CvPage />)
    expect(screen.queryByText('Why Hexagonal Architecture Saved the Pivot')).not.toBeInTheDocument()
  })
```

- [ ] **Step 2: Run test to verify it passes**

Run: `npx vitest run src/__tests__/components/CvPage.test.tsx`
Expected: PASS — notes are conditionally rendered, not in the DOM by default.

- [ ] **Step 3: Add test — notes appear when toggle is clicked**

Append to the `describe('CvPage')` block:

```tsx
  it('shows note titles when toggle is clicked', async () => {
    const user = userEvent.setup()
    render(<CvPage />)

    await user.click(screen.getByRole('button', { name: 'SHOW PERSONAL NOTES' }))

    expect(screen.getByText(/Why Hexagonal Architecture Saved the Pivot/)).toBeInTheDocument()
    expect(screen.getByText(/What I Learned About Long-Lived Infrastructure/)).toBeInTheDocument()
    expect(screen.getByText(/Applying SRE Principles/)).toBeInTheDocument()
    expect(screen.getByText(/Choosing the Right Storage Pattern/)).toBeInTheDocument()
  })
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/__tests__/components/CvPage.test.tsx`
Expected: PASS.

- [ ] **Step 5: Add test — mobile notes view renders role group labels**

Append to the `describe('CvPage')` block:

```tsx
  it('renders mobile notes view with role group labels when toggled', async () => {
    const user = userEvent.setup()
    render(<CvPage />)

    await user.click(screen.getByRole('button', { name: 'SHOW PERSONAL NOTES' }))

    const mobileNotesView = document.querySelector('.cv-notes-mobile')
    expect(mobileNotesView).toBeInTheDocument()

    const groupLabels = document.querySelectorAll('.cv-notes-group-label')
    expect(groupLabels.length).toBe(2)
    expect(groupLabels[0]).toHaveTextContent('SevenSoftware')
    expect(groupLabels[1]).toHaveTextContent('Topcon Mirage Technologies')
  })
```

- [ ] **Step 6: Run test to verify it passes**

Run: `npx vitest run src/__tests__/components/CvPage.test.tsx`
Expected: PASS.

- [ ] **Step 7: Add test — cv-page gets notes-visible class**

Append to the `describe('CvPage')` block:

```tsx
  it('adds cv-page--notes-visible class when toggled', async () => {
    const user = userEvent.setup()
    render(<CvPage />)

    const page = document.querySelector('.cv-page')
    expect(page).not.toHaveClass('cv-page--notes-visible')

    await user.click(screen.getByRole('button', { name: 'SHOW PERSONAL NOTES' }))
    expect(page).toHaveClass('cv-page--notes-visible')
  })
```

- [ ] **Step 8: Run test to verify it passes**

Run: `npx vitest run src/__tests__/components/CvPage.test.tsx`
Expected: PASS.

- [ ] **Step 9: Run full test suite**

Run: `npm run test`
Expected: All tests pass (existing + new).

- [ ] **Step 10: Commit**

```bash
git add src/__tests__/components/CvPage.test.tsx
git commit -m "test: add CvPage notes toggle and visibility tests"
```

---

### Task 5: Visual QA

**Files:** None (manual verification)

- [ ] **Step 1: Start dev server**

Run: `npm run dev`

- [ ] **Step 2: Desktop QA — notes off**

Open the `/cv` route in a browser at desktop width (>768px). Verify:
- Toggle button reads "SHOW PERSONAL NOTES", centered above subtitle
- CV renders as single column, max-width 800px, centered
- No `+`/`-` toggles on any role
- No notes visible

- [ ] **Step 3: Desktop QA — notes on**

Click "SHOW PERSONAL NOTES". Verify:
- Button changes to "HIDE PERSONAL NOTES"
- Page widens (max-width 1000px), stays centered
- Roles with stories show two-column layout: CV left, italic notes right with left border
- Roles without stories remain single column (no empty right column artifact)
- Education section unaffected

- [ ] **Step 4: Mobile QA — notes off**

Resize browser to <768px (or use devtools responsive mode). Verify:
- Single column CV, centered
- Toggle button visible

- [ ] **Step 5: Mobile QA — notes on**

Click "SHOW PERSONAL NOTES". Verify:
- CV roles are hidden
- Notes appear grouped by role label (company name, uppercase)
- Each group has left-bordered italic notes
- Subtitle remains visible
- Toggle reads "HIDE PERSONAL NOTES"

- [ ] **Step 6: Toggle back**

Click "HIDE PERSONAL NOTES" in both viewports. Verify CV returns to default state.

- [ ] **Step 7: Run build**

Run: `npm run build`
Expected: No errors.

- [ ] **Step 8: Commit (if any fixes were needed)**

Only if visual QA revealed issues that required code changes.
