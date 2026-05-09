# CV / Work History Page — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the CV placeholder with a narrative work history page showing roles, accomplishments, and detailed anecdotes about debugging, architecture decisions, and incident response.

**Architecture:** Structured TypeScript data file with role entries (bullets + story paragraphs). A `CvPage` component maps over the data rendering role headers, bullet lists, and story blocks. CSS added to `tech.css` for the CV-specific layout. The tech-main layout is adjusted to support long-form scrollable content.

**Tech Stack:** React 18, TypeScript, CSS custom properties (existing design token system)

**Spec:** `docs/specs/two-sided-portfolio.md` — Appendix B

---

## File Map

### New files

| File | Responsibility |
|------|---------------|
| `src/data/work-history.ts` | Structured data: roles, bullets, stories, education |
| `src/__tests__/data/work-history.test.ts` | Data integrity tests |

### Modified files

| File | Changes |
|------|---------|
| `src/components/tech/CvPage.tsx` | Replace placeholder with full narrative layout |
| `src/styles/tech.css` | Add CV page styles, adjust tech-main for scrollable content |

---

## Task 1: Create work history data file (TDD)

**Files:**
- Create: `src/data/work-history.ts`
- Create: `src/__tests__/data/work-history.test.ts`

- [ ] **Step 1: Write the failing test**

Create `src/__tests__/data/work-history.test.ts`:

```ts
import { roles, education } from '../../data/work-history'

describe('work-history data', () => {
  it('has roles ordered most recent first', () => {
    for (let i = 0; i < roles.length - 1; i++) {
      expect(roles[i].startYear).toBeGreaterThanOrEqual(roles[i + 1].startYear)
    }
  })

  it('every role has a title, company, and at least one bullet', () => {
    for (const role of roles) {
      expect(role.title).toBeTruthy()
      expect(role.company).toBeTruthy()
      expect(role.bullets.length).toBeGreaterThan(0)
    }
  })

  it('contains the expected number of roles', () => {
    expect(roles.length).toBe(7)
  })

  it('has education entries with degree and institution', () => {
    for (const entry of education) {
      expect(entry.degree).toBeTruthy()
      expect(entry.institution).toBeTruthy()
    }
  })

  it('stories have a title and at least one paragraph', () => {
    for (const role of roles) {
      for (const story of role.stories) {
        expect(story.title).toBeTruthy()
        expect(story.paragraphs.length).toBeGreaterThan(0)
      }
    }
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npx vitest run src/__tests__/data/work-history.test.ts
```

Expected: FAIL — module not found.

- [ ] **Step 3: Create the work history data**

Create `src/data/work-history.ts`:

