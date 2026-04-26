export interface TimelineIcon {
  slug: string
  label: string
  hex?: string
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
      { slug: 'amazonaws', label: 'AWS', hex: '232F3E' },
      { slug: 'terraform', label: 'Terraform', hex: '844FBA' },
      { slug: 'ansible', label: 'Ansible', hex: 'EE0000' },
      { slug: 'docker', label: 'Docker', hex: '2496ED' },
      { slug: 'gitlab', label: 'GitLab', hex: 'FC6D26' },
      { slug: 'python', label: 'Python', hex: '3776AB' },
      { slug: 'kubernetes', label: 'Kubernetes', hex: '326CE5' },
      { slug: 'helm', label: 'Helm', hex: '0F1689' },
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
      { slug: 'amazonaws', label: 'AWS', hex: '232F3E' },
      { slug: 'microsoftazure', label: 'Azure', hex: '0078D4' },
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
      { slug: 'ovh', label: 'OVH', hex: '123F6D' },
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
      { slug: 'vmware', label: 'ESXi', hex: '607078' },
      { slug: 'pfsense', label: 'pfSense', hex: '212121' },
      { slug: 'cisco', label: 'Cisco', hex: '1BA0D7' },
    ],
  },
  {
    startYear: 2010,
    endYear: 2013,
    label: '2010–2013',
    icons: [
      { slug: 'cisco', label: 'Cisco', hex: '1BA0D7' },
    ],
  },
]
