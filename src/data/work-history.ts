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
          'A staging deployment triggered 403 errors on CloudFront-served assets. Nothing had changed in the application code — the signed URL generation logic was identical. The puzzle was why the same code suddenly stopped working.',
          'My debugging approach was to isolate variables: I extracted the signing logic and tested it independently against both the old and new CloudFront distributions. This narrowed the problem from "the whole system is broken" to "the signature format is rejected by the new distribution."',
          'The root cause turned out to be a subtle encoding detail in the AWS documentation: CloudFront signatures require URL-safe Base64 encoding. The older distribution had tolerated standard Base64 characters, but the newly created one enforced the spec strictly. A single forward slash in the encoded signature was enough to invalidate it.',
          'The takeaway: long-lived infrastructure components can silently accumulate assumptions. When they are recreated, the gap between what the code assumes and what the platform currently requires becomes visible. Since then, I treat any infrastructure recreation as a potential behavior change, not just a state reset.',
        ],
      },
      {
        title: 'Applying SRE Principles After a Production Incident',
        paragraphs: [
          'An unplanned production deployment pushed unreleased staging changes into the live environment. The immediate problem was resolved quickly, but the more interesting question was: how did the deployment pipeline allow this in the first place?',
          'I ran a blameless post-mortem following SRE principles — focusing on the system, not the individual. The analysis revealed that GitLab\'s default role-based permissions granted deployment access far more broadly than intended. The platform\'s permission model didn\'t match the team\'s actual deployment process.',
          'The fix had two layers. First, I implemented GitLab protected environment rules to restrict production deployments to an explicit allowlist, closing the permission gap. Second, I documented a step-by-step deployment runbook with clear role assignments — who initiates, who approves, who monitors — so that the process was no longer implicit knowledge.',
          'This experience shaped how I think about access control: permissions should encode your deployment process, not just your org chart. And post-mortems are most valuable when they lead to systemic changes, not just individual corrections.',
        ],
      },
      {
        title: 'Choosing the Right Storage Pattern for Large Files',
        paragraphs: [
          'A 2GB coordinate file needed for point cloud processing was embedded inside a Docker image. Every image pull downloaded the full 2GB, even when only application code had changed. The question was not just "where should this file live?" but "what access pattern does the consuming code expect?"',
          'For local development, Docker Compose volume mounts were the simplest solution — the file stays on the host, builds are fast, and developers never re-download it.',
          'For production, I evaluated S3 vs EFS. S3 would have required the application to download the file at startup or implement a caching layer — both changes to code that expected a local file path. EFS could be mounted as a filesystem on every EC2 instance simultaneously, with no application changes required. The access pattern drove the architecture decision: when code expects a file path, give it a filesystem, not an API.',
          'This was a useful lesson in infrastructure design: the right storage service depends on the consumer\'s interface, not just the data\'s size or access frequency.',
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