```ts
export interface Story {
  title: string
  paragraphs: string[]
}

export interface Role {
  title: string
  company: string
  startYear: number
  period: string
  location: string
  bullets: string[]
  stories: Story[]
}

export interface Education {
  degree: string
  institution: string
  period: string
}

export const roles: Role[] = [
  {
    title: 'Co-Founder',
    company: 'SevenSoftware',
    startYear: 2025,
    period: 'Jan 2025 – Present',
    location: 'Remote',
    bullets: [
      'Built two products in 14 months: a SaaS platform (React, FastAPI, GCP Cloud Functions, Pub/Sub) and a desktop application (Tauri, React, FastAPI), pivoting from cloud to desktop in weeks.',
      'Own the full technical and product roadmap for CucoStudio, a video creation platform leveraging Whisper and Chatterbox for transcription and voice cloning.',
    ],
    stories: [],
  },
  {
    title: 'Senior DevOps Engineer, Team Lead',
    company: 'Topcon Mirage Technologies',
    startYear: 2023,
    period: 'Sep 2023 – Jan 2025',
    location: 'Valencia, Spain',
    bullets: [
      'Reduced cycle time on the infrastructure repository from ~2 hours to ~20 minutes by eliminating redundant Security Groups and VPCs, consolidating and reducing ECS clusters, across four AWS environments.',
      'Reduced infrastructure costs (~8%) by replacing public IPs with NAT gateways.',
      'Implemented corporate security compliance in collaboration with Topcon\'s Global Security Team (TGST).',
      'Architected and implemented an EKS + Karpenter solution for self-hosted GitLab runners to match high compute demand during release weeks.',
      'Coordinated three teams across timezones (California/TGST – Valencia/TM – Tokyo/Topcon HQ) to create a secure connection between TM\'s and Topcon HQ\'s Ops infrastructure.',
      'Led two engineers; performed code reviews and mentoring while contributing individually.',
      'Built a DRP from scratch across four AWS environments, achieving ~1 h RTO and ~0–5 min RPO.',
    ],
    stories: [
      {
        title: 'The CloudFront Signed URL Mystery',
        paragraphs: [
          'During the preparation of a major release, we deployed changes into staging and almost immediately the application started failing when trying to download assets from S3 through CloudFront. Every request returned a 403, pointing to an authorization problem rather than a functional bug. What made it confusing was that nothing relevant had changed in the application code, especially not in the Lambda responsible for generating the signed URLs.',
          'After ruling out recent code changes, I shifted focus to the infrastructure. The CloudFront distribution had just been recreated as part of the deployment, and I noticed the previous one had been in place for several years. I extracted the TypeScript logic responsible for generating signed URLs and tested it independently against both staging and production behaviors, reproducing the failure outside the full system.',
          'Digging into the AWS documentation, I found a subtle but critical detail: the signature must use a URL-safe variant of Base64 encoding. Our implementation still contained standard Base64 characters, including the forward slash. The older CloudFront distribution had been more permissive; the newly created one enforced the correct encoding strictly.',
          'Once I updated the signing logic to replace the forward slash with the expected URL-safe character, the 403 errors disappeared. The root cause was not a logic error in the authorization itself, but a mismatch between legacy behavior and current platform requirements — exposed by recreating a long-lived infrastructure component.',
        ],
      },
      {
        title: 'The Accidental Production Deploy',
        paragraphs: [
          'A senior developer noticed a minor version mismatch in the platform and attempted to fix it by deploying directly to production. The deployment pushed all pending staging changes into production, and the developer did not know how to revert.',
          'The root cause was not technical — GitLab\'s ownership permissions allowed anyone with the subsidiary owner role to trigger production deployments. After the incident, I implemented GitLab protected environment rules restricting production deployments to a whitelist of specific users, replacing the implicit trust in role-based permissions.',
        ],
      },
      {
        title: 'Extracting a 2GB File from a Docker Image',
        paragraphs: [
          'A 2GB coordinate file used for point cloud processing was embedded inside a Docker image, making it bloated and slow to pull. For local development, I mounted the file as a volume in Docker Compose — faster builds, no re-downloading on every image change.',
          'For production, I moved the file to EFS. The choice of EFS over S3 was driven by the access pattern: processing tasks ran on dynamically spawned EC2 instances and needed the file available as a mounted filesystem, not as an object to download. EFS could be mounted simultaneously on every instance at launch with no application-level download logic, no caching layer, and no change to the processing code that expected a local file path.',
        ],
      },
    ],
  },
  {
    title: 'DevOps Engineer',
    company: 'Topcon Mirage Technologies',
    startYear: 2022,
    period: 'Mar 2022 – Oct 2023',
    location: 'Valencia, Spain',
    bullets: [
      'Created a single source of truth for component versions across all environments through a custom manifest-based system built with Python over GitLab CI/CD. This system gave ownership of deployments to PMs and developers.',
      'Managed a self-hosted GitLab. Implemented custom GitOps to deploy GitLab configuration. Hardened GitLab\'s setup and underlying infrastructure.',
    ],
    stories: [],
  },
  {
    title: 'DevOps Engineer',
    company: 'GSoft Innovation',
    startYear: 2021,
    period: 'Mar 2021 – Oct 2021',
    location: 'Remote',
    bullets: [
      'Deployed and troubleshot web applications on Kubernetes with Istio service mesh and Tetrate Service Bridge (TSB) on GCP, AWS, and Azure.',
      'Collaborated on the creation of a Terraform plugin for TSB.',
      'Built GitLab CI/CD pipelines for Spring Boot microservices.',
    ],
    stories: [],
  },
  {
    title: 'Senior System & Network Administrator, DevOps',
    company: 'Pyxel Solutions',
    startYear: 2019,
    period: 'Sep 2019 – Mar 2021',
    location: 'Havana, Cuba',
    bullets: [
      'Migrated on-premise systems to OVH cloud. Self-hosted GitLab instance, runners, and staging environment serving ~10 WordPress sites.',
      'Reduced user feedback cycle from 3–4 days to 1 day by automating deployments to staging. GitLab CI/CD pipelines and Docker Swarm.',
      'Automated self-hosted GitLab instance backup system using Bash scripts.',
      'Orchestrated automated DAST using OWASP ZAP to identify and mitigate critical vulnerabilities (XSS, SQLi, Broken Auth) within the SDLC.',
      'Containerized NestJS, Python, Angular, and PHP applications with Docker for easier distribution to clients.',
    ],
    stories: [],
  },
  {
    title: 'Senior System & Network Administrator',
    company: 'Ministry of Foreign Trade and Foreign Investment',
    startYear: 2013,
    period: 'Sep 2013 – Jul 2019',
    location: 'Havana, Cuba',
    bullets: [
      'Led a full on-prem datacenter redesign: 20 physical servers for ~1,200 users, migrated from ESXi to Proxmox, no migration downtime. Optimized hardware usage so two physical servers were freed for R&D labs and replacement.',
      'Enforced security policy via pfSense and Cisco ASA firewalls; implemented SIEM-based management.',
      'Integrated Cisco Secure ACS with Active Directory for centralized authentication across all network devices.',
      'Managed LAN/WAN environments using Cisco, Huawei, and Netgear hardware.',
    ],
    stories: [],
  },
  {
    title: 'Earlier Career',
    company: 'CUJAE / Datacimex',
    startYear: 2010,
    period: '2010 – 2020',
    location: 'Havana, Cuba',
    bullets: [
      'Lecturer at CUJAE (2018–2020) — Taught Computer Networks II & III.',
      'Intern at Datacimex (2010–2013) — Designed a national IP/MPLS platform proposal for FINCIMEX with PCI-DSS compliance; configured Cisco routers and ASA firewalls.',
    ],
    stories: [],
  },
]

export const education: Education[] = [
  {
    degree: 'Master\'s Degree, Cloud Computing and Web Technologies',
    institution: 'University of Valencia',
    period: '2021 – 2022',
  },
  {
    degree: 'Telecommunications Engineering',
    institution: 'Universidad Tecnológica de La Habana "José Antonio Echeverría" (CUJAE)',
    period: '2008 – 2013',
  },
]
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
npx vitest run src/__tests__/data/work-history.test.ts
```

