import type { Build, Project } from './types'

export const projects: Project[] = [
  {
    slug: 'los-panaderos',
    index: '01',
    title: 'Los Panaderos',
    tagline: {
      en: 'Multi-agent wildfire coordination, from the first smoke report to a coordinated response.',
      es: 'Coordinación multiagente de incendios, del primer aviso de humo a una respuesta coordinada.',
    },
    badge: { en: '1st place · HappyRobot track', es: '1.er puesto · track HappyRobot' },
    kind: { en: 'Hackathon · Agentic systems', es: 'Hackathon · Sistemas agénticos' },
    when: { en: 'Sep 2026', es: 'Sep 2026' },
    role: { en: 'Architecture & operator UI/UX', es: 'Arquitectura y UI/UX del operador' },
    team: { en: '4 people · 48 hours', es: '4 personas · 48 horas' },
    cover: 'fire',
    featured: true,
    problem: {
      en: 'In the first minutes of a wildfire the bottleneck is not only the fire. It is the dispatch center: filtering reports, prioritizing people, and coordinating the fleet and communications at once. A fixed protocol falls behind at the first change of the fire front, and the information is incomplete by design.',
      es: 'En los primeros minutos de un incendio el cuello de botella no es solo el fuego. Es la centralita: filtrar avisos, priorizar a la población y coordinar a la vez la flota y las comunicaciones. Un protocolo fijo se queda atrás en el primer cambio de frente, y la información es incompleta por diseño.',
    },
    built: [
      {
        en: 'A multi-agent system on HappyRobot’s platform paired with a simulation engine that models fire, wind, sensors, vehicles and population. The agents reason and decide; the engine owns the physics and checks every order.',
        es: 'Un sistema multiagente sobre la plataforma de HappyRobot junto a un motor de simulación que modela fuego, viento, sensores, vehículos y población. Los agentes razonan y deciden; el motor lleva la física y comprueba cada orden.',
      },
      {
        en: 'Specialised agents: Central Dispatch decides what to verify, whom to warn and which mission to assign; Los Panaderos turns that into one order per vehicle across scouting, containment and trucks; calls and Telegram reach contacts and districts; Marina answers residents’ questions.',
        es: 'Agentes especializados: Despacho Central decide qué verificar, a quién avisar y qué misión asignar; Los Panaderos lo convierte en una orden por vehículo (exploración, contención y camiones); llamadas y Telegram llegan a contactos y distritos; Marina atiende las consultas de los vecinos.',
      },
      {
        en: 'Scoped the problem with active firefighters and turned real dispatch workflows into product requirements and agent logic.',
        es: 'Definimos el problema con bomberos en activo y convertimos flujos reales de despacho en requisitos de producto y lógica de agentes.',
      },
      {
        en: 'I co-designed the architecture and built the operator UI/UX used to monitor and direct the drone agents, keeping human responders in the loop.',
        es: 'Co-diseñé la arquitectura y construí la UI/UX del operador para monitorizar y dirigir a los agentes dron, manteniendo a los equipos humanos en el circuito.',
      },
    ],
    outcome: {
      en: 'Won the HappyRobot track at HackSpain 2026: a working, demoable prototype shipped in 48 hours.',
      es: 'Ganamos el track de HappyRobot en HackSpain 2026: un prototipo funcional y demostrable entregado en 48 horas.',
    },
    stack: ['HappyRobot', 'Agentic systems', 'Simulation', 'Telegram', 'Voice calls', 'Operator UI'],
    links: [
      { label: { en: 'Live demo', es: 'Demo en vivo' }, href: 'https://hackspain.g-villar.tech' },
      { label: { en: 'Code (team repo)', es: 'Código (repo del equipo)' }, href: 'https://github.com/Fedeloz/Los_Panaderos' },
    ],
  },
  {
    slug: 'sybol-compliance-engine',
    index: '02',
    title: 'Sybol Compliance Engine',
    tagline: {
      en: 'An AI engine that scores media authenticity against EU regulation and issues signed Verifiable Credentials.',
      es: 'Un motor de IA que puntúa la autenticidad multimedia frente a la regulación europea y emite Credenciales Verificables firmadas.',
    },
    badge: { en: 'Client project · IEU Labs × Sybol', es: 'Proyecto de cliente · IEU Labs × Sybol' },
    kind: { en: 'Client project · AI compliance', es: 'Proyecto de cliente · Cumplimiento con IA' },
    when: { en: 'Mar – Aug 2026', es: 'Mar – Ago 2026' },
    role: { en: 'Software engineer & team lead', es: 'Ingeniero de software y líder de equipo' },
    team: { en: '7 people · technical, research, QA', es: '7 personas · técnico, investigación, QA' },
    cover: 'shield',
    featured: true,
    problem: {
      en: 'Sybol needed a way to score how authentic a media asset is, check it against EU regulatory requirements (EU AI Act, GDPR, Digital Product Passport) and issue the result as a credential that others can verify.',
      es: 'Sybol necesitaba puntuar cuán auténtico es un activo multimedia, contrastarlo con los requisitos regulatorios europeos (AI Act, RGPD, Pasaporte Digital de Producto) y emitir el resultado como una credencial que otros puedan verificar.',
    },
    built: [
      {
        en: 'An agentic RAG pipeline over EU AI Act, GDPR and Digital Product Passport regulation that returns structured compliance rules per media asset (LlamaIndex, Qdrant, Mistral Large).',
        es: 'Un pipeline RAG agéntico sobre el AI Act, el RGPD y el Pasaporte Digital de Producto que devuelve reglas de cumplimiento estructuradas por activo multimedia (LlamaIndex, Qdrant, Mistral Large).',
      },
      {
        en: 'A media authenticity scoring engine on a 0–1 scale, from deepfake to authentic, combining a deepfake-detection model with image signals (OpenCV, EXIF metadata, perceptual hashing).',
        es: 'Un motor de puntuación de autenticidad en escala 0–1, de deepfake a auténtico, que combina un modelo de detección de deepfakes con señales de imagen (OpenCV, metadatos EXIF, hashing perceptual).',
      },
      {
        en: 'Results encoded as W3C Verifiable Credentials (VC Data Model 2.0), signed through Sybol’s DID infrastructure.',
        es: 'Resultados codificados como Credenciales Verificables W3C (VC Data Model 2.0), firmadas con la infraestructura DID de Sybol.',
      },
      {
        en: 'A FastAPI service deployed on Railway. I led the team across technical, research and QA workstreams, working directly with Sybol’s CTO.',
        es: 'Un servicio FastAPI desplegado en Railway. Lideré al equipo en los frentes técnico, de investigación y QA, trabajando directamente con el CTO de Sybol.',
      },
    ],
    outcome: {
      en: 'Delivered a working compliance and authenticity API to the client over a five-month engagement. The code is public on GitHub.',
      es: 'Entregamos al cliente una API funcional de cumplimiento y autenticidad en cinco meses de colaboración. El código es público en GitHub.',
    },
    stack: ['LlamaIndex', 'Qdrant', 'Mistral Large', 'FastAPI', 'OpenCV', 'W3C VC', 'Railway'],
    links: [{ label: { en: 'Code', es: 'Código' }, href: 'https://github.com/javocruz/sybol-compliance-engine' }],
  },
  {
    slug: 'pharmable',
    index: '03',
    title: 'Pharmable',
    tagline: {
      en: 'AI validation that catches non-compliant regulatory documents before they reach human review.',
      es: 'Validación con IA que detecta documentos regulatorios no conformes antes de que lleguen a revisión humana.',
    },
    badge: { en: 'Co-founder & CTO', es: 'Cofundador y CTO' },
    kind: { en: 'Startup · AI compliance', es: 'Startup · Cumplimiento con IA' },
    when: { en: '2026 – now', es: '2026 – hoy' },
    role: { en: 'Co-founder & CTO', es: 'Cofundador y CTO' },
    team: { en: 'Founding team', es: 'Equipo fundador' },
    cover: 'pharma',
    featured: true,
    problem: {
      en: 'Biotechs preparing FDA/EMA filings review documents late and by hand. Quality-management platforms validate workflow and metadata, not whether the content of a document actually satisfies the regulation it is meant to meet.',
      es: 'Las biotecnológicas que preparan solicitudes ante la FDA y la EMA revisan los documentos tarde y a mano. Las plataformas de gestión de calidad validan el flujo y los metadatos, no si el contenido del documento cumple de verdad la regulación.',
    },
    built: [
      {
        en: 'A validation engine that checks document content against a regulatory rules library (21 CFR Part 11/211/820, EU GMP, ICH Q9/Q10/E3/M4, EMA eCTD) and classifies findings as critical, major or minor, each with a citation and a recommended fix.',
        es: 'Un motor de validación que contrasta el contenido del documento con una biblioteca de reglas (21 CFR Part 11/211/820, EU GMP, ICH Q9/Q10/E3/M4, EMA eCTD) y clasifica los hallazgos como críticos, mayores o menores, con cita y corrección recomendada.',
      },
      {
        en: 'A compliance dashboard with a live score, upload-and-scan with streamed findings, and document control with version history.',
        es: 'Un panel de cumplimiento con puntuación en vivo, carga y análisis con hallazgos en streaming, y control documental con historial de versiones.',
      },
      {
        en: 'An append-only, tamper-evident audit trail built on a SHA-256 hash chain, designed around EU GMP Annex 11 and 21 CFR Part 11, plus AI-assisted Clinical Study Report drafting.',
        es: 'Una pista de auditoría de solo adición y a prueba de manipulación, basada en una cadena de hashes SHA-256 y diseñada en torno al Anexo 11 de EU GMP y 21 CFR Part 11, además de redacción asistida por IA de Informes de Estudio Clínico.',
      },
    ],
    outcome: {
      en: 'A working MVP demo. Pre-revenue and building toward Series A–C biotech customers.',
      es: 'Un MVP funcional en demo. Todavía sin ingresos y construyendo hacia clientes biotecnológicos en Series A–C.',
    },
    stack: ['Next.js', 'Fastify', 'tRPC', 'FastAPI', 'Turborepo', 'Hash-chained audit log'],
    links: [],
  },
  {
    slug: 'streamscope',
    index: '04',
    title: 'StreamScope',
    tagline: {
      en: 'Real-time Twitch chat intelligence that surfaces the messages a streamer actually needs.',
      es: 'Inteligencia de chat de Twitch en tiempo real que destaca los mensajes que un streamer realmente necesita.',
    },
    badge: { en: '2nd of 25 teams', es: '2.º de 25 equipos' },
    kind: { en: 'Venture bootcamp · Full-stack ML', es: 'Venture bootcamp · ML full-stack' },
    when: { en: 'Feb 2026', es: 'Feb 2026' },
    role: { en: 'Product lead & system architect', es: 'Líder de producto y arquitecto del sistema' },
    team: { en: '4 people · developers + business lead', es: '4 personas · desarrolladores + líder de negocio' },
    cover: 'stream',
    featured: true,
    problem: {
      en: 'On a busy stream, chat moves faster than anyone can read, so streamers miss the questions, feedback and moments that matter.',
      es: 'En un stream concurrido el chat va más rápido de lo que nadie puede leer, así que los streamers se pierden las preguntas, el feedback y los momentos importantes.',
    },
    built: [
      {
        en: 'Real-time ingestion of Twitch chat with an NLP pipeline (sentence embeddings with a FastText fallback classifier) that sorts messages into categorised buckets.',
        es: 'Ingesta en tiempo real del chat de Twitch con un pipeline de NLP (embeddings de frases con un clasificador FastText de respaldo) que ordena los mensajes en categorías.',
      },
      {
        en: 'Speech-to-text of the streamer’s audio and LLM topic extraction, so chat can be matched to what is being talked about.',
        es: 'Transcripción del audio del streamer y extracción de temas con un LLM, para relacionar el chat con lo que se está hablando.',
      },
      {
        en: 'An analytics dashboard, overlay editor and collaboration features on a Flask REST API with 40+ endpoints, Supabase (PostgreSQL) and WebSockets.',
        es: 'Un panel de analítica, un editor de overlays y funciones de colaboración sobre una API REST en Flask con más de 40 endpoints, Supabase (PostgreSQL) y WebSockets.',
      },
      {
        en: 'I led product vision and directed the cross-functional team, defining features, roadmap and system architecture.',
        es: 'Lideré la visión de producto y dirigí al equipo multidisciplinar, definiendo funcionalidades, hoja de ruta y arquitectura.',
      },
    ],
    outcome: {
      en: 'Placed 2nd of 25 teams, mostly Master’s students, at the IE Tech Venture Bootcamp. Development continued toward a commercial launch.',
      es: 'Segundo puesto entre 25 equipos, la mayoría de máster, en el IE Tech Venture Bootcamp. El desarrollo continuó hacia un lanzamiento comercial.',
    },
    stack: ['Flask', 'Supabase', 'FastText', 'sentence-transformers', 'Whisper', 'WebSockets', 'React'],
    links: [{ label: { en: 'IE project page', es: 'Página del proyecto en IE' }, href: 'https://www.ie.edu/school-science-technology/student-projects/streamscope/' }],
  },
  {
    slug: 'iata-saf-datathon',
    index: '05',
    title: 'IATA × Infosys Datathon',
    tagline: {
      en: 'A levy mechanism that cuts the cost of decarbonizing aviation fuel from $633 to $29 per ton.',
      es: 'Un mecanismo de tasa que reduce el coste de descarbonizar el combustible de aviación de 633 $ a 29 $ por tonelada.',
    },
    badge: { en: 'Top 5 of 38 teams', es: 'Top 5 de 38 equipos' },
    kind: { en: 'Datathon · Data science & policy', es: 'Datathon · Ciencia de datos y política' },
    when: { en: 'Oct – Dec 2025', es: 'Oct – Dic 2025' },
    cover: 'aero',
    featured: false,
    problem: {
      en: 'Sustainable Aviation Fuel (SAF) is limited by physical supply, which keeps the marginal abatement cost high, and current EU mandates add a logistics penalty.',
      es: 'El combustible sostenible de aviación (SAF) está limitado por la oferta física, lo que mantiene alto el coste marginal de reducción, y los mandatos actuales de la UE añaden una penalización logística.',
    },
    built: [
      {
        en: 'Modeled SAF adoption across EU27 aviation using IATA, EUROCONTROL and Eurostat data.',
        es: 'Modelamos la adopción de SAF en la aviación de la UE-27 con datos de IATA, EUROCONTROL y Eurostat.',
      },
      {
        en: 'Proposed a proprietary, government-backed SAF levy, validated through consultations with Qatar Airways leadership.',
        es: 'Propusimos una tasa SAF propia respaldada por el gobierno, validada en consultas con la dirección de Qatar Airways.',
      },
      {
        en: 'A predictive model showing that pairing the levy with the Global Book & Claim mechanism eliminates the 15% logistics penalty in current EU mandates.',
        es: 'Un modelo predictivo que muestra que combinar la tasa con el mecanismo Global Book & Claim elimina la penalización logística del 15% de los mandatos actuales de la UE.',
      },
    ],
    outcome: {
      en: 'Top 5 of 38 teams, with a design that improves capital efficiency by 95%, cutting marginal abatement cost from $633/t to $29/t.',
      es: 'Top 5 de 38 equipos, con un diseño que mejora la eficiencia del capital un 95% y reduce el coste marginal de reducción de 633 $/t a 29 $/t.',
    },
    stack: ['Python', 'Predictive modeling', 'Data analysis', 'Policy design'],
    links: [{ label: { en: 'Code', es: 'Código' }, href: 'https://github.com/javocruz/iata-datathon' }],
  },
  {
    slug: 'frutas-prohibidas',
    index: '06',
    title: 'Frutas Prohibidas',
    tagline: {
      en: 'A sustainability dashboard that turns every restaurant transaction into CO₂, water and land impact.',
      es: 'Un panel de sostenibilidad que convierte cada transacción de un restaurante en impacto de CO₂, agua y suelo.',
    },
    badge: { en: 'Production MVP', es: 'MVP en producción' },
    kind: { en: 'Client project · Full-stack', es: 'Proyecto de cliente · Full-stack' },
    when: { en: 'Feb – Jun 2025', es: 'Feb – Jun 2025' },
    role: { en: 'Software engineer & team lead', es: 'Ingeniero de software y líder de equipo' },
    team: { en: '3 people', es: '3 personas' },
    cover: 'fruit',
    featured: false,
    problem: {
      en: 'A vegan restaurant wanted its sustainability story to be measurable: the real impact of every order, visible to staff and customers.',
      es: 'Un restaurante vegano quería que su historia de sostenibilidad fuera medible: el impacto real de cada pedido, visible para el personal y los clientes.',
    },
    built: [
      {
        en: 'A real-time dashboard platform calculating CO₂, water and land impact per transaction (React + TypeScript, Node.js/Express, Supabase).',
        es: 'Una plataforma de panel en tiempo real que calcula el impacto en CO₂, agua y suelo por transacción (React + TypeScript, Node.js/Express, Supabase).',
      },
      {
        en: 'An admin dashboard for staff to manage menu items, monitor sustainability metrics and configure eco-receipt printing rules, with secure authentication and role-based access control.',
        es: 'Un panel de administración para gestionar el menú, monitorizar métricas de sostenibilidad y configurar reglas de impresión de eco-tickets, con autenticación segura y control de acceso por roles.',
      },
      {
        en: 'CI/CD pipelines for automated testing and deployment. I owned client communication from requirements and demos through deployment.',
        es: 'Pipelines de CI/CD para pruebas y despliegue automatizados. Me encargué de la comunicación con el cliente, de los requisitos y demos al despliegue.',
      },
    ],
    outcome: {
      en: 'Shipped a production MVP for a real restaurant client.',
      es: 'Entregamos un MVP en producción para un cliente real de restauración.',
    },
    stack: ['React', 'TypeScript', 'Node.js', 'Express', 'Supabase', 'CI/CD'],
    links: [{ label: { en: 'Code', es: 'Código' }, href: 'https://github.com/javocruz/frutas-prohibidas-mvp' }],
  },
]

