export type PortalViewId =
  | 'inicio'
  | 'eventos'
  | 'atencion'
  | 'reels'
  | 'noticias'
  | 'nosotros'
  | 'admin';

export interface FacebookPostItem {
  id: string;
  imagenUrl: string;
  titulo: string;
  descripcionCompleta: string;
  fecha: string;
  facebookPostUrl: string;
}

export type EventCategory =
  | 'Deporte'
  | 'Innovación y Negocios'
  | 'Cultura'
  | 'Académico';

export interface EventItem {
  id: string;
  title: string;
  category: EventCategory;
  categoryColor: 'secondary' | 'accent' | 'primary';
  badgeIcon: string;
  badgeText: string;
   badgeBg: 'primary' | 'accent';
  dateLabel: string;
  shortDate: string;
  description: string;
  image: string;
  location: string;
  organizer: string;
  quota: string;
  requirements: string[];
  benefits: string[];
  basesSummary: string;
  featuredInHome: boolean;
}

export interface StudentServiceItem {
  id: string;
  title: string;
  icon: string;
  description: string;
  details: string[];
  whatsappMessage: string;
  officeHours: string;
  responsibleSecretariat: string;
}

export interface RegulationArticle {
  number: string;
  title: string;
  content: string;
}

export interface RegulationDoc {
  id: string;
  title: string;
  subtitle: string;
  code: string;
  updatedAt: string;
  pages: number;
  fileSize: string;
  summary: string;
  articles: RegulationArticle[];
}

export interface ReelItem {
  id: string;
  title: string;
  caption: string;
  category: 'Gestión' | 'Deportes' | 'Cultura' | 'Tutorial';
  categoryBg: 'primary' | 'secondary' | 'accent';
  views: string;
  likes: string;
  comments: string;
  duration: string;
  publishedAt: string;
  image: string;
  tiktokUrl: string;
  highlights: string[];
  featuredInHome: boolean;
}

export interface NewsItem {
  id: string;
  title: string;
  category: 'Proyección Social' | 'Gestión' | 'Infraestructura' | 'Académico';
  categoryBg: 'accent' | 'primary' | 'secondary';
  date: string;
  readTime: string;
  author: string;
  summary: string;
  image: string;
  fullContent: string[];
  keyImpacts: string[];
  featuredInHome: boolean;
}

export interface FacultyOption {
  id: string;
  name: string;
  careers: string[];
}

export interface ExecutiveMember {
  id: string;
  name: string;
  role: string;
  faculty: string;
  description: string;
  whatsappText: string;
}

export interface RegistrationPayload {
  confirmationCode: string;
  eventId: string;
  eventTitle: string;
  eventCategory: string;
  fullName: string;
  studentId: string;
  faculty: string;
  career: string;
  whatsapp: string;
  submittedAt: string;
}

export const OFFICIAL_WHATSAPP_NUMBER = '59175562627';

