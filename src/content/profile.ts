import type { L } from './types'

export const profile = {
  name: 'Javier Cruz Villarreal',
  email: 'contact@javicruz.dev',
  location: 'Madrid, Spain',
  github: 'https://github.com/javocruz',
  linkedin: 'https://linkedin.com/in/javiercruzv',
  siteUrl: 'https://javicruz.dev',
}

export const summary: L = {
  en: 'Computer Science & AI student who builds and leads AI products from idea to demo. CTO across two AI startups, hackathon winner, and most comfortable close to the customer, bridging engineering, product and business.',
  es: 'Estudiante de Ciencias de la Computación e IA que construye y lidera productos de IA, de la idea a la demo. CTO en dos startups de IA, ganador de hackathon, y más cómodo cerca del cliente, uniendo ingeniería, producto y negocio.',
}

export const heroLine: L = {
  en: 'I build AI products from idea to demo, and I know how to get people to care about them.',
  es: 'Construyo productos de IA de la idea a la demo, y sé cómo lograr que a la gente le importen.',
}

export const stats: { value: string; label: L }[] = [
  { value: '1st', label: { en: 'HappyRobot track, HackSpain 2026', es: 'Track HappyRobot, HackSpain 2026' } },
  { value: '2nd/25', label: { en: 'IE Tech Venture Bootcamp', es: 'IE Tech Venture Bootcamp' } },
  { value: 'Top 5/38', label: { en: 'IATA × Infosys Datathon', es: 'Datathon IATA × Infosys' } },
  { value: '5M+', label: { en: 'Organic views created', es: 'Vistas orgánicas generadas' } },
]

export const workedWith = [
  'Sybol', 'HappyRobot', 'Outamation', 'IE University', 'Extern', 'amo (Bump)', 'IATA', 'Infosys', 'Frutas Prohibidas', 'Innovis VC',
]

export type Experience = { role: L; org: string; when: L; bullets: L[]; tags: string[] }