export const builds: Build[] = [
  {
    title: 'My ASL Teacher',
    when: 'Apr 2026 · Runway hackathon',
    text: {
      en: 'An ASL learning app with Runway avatars, MediaPipe hand tracking and a lesson mode.',
      es: 'Una app para aprender ASL con avatares de Runway, seguimiento de manos con MediaPipe y modo lecciones.',
    },
    href: 'https://github.com/javocruz/my-asl-teacher',
  },
  {
    title: 'European Flight Delays',
    when: 'ML Foundations · final project',
    text: {
      en: 'Predicting high ATC-delay days and delay minutes at European airports from EUROCONTROL data, with a strict temporal train/validation/test split. Team of six.',
      es: 'Predicción de días de alto retraso ATC y de minutos de retraso en aeropuertos europeos con datos de EUROCONTROL, con una división temporal estricta entrenamiento/validación/test. Equipo de seis.',
    },
    href: 'https://github.com/agarcia246/Machine_learning_Project',
  },
  {
    title: 'Iberdrola × IE Datathon',
    when: '2026 · Datathon',
    text: {
      en: 'Planning a phased 2027 interurban EV-charging rollout for Spain, using grid hosting capacity as a deployment filter.',
      es: 'Planificación de un despliegue por fases de carga de VE interurbana en España para 2027, usando la capacidad de red como filtro de despliegue.',
    },
  },
  {
    title: 'Rental Housing Law Navigator',
    when: '2026 · Hackathon challenge',
    text: {
      en: 'Given an address, resolves the jurisdiction stack and which tenancy rules apply: rent caps, just-cause eviction, deposits, screening and algorithmic pricing.',
      es: 'Dada una dirección, resuelve la jerarquía de jurisdicciones y qué normas de alquiler aplican: límites de renta, desahucio causal, fianzas, selección de inquilinos y precios algorítmicos.',
    },
  },
  {
    title: 'The Bazaar agent',
    when: 'Oct 2026 · Causa Prima hackathon',
    text: {
      en: 'A negotiation agent that haggles with card dealers, trades with other teams and runs a market, built for a live multi-team game in Madrid.',
      es: 'Un agente de negociación que regatea con vendedores de cromos, comercia con otros equipos y gestiona un mercado, creado para un juego en vivo entre equipos en Madrid.',
    },
  },
  {
    title: 'Orca restaurant agent',
    when: 'Mar 2026 · MADHACK × Orca',
    text: {
      en: 'A restaurant provider agent and a consumer agent for a collaborative travel-concierge ecosystem on the Orca platform.',
      es: 'Un agente proveedor de restaurantes y un agente consumidor para un ecosistema colaborativo de conserjería de viajes en la plataforma Orca.',
    },
    href: 'https://github.com/javocruz/OrcaHackathon',
  },
]
