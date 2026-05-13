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
  summary: string
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
    summary: 'Built two products in 14 months — a SaaS platform and a desktop app — and own the full technical and product roadmap for CucoStudio, a video creation platform.',
    stories: [
      {
        title: 'Why Hexagonal Architecture Saved the Pivot',
        paragraphs: [
          'CucoStudio started as a SaaS platform: React frontend, FastAPI backend, GCP Cloud Functions, Pub/Sub for async jobs, and Firestore as the database. It worked. Then we decided to pivot to a desktop application with Tauri.',
          'That pivot could have been a rewrite. Instead, it took weeks — because we had built the backend with hexagonal architecture from the start. The application logic talked to the database through ports (interfaces). Firestore was just an adapter behind that port.',
          'When we moved to desktop, I swapped the Firestore adapter for a SQLite adapter. The application logic didn\'t change. The business rules didn\'t change. I just wrote a new adapter that spoke SQL instead of NoSQL, plugged it in, and everything worked.',
          'The lesson wasn\'t "hexagonal architecture is great" — it\'s that architectural discipline pays off exactly when you need to move fast. The pivot felt easy precisely because we\'d invested in that separation upfront.',
        ],
      },
    ],
  },
  {
    title: 'Senior DevOps Engineer, Team Lead',
    company: 'Topcon Mirage Technologies',
    startYear: 2023,
    period: 'Sep 2023 – Jan 2025',
    location: 'Valencia, Spain',
    summary: 'Led infrastructure across four AWS environments, cut cycle times from 2 hours to 20 minutes, coordinated teams across three timezones, and built a DRP from scratch.',
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
          'A 2GB coordinate file used for point cloud processing had been embedded inside a Docker image. The image was bloated and slow to pull. Nobody questioned it — it was just "how it works here."',
          'For local development, I mounted the file as a volume in Docker Compose — faster builds, no re-downloading on every image change. For production, I moved it to EFS. The choice of EFS over S3 was driven by the access pattern: the processing tasks ran on dynamically spawned EC2 instances and needed the file available as a mounted filesystem, not as an object to download. EFS could be mounted simultaneously on every instance at launch with no application-level download logic, no caching layer, and no change to the processing code that expected a local file path.',
          'Lesson: the access pattern drives the storage decision, and sometimes the biggest wins come from fixing things everyone stopped noticing.',
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
    summary: 'Built a manifest-based deployment system that gave PMs and developers ownership of their releases, and hardened a self-hosted GitLab instance with custom GitOps.',
    stories: [],
  },
  {
    title: 'DevOps Engineer',
    company: 'GSoft Innovation',
    startYear: 2021,
    period: 'Mar 2021 – Oct 2021',
    location: 'Remote',
    summary: 'Worked with Kubernetes, Istio, and Tetrate Service Bridge across three clouds (GCP, AWS, Azure). Collaborated on a Terraform plugin for TSB and built CI/CD pipelines for Spring Boot microservices.',
    stories: [
      {
        title: 'Learning to Communicate With Limited Time',
        paragraphs: [
          'The biggest learning here wasn\'t technical — it was communication. When you have just a few minutes a day with a client, do not get creative, ask. I have the tendency to overthink and sometimes even do it out loud. That\'s fine in some situations, but definitely not with someone who expects you to have the right answers all the time.',
          'In these situations it\'s better to listen and ask questions so you can listen some more before saying anything. The lesson stuck: clarity and economy of words matter more than showing your thought process.',
        ],
      },
    ],
  },
  {
    title: 'Senior Sysadmin & DevOps',
    company: 'Pyxel Solutions',
    startYear: 2019,
    period: 'Sep 2019 – Mar 2021',
    location: 'Havana, Cuba',
    summary: 'Migrated on-prem to OVH cloud, cut the user feedback cycle from 3–4 days to 1 day by automating staging deployments, and introduced DAST scanning into the SDLC with OWASP ZAP.',
    stories: [],
  },
  {
    title: 'Senior Sysadmin',
    company: 'Ministry of Foreign Trade',
    startYear: 2013,
    period: 'Sep 2013 – Jul 2019',
    location: 'Havana, Cuba',
    summary: 'Redesigned a full on-prem datacenter — 20 physical servers, ~1,200 users, migrated from ESXi to Proxmox with zero downtime. Managed security (pfSense, Cisco ASA) and LAN/WAN infrastructure.',
    stories: [],
  },
  {
    title: 'Earlier Career',
    company: 'CUJAE / Datacimex',
    startYear: 2010,
    period: '2010 – 2020',
    location: 'Havana, Cuba',
    summary: 'Taught Computer Networks at CUJAE (2018–2020). Interned at Datacimex (2010–2013) designing a national IP/MPLS platform with PCI-DSS compliance.',
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