export const experience: Experience[] = [
  {
    role: { en: 'Software Engineer & Team Lead', es: 'Ingeniero de software y líder de equipo' },
    org: 'IEU Labs × Sybol · AI Compliance Engine',
    when: { en: 'Mar 2026 – Aug 2026', es: 'Mar 2026 – Ago 2026' },
    bullets: [
      { en: 'Led a 7-person team across technical, research and QA workstreams in direct coordination with Sybol’s CTO.', es: 'Lideré un equipo de 7 personas en frentes técnico, de investigación y QA, en coordinación directa con el CTO de Sybol.' },
      { en: 'Architected an agentic RAG pipeline over EU AI Act, GDPR and Digital Product Passport regulation that returns structured compliance rules per media asset.', es: 'Diseñé un pipeline RAG agéntico sobre el AI Act de la UE, el RGPD y el Pasaporte Digital de Producto que devuelve reglas de cumplimiento estructuradas por activo multimedia.' },
      { en: 'Designed a media authenticity scoring engine (0–1, deepfake to authentic) with outputs encoded as signed W3C Verifiable Credentials.', es: 'Diseñé un motor de puntuación de autenticidad multimedia (0–1, de deepfake a auténtico) con salidas codificadas como Credenciales Verificables W3C firmadas.' },
    ],
    tags: ['RAG', 'FastAPI', 'W3C VC', 'Leadership'],
  },
  {
    role: { en: 'Co-founder & CTO', es: 'Cofundador y CTO' },
    org: 'Pharmable · AI compliance platform for biotech',
    when: { en: '2026 – Present', es: '2026 – Presente' },
    bullets: [
      { en: 'Building an AI compliance platform for Series A–C biotechs preparing FDA/EMA filings.', es: 'Construyo una plataforma de cumplimiento con IA para biotecnológicas en Series A–C que preparan solicitudes ante la FDA y la EMA.' },
      { en: 'Architected the MVP: a validation engine for 21 CFR Part 11/211/820 and ICH Q10/E3, a SHA-256 hash-chained audit trail, and AI-assisted Clinical Study Report drafting.', es: 'Diseñé el MVP: motor de validación para 21 CFR Part 11/211/820 e ICH Q10/E3, trazabilidad con cadena de hashes SHA-256 y redacción asistida por IA de Informes de Estudio Clínico.' },
    ],
    tags: ['Startup', 'Compliance', 'Next.js', 'AI'],
  },
  {
    role: { en: 'CTO', es: 'CTO' },
    org: 'Hospitia · AI hotel inspection platform (stealth)',
    when: { en: 'Sep 2026 – Present', es: 'Sep 2026 – Presente' },
    bullets: [
      { en: 'Own the technical side of a four-stage AI vision pipeline that automates hotel brand-compliance inspections.', es: 'Responsable técnico de un pipeline de visión por IA de cuatro etapas que automatiza las inspecciones de cumplimiento de marca en hoteles.' },
    ],
    tags: ['Startup', 'Computer vision', 'Stealth'],
  },
  {
    role: { en: 'Content Specialist, Bump Mexico', es: 'Especialista de contenido, Bump México' },
    org: 'amo (Bump)',
    when: { en: 'Sep 2026 – Present', es: 'Sep 2026 – Presente' },
    bullets: [
      { en: 'Own creative strategy for Mexico, managing UGC creators and local TikTok/IG accounts toward ~10% weekly growth.', es: 'Dirijo la estrategia creativa para México, gestionando creadores UGC y cuentas locales de TikTok/IG con un objetivo de ~10% de crecimiento semanal.' },
      { en: 'Produced short-form content reaching 5M+ organic views on Instagram Reels and 20M+ distributed views on TikTok.', es: 'Produje contenido corto con más de 5M de vistas orgánicas en Instagram Reels y más de 20M de vistas distribuidas en TikTok.' },
    ],
    tags: ['Growth', 'UGC', 'Content'],
  },
  {
    role: { en: 'AI Document Intelligence Extern', es: 'Extern de inteligencia documental con IA' },
    org: 'Extern × Outamation',
    when: { en: 'Dec 2025 – Feb 2026', es: 'Dic 2025 – Feb 2026' },
    bullets: [
      { en: 'Selected for the IE × Extern program (12% acceptance); built OCR + LLM pipelines extracting structured JSON from complex multipage PDFs.', es: 'Seleccionado para el programa IE × Extern (12% de aceptación); construí pipelines de OCR + LLM que extraen JSON estructurado de PDFs complejos de varias páginas.' },
    ],
    tags: ['OCR', 'LLMs', 'Python'],
  },
  {
    role: { en: 'Software Engineer & Team Lead', es: 'Ingeniero de software y líder de equipo' },
    org: 'IEU Labs × Frutas Prohibidas',
    when: { en: 'Feb 2025 – Jun 2025', es: 'Feb 2025 – Jun 2025' },
    bullets: [
      { en: 'Led a 3-person team shipping a production MVP for a restaurant client (React, Node.js, Supabase) calculating CO₂, water and land impact per transaction.', es: 'Lideré un equipo de 3 personas que entregó un MVP en producción para un cliente de restauración (React, Node.js, Supabase) que calcula el impacto en CO₂, agua y suelo por transacción.' },
      { en: 'Owned client communication from requirements and demos through deployment.', es: 'Me encargué de la comunicación con el cliente, desde requisitos y demos hasta el despliegue.' },
    ],
    tags: ['React', 'Node.js', 'Supabase', 'Client work'],
  },
]

