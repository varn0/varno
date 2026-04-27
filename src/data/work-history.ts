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
        title: 'What I Learned About Long-Lived Infrastructure',
        paragraphs: [
          'A CloudFront distribution that hadn\'t been recreated in four years was silently tolerating non-compliant signed URL encoding. When it was finally recreated, the stricter enforcement broke every asset download. To find the root cause, I isolated the signing logic, created a fresh distribution, and reimplemented the feature strictly by the documentation — then diffed it against the existing code. The mismatch was a single character encoding detail. Lesson: when debugging legacy infrastructure, build the correct version from scratch and compare — don\'t try to reason backward from broken code.',
        ],
      },
      {
        title: 'Applying SRE Principles After a Production Incident',
        paragraphs: [
          'GitLab\'s repository owner role grants deployment access by default — but not every owner should deploy to production. A blameless post-mortem led to implementing protected environment rules to compensate for the lack of granularity in GitLab\'s built-in permissions. Lesson: permissions should encode your deployment process, not just your org chart.',
        ],
      },
      {
        title: 'Choosing the Right Storage Pattern for Large Files',
        paragraphs: [
          'A 2GB file had lived inside a Docker image for so long that the slow pulls were just "how it works here." Questioning that small accepted inconvenience led to moving it to EFS — the right choice because the consuming code expected a file path, not an API. Lesson: the access pattern drives the storage decision, and sometimes the biggest wins come from fixing things everyone stopped noticing.',
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
