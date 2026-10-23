import type { Build, Project } from './types'

export const projects: Project[] = [
  {
    slug: 'snapfrost',
    index: '01',
    title: 'SnapFrost',
    tagline: {
      en: 'Frost early-warning system that texts Andean potato farmers before a damaging night.',
      es: 'Sistema de alerta temprana de heladas que avisa por SMS a agricultores de papa andinos antes de una noche dañina.',
    },
    badge: { en: '1st place Madrid · 2nd place EMEA final', es: '1.er puesto Madrid · 2.º puesto final EMEA' },
    kind: { en: 'Hackathon · BCG Platinion × Welthungerhilfe', es: 'Hackathon · BCG Platinion × Welthungerhilfe' },
    when: { en: '16–17 Oct 2026', es: '16–17 oct 2026' },
    role: { en: 'Team member · hardware, ML and demo', es: 'Miembro del equipo · hardware, ML y demo' },
    team: {
      en: 'Clara Gómez Montero (lead), Jaume, Álvaro García Olivares, Marcos Arribas and me',
      es: 'Clara Gómez Montero (líder), Jaume, Álvaro García Olivares, Marcos Arribas y yo',
    },
    cover: 'frost',
    featured: true,
    problem: {
      en: 'A single frost night can wipe out a potato harvest in the Bolivian Andes, along with the farmer’s income and next year’s seed. Regional forecasts measure air at 2 m, but on clear, calm nights the air at the leaves is colder. Farmers have basic phones, so the warning has to be an SMS.',
      es: 'Una sola noche de helada puede acabar con una cosecha de papa en los Andes bolivianos, y con ella los ingresos del agricultor y la semilla del año siguiente. Las previsiones regionales miden el aire a 2 m, pero en noches despejadas y en calma el aire junto a las hojas está más frío. Los agricultores tienen teléfonos básicos, así que el aviso tiene que ser un SMS.',
    },
    built: [
      {
        en: 'A Raspberry Pi 5 field station with temperature, pressure and humidity sensors, plus an LCD, a risk LED and a buzzer.',
        es: 'Una estación de campo con Raspberry Pi 5 y sensores de temperatura, presión y humedad, además de una pantalla LCD, un LED de riesgo y un zumbador.',
      },
      {
        en: 'The station works offline: it raises the alarm locally and buffers readings if the network drops.',
        es: 'La estación funciona sin conexión: da la alarma en local y guarda las lecturas si se cae la red.',
      },
      {
        en: 'A quantile gradient-boosting model that predicts the night’s minimum temperature and corrects it with live sensor readings.',
        es: 'Un modelo de gradient boosting por cuantiles que predice la temperatura mínima de la noche y la corrige con las lecturas del sensor en vivo.',
      },
      {
        en: 'SMS alerts through Twilio/Vonage when the risk is moderate or higher.',
        es: 'Alertas por SMS con Twilio/Vonage cuando el riesgo es moderado o mayor.',
      },
      {
        en: 'A live demo where judges scanned a QR code, played the farmers and watched the real sensor get cooled.',
        es: 'Una demo en vivo en la que el jurado escaneaba un QR, hacía de agricultor y veía cómo se enfriaba el sensor real.',
      },
    ],
    outcome: {
      en: '14% lower forecast error than the raw ECMWF forecast on 358 unseen nights (1.50 to 1.29 °C). Built in two days; 1st in Madrid, then 2nd in the EMEA final against the winners of the other BCG Platinion hubs. A prototype, with a pilot proposed.',
      es: 'Un 14% menos de error de previsión que la previsión ECMWF sin corregir en 358 noches no vistas (de 1,50 a 1,29 °C). Hecho en dos días; 1.º en Madrid y después 2.º en la final EMEA frente a los ganadores de los demás hubs de BCG Platinion. Un prototipo, con un piloto propuesto.',
    },
    stack: ['Python', 'FastAPI', 'SQLite', 'scikit-learn', 'pandas', 'React', 'TypeScript', 'Vite', 'Three.js', 'Raspberry Pi 5', 'I2C', 'Open-Meteo / ERA5-Land', 'Twilio', 'Pytest', 'Playwright'],
    links: [],
  },
  {
    slug: 'los-panaderos',
    index: '02',
    title: 'Los Panaderos',
    tagline: {
      en: 'AI agents run a wildfire crisis room, dispatching drones and trucks with incomplete information.',
      es: 'Agentes de IA dirigen una sala de crisis de incendios y despachan drones y camiones con información incompleta.',
    },
    badge: { en: '1st place · HappyRobot track', es: '1.er puesto · track HappyRobot' },
    kind: { en: 'Hackathon · HackSpain 2026', es: 'Hackathon · HackSpain 2026' },
    when: { en: '18–20 Sep 2026', es: '18–20 sep 2026' },
    role: { en: 'Team member · product and interface', es: 'Miembro del equipo · producto e interfaz' },
    team: {
      en: 'Federico Lozano Cuadra, Guillermo Villar Sánchez, Juan Camacho Mohedano and me',
      es: 'Federico Lozano Cuadra, Guillermo Villar Sánchez, Juan Camacho Mohedano y yo',
    },
    cover: 'fire',
    featured: true,
    problem: {
      en: 'The first smoke call arrives before anyone has confirmed the fire. Wind shifts, there are more fronts than vehicles, and warning the wrong district is as bad as not warning. A control room has to decide on incomplete information, and a fixed protocol falls behind at the first wind change.',
      es: 'La primera llamada por humo llega antes de que nadie haya confirmado el fuego. El viento cambia, hay más frentes que vehículos y avisar al distrito equivocado es tan malo como no avisar. Una sala de control tiene que decidir con información incompleta, y un protocolo fijo se queda atrás en el primer cambio de viento.',
    },
    built: [
      {
        en: 'A custom wildfire simulator of Brunete where the agents only see what the sensors and delayed satellite data show.',
        es: 'Un simulador de incendios propio de Brunete en el que los agentes solo ven lo que muestran los sensores y los datos de satélite con retraso.',
      },
      {
        en: 'HappyRobot agents that prioritise incidents and send scout drones, extinguisher drones and fire trucks.',
        es: 'Agentes de HappyRobot que priorizan incidentes y envían drones de exploración, drones extintores y camiones de bomberos.',
      },
      {
        en: 'A bilingual (ES/EN) control-room interface with a dual map: the ground truth next to what the system actually knows.',
        es: 'Una interfaz de sala de control bilingüe (ES/EN) con doble mapa: la realidad junto a lo que el sistema sabe de verdad.',
      },
      {
        en: 'A live demo: ignite a fire, send the first smoke call, and watch the agents assign missions as the two maps drift apart.',
        es: 'Una demo en vivo: provocar un incendio, enviar la primera llamada por humo y ver cómo los agentes asignan misiones mientras los dos mapas se separan.',
      },
    ],
    outcome: {
      en: '1st place in the HappyRobot track, one of five tracks, at HackSpain 2026: 36 hours, about 250 builders. A prototype.',
      es: '1.er puesto en el track de HappyRobot, uno de cinco tracks, en HackSpain 2026: 36 horas y unos 250 participantes. Un prototipo.',
    },
    stack: ['Python', 'Custom simulation engine', 'JavaScript', 'Canvas', 'HappyRobot', 'MCP'],
    links: [
      { label: { en: 'Live demo', es: 'Demo en vivo' }, href: 'https://hackspain.g-villar.tech' },
      { label: { en: 'Code (team repo)', es: 'Código (repo del equipo)' }, href: 'https://github.com/Fedeloz/Los_Panaderos' },
    ],
  },
  {
    slug: 'sybol-compliance-engine',
    index: '03',
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
    index: '04',
    title: 'Pharmable',
    tagline: {
      en: 'AI validation that catches non-compliant regulatory documents before they reach human review.',
      es: 'Validación con IA que detecta documentos regulatorios no conformes antes de que lleguen a revisión humana.',
    },
    badge: { en: 'Co-founder & CTO · MVP on hold', es: 'Cofundador y CTO · MVP en pausa' },
    kind: { en: 'Startup · AI compliance', es: 'Startup · Cumplimiento con IA' },
    when: { en: '2026 · on hold', es: '2026 · en pausa' },
    role: { en: 'Co-founder & CTO', es: 'Cofundador y CTO' },
    team: { en: 'Founding team', es: 'Equipo fundador' },
    cover: 'pharma',
    featured: false,
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
        en: 'A compliance dashboard with a running score, upload-and-scan with streamed findings, and document control with version history.',
        es: 'Un panel de cumplimiento con puntuación continua, carga y análisis con hallazgos en streaming, y control documental con historial de versiones.',
      },
      {
        en: 'An append-only, tamper-evident audit trail built on a SHA-256 hash chain, designed around EU GMP Annex 11 and 21 CFR Part 11, plus AI-assisted Clinical Study Report drafting.',
        es: 'Una pista de auditoría de solo adición y a prueba de manipulación, basada en una cadena de hashes SHA-256 y diseñada en torno al Anexo 11 de EU GMP y 21 CFR Part 11, además de redacción asistida por IA de Informes de Estudio Clínico.',
      },
    ],
    outcome: {
      en: 'An MVP in progress, currently on hold. Pre-revenue, aimed at Series A–C biotechs.',
      es: 'Un MVP en curso, ahora en pausa. Sin ingresos, orientado a biotecnológicas en Series A–C.',
    },
    stack: ['Next.js', 'Fastify', 'tRPC', 'FastAPI', 'Turborepo', 'Hash-chained audit log'],
    links: [],
  },
  {
    slug: 'frutas-prohibidas',
    index: '05',
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
    title: 'StreamScope',
    when: '2025/26 · IE Tech Venture Bootcamp',
    text: {
      en: 'A real-time Twitch chat intelligence platform. 2nd of 25 teams at the IE Tech Venture Bootcamp.',
      es: 'Una plataforma de inteligencia de chat de Twitch en tiempo real. 2.º de 25 equipos en el IE Tech Venture Bootcamp.',
    },
    href: 'https://github.com/javocruz/Stream-Scope',
  },
  {
    title: 'IATA × Infosys Sustainability Datathon',
    when: 'Oct – Dec 2025 · Datathon',
    text: {
      en: 'A cost-benefit model for sustainable aviation fuel; a proposed levy brings the cost per ton of CO₂ from $633 to $29. Top 5 of 38 teams.',
      es: 'Un modelo coste-beneficio del combustible sostenible de aviación; una tasa propuesta reduce el coste por tonelada de CO₂ de 633 $ a 29 $. Top 5 de 38 equipos.',
    },
    href: 'https://github.com/javocruz/iata-datathon',
  },
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