Expected: all 5 tests PASS.

- [ ] **Step 5: Commit**

```bash
git add src/data/work-history.ts src/__tests__/data/work-history.test.ts
git commit -m "feat: add work history data with roles, bullets, and stories"
```

---

## Task 2: Add CV page styles to tech.css

**Files:**
- Modify: `src/styles/tech.css`

- [ ] **Step 1: Append CV styles to tech.css**

Add the following at the end of `src/styles/tech.css`, before the `@media` block:

```css
/* === CV Page === */
.cv-page {
  width: 100%;
  max-width: 800px;
  padding: 2rem 0 4rem;
}

.cv-page-title {
  font-family: var(--font-heading);
  font-size: 1.75rem;
  font-weight: normal;
  letter-spacing: 0.05em;
  margin-bottom: 3rem;
}

.cv-role {
  margin-bottom: 2.5rem;
}

.cv-role-header {
  margin-bottom: 1rem;
}

.cv-role-title {
  font-family: var(--font-heading);
  font-size: 1.1rem;
  font-weight: 700;
  letter-spacing: 0.02em;
}

.cv-role-meta {
  font-family: var(--font-mono);
  font-size: 0.8rem;
  color: var(--text-muted);
  margin-top: 0.25rem;
}

.cv-bullets {
  list-style: none;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.cv-bullet {
  font-size: 0.9rem;
  line-height: 1.6;
  padding-left: 1rem;
  position: relative;
}

.cv-bullet::before {
  content: '–';
  position: absolute;
  left: 0;
  color: var(--text-muted);
}

.cv-story {
  margin-top: 1.5rem;
  padding-left: 1rem;
  border-left: 2px solid var(--border);
  opacity: 0.85;
}

.cv-story-title {
  font-family: var(--font-heading);
  font-size: 0.95rem;
  font-weight: 700;
  margin-bottom: 0.75rem;
}

.cv-story p {
  font-size: 0.875rem;
  line-height: 1.7;
  margin-bottom: 0.75rem;
}

.cv-story p:last-child {
  margin-bottom: 0;
}

.cv-section-divider {
  border: none;
  border-top: 1px solid var(--border);
  opacity: 0.2;
  margin: 2.5rem 0;
}

.cv-education {
  margin-top: 1rem;
}

.cv-education-entry {
  margin-bottom: 1rem;
}

.cv-education-degree {
  font-size: 0.9rem;
  font-weight: 700;
}

.cv-education-meta {
  font-family: var(--font-mono);
  font-size: 0.8rem;
  color: var(--text-muted);
  margin-top: 0.15rem;
}
```

