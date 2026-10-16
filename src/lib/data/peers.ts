// src/lib/data/peers.ts

export interface Peer {
  id: string
  name: string
  discipline: string
  specialty: string
  skills: string[]
  avatar: string
  avatarType: 'niqab' | 'hijab' | 'male'
  college: string
  bio: string
  projects: PeerProject[]
  isFriend: boolean
  matchScore?: number
}

export interface PeerProject {
  id: string
  title: string
  skill: string
  description: string
  image: string
}

// Allowed disciplines
export const ALLOWED_DISCIPLINES = [
  'Business Information System',
  'Computer Science',
  'Accounting (Arabic)',
  'Accounting (English)',
] as const

export type Discipline = typeof ALLOWED_DISCIPLINES[number]

export const PEERS: Peer[] = [
  {
    id: '1',
    name: 'Mariem ahmed',
    discipline: 'Computer Science',
    specialty: 'Cloud Architect & Software Engineer',
    skills: ['AWS', 'Docker', 'PostgreSQL', 'System Architecture', 'Python'],
    avatar: '',
    avatarType: 'niqab',
    college: 'CS',
    bio: 'Passionate about building scalable cloud architectures, ERP integrations, and resilient distributed systems.',
    isFriend: true,
    matchScore: 98,
    projects: [
      { id: 'p1', title: 'Task & Cloud Manager API', skill: 'Node.js & Docker', description: 'A robust cloud API with role-based access control and microservices.', image: '/assets/illustrations/feature_practical.jpg' },
      { id: 'p2', title: 'Enterprise Data Pipeline', skill: 'Python & SQL', description: 'Real-time ETL data pipeline streaming sensor events to central databases.', image: '/assets/illustrations/feature_peers.jpg' },
    ],
  },
  {
    id: '2',
    name: 'basmalha Ibrahim',
    discipline: 'Business Information System',
    specialty: 'Business Intelligence & Data Science',
    skills: ['Power BI', 'SQL', 'Data Analytics', 'Python', 'Tableau'],
    avatar: '',
    avatarType: 'hijab',
    college: 'BIS',
    bio: 'Transforms complex raw enterprise data into actionable business intelligence dashboards.',
    isFriend: true,
    matchScore: 95,
    projects: [
      { id: 'p1', title: 'Executive Sales & Operations BI', skill: 'Power BI', description: 'Multi-dimensional executive dashboard monitoring KPI trends across 4 retail branches.', image: '/assets/illustrations/feature_community.jpg' },
    ],
  },
  {
    id: '3',
    name: 'Dooa Abd-elftah',
    discipline: 'Business Information System',
    specialty: 'Business & Systems Analysis',
    skills: ['UML Modeling', 'Agile / Scrum', 'ERP Workflows', 'Jira', 'Process Optimization'],
    avatar: '',
    avatarType: 'hijab',
    college: 'BIS',
    bio: 'Experienced in translating complicated business requirements into clear technical system specs.',
    isFriend: false,
    matchScore: 92,
    projects: [
      { id: 'p1', title: 'Hospital ERP Process Re-engineering', skill: 'UML & BPMN', description: 'Redesigned patient intake workflows cutting waiting times by 35%.', image: '/assets/illustrations/feature_practical.jpg' },
    ],
  },
  {
    id: '4',
    name: 'Raneem Yasser',
    discipline: 'Computer Science',
    specialty: 'Full-Stack Web Development',
    skills: ['React', 'Next.js', 'TypeScript', 'Node.js', 'Tailwind CSS'],
    avatar: '',
    avatarType: 'hijab',
    college: 'CS',
    bio: 'Frontend enthusiast focused on pixel-perfect, accessible, and ultra-fast web user interfaces.',
    isFriend: true,
    matchScore: 94,
    projects: [
      { id: 'p1', title: 'Collaborative Student Workspace', skill: 'React & Next.js', description: 'Real-time collaborative canvas for team brainstorming and file sharing.', image: '/assets/illustrations/feature_peers.jpg' },
    ],
  },
  {
    id: '5',
    name: 'Malak Mahmouad',
    discipline: 'Accounting (Arabic)',
    specialty: 'Financial Analysis & Cost Accounting',
    skills: ['Financial Modeling', 'Cost Accounting', 'IFRS Standards', 'Excel Advanced', 'Budgeting'],
    avatar: '',
    avatarType: 'hijab',
    college: 'Business',
    bio: 'Specializing in corporate financial forecasting, budget variance, and Egyptian accounting standards.',
    isFriend: false,
    matchScore: 89,
    projects: [
      { id: 'p1', title: 'Enterprise Cost-Volume-Profit Model', skill: 'Financial Modeling', description: 'Dynamic sensitivity model simulating profit break-even under variable supply costs.', image: '/assets/illustrations/feature_community.jpg' },
    ],
  },
  {
    id: '6',
    name: 'Rahma',
    discipline: 'Computer Science',
    specialty: 'Mobile App Development (Flutter)',
    skills: ['Flutter', 'Dart', 'State Management (Bloc)', 'REST APIs', 'Firebase'],
    avatar: '',
    avatarType: 'hijab',
    college: 'CS',
    bio: 'Crafts fluid, intuitive mobile experiences for iOS and Android with solid state architecture.',
    isFriend: false,
    matchScore: 96,
    projects: [
      { id: 'p1', title: 'Campus Smart Navigator App', skill: 'Flutter', description: 'Cross-platform mobile application providing real-time room schedules and beacon navigation.', image: '/assets/illustrations/feature_practical.jpg' },
    ],
  },
  {
    id: '7',
    name: 'Nada Elsayed',
    discipline: 'Business Information System',
    specialty: 'ERP Systems & Odoo Implementation',
    skills: ['Odoo', 'SAP Concepts', 'Database Administration', 'Python', 'Supply Chain Logic'],
    avatar: '',
    avatarType: 'hijab',
    college: 'BIS',
    bio: 'Bridging technical software engineering with real-world enterprise ERP workflows.',
    isFriend: true,
    matchScore: 91,
    projects: [
      { id: 'p1', title: 'Odoo Warehouse Automation Module', skill: 'Odoo & Python', description: 'Custom barcode scanning module integrating inventory stock moves automatically.', image: '/assets/illustrations/feature_peers.jpg' },
    ],
  },
  {
    id: '8',
    name: 'Rania Khaled',
    discipline: 'Business Information System',
    specialty: 'Database Architecture & Big Data',
    skills: ['SQL Server', 'PostgreSQL', 'Data Warehousing', 'Data Mining', 'ETL'],
    avatar: '',
    avatarType: 'hijab',
    college: 'BIS',
    bio: 'Passionate about structured relational schemas, query tuning, and large scale data warehousing.',
    isFriend: false,
    matchScore: 90,
    projects: [
      { id: 'p1', title: 'Enterprise Data Warehouse Schema', skill: 'SQL & Data Warehousing', description: 'Star-schema data mart built for multidimensional sales and churn analytics.', image: '/assets/illustrations/feature_community.jpg' },
    ],
  },
  {
    id: '9',
    name: 'Mohamed hamada',
    discipline: 'Computer Science',
    specialty: 'IoT & Embedded Hardware Systems',
    skills: ['Arduino', 'Raspberry Pi', 'MQTT', 'C++', 'Python IoT', 'Sensor Networks'],
    avatar: '',
    avatarType: 'male',
    college: 'CS',
    bio: 'Hardware tinkerer connecting physical sensor clusters to cloud gateways and backend brokers.',
    isFriend: true,
    matchScore: 97,
    projects: [
      { id: 'p1', title: 'Industrial Sensor Telemetry Node', skill: 'IoT & MQTT', description: 'Custom micro-controller board transmitting vibration and heat telemetry via MQTT.', image: '/assets/illustrations/feature_practical.jpg' },
    ],
  },
  {
    id: '10',
    name: 'Shahd Mohamed',
    discipline: 'Computer Science',
    specialty: 'Cybersecurity & Infrastructure Protection',
    skills: ['Network Security', 'Penetration Testing', 'Linux Hardening', 'Python', 'Wireshark'],
    avatar: '',
    avatarType: 'hijab',
    college: 'CS',
    bio: 'Dedicated to defending digital assets, securing API backends, and validating network vulnerabilities.',
    isFriend: false,
    matchScore: 93,
    projects: [
      { id: 'p1', title: 'Enterprise Network Audit & Hardening', skill: 'Network Security', description: 'Full vulnerability scan and CIS benchmark hardening for campus servers.', image: '/assets/illustrations/feature_peers.jpg' },
    ],
  },
  {
    id: '11',
    name: 'Shahd Khamees',
    discipline: 'Accounting (English)',
    specialty: 'Auditing, Governance & Compliance',
    skills: ['Internal Audit', 'GAAP / IFRS', 'Risk Assessment', 'SAP FI', 'Forensic Accounting'],
    avatar: '',
    avatarType: 'hijab',
    college: 'Business',
    bio: 'Focused on internal financial control frameworks, fraud risk prevention, and regulatory compliance.',
    isFriend: false,
    matchScore: 88,
    projects: [
      { id: 'p1', title: 'Financial Internal Controls Framework', skill: 'Auditing & Compliance', description: 'Designed risk matrix and segregation of duties controls for an enterprise accounting division.', image: '/assets/illustrations/feature_community.jpg' },
    ],
  },
]
