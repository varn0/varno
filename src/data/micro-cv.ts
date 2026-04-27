export interface TimelineIcon {
  slug: string
  label: string
  hex?: string
  darkHex?: string  // override color for dark mode
  src?: string      // custom icon URL (overrides CDN)
  wide?: boolean    // true for wordmark logos that need extra width
}

export interface TimelineEntry {
  startYear: number
  endYear: number | null // null = present
  label: string
  icons: TimelineIcon[]
}

export const timelineEntries: TimelineEntry[] = [
  {
    startYear: 2025,
    endYear: null,
    label: '2025–',
    icons: [
      { slug: 'react', label: 'React', hex: '61DAFB' },
      { slug: 'fastapi', label: 'FastAPI', hex: '009688' },
      { slug: 'tauri', label: 'Tauri', hex: 'FFC131' },
      { slug: 'googlecloud', label: 'GCP', hex: '4285F4' },
      { slug: 'python', label: 'Python', hex: '3776AB' },
    ],
  },
  {
    startYear: 2022,
    endYear: 2024,
    label: '2022–2024',
    icons: [
      { slug: 'aws', label: 'AWS', src: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/amazonwebservices/amazonwebservices-plain-wordmark.svg' },
      { slug: 'terraform', label: 'Terraform', hex: '844FBA' },
      { slug: 'ansible', label: 'Ansible', hex: 'EE0000' },
      { slug: 'docker', label: 'Docker', hex: '2496ED' },
      { slug: 'gitlab', label: 'GitLab', hex: 'FC6D26' },
      { slug: 'python', label: 'Python', hex: '3776AB' },
      { slug: 'kubernetes', label: 'Kubernetes', hex: '326CE5' },
      { slug: 'helm', label: 'Helm', hex: '0F1689', darkHex: '8B9FFF' },
    ],
  },
  {
    startYear: 2021,
    endYear: 2021,
    label: '2021',
    icons: [
      { slug: 'kubernetes', label: 'Kubernetes', hex: '326CE5' },
      { slug: 'istio', label: 'Istio', hex: '466BB0' },
      { slug: 'terraform', label: 'Terraform', hex: '844FBA' },
      { slug: 'googlecloud', label: 'GCP', hex: '4285F4' },
      { slug: 'aws', label: 'AWS', src: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/amazonwebservices/amazonwebservices-plain-wordmark.svg' },
      { slug: 'azure', label: 'Azure', src: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/azure/azure-original.svg' },
      { slug: 'springboot', label: 'Spring Boot', hex: '6DB33F' },
      { slug: 'gitlab', label: 'GitLab', hex: 'FC6D26' },
    ],
  },
  {
    startYear: 2019,
    endYear: 2021,
    label: '2019–2021',
    icons: [
      { slug: 'docker', label: 'Docker', hex: '2496ED' },
      { slug: 'gitlab', label: 'GitLab', hex: 'FC6D26' },
      { slug: 'ovh', label: 'OVH', hex: '123F6D', darkHex: '4A8FCD' },
      { slug: 'gnubash', label: 'Bash', hex: '4EAA25' },
      { slug: 'python', label: 'Python', hex: '3776AB' },
    ],
  },
  {
    startYear: 2013,
    endYear: 2019,
    label: '2013–2019',
    icons: [
      { slug: 'proxmox', label: 'Proxmox', hex: 'E57000' },
      { slug: 'vsphere', label: 'ESXi/vSphere', src: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/vsphere/vsphere-original.svg' },
      { slug: 'pfsense', label: 'pfSense', hex: '212121', darkHex: 'CCCCCC' },
      { slug: 'cisco', label: 'Cisco', hex: '1BA0D7', darkHex: '49D0FF', wide: true },
    ],
  },
  {
    startYear: 2010,
    endYear: 2013,
    label: '2010–2013',
    icons: [
      { slug: 'cisco', label: 'Cisco', hex: '1BA0D7', darkHex: '49D0FF', wide: true },
    ],
  },
]