export function buildWhatsAppUrl(message: string): string {
  return `https://wa.me/${OFFICIAL_WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

export const OFFICIAL_LOGOS = {
  ful: '/images/logo_ful.jpg',
  uagrmWordmark: '/images/logo_uagrm.png',
  uagrmShield: '/images/escudo_uagrm.jpg',
  heroCampusBg:
    'https://lh3.googleusercontent.com/aida/ALJJyrAigTS0hJlsKJJQpaf_DyieUXVZHKasazQUwFLPP7cjWvs6nyyiVVa36bpCP6nRNNDt8RT5gwDd_Hq9LYZsqQsgD3CduILHkQoEw1lPmaB_UtX3fjdFCQCqJbZZyMT2CzUmMZOfHSADdRV0hZ-nATfcTwOKiMMfDGA8ku3514YjwF089va6vxQlRdjVVegdyEaFdrs6gbUCAMVb7tV7J43JsxPBzcprjSxjop-iG_HL1H-dK0VqMF2vI6M',
};

export const UAGRM_FACULTIES: FacultyOption[] = [
  {
    id: 'ficct',
    name: 'Facultad de Ingeniería en Ciencias de la Computación y Telecomunicaciones (FICCT)',
    careers: ['Ingeniería Informática', 'Ingeniería en Sistemas', 'Ingeniería en Redes y Telecomunicaciones'],
  },
  {
    id: 'fcet',
    name: 'Facultad de Ciencias Exactas y Tecnología (FCET)',
    careers: [
      'Ingeniería Civil',
      'Ingeniería Industrial',
      'Ingeniería Petrolera',
      'Ingeniería Química',
      'Ingeniería Electromecánica',
      'Ingeniería Ambiental',
      'Ingeniería de Alimentos',
      'Ingeniería de Control de Procesos',
    ],
  },
  {
    id: 'fceaf',
    name: 'Facultad de Ciencias Económicas y Empresariales (FCEE)',
    careers: ['Administración de Empresas', 'Economía', 'Ingeniería Comercial', 'Ingeniería Financiera', 'Comercio Internacional'],
  },
  {
    id: 'fcjpsri',
    name: 'Facultad de Ciencias Jurídicas, Políticas, Sociales y Relaciones Internacionales',
    careers: ['Derecho', 'Ciencia Política y Administración Pública', 'Relaciones Internacionales', 'Trabajo Social'],
  },
  {
    id: 'fcs',
    name: 'Facultad de Ciencias de la Salud Humana',
    careers: ['Medicina', 'Enfermería', 'Odontología'],
  },
  {
    id: 'fcapf',
    name: 'Facultad de Contaduría Pública (Auditoría Financiera)',
    careers: ['Contaduría Pública', 'Información y Control de Gestión'],
  },
  {
    id: 'fch',
    name: 'Facultad de Humanidades',
    careers: [
      'Psicología',
      'Ciencias de la Comunicación',
      'Ciencias de la Educación',
      'Sociología',
      'Lenguas Modernas y Filología Hispánica',
      'Gestión del Turismo',
    ],
  },
  {
    id: 'fahdu',
    name: 'Facultad de Ciencias del Hábitat, Diseño y Arte',
    careers: ['Arquitectura', 'Diseño Integral', 'Planificación Territorial', 'Arte'],
  },
  {
    id: 'fca',
    name: 'Facultad de Ciencias Agrícolas',
    careers: ['Ingeniería Agronómica', 'Ingeniería Forestal', 'Biología', 'Ciencias Ambientales'],
  },
  {
    id: 'fmvz',
    name: 'Facultad de Ciencias Veterinarias',
    careers: ['Medicina Veterinaria y Zootecnia'],
  },
  {
    id: 'fcbb',
    name: 'Facultad de Ciencias Farmacéuticas y Bioquímicas',
    careers: ['Bioquímica', 'Farmacia'],
  },
  {
    id: 'fp',
    name: 'Facultad Politécnica',
    careers: ['Construcciones Civiles', 'Mecánica General', 'Electricidad Industrial', 'Electrónica', 'Agrimensura', 'Ofimática'],
  },
  {
    id: 'finor',
    name: 'Facultad Integral del Norte (FINOR - Montero)',
    careers: ['Ingeniería Comercial', 'Contaduría Pública', 'Derecho', 'Enfermería', 'Ingeniería Petrolera', 'Medicina Veterinaria'],
  },
  {
    id: 'fii',
    name: 'Facultad Integral de Ichilo (Yapacaní)',
    careers: ['Ingeniería Agropecuaria', 'Contaduría Pública', 'Ciencias de la Educación', 'Administración de Empresas'],
  },
  {
    id: 'fich',
    name: 'Facultad Integral del Chaco (Camiri)',
    careers: ['Ingeniería del Petróleo y Gas Natural', 'Contaduría Pública', 'Derecho', 'Ciencias de la Educación'],
  },
  {
    id: 'fiquim',
    name: 'Facultad Integral Chiquitana (San Ignacio de Velasco)',
    careers: ['Ingeniería Agropecuaria', 'Zootecnia', 'Contaduría Pública', 'Turismo'],
  },
  {
    id: 'fiv',
    name: 'Facultad Integral de los Valles Cruceños (Vallegrande)',
    careers: ['Ingeniería Agropecuaria', 'Contaduría Pública', 'Sistemas Informáticos'],
  },
  {
    id: 'fip',
    name: 'Facultad Integral del Noreste (San Julián)',
    careers: ['Ingeniería Agropecuaria', 'Contaduría Pública', 'Enfermería'],
  },
];

export const PORTAL_EVENTS: EventItem[] = [
  {
    id: 'card-event-1',
    title: 'Campeonato Interfacultativo de Futsal',
    category: 'Deporte',
    categoryColor: 'secondary',
    badgeIcon: 'sports_soccer',
    badgeText: '18 Facultades',
    badgeBg: 'primary',
    dateLabel: 'Inicia: 24 de Noviembre, 2026',
    shortDate: '24 de Noviembre, 2026',
    description:
      'Inscribe el representativo de tu carrera para el torneo deportivo más grande del campus universitario. Premios y trofeos FUL.',
    image:
      'https://lh3.googleusercontent.com/aida/ALJJyrCKBSGA7RRydyKunseIlbHLZnzzjTCzagjbqx-Naml6FZipzOz2UqvTe3ZgX67ENMsQ1hID-31MbA7wMTdhs5LP_oEhS7vqO9AyGzGhGFK-HilQbwLoPSUE7QQCBgqdPJLky_6Ooe_JiORJq69Agft2gvA3HeKfJSgVT3G0Lw3nusQGz-yM7gn53hU1awYFKPYYWomfr8sxzO0TEvXGP5ODmWvD7trPyx2nK1PeRR04mS4TZwW3',
    location: 'Coliseo Polideportivo Ciudad Universitaria (2do Anillo)',
    organizer: 'Secretaría de Deportes y Recreación FUL UAGRM',
    quota: 'Hasta 2 selecciones por carrera (Categorías Damas y Varones)',
    requirements: [
      'Estudiante regular matriculado en la gestión 2/2026 de la UAGRM',
      'Boleta de inscripción actualizada y Cédula de Identidad vigente',
      'Nómina oficial de 8 a 12 jugadores avalada por su Centro Interno o delegado',
    ],
    benefits: [
      'Trofeo Rotativo Copa FUL 2026–2028, medallas e indumentaria deportiva oficial',
      'Arbitraje colegiado e hidratación cubierta al 100% por la FUL',
      'Certificación oficial de participación deportiva universitaria',
    ],
    basesSummary:
      'El Campeonato Interfacultativo de Futsal reúne a las 18 facultades y unidades integrales de la UAGRM en modalidades Damas y Varones. La inscripción es totalmente gratuita y garantiza seguro médico deportivo dentro del campus.',
    featuredInHome: true,
  },
  {
    id: 'card-event-2',
    title: 'Feria de Emprendimiento Universitario',
    category: 'Innovación y Negocios',
    categoryColor: 'accent',
    badgeIcon: 'storefront',
    badgeText: 'Stands Gratuitos',
    badgeBg: 'primary',
    dateLabel: '02 al 04 de Diciembre, 2026',
    shortDate: '02 al 04 de Diciembre, 2026',
    description:
      'Espacio de exposición comercial y capital semilla para proyectos y emprendimientos de estudiantes morenianos.',
    image:
      'https://lh3.googleusercontent.com/aida/ALJJyrA5Y3JnmsGGhhuJ1YFPIw7uouyxjT6zXzWjCosDp5xrEJSDf7Rwk0fGofGLe_Wr7PvnwCHYcky8_vQIPbOrL2n3UkQQwamMGrmiQBfeDoWCWTnOoqMDj7r_hIv773uuXoS8XwX_Q5o9LFi0K1D45fZUsDvMYeZdXljCSyw10spHKb9gnLQSsNXnCSlXqzcg2z_Bp6W6smBDSn1LaM6ApjCsmMzgsP0WEaNVHafN2xm27by3LT_x1Gwp3n_NPDor7V4m9U0',
    location: 'Explanada Central de Módulos UAGRM',
    organizer: 'Secretaría de Innovación, Proyectos y Desarrollo Estudiantil FUL',
    quota: '120 stands equipados sin costo para estudiantes emprendedores',
    requirements: [
      'Al menos un integrante titular debe ser estudiante activo de la UAGRM',
      'Breve descripción del producto, servicio o prototipo tecnológico',
      'Compromiso de atención del stand durante las tres jornadas feriales',
    ],
    benefits: [
      'Asignación gratuita de stand con toldo, mesa, punto eléctrico y Wi-Fi',
      'Evaluación por jurado empresarial para premios de Capital Semilla FUL',
      'Certificado con valor curricular y difusión en @ful.uagrm',
    ],
    basesSummary:
      'La Feria de Emprendimiento Universitario impulsa la economía estudiantil cruceña ofreciendo vitrina comercial directa, mentorías en modelo de negocios y capital semilla a las mejores iniciativas.',
    featuredInHome: true,
  },
  {
    id: 'card-event-3',
    title: 'Ballet Folklórico FUL - Rumbo a la Entrada Universitaria',
    category: 'Cultura',
    categoryColor: 'secondary',
    badgeIcon: 'theater_comedy',
    badgeText: 'Audiciones Abiertas',
    badgeBg: 'primary',
    dateLabel: 'Convocatoria Abierta 2026',
    shortDate: 'Convocatoria Abierta 2026',
    description:
      'Forma parte del elenco oficial que representará a la UAGRM en festivales departamentales y la gran entrada folklórica.',
    image:
      'https://lh3.googleusercontent.com/aida/ALJJyrAhmcyHXi37enHlKiOCONuitdLmMxvP5mRpMQVvsUtQm_OxwqG7m2MHPeUfRhdIub4i8R08Z07AOlo-fCJcsEcdrOasqrABS5CCL3BcknzAUyB5Sc2gm763U4ZNpnqAhJnywAIn6IpdKv3IXjRaCbzlrbR-w41wjeerSxCf6Yea8Sl-pnBUcW6Js496a80F7VmoQWE4V_cTr0Qc2gLeGszdSS-gfXxG99gnS2_HVR0F4HwWZHorIYLlJC2UT2A4cOo',
    location: 'Salón de Ensayos Paraninfo Universitario y Edificio FUL',
    organizer: 'Secretaría de Cultura y Folklore Moreniano FUL',
    quota: '80 plazas para bailarines y músicos de todas las facultades',
    requirements: [
      'Ser estudiante regular de cualquier carrera de la UAGRM',
      'Disponibilidad de horarios para ensayos los martes, jueves y sábados',
      'Entusiasmo por las danzas orientales, chaqueñas y nacionales',
    ],
    benefits: [
      'Vestuario oficial de gala financiado por la Federación Universitaria Local',
      'Beca cultural y reconocimiento por representación artística institucional',
      'Participación en el Festival Nacional de entradas universitarias',
    ],
    basesSummary:
      'El Ballet Folklórico Oficial de la FUL convoca a estudiantes con o sin experiencia previa para integrar el cuerpo de baile representativo de la René Moreno en festivales regionales y nacionales.',
    featuredInHome: true,
  },
  {
    id: 'card-event-4',
    title: 'Cursos de Nivelación y Auxiliatura',
    category: 'Académico',
    categoryColor: 'primary',
    badgeIcon: 'school',
    badgeText: '100% Gratuito',
    badgeBg: 'accent',
    dateLabel: 'Inicio de Clases: 01 de Diciembre',
    shortDate: 'Inicio: 01 de Diciembre',
    description:
      'Refuerzo gratuito en Cálculo, Física, Química y Metodología de Investigación dictado por auxiliares de docencia destacados.',
    image:
      'https://lh3.googleusercontent.com/aida/ALJJyrCRNRBwB5SKOjNd9rcYJqX2hXy9Vk6meDIJYCsKsXj8lD8-i7NKN_TkUK4hat-TUrLeMAw3-wgvh-U4vnIOKtu-v34XHNiWKl2_zYG5Negzm5EzJoK5qM6GU1qvHjRaZF2slgoza4nmjAp7gGUVZciLQGBFKiZI9W_6_NACC8zj8LzsOV3AFrMS0XtVzTTyyJ09yNJ7rnI4kkuFYqE1cCJPyRkXIvaD3fNZ_FfoACRQZYTrMKvX7W_2jcyE',
    location: 'Aulas Magnas Módulos 212, 224 y 236 - Ciudad Universitaria',
    organizer: 'Secretaría Académica y Científica FUL UAGRM',
    quota: 'Cupos por paralelo de 60 estudiantes (Turnos mañana, tarde y noche)',
    requirements: [
      'Registro Universitario activo de 8 o 9 dígitos',
      'Seleccionar las materias de refuerzo al momento de la inscripción',
      'Asistencia mínima del 80% para recibir certificado y banco de exámenes',
    ],
    benefits: [
      'Guías prácticas impresas y solucionarios de exámenes parciales y finales',
      'Simulacros presenciales antes de la semana de exámenes finales',
      'Certificado de participación académica avalado por la FUL',
    ],
    basesSummary:
      'Programa intensivo y gratuito de preparación para exámenes parciales, finales y mesas examinadoras en materias troncales de ciencias exactas, económicas, jurídicas y salud.',
    featuredInHome: true,
  },
  {
    id: 'card-event-5',
    title: 'Congreso Departamental de Liderazgo e Investigación Científica',
    category: 'Académico',
    categoryColor: 'primary',
    badgeIcon: 'workspace_premium',
    badgeText: 'Valor Curricular',
    badgeBg: 'accent',
    dateLabel: '11 y 12 de Diciembre, 2026',
    shortDate: '11 y 12 de Diciembre, 2026',
    description:
      'Ponencias magistrales, mesas de investigación estudiantil y certificación oficial con carga horaria académica para todas las carreras.',
    image:
      'https://lh3.googleusercontent.com/aida/ALJJyrCRN7vDCVYwLWh5AK52pPauR0Y6XROeJKO5XeJJUNIV_YfmypmMyo6IwTy5BgQKfbbbVw86WSGOPBdReMgw_s3ic_B25foXJ3_YA7VmnJkdlEclT5qs4ytdF5B4GC4EJsxJpkaONgAKN3d3eU5jgne0D2twduNJ6zM2tbGsK3bLFS06C23lb0vAwHRJYM_bXEcIhuDdGqLW4cSV-nsTdqluLIBpIhrYXm7XFtaA6XC_Xpo6CBpbO85E',
    location: 'Salón Auditorio de los Módulos UAGRM',
    organizer: 'Secretaría Ejecutiva y Comisión Académica FUL',
    quota: '400 participantes acreditados',
    requirements: [
      'Estudiante regular de pregrado de la UAGRM (Campus o Facultades Integrales)',
      'Registro previo en línea mediante el portal oficial de la FUL',
    ],
    benefits: [
      'Certificado físico y digital con 30 horas académicas de valor curricular',
      'Carpeta institucional, material de apoyo y refrigerio',
      'Publicación de los mejores artículos estudiantiles en la revista FUL',
    ],
    basesSummary:
      'Encuentro académico multidisciplinario orientado a fortalecer las competencias de investigación, innovación tecnológica y liderazgo universitario en Santa Cruz.',
    featuredInHome: false,
  },
  {
    id: 'card-event-6',
    title: 'Hackathon Moreniano de Soluciones Digitales para el Campus',
    category: 'Innovación y Negocios',
    categoryColor: 'accent',
    badgeIcon: 'terminal',
    badgeText: 'Premios en Efectivo',
    badgeBg: 'primary',
    dateLabel: '18 y 19 de Diciembre, 2026',
    shortDate: '18 y 19 de Diciembre, 2026',
    description:
      'Maratón de 36 horas para desarrollar aplicaciones, automatización de trámites estudiantiles y soluciones smart-campus en la UAGRM.',
    image:
      'https://lh3.googleusercontent.com/aida/ALJJyrA1_xrfzppQO4tlZxq5xWzZ2aQ_nMqPDqRCMJT809u0bz0J82csWF6_DBUZ-GvN7whm_cF-TBLQDLbcrsF3qRKK7aWG-g-uF4Pedi4Ce_j8CCix76AGnLBiiX3R5scgM8_YsxKg0VnJqoZju-iiukUhTL1u7hB8mxWACulgnk2PT_5LGATHe4KiHT5qyA_dhQ-TdyVZ3Koxl78scBGPFYVHYE1szOlrxjWAPIrv9or4BSNBiLEM59w5i6BXrnfy',
    location: 'Laboratorios de Cómputo y Sala de Estudio FUL',
    organizer: 'Secretaría de Ciencia y Tecnología FUL UAGRM',
    quota: '30 equipos multidisciplinarios (de 3 a 5 estudiantes)',
    requirements: [
      'Equipos integrados por estudiantes activos de la UAGRM',
      'Portar equipo portátil personal para las sesiones de desarrollo',
    ],
    benefits: [
      'Premios económicos a los 3 primeros lugares e incubación del proyecto',
      'Alimentación e internet de alta velocidad durante toda la competencia',
      'Certificación oficial y vinculación con empresas tecnológicas cruceñas',
    ],
    basesSummary:
      'Convocatoria abierta a estudiantes de informática, sistemas, diseño, administración e ingenierías para cocrear herramientas tecnológicas al servicio del estudiante.',
    featuredInHome: false,
  },
];

export const STUDENT_SERVICES: StudentServiceItem[] = [
  {
    id: 'service-academica',
    title: 'Asesoría Académica',
    icon: 'menu_book',
    description:
      'Resolución de conflictos de notas, habilitación de mesas extraordinarias, convalidaciones y casos especiales.',
    details: [
      'Revisión y reclamo formal de calificaciones ante direcciones de carrera',
      'Solicitud de levantamiento de bloqueo de registro por motivos justificados',
      'Orientación en cambios de carrera, carreras paralelas y traspasos',
    ],
    whatsappMessage:
      'Hola FUL UAGRM, necesito apoyo en el área de Asesoría Académica (notas, adición, bloqueo o trámites de carrera).',
    officeHours: 'Lun a Vie: 08:00 – 18:30',
    responsibleSecretariat: 'Secretaría Académica FUL',
  },
  {
    id: 'service-defensoria',
    title: 'Defensoría Universitaria',
    icon: 'shield',
    description:
      'Acompañamiento legal frente a arbitrariedades, cobros irregulares, acoso y vulneraciones al estatuto orgánico.',
    details: [
      'Denuncias confidenciales contra cobros indebidos de textos o laboratorios',
      'Representación estudiantil ante el Tribunal de Justicia Universitaria',
      'Defensa irrestricta de los derechos consagrados en el Estatuto Orgánico',
    ],
    whatsappMessage:
      'Hola Defensoría Universitaria FUL UAGRM, deseo reportar una vulneración de derechos estudiantiles y recibir asesoramiento confidencial.',
    officeHours: 'Lun a Vie: 08:00 – 18:30 (Atención prioritaria)',
    responsibleSecretariat: 'Secretaría de Conflictos y Derechos Estudiantiles',
  },
  {
    id: 'service-becas',
    title: 'Becas y Bienestar',
    icon: 'card_membership',
    description:
      'Fiscalización y postulación a becas comedor, beca IDH, internado y subsidios de transporte estudiantil.',
    details: [
      'Guía de requisitos socioeconómicos y académicos para Beca Comedor',
      'Seguimiento de pagos de Beca Estudio, Investigación e Internado Rotatorio IDH',
      'Atención médica preventiva y brigadas de salud estudiantil',
    ],
    whatsappMessage:
      'Hola FUL UAGRM, quisiera recibir información y asesoría sobre postulación y seguimiento de Becas (Comedor / IDH).',
    officeHours: 'Lun a Vie: 08:00 – 18:30',
    responsibleSecretariat: 'Secretaría de Bienestar Estudiantil y Becas',
  },
  {
    id: 'service-tramites',
    title: 'Agilización de Trámites',
    icon: 'fact_check',
    description:
      'Orientación paso a paso para títulos en provisión nacional, certificados de notas y trámites ante DPA.',
    details: [
      'Verificación de requisitos para Graduación por Excelencia y Modalidades de Grado',
      'Seguimiento a trámites demorados de Diploma Académico y Título en Provisión Nacional',
      'Guía para legalizaciones, históricos académicos y certificados gratuitos',
    ],
    whatsappMessage:
      'Hola FUL UAGRM, solicito orientación para agilizar mi trámite de titulación / certificado ante DPA.',
    officeHours: 'Lun a Vie: 08:00 – 18:30',
    responsibleSecretariat: 'Secretaría de Trámites y Seguimiento Administrativo',
  },
];

export const OFFICIAL_REGULATIONS: RegulationDoc[] = [
  {
    id: 'estatuto-organico',
    title: 'Estatuto Orgánico',
    subtitle: 'UAGRM (PDF)',
    code: 'GACETA-UAGRM-EO-2026',
    updatedAt: 'Vigente Gestión 2026–2028',
    pages: 64,
    fileSize: '2.4 MB',
    summary:
      'Norma fundamental de la Universidad Autónoma Gabriel René Moreno que consagra la Autonomía Universitaria, el cogobierno paritario docente-estudiantil y los derechos y garantías de los estudiantes.',
    articles: [
      {
        number: 'Artículo 5° (Cogobierno Paritario)',
        title: 'Representación Estudiantil en Órganos de Gobierno',
        content:
          'El gobierno de la Universidad Autónoma Gabriel René Moreno se ejerce mediante la participación paritaria de docentes y estudiantes en el Ilustre Consejo Universitario (ICU), Consejos Facultativos y Consejos de Carrera.',
      },
      {
        number: 'Artículo 88° (Derechos del Estudiante)',
        title: 'Garantías Académicas y Gratuidad de la Enseñanza',
        content:
          'Todo estudiante regular tiene derecho a recibir formación académica de calidad sin cobros al margen de los aranceles universitarios aprobados, a ser evaluado con objetividad y a contar con defensa institucional ante cualquier vulneración.',
      },
      {
        number: 'Artículo 94° (Reconocimiento de la FUL)',
        title: 'Órgano Máximo de Representación Estudiantil',
        content:
          'La Federación Universitaria Local (FUL) es la máxima entidad gremial y representativa del estamento estudiantil de la UAGRM en el campus central y las unidades facultativas integrales de provincia.',
      },
    ],
  },
  {
    id: 'regimen-estudiantil',
    title: 'Régimen Estudiantil',
    subtitle: 'Derechos y deberes',
    code: 'RES-ICU-RE-042/2026',
    updatedAt: 'Actualizado 2026',
    pages: 38,
    fileSize: '1.6 MB',
    summary:
      'Reglamenta los procedimientos de admisión, permanencia, evaluación académica, recalificación de exámenes, licencias temporales y modalidades de graduación en todas las carreras de la UAGRM.',
    articles: [
      {
        number: 'Artículo 19° (Evaluación y Revisión de Exámenes)',
        title: 'Derecho a Conocer y Reclamar Calificaciones',
        content:
          'Los docentes están obligados a entregar las pruebas corregidas en un plazo no mayor a 10 días hábiles. El estudiante puede solicitar revisión de su evaluación con acompañamiento de su representación estudiantil.',
      },
      {
        number: 'Artículo 31° (Prohibición de Cobros Irregulares)',
        title: 'Textos, Guías y Materiales de Laboratorio',
        content:
          'Queda terminantemente prohibida la venta obligatoria de libros, guías o boletos como condición para rendir exámenes parciales, prácticos o finales bajo sanción disciplinaria.',
      },
      {
        number: 'Artículo 52° (Graduación por Excelencia)',
        title: 'Titulación Directa por Rendimiento Académico',
        content:
          'Los estudiantes que aprueben la totalidad del plan de estudios en el tiempo establecido y con promedio ponderado igual o superior al exigido por su facultad acceden a la titulación directa sin costo adicional de defensa.',
      },
    ],
  },
  {
    id: 'reglamento-becas',
    title: 'Reglamento Becas',
    subtitle: 'IDH y Comedor',
    code: 'REG-BIENESTAR-IDH-2026',
    updatedAt: 'Convocatoria 2026–2028',
    pages: 29,
    fileSize: '1.2 MB',
    summary:
      'Establece las bases, tablas de calificación socioeconómica, méritos académicos y fiscalización estudiantil para la asignación transparente de Becas Comedor, Beca Estudio, Investigación, Extensión e Internado con recursos IDH.',
    articles: [
      {
        number: 'Artículo 8° (Modalidades de Becas Universitarias)',
        title: 'Cobertura Alimentaria y Estímulo Académico',
        content:
          'El sistema de Bienestar Estudiantil comprende la Beca Comedor Universitario (almuerzo y cena nutritiva), Beca Estudio, Beca Investigación Científica, Beca Auxiliatura y Beca de Internado Rotatorio.',
      },
      {
        number: 'Artículo 14° (Requisitos Generales de Postulación)',
        title: 'Documentación Simple y Transparente',
        content:
          'Para postular se requiere ser estudiante regular matriculado, presentar histórico académico, boleta de inscripción vigente, fotocopia de cédula de identidad y ficha socioeconómica verificada.',
      },
      {
        number: 'Artículo 26° (Fiscalización de la FUL)',
        title: 'Transparencia en Listas de Beneficiarios',
        content:
          'La Federación Universitaria Local fiscaliza la evaluación de expedientes y la calidad nutricional del Comedor Universitario para garantizar que el beneficio llegue a quienes realmente lo necesitan.',
      },
    ],
  },
];

export const TIKTOK_REELS: ReelItem[] = [
  {
    id: 'reel-1',
    title: 'Defensa Estudiantil en Marcha',
    caption: '¡No permitiremos cobros irregulares en inscripciones facultativas!',
    category: 'Gestión',
    categoryBg: 'primary',
    views: '42.5K',
    likes: '6.8K',
    comments: '512',
    duration: '00:58',
    publishedAt: 'Hace 2 días',
    image:
      'https://lh3.googleusercontent.com/aida/ALJJyrDH5MgLH83Y4BOWCY1gC8P45rJDSh-gd4E9GJUsg5hXetTDgq2Yn8qyK5wc3OaBdBmKKm5kbnFJc7fvyk7UKQC7vVHN7xFrdjIOsYjpRZAXAr-fWVG_5NZs_ctkYb2pGa6sieXsLuf2IdldySmYRAf4s-uIaX2Ps_x7qRoUzcLkgc2Y4WzU6fnldT-3mWk2NW5Wskor29b2H4F8ntWVOPIYskGceYtvqu_tluGqToUAVzR5t9pRJQ',
    tiktokUrl: 'https://tiktok.com/@ful.uagrm',
    highlights: [
      'Inspección directa en módulos facultativos junto al Sec. Ejecutivo Yordy Roca',
      'Habilitación de línea directa de WhatsApp para denuncias anónimas',
      'Respeto estricto a las tasas oficiales aprobadas por el ICU',
    ],
    featuredInHome: true,
  },
  {
    id: 'reel-2',
    title: 'Final de infarto en Futsal',
    caption: 'Revive los mejores goles de la fase eliminatoria interfacultades',
    category: 'Deportes',
    categoryBg: 'secondary',
    views: '88.1K',
    likes: '14.2K',
    comments: '940',
    duration: '01:15',
    publishedAt: 'Hace 4 días',
    image:
      'https://lh3.googleusercontent.com/aida/ALJJyrCaxc3PF8-_GIYc9BXS9Q7yvbSdw-rwMXHRI5dk8Ux2pUGAOusTihrjjeJ8_iYpxfseoZfWqkyagkREYoOFzm-KaTaWrEAeJWK6M1bjTx9Igvm2GTZExwF2o2dsmRD8tX0-09k5FdUZnBqjx3iNKGZFKeNZFhEfWJr4vCy8hs5qwvacALDQG9S_TU3M23zOpBSn3vZUQOd9MLET-hP_W_bdc_T_lRBWWE4A-Re9quZpKew86oOy',
    tiktokUrl: 'https://tiktok.com/@ful.uagrm',
    highlights: [
      'Coliseo Polideportivo repleto con barras de las 18 facultades',
      'Entrega de balones e indumentaria oficial a las selecciones clasificadas',
      'Próxima jornada nocturna con ingreso libre para toda la UAGRM',
    ],
    featuredInHome: true,
  },
  {
    id: 'reel-3',
    title: 'Ballet FUL en Escena',
    caption: 'Ensayo general del Ballet Folklórico FUL en el paraninfo',
    category: 'Cultura',
    categoryBg: 'accent',
    views: '31.4K',
    likes: '4.9K',
    comments: '285',
    duration: '00:47',
    publishedAt: 'Hace 1 semana',
    image:
      'https://lh3.googleusercontent.com/aida/ALJJyrB5nzO4rMyyiShklnAtdMHNjfHR7cqWbBzeRV2rrjBzBAH71R3PviIVFwHFzW3zUjGvJCMH1unuDXx6iwzcAOeNLuCMtXi-M97IF5-a_z9UxdWc_k1YZK2qHOMbrvKxmtOfJbLaz4uX21gRocb8ciJeCULAZ87qqlfKZIC8h9FUN5FZWzdgsQbPZh-AbB-b0LbKct8P1USGhME96koa0Ga5ObhueDyq0a4fWk9BePHwkmD5qtzaCQ',
    tiktokUrl: 'https://tiktok.com/@ful.uagrm',
    highlights: [
      'Coreografía de Carnaval Cruceño, Chovena y Taquirari en honor a Santa Cruz',
      'Audiciones abiertas para nuevos integrantes de todas las carreras',
      'Preparación oficial rumbo a la Entrada Folklórica Universitaria',
    ],
    featuredInHome: true,
  },
  {
    id: 'reel-4',
    title: 'Tutorial Becas IDH y Comedor',
    caption: 'Paso a paso: Cómo postular a la Beca Comedor y Beca IDH 2026',
    category: 'Tutorial',
    categoryBg: 'primary',
    views: '112.9K',
    likes: '21.3K',
    comments: '1.4K',
    duration: '01:32',
    publishedAt: 'Hace 1 semana',
    image:
      'https://lh3.googleusercontent.com/aida/ALJJyrCDRFKcBV3yuU-uBMFq6kZwIhSd0b977vqPsUrdVI15HBhlRharQhe7qBDhYjhiZaZzy8A6AaYKwET8YyIhN_g2BgRdtlpGxKk71HQ1sHRzRuc5ahNSn_bc5E_apRpBLeegCRnOTLdiRTAtVnUwQ-VozGmop-cYvUQYZdq6LWPHdE8EsjEWUetbK2kTd5GUmgVV4JdyxtriqhVwecE1BDxRQIrEPL4X_2u5jJTABpdVCW-2tXCnIQ',
    tiktokUrl: 'https://tiktok.com/@ful.uagrm',
    highlights: [
      'Descarga y llenado correcto del formulario socioeconómico en el perfil estudiantil',
      'Documentos indispensables y plazos de presentación en Bienestar Estudiantil',
      'Mesa de ayuda gratuita en el edificio central de la FUL para armar tu carpeta',
    ],
    featuredInHome: true,
  },
];

export const PORTAL_NEWS: NewsItem[] = [
  {
    id: 'card-news-1',
    title: 'Brigadas universitarias en apoyo a los barrios de Santa Cruz',
    category: 'Proyección Social',
    categoryBg: 'accent',
    date: '14 de Noviembre, 2026',
    readTime: '3 min de lectura',
    author: 'Dirección de Comunicación FUL UAGRM',
    summary:
      'Estudiantes de medicina, enfermería, ingeniería y derecho brindaron atención gratuita y asesoramiento a más de 1.200 familias cruceñas.',
    image:
      'https://lh3.googleusercontent.com/aida/ALJJyrCnTPfOWX_FWu6ddJZqosOtPefaYdLHc7OvwhlDYMotaPUGwsflsDqLiFLZqQWO_-O15sm2fsgKDxotqMyej40RW2t7sDvYFmc8_etrUlYDoz8ygcjvDtHvNanlIkeqtlmKBa4famVNUseML5cCF6dUSnJMfU63wD-b_tzkXbPJgz_C5N4isjuiRKXaHSwtC38VdCiIvSNrT8O89fm6ce4TjGUp2cpS_D9dcUfZJ79Pdastc_FU',
    fullContent: [
      'Con el compromiso de devolver a nuestro pueblo el esfuerzo que sostiene a la universidad pública, la Federación Universitaria Local (FUL 2026–2028) desplegó este fin de semana las Brigadas Multidisciplinarias Morenianas en los distritos municipales 7, 8 y 12 de Santa Cruz de la Sierra.',
      'Más de 180 estudiantes voluntarios de las facultades de Ciencias de la Salud Humana, Ciencias Farmacéuticas y Bioquímicas, Ciencias Jurídicas, Veterinaria y Tecnología instalaron carpas de atención médica primaria, control de signos vitales, entrega gratuita de medicamentos básicos, desparasitación veterinaria y consultorio jurídico popular.',
      'El Secretario Ejecutivo de la FUL, Yordy Roca, destacó que estas jornadas se realizarán de forma mensual en barrios periféricos y municipios de las provincias cruceñas, consolidando la extensión social con acreditación de horas de servicio comunitario para los estudiantes participantes.',
    ],
    keyImpacts: [
      '1.240 familias atendidas gratuitamente en medicina general, pediatría y odontología preventiva',
      '320 consultas legales gratuitas en trámites familiares, derechos laborales y regularización de documentos',
      'Certificación de horas de extensión social universitaria para los 180 brigadistas voluntarios',
    ],
    featuredInHome: true,
  },
  {
    id: 'card-news-2',
    title: 'Convenios interinstitucionales para pasantías estudiantiles',
    category: 'Gestión',
    categoryBg: 'primary',
    date: '10 de Noviembre, 2026',
    readTime: '4 min de lectura',
    author: 'Secretaría Académica y Vinculación Profesional FUL',
    summary:
      'La FUL firmó acuerdos con más de 25 empresas del sector agroindustrial y tecnológico para habilitar prácticas remuneradas para los últimos semestres.',
    image:
      'https://lh3.googleusercontent.com/aida/ALJJyrCRN7vDCVYwLWh5AK52pPauR0Y6XROeJKO5XeJJUNIV_YfmypmMyo6IwTy5BgQKfbbbVw86WSGOPBdReMgw_s3ic_B25foXJ3_YA7VmnJkdlEclT5qs4ytdF5B4GC4EJsxJpkaONgAKN3d3eU5jgne0D2twduNJ6zM2tbGsK3bLFS06C23lb0vAwHRJYM_bXEcIhuDdGqLW4cSV-nsTdqluLIBpIhrYXm7XFtaA6XC_Xpo6CBpbO85E',
    fullContent: [
      'En un acto celebrado en el Salón Auditorio del Campus Universitario, la Federación Universitaria Local (FUL UAGRM) concretó la firma de 25 nuevos convenios interinstitucionales con industrias, cámaras empresariales, empresas de desarrollo de software e instituciones públicas del departamento de Santa Cruz.',
      'El programa "Primer Paso Profesional Moreniano" abre 350 plazas semestrales de pasantías y prácticas preprofesionales con estipendio de transporte y alimentación para estudiantes que cursan desde séptimo hasta décimo semestre en todas las facultades.',
      'Además de facilitar el cumplimiento del requisito de práctica empresarial y trabajo dirigido para la titulación, el acuerdo contempla bolsas de empleo directo y mentorías técnicas con profesionales del medio.',
    ],
    keyImpacts: [
      '25 empresas e instituciones aliadas en agroindustria, banca, tecnología, construcción y salud',
      '350 cupos semestrales con estipendio garantizado y convalidación de práctica preprofesional',
      'Convocatoria transparente mediante registro directo en la Oficina Central de la FUL',
    ],
    featuredInHome: true,
  },
  {
    id: 'card-news-3',
    title: 'Mejoras en infraestructura y servicios básicos en facultades',
    category: 'Infraestructura',
    categoryBg: 'secondary',
    date: '05 de Noviembre, 2026',
    readTime: '3 min de lectura',
    author: 'Comisión de Infraestructura y Bienestar FUL',
    summary:
      'Entrega de salas de estudio con internet de alta velocidad, renovación de luminarias en pasillos y mantenimiento de módulos estudiantiles.',
    image:
      'https://lh3.googleusercontent.com/aida/ALJJyrA1_xrfzppQO4tlZxq5xWzZ2aQ_nMqPDqRCMJT809u0bz0J82csWF6_DBUZ-GvN7whm_cF-TBLQDLbcrsF3qRKK7aWG-g-uF4Pedi4Ce_j8CCix76AGnLBiiX3R5scgM8_YsxKg0VnJqoZju-iiukUhTL1u7hB8mxWACulgnk2PT_5LGATHe4KiHT5qyA_dhQ-TdyVZ3Koxl78scBGPFYVHYE1szOlrxjWAPIrv9or4BSNBiLEM59w5i6BXrnfy',
    fullContent: [
      'Como resultado de las gestiones e inspecciones técnicas impulsadas por la FUL 2026–2028 ante las instancias administrativas de la UAGRM, esta semana se entregaron tres nuevas Salas de Estudio y Coworking Estudiantil equipadas con puntos de carga eléctrica, climatización e internet Wi-Fi de fibra óptica.',
      'Paralelamente, se ejecutó el plan de iluminación LED de seguridad en los pasillos peatonales y accesos de la Ciudad Universitaria para resguardar a los estudiantes del turno nocturno, junto con la refacción integral de baterías de baños y bebederos de agua filtrada en los módulos de mayor afluencia.',
      'La directiva de la FUL anunció que el cronograma de mantenimiento continuará en las Facultades Integrales de provincia (Montero, Yapacaní, Camiri, Vallegrande, San Ignacio y San Julián).',
    ],
    keyImpacts: [
      '3 nuevas salas de estudio climatizadas con conectividad Wi-Fi de alta velocidad libre',
      '140 luminarias LED instaladas en corredores peatonales para seguridad del turno noche',
      'Habilitación de puntos de hidratación gratuita y mantenimiento sanitario en módulos',
    ],
    featuredInHome: true,
  },
];

export const EXECUTIVE_BOARD: ExecutiveMember[] = [
  {
    id: 'exec-1',
    name: 'Yordy Roca',
    role: 'Secretario Ejecutivo FUL UAGRM (2026–2028)',
    faculty: 'Representación General Estudiantil ante el ICU',
    description:
      'Encabeza la defensa del cogobierno universitario, la transparencia institucional, el presupuesto estudiantil y la modernización académica para más de 100.000 universitarios.',
    whatsappText: 'Hola Secretario Ejecutivo Yordy Roca - FUL UAGRM, deseo comunicarme con la Secretaría Ejecutiva.',
  },
  {
    id: 'exec-2',
    name: 'Secretaría Académica y Científica',
    role: 'Desarrollo Curricular, Auxiliaturas y Titulación',
    faculty: 'Comisión Académica del Ilustre Consejo Universitario',
    description:
      'Coordina los cursos gratuitos de nivelación, congresos científicos, defensa de notas, mesas examinadoras y agilización de títulos profesionales.',
    whatsappText: 'Hola Secretaría Académica FUL UAGRM, requiero información sobre cursos de nivelación y trámites académicos.',
  },
  {
    id: 'exec-3',
    name: 'Secretaría de Atención Estudiantil y Derechos',
    role: 'Defensoría Legal y Bienestar Universitario',
    faculty: 'Defensoría del Estudiante y Fiscalización de Becas',
    description:
      'Atiende denuncias de cobros irregulares, vulneraciones al Estatuto Orgánico y supervisa la adjudicación transparente de Becas Comedor e IDH.',
    whatsappText: 'Hola Secretaría de Atención Estudiantil FUL UAGRM, solicito apoyo con mi caso estudiantil.',
  },
  {
    id: 'exec-4',
    name: 'Secretaría de Deportes, Cultura e Innovación',
    role: 'Torneos Interfacultativos, Ballet FUL y Emprendimiento',
    faculty: 'Integración Deportiva y Extensión Cultural',
    description:
      'Organiza el Campeonato Interfacultativo en las 18 facultades, el Ballet Folklórico Oficial y la Feria de Emprendimiento Universitario.',
    whatsappText: 'Hola Secretaría de Deportes y Cultura FUL UAGRM, deseo consultar sobre las convocatorias deportivas y culturales.',
  },
];

export const OFFICIAL_FACEBOOK_URL = 'https://facebook.com/ful.uagrm';

export const FACEBOOK_POSTS: FacebookPostItem[] = [
  {
    id: 'fb-post-1',
    titulo: 'Convocatoria Oficial Beca Comedor y Beca Estudio IDH — Gestión 2026',
    fecha: '16 de Noviembre, 2026',
    imagenUrl:
      'https://lh3.googleusercontent.com/aida/ALJJyrCDRFKcBV3yuU-uBMFq6kZwIhSd0b977vqPsUrdVI15HBhlRharQhe7qBDhYjhiZaZzy8A6AaYKwET8YyIhN_g2BgRdtlpGxKk71HQ1sHRzRuc5ahNSn_bc5E_apRpBLeegCRnOTLdiRTAtVnUwQ-VozGmop-cYvUQYZdq6LWPHdE8EsjEWUetbK2kTd5GUmgVV4JdyxtriqhVwecE1BDxRQIrEPL4X_2u5jJTABpdVCW-2tXCnIQ',
    descripcionCompleta:
      '¡Atención comunidad estudiantil moreniana! La Federación Universitaria Local (FUL 2026–2028) comunica la apertura oficial de recepción de carpetas para la Beca Comedor Universitario y las Becas IDH (Estudio, Investigación, Auxiliatura e Internado Rotatorio).\n\nRequisitos indispensables de postulación:\n• Ser estudiante regular matriculado en la presente gestión académica de la UAGRM.\n• Boleta de inscripción actualizada e Histórico Académico sellado.\n• Fotocopia simple de Cédula de Identidad vigente.\n• Formulario de Ficha Socioeconómica impreso desde el Perfil Estudiantil.\n\nNuestra Comisión de Bienestar Estudiantil se encuentra atendiendo de forma continua en el Edificio Central de la FUL (frente al Comedor Universitario) de 08:00 a 18:30 para revisar gratuitamente tus documentos y asegurar que ningún estudiante se quede sin postular.',
    facebookPostUrl: 'https://facebook.com/ful.uagrm',
  },
  {
    id: 'fb-post-2',
    titulo: 'Fixture Oficial y Acreditación — Campeonato Interfacultativo de Futsal FUL',
    fecha: '13 de Noviembre, 2026',
    imagenUrl:
      'https://lh3.googleusercontent.com/aida/ALJJyrCKBSGA7RRydyKunseIlbHLZnzzjTCzagjbqx-Naml6FZipzOz2UqvTe3ZgX67ENMsQ1hID-31MbA7wMTdhs5LP_oEhS7vqO9AyGzGhGFK-HilQbwLoPSUE7QQCBgqdPJLky_6Ooe_JiORJq69Agft2gvA3HeKfJSgVT3G0Lw3nusQGz-yM7gn53hU1awYFKPYYWomfr8sxzO0TEvXGP5ODmWvD7trPyx2nK1PeRR04mS4TZwW3',
    descripcionCompleta:
      '¡Vivimos la fiesta deportiva más grande de la René Moreno! Publicamos el afiche y rol oficial de encuentros de la primera fecha del Campeonato Interfacultativo de Futsal FUL 2026–2028 en las categorías Damas y Varones.\n\nPuntos importantes para los delegados deportivos de las 18 facultades:\n• La acreditación de carnets deportivos se realiza en la Secretaría de Deportes de la FUL hasta 48 horas antes de cada partido.\n• Todos los encuentros se disputarán en el Coliseo Polideportivo de la Ciudad Universitaria (Av. Busch y 2do Anillo) con arbitraje colegiado y cobertura médica garantizada.\n• Ingreso totalmente libre para las barras estudiantiles de todas las carreras.\n\n¡Apoya a tu facultad y deja tu comentario alentando a tu selección en nuestra publicación oficial de Facebook!',
    facebookPostUrl: 'https://facebook.com/ful.uagrm',
  },
  {
    id: 'fb-post-3',
    titulo: 'Cronograma Oficial de Trámites Académicos, Adición y Títulos Gratuitos',
    fecha: '09 de Noviembre, 2026',
    imagenUrl:
      'https://lh3.googleusercontent.com/aida/ALJJyrCRNRBwB5SKOjNd9rcYJqX2hXy9Vk6meDIJYCsKsXj8lD8-i7NKN_TkUK4hat-TUrLeMAw3-wgvh-U4vnIOKtu-v34XHNiWKl2_zYG5Negzm5EzJoK5qM6GU1qvHjRaZF2slgoza4nmjAp7gGUVZciLQGBFKiZI9W_6_NACC8zj8LzsOV3AFrMS0XtVzTTyyJ09yNJ7rnI4kkuFYqE1cCJPyRkXIvaD3fNZ_FfoACRQZYTrMKvX7W_2jcyE',
    descripcionCompleta:
      'Comunicado Oficial de la Secretaría Académica de la FUL UAGRM (Gestión 2026–2028): Ponemos a disposición de todos los estudiantes el cronograma actualizado de trámites académicos y administrativos aprobados para el semestre.\n\nFechas y gestiones habilitadas:\n1. Levantamiento de bloqueo de registro y casos especiales sin multa.\n2. Habilitación de mesas examinadoras extraordinarias para estudiantes de último semestre.\n3. Recepción de carpetas para Graduación Directa por Excelencia Académica y agilización de Diplomas Académicos y Títulos en Provisión Nacional ante el DPA.\n\nRecuerda que ningún trámite de asesoramiento en las oficinas de la FUL tiene costo alguno. Revisa el afiche completo y déjanos tus consultas en los comentarios de Facebook.',
    facebookPostUrl: 'https://facebook.com/ful.uagrm',
  },
];