Also, modify the existing `.tech-main` rule so the CV page can scroll rather than being forced to center vertically. Change:

```css
[data-side="tech"] .tech-main {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
}
```

to:

```css
[data-side="tech"] .tech-main {
  flex: 1;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding: 2rem;
}
```

This changes `align-items` from `center` to `flex-start` so long content scrolls naturally instead of being cut off. The home page still looks centered because `.tech-home` has its own centering within the flex container.

- [ ] **Step 2: Verify build compiles**

```bash
npm run build
```

Expected: Build succeeds.

- [ ] **Step 3: Commit**

```bash
git add src/styles/tech.css
git commit -m "style: add CV page styles and fix tech-main for scrollable content"
```

---

## Task 3: Implement CvPage component

**Files:**
- Modify: `src/components/tech/CvPage.tsx`

- [ ] **Step 1: Replace CvPage with full implementation**

Replace the entire contents of `src/components/tech/CvPage.tsx`:

```tsx
import { roles, education } from '../../data/work-history'
import type { Role, Story } from '../../data/work-history'

function StoryBlock({ story }: { story: Story }) {
  return (
    <div className="cv-story">
      <h4 className="cv-story-title">{story.title}</h4>
      {story.paragraphs.map((p, i) => (
        <p key={i}>{p}</p>
      ))}
    </div>
  )
}

function RoleSection({ role }: { role: Role }) {
  return (
    <section className="cv-role">
      <div className="cv-role-header">
        <h3 className="cv-role-title">
          {role.title} — {role.company}
        </h3>
        <div className="cv-role-meta">
          {role.period} · {role.location}
        </div>
      </div>
      <ul className="cv-bullets">
        {role.bullets.map((bullet, i) => (
          <li key={i} className="cv-bullet">{bullet}</li>
        ))}
      </ul>
      {role.stories.map((story, i) => (
        <StoryBlock key={i} story={story} />
      ))}
    </section>
  )
}

export function CvPage() {
  return (
    <div className="cv-page">
      <h2 className="cv-page-title">Work History</h2>
      {roles.map((role, i) => (
        <RoleSection key={i} role={role} />
      ))}
      <hr className="cv-section-divider" />
      <h2 className="cv-page-title">Education</h2>
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

- [ ] **Step 2: Verify build compiles**

```bash
npm run build
```

Expected: Build succeeds.

- [ ] **Step 3: Run all tests**

```bash
npx vitest run
```

Expected: All tests pass (existing 13 + new 5 = 18 total).

- [ ] **Step 4: Commit**

```bash
git add src/components/tech/CvPage.tsx
git commit -m "feat: implement CvPage with narrative work history and education"
```

---

## Task 4: Visual verification

- [ ] **Step 1: Start dev server**

```bash
npm run dev
```

- [ ] **Step 2: Check CV page at http://localhost:5173/cv**

Verify:
1. "Work History" title at top in JetBrains Mono
2. Roles listed most recent first (SevenSoftware → Earlier Career)
3. Each role shows: title — company, period · location in monospace muted text
4. Bullets use dash (–) prefix, no standard bullet markers
5. Topcon Sr. DevOps role has three story blocks with left border, slightly muted
6. Story titles in bold, paragraphs with comfortable line height
7. Divider line between roles and education
8. Education section with two entries
9. Page scrolls naturally (not vertically centered/cut off)
10. Dark mode: toggle theme, verify all text and borders adapt
11. Mobile (resize to 375px): content still readable, no horizontal overflow

- [ ] **Step 3: Verify home page not broken**

Navigate to `/` — profile section should still be vertically centered in viewport. The `align-items: flex-start` change should not break the home page layout because `.tech-home` centers its own content.

- [ ] **Step 4: Commit any fixes if needed**

Only if visual verification revealed issues.
