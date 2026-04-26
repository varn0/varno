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