export const leadership: { title: string; org: string; when: L; text: L }[] = [
  {
    title: 'Partnerships Officer',
    org: 'IE Technology & Innovation Club',
    when: { en: 'Jan 2026 – Present', es: 'Ene 2026 – Presente' },
    text: {
      en: 'Helped organize TechIE Day, leading the Cursor hackathon from sponsor coordination to participant experience. Driving outreach to tech companies and startups for partnerships, sponsorships and speakers.',
      es: 'Ayudé a organizar TechIE Day, liderando el hackathon de Cursor, desde la coordinación de patrocinadores hasta la experiencia de los participantes. Dirijo el contacto con empresas tecnológicas y startups para alianzas, patrocinios y ponentes.',
    },
  },
  {
    title: 'AI Lab Ambassador',
    org: 'IE University',
    when: { en: 'Jan 2026 – Present', es: 'Ene 2026 – Presente' },
    text: {
      en: 'Selected for performance to support AI Lab operations, mentor incoming students and grow IE’s AI community through lab sessions and knowledge-sharing.',
      es: 'Seleccionado por desempeño para apoyar las operaciones del AI Lab, orientar a nuevos estudiantes y hacer crecer la comunidad de IA de IE con sesiones y conocimiento compartido.',
    },
  },
  {
    title: 'Startup Sourcing & Deal Flow',
    org: 'Innovis VC (student-led venture fund)',
    when: { en: 'Ongoing', es: 'En curso' },
    text: {
      en: 'Source and evaluate early-stage startups, producing structured deal-flow assessments on market, product and team.',
      es: 'Identifico y evalúo startups en fase inicial, elaborando análisis estructurados de mercado, producto y equipo.',
    },
  },
]

export const skills: { group: L; items: string[] }[] = [
  { group: { en: 'AI & ML', es: 'IA y ML' }, items: ['LLMs', 'RAG', 'Agentic systems', 'Prompt engineering', 'OCR', 'Vector search', 'NLP'] },
  { group: { en: 'Engineering', es: 'Ingeniería' }, items: ['Python', 'SQL', 'TypeScript', 'React', 'Node.js / Express', 'Flask', 'Supabase / PostgreSQL', 'C / C++'] },
  { group: { en: 'Cloud & data', es: 'Nube y datos' }, items: ['AWS (Bedrock, S3)', 'Google Cloud Platform', 'Docker', 'CI/CD', 'Git', 'BigQuery', 'Looker'] },
  { group: { en: 'Languages', es: 'Idiomas' }, items: ['Spanish (native)', 'English (C1)'] },
]

export const education: { title: L; place: string; when: L }[] = [
  { title: { en: 'B.S. Computer Science & Artificial Intelligence', es: 'Grado en Ciencias de la Computación e Inteligencia Artificial' }, place: 'IE School of Sciences and Technology · Madrid', when: { en: 'Expected Jun 2028', es: 'Previsto jun 2028' } },
  { title: { en: 'B.S. Computer Science and Technology', es: 'Ingeniería en Ciencias de la Computación y Tecnología' }, place: 'Tecnológico de Monterrey · Monterrey', when: { en: 'Sep 2022 – Jan 2024', es: 'Sep 2022 – Ene 2024' } },
]

export const certs = ['Google Cloud Computing Foundations · Nov 2024', 'Responsive Web Design · freeCodeCamp · Jan 2023']

// Add real quotes here and a testimonials strip appears on the home page.
export const testimonials: { quote: L; name: string; role: string }[] = []

// Short, hand-edited "now" list shown next to live GitHub activity.
export const now: L[] = [
  { en: 'Building Pharmable, an AI compliance platform for biotech filings.', es: 'Construyendo Pharmable, una plataforma de cumplimiento con IA para solicitudes biotecnológicas.' },
  { en: 'CTO at Hospitia, an AI vision pipeline for hotel inspections.', es: 'CTO en Hospitia, un pipeline de visión por IA para inspecciones hoteleras.' },
  { en: 'Studying CS & AI at IE University (class of 2028).', es: 'Estudiando Ciencias de la Computación e IA en IE University (promoción 2028).' },
]
