export const profile = {
  name: 'Javier Cruz Villarreal',
  email: 'javiercruzvill123@gmail.com',
  phone: '+34 673 256 252',
  location: 'Madrid, Spain',
  github: 'https://github.com/javocruz',
  linkedin: 'https://linkedin.com/in/javiercruzv',
  about: [
    'Computer Science & AI undergraduate with hands-on experience in full-stack development, data analytics, client communication and growth strategy.',
    'I drive projects from concept to deployment, lead small teams, and know the world of growth marketing, UGC and social media from the inside. Eager to move deeper into project and product management.',
  ],
}

export const stats = [
  { value: '5M+', label: 'Organic views' },
  { value: 'Top 5', label: 'of 38 teams, IATA Datathon' },
  { value: 'A+', label: 'IE Shadowing Program' },
]

export type Project = {
  id: string
  index: string
  title: string
  kind: string
  year: string
  blurb: string
  points: string[]
  tags: string[]
  link?: { label: string; href: string }
  cover: 'fruit' | 'aero' | 'grid'
}

export const projects: Project[] = [
  {
    id: 'frutas', index: '01', title: 'Frutas Prohibidas', kind: 'Vegan restaurant web app · Full-stack', year: '2025',
    blurb: 'Front end (React + TypeScript) and back end (Node/Express + Supabase) for a real restaurant, led as team lead of 2 developers and 1 designer.',
    points: [
      'Admin dashboard to manage menu items, track sustainability metrics and configure eco-receipt printing rules',
      'Secure authentication with role-based access control',
      'CI/CD pipelines for automated testing and deployment',
    ],
    tags: ['React', 'TypeScript', 'Node.js', 'Express', 'Supabase', 'CI/CD'],
    link: { label: 'View code', href: 'https://github.com/javocruz' },
    cover: 'fruit',
  },
  {
    id: 'iata', index: '02', title: 'IATA × Infosys Datathon', kind: 'Aviation decarbonization · Data science', year: '2025',
    blurb: 'Top 5 finalist out of 38 teams. A system that lifts capital efficiency by 95%, cutting marginal abatement cost from $633/t to $29/t.',
    points: [
      'Designed a government-backed Sustainable Aviation Fuel levy for physical supply constraints',
      'Validated through consultations with Qatar Airways leadership',
      'Predictive model showing a SAF levy plus Global Book & Claim removes the 15% logistics penalty in current EU mandates',
    ],
    tags: ['Data analysis', 'Predictive modeling', 'Policy design', 'Sustainability'],
    cover: 'aero',
  },
  {
    id: 'unity', index: '03', title: 'Unity Reporting Platform', kind: 'Web reporting interface · Full-stack', year: '2024',
    blurb: 'Led design and implementation of a web reporting interface using Unity for robust UI elements, Bootstrap for responsive layout and a Node/Express backend.',
    points: [],
    tags: ['Unity', 'Bootstrap', 'Node.js', 'AJAX'],
    cover: 'grid',
  },
]

export const experience = [
  { role: 'AI Lab Team Leader & Mentor', org: 'IE University AI Lab', when: 'Feb 2026 – Jun 2026', note: 'Re-enrolled on the professor’s recommendation. Leading and mentoring new participants.', tags: ['Leadership', 'AI', 'Mentoring'] },
  { role: 'Partnerships Officer', org: 'IE Technology & Innovation Club', when: 'Jan 2026 – Now', note: 'Outreach to leading tech companies and startups to secure partnerships, sponsorships and guest speakers.', tags: ['Partnerships', 'Strategy'] },
  { role: 'Document Insights & Data Extraction Extern', org: 'IE × Extern Program', when: 'Dec 2025 – Now', note: 'Chosen for an exclusive program. LLMs, prompt engineering and Python workflows for OCR, text extraction and document intelligence.', tags: ['LLMs', 'Python', 'Automation'] },
  { role: 'UGC Creator & Growth Strategy', org: 'amo', when: 'Jul 2025 – Now', note: '5M+ organic views on Instagram Reels and 20M+ pushed views on TikTok. Designed growth strategy for user acquisition and retention.', tags: ['Content', 'Growth', 'Analytics'] },
  { role: 'Software Developer & Team Lead', org: 'IEU Labs · Frutas Prohibidas', when: 'Feb 2025 – Jun 2025', note: 'Led 2 programmers and 1 designer to ship a real-time dashboard for a vegan restaurant, with regular client demos.', tags: ['React', 'Node.js', 'Supabase'] },
  { role: 'IE Shadowing Program', org: 'IE University · Immersive Learning', when: 'Apr 2025', note: 'Shadowed the Director of the VR Program on VR in higher education. Received an A+ from the mentor.', tags: ['VR', 'EdTech'] },
]

export const skills = [
  { group: 'Build', items: ['Python', 'TypeScript', 'React', 'Node.js', 'Express', 'C/C++'] },
  { group: 'Data', items: ['SQL', 'BigQuery', 'Looker', 'Predictive modeling'] },
  { group: 'Ship', items: ['Google Cloud', 'Docker', 'CI/CD', 'Git / GitHub', 'Supabase'] },
  { group: 'Languages', items: ['Spanish (native)', 'English (C1)'] },
]

export const education = [
  { title: 'BSc Computer Science & Artificial Intelligence', place: 'IE School of Sciences and Technology, Madrid', when: 'Graduating Jun 2028' },
  { title: 'BS Computer Science & Technology', place: 'Tecnológico de Monterrey, Mexico', when: '2022 – 2024' },
]

export const certs = [
  'Google Cloud Computing Foundations · Nov 2024',
  'Google Project Management Professional',
  'Responsive Web Design · freeCodeCamp · Jan 2023',
]
