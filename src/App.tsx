import React, { useEffect, useRef, useState } from 'react';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { AdminDashboard } from './components/AdminDashboard';
import {
  EventRegistrationModal,
  FacebookPostModal,
  NewsReaderModal,
  ReelPlayerModal,
  RegulationViewerModal,
} from './components/PortalModals';
import {
  EXECUTIVE_BOARD,
  EventCategory,
  EventItem,
  FACEBOOK_POSTS,
  FacebookPostItem,
  FacultyOption,
  NewsItem,
  OFFICIAL_LOGOS,
  OFFICIAL_REGULATIONS,
  PORTAL_EVENTS,
  PORTAL_NEWS,
  PortalViewId,
  ReelItem,
  RegulationDoc,
  resolveEventImage,
  STUDENT_SERVICES,
  TIKTOK_REELS,
  UAGRM_FACULTIES,
} from './data/portalData';
import {
  buildDynamicWhatsAppUrl,
  collection,
  db,
  DEFAULT_PORTAL_CONFIG,
  doc,
  FirestoreEvento,
  FirestoreFacultad,
  FirestoreNoticia,
  FirestoreTikTokVideo,
  handleFirestoreError,
  mapFirestoreEventoToEventItem,
  mapFirestoreNoticiaToNewsItem,
  mapFirestoreTikTokToReelItem,
  onSnapshot,
  OperationType,
  PortalConfig,
} from './firebase';

export default function App() {
  const [activeView, setActiveView] = useState<PortalViewId>(() => {
    if (
      typeof window !== 'undefined' &&
      (window.location.pathname === '/admin' || window.location.hash === '#admin')
    ) {
      return 'admin';
    }
    return 'inicio';
  });
  const [selectedEvent, setSelectedEvent] = useState<EventItem | null>(null);
  const [selectedNews, setSelectedNews] = useState<NewsItem | null>(null);
  const [selectedReel, setSelectedReel] = useState<ReelItem | null>(null);
  const [selectedRegulation, setSelectedRegulation] = useState<RegulationDoc | null>(null);
  const [selectedFacebookPost, setSelectedFacebookPost] = useState<FacebookPostItem | null>(
    null
  );

  // Live Firestore State with Seamless Fallback to Initial Institutional Data
  const [eventsList, setEventsList] = useState<EventItem[]>(PORTAL_EVENTS);
  const [newsList, setNewsList] = useState<NewsItem[]>(PORTAL_NEWS);
  const [facebookPosts, setFacebookPosts] = useState<FacebookPostItem[]>(FACEBOOK_POSTS);
  const [reelsList, setReelsList] = useState<ReelItem[]>(TIKTOK_REELS);
  const [facultiesList, setFacultiesList] = useState<FacultyOption[]>(UAGRM_FACULTIES);
  const [portalConfig, setPortalConfig] = useState<PortalConfig>(DEFAULT_PORTAL_CONFIG);

  // Listen to browser navigation (/admin <-> /)
  useEffect(() => {
    const handlePopState = () => {
      if (window.location.pathname === '/admin' || window.location.hash === '#admin') {
        setActiveView('admin');
      } else {
        setActiveView('inicio');
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Subscribe to Public Firestore Collections
  useEffect(() => {
    const unsubNoticias = onSnapshot(
      collection(db, 'noticias'),
      (snap) => {
        if (!snap.empty) {
          const activeNews = snap.docs
            .map((d) => ({
              id: d.id,
              ...(d.data() as Omit<FirestoreNoticia, 'id'>),
            }))
            .filter((n) => !n.archivada)
            .map(mapFirestoreNoticiaToNewsItem);
          setNewsList(activeNews);
        } else {
          setNewsList(PORTAL_NEWS);
        }
      },
      (err) => handleFirestoreError(err, OperationType.LIST, 'noticias')
    );

    const unsubEventos = onSnapshot(
      collection(db, 'eventos'),
      (snap) => {
        if (!snap.empty) {
          const mappedEvents = snap.docs.map((d) =>
            mapFirestoreEventoToEventItem({
              id: d.id,
              ...(d.data() as Omit<FirestoreEvento, 'id'>),
            })
          );
          setEventsList(mappedEvents);
        } else {
          setEventsList(PORTAL_EVENTS);
        }
      },
      (err) => handleFirestoreError(err, OperationType.LIST, 'eventos')
    );

    const unsubFb = onSnapshot(
      collection(db, 'facebook_posts'),
      (snap) => {
        if (!snap.empty) {
          const posts: FacebookPostItem[] = snap.docs.map((d) => ({
            id: d.id,
            ...(d.data() as Omit<FacebookPostItem, 'id'>),
          }));
          setFacebookPosts(posts);
        } else {
          setFacebookPosts(FACEBOOK_POSTS);
        }
      },
      (err) => handleFirestoreError(err, OperationType.LIST, 'facebook_posts')
    );

    const unsubTiktok = onSnapshot(
      collection(db, 'tiktok_videos'),
      (snap) => {
        if (!snap.empty) {
          const videos = snap.docs
            .map((d) => ({
              id: d.id,
              ...(d.data() as Omit<FirestoreTikTokVideo, 'id'>),
            }))
            .sort((a, b) => a.orden - b.orden)
            .map(mapFirestoreTikTokToReelItem);
          setReelsList(videos);
        } else {
          setReelsList(TIKTOK_REELS);
        }
      },
      (err) => handleFirestoreError(err, OperationType.LIST, 'tiktok_videos')
    );

    const unsubFacultades = onSnapshot(
      collection(db, 'facultades'),
      (snap) => {
        if (!snap.empty) {
          const facs: FacultyOption[] = snap.docs
            .map((d) => ({
              id: d.id,
              ...(d.data() as Omit<FirestoreFacultad, 'id'>),
            }))
            .sort((a, b) => a.orden - b.orden)
            .map((f) => ({
              id: f.id,
              name: f.nombre,
              careers: f.carreras,
            }));
          setFacultiesList(facs);
        } else {
          setFacultiesList(UAGRM_FACULTIES);
        }
      },
      (err) => handleFirestoreError(err, OperationType.LIST, 'facultades')
    );

    const unsubConfig = onSnapshot(
      doc(db, 'configuracion', 'general'),
      (snap) => {
        if (snap.exists()) {
          setPortalConfig(snap.data() as PortalConfig);
        }
      },
      (err) => handleFirestoreError(err, OperationType.GET, 'configuracion/general')
    );

    return () => {
      unsubNoticias();
      unsubEventos();
      unsubFb();
      unsubTiktok();
      unsubFacultades();
      unsubConfig();
    };
  }, []);

  // Filtros en vistas dedicadas
  const [eventCategoryFilter, setEventCategoryFilter] = useState<'Todos' | EventCategory>('Todos');
  const [eventSearchQuery, setEventSearchQuery] = useState('');
  const [reelCategoryFilter, setReelCategoryFilter] = useState<string>('Todos');
  const [newsCategoryFilter, setNewsCategoryFilter] = useState<string>('Todos');

  const carouselRef = useRef<HTMLDivElement | null>(null);

  const scrollCarousel = (direction: -1 | 1) => {
    if (carouselRef.current) {
      carouselRef.current.scrollBy({
        left: 360 * direction,
        behavior: 'smooth',
      });
    }
  };

  const navigateTo = (view: PortalViewId) => {
    setActiveView(view);
    if (typeof window !== 'undefined') {
      const newUrl = view === 'admin' ? '/admin' : '/';
      window.history.pushState(null, '', newUrl);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const renderFacebookGallerySection = () => (
    <section
      id="comunicados-facebook"
      className="py-16 lg:py-24 bg-white border-b border-light-outline/40"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 1. Encabezado de la sección */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-12">
          <div>
            <div className="inline-flex items-center gap-2 text-[#1877F2] font-headline text-label-md font-bold uppercase tracking-wider mb-2">
              <span className="material-symbols-outlined text-[18px]">photo_library</span>
              <span>Comunicados y Galería en Facebook</span>
            </div>
            <h2 className="font-headline text-headline-md sm:text-headline-lg text-primary font-bold tracking-tight">
              Comunicados en Facebook
            </h2>
            <p className="font-body text-body-md text-light-on-surface-container mt-1 max-w-2xl">
              Actualizaciones oficiales, afiches de convocatorias, resoluciones estudiantiles y fotografías de las actividades de la Gestión 2026–2028.
            </p>
          </div>

          <a
            href={portalConfig.facebookUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2.5 px-5 py-2.5 bg-white text-primary border-2 border-primary/20 hover:border-[#1877F2] hover:bg-[#1877F2] hover:text-white font-headline text-label-md font-bold rounded-full transition-all duration-150 shrink-0 shadow-xs"
          >
            <svg className="w-4 h-4 fill-current shrink-0" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
            </svg>
            <span>Página Oficial en Facebook</span>
          </a>
        </div>

        {/* 2. Cuadrícula de tarjetas (3 columnas en escritorio, 1 en móvil) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {facebookPosts.map((post) => (
            <article
              key={post.id}
              onClick={() => setSelectedFacebookPost(post)}
              className="group bg-white rounded-2xl border border-light-outline/50 overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-150 flex flex-col cursor-pointer"
            >
              {/* Imagen o afiche en formato cuadrado/rectangular limpio (object-cover) con etiqueta discreta de Facebook */}
              <div className="relative aspect-[4/3] overflow-hidden bg-primary/10">
                <img
                  src={post.imagenUrl}
                  alt={post.titulo}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-250"
                />
                <div className="absolute top-3.5 right-3.5 w-9 h-9 rounded-full bg-white/95 text-[#1877F2] shadow-md flex items-center justify-center border border-light-outline/40">
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                </div>
              </div>

              {/* Contenido de la tarjeta */}
              <div className="p-6 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-1.5 text-xs text-light-on-surface-container/75 font-body mb-2.5">
                    <span className="material-symbols-outlined text-[16px] text-secondary">
                      calendar_today
                    </span>
                    <span>{post.fecha}</span>
                  </div>

                  <h3 className="font-headline text-title-lg text-primary font-bold mb-2.5 group-hover:text-secondary transition-colors leading-snug">
                    {post.titulo}
                  </h3>

                  <p className="font-body text-body-md text-light-on-surface-container line-clamp-2 mb-4">
                    {post.descripcionCompleta}
                  </p>
                </div>

                {/* Indicador visual al pasar el cursor */}
                <div className="pt-3 border-t border-light-outline/40 flex items-center justify-between text-xs font-headline font-bold text-primary group-hover:text-secondary transition-colors">
                  <span>Leer comunicado completo</span>
                  <span className="material-symbols-outlined text-[18px] group-hover:translate-x-1 transition-transform">
                    open_in_full
                  </span>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );

  const homeEvents = eventsList.filter((e) => e.featuredInHome);

  const filteredEvents = eventsList.filter((ev) => {
    const matchesCategory =
      eventCategoryFilter === 'Todos' || ev.category === eventCategoryFilter;
    const matchesQuery =
      !eventSearchQuery.trim() ||
      ev.title.toLowerCase().includes(eventSearchQuery.toLowerCase()) ||
      ev.description.toLowerCase().includes(eventSearchQuery.toLowerCase());
    return matchesCategory && matchesQuery;
  });

  const filteredReels = reelsList.filter(
    (r) => reelCategoryFilter === 'Todos' || r.category === reelCategoryFilter
  );

  const homeNews = newsList.filter((n) => n.featuredInHome);

  const filteredNews = newsList.filter(
    (n) => newsCategoryFilter === 'Todos' || n.category === newsCategoryFilter
  );

  const renderEventCard = (ev: EventItem, isCarouselCard = false) => {
    const catBg =
      ev.categoryColor === 'accent'
        ? 'bg-accent text-on-accent'
        : ev.categoryColor === 'primary'
        ? 'bg-primary text-on-primary'
        : 'bg-secondary text-on-secondary';

    const badgeBg = ev.badgeBg === 'accent' ? 'bg-accent text-white' : 'bg-primary/90 text-white';

    return (
      <article
        key={ev.id}
        data-component-id={ev.id}
        className={`${
          isCarouselCard
            ? 'min-w-[300px] sm:min-w-[340px] max-w-[340px] snap-start shrink-0'
            : 'w-full'
        } bg-white rounded-2xl border border-light-outline/50 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-150 flex flex-col overflow-hidden`}
      >
        <div className="relative h-48 overflow-hidden bg-primary/10">
          <img
            src={resolveEventImage(ev.image, ev.category, `${ev.id} ${ev.title}`)}
            alt={ev.title}
            referrerPolicy="no-referrer"
            onError={(e) => {
              const target = e.currentTarget;
              if (!target.dataset.fallbackApplied) {
                target.dataset.fallbackApplied = 'true';
                target.src = resolveEventImage('', ev.category, `${ev.id} ${ev.title}`);
              }
            }}
            className="w-full h-full object-cover"
          />
          <span
            className={`absolute top-3 left-3 ${catBg} px-3.5 py-1 rounded-full font-headline text-label-sm font-bold uppercase tracking-wider shadow`}
          >
            {ev.category}
          </span>
          <div
            className={`absolute bottom-3 right-3 ${badgeBg} text-xs px-2.5 py-1 rounded-md font-mono flex items-center gap-1`}
          >
            <span className="material-symbols-outlined text-[14px]">{ev.badgeIcon}</span>
            <span>{ev.badgeText}</span>
          </div>
        </div>
        <div className="p-6 flex-1 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-1.5 text-primary/70 font-body text-xs font-medium mb-2.5">
              <span className="material-symbols-outlined text-[16px] text-secondary">
                calendar_today
              </span>
              <span>{ev.dateLabel}</span>
            </div>
            <h3 className="font-headline text-title-lg text-primary font-bold mb-2 line-clamp-2">
              {ev.title}
            </h3>
            <p className="font-body text-body-sm text-light-on-surface-container line-clamp-2 mb-4">
              {ev.description}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setSelectedEvent(ev)}
            className="w-full py-3 px-4 bg-primary text-on-primary font-headline text-label-md font-bold rounded-xl hover:bg-secondary transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs"
          >
            <span>Ver convocatoria e inscribirse</span>
            <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
          </button>
        </div>
      </article>
    );
  };

  return (
    <div className="min-h-screen flex flex-col bg-light-surface text-light-on-surface">
      <Navbar
        activeView={activeView}
        onNavigate={navigateTo}
        portalConfig={portalConfig}
      />

      <main className="flex-1">
        {/* =========================================================
            VISTA 1: INICIO (PORTAL OFICIAL - FIEL 100% A INICIO.HTML)
           ========================================================= */}
        {activeView === 'inicio' && (
          <>
            {/* 2. HERO SECTION (BANNER PRINCIPAL DINÁMICO) */}
            <section className="relative bg-[#002855] text-white overflow-hidden border-b border-primary/20 min-h-[460px] sm:min-h-[520px] lg:min-h-[560px] flex items-center">
              {/* Fotografía de los estudiantes en el campus frente a los pabellones de ladrillo (lado derecho) */}
              <div className="absolute inset-y-0 right-0 w-full lg:w-[64%] z-0 overflow-hidden">
                <img
                  src="/images/hero_campus_estudiantes.jpg"
                  alt="Estudiantes de la UAGRM frente a los pabellones de ladrillo del campus universitario"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover object-[center_30%] lg:object-right scale-[1.01]"
                />
                {/* Transición fluida de azul marino profundo desde la izquierda hacia la fotografía */}
                <div className="absolute inset-0 bg-gradient-to-r from-[#002855] via-[#002855]/85 lg:via-[#002855]/60 to-transparent"></div>
                <div className="absolute inset-0 bg-gradient-to-t from-[#002855]/85 via-transparent to-[#002855]/45 lg:hidden"></div>
              </div>

              {/* Formas geométricas dinámicas superpuestas (Azul, Rojo y Amarillo) */}
              <svg
                className="absolute inset-0 w-full h-full z-[1] pointer-events-none select-none"
                viewBox="0 0 1440 580"
                preserveAspectRatio="none"
                aria-hidden="true"
              >
                {/* Franja diagonal azul brillante superior izquierda */}
                <polygon points="0,0 590,0 0,210" fill="#004C97" opacity="0.65" />
                <polygon points="0,0 320,0 0,130" fill="#0056AD" opacity="0.45" />

                {/* Acentos geométricos rojo y amarillo en borde izquierdo */}
                <polygon points="0,285 78,195 0,435" fill="#E11D2E" />
                <polygon points="0,375 36,396 0,535" fill="#FACC15" />

                {/* Curva azul inferior derecha y diagonales rojas/amarillas */}
                <path
                  d="M920,580 Q1160,485 1440,515 L1440,580 Z"
                  fill="#1D3A7A"
                  opacity="0.92"
                />
                <polygon points="1365,0 1440,0 1440,580 1235,580" fill="#E11D2E" opacity="0.28" />
                <path
                  d="M1140,580 C1280,490 1375,355 1440,215 L1440,580 Z"
                  fill="#E11D2E"
                />
                <polygon points="1440,115 1440,220 1378,345" fill="#FACC15" />
              </svg>

              {/* Contenido Principal del Hero (Columna Izquierda) */}
              <div className="relative z-10 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-10 py-16 sm:py-20 lg:py-24">
                <div className="max-w-2xl space-y-5 text-left">
                  {/* Título Principal Imponente */}
                  <h1 className="font-headline text-[34px] sm:text-[46px] lg:text-[54px] font-extrabold tracking-tight leading-[1.06] text-white uppercase drop-shadow-sm text-balance">
                    <span className="block">EL PODER DE LOS</span>
                    <span className="block">ESTUDIANTES -</span>
                    <span className="block mt-0.5">
                      <span className="text-[#EE1D23]">FUL</span>{' '}
                      <span className="text-white">2026-2028</span>
                    </span>
                  </h1>

                  {/* Subtexto */}
                  <p className="font-body text-base sm:text-lg lg:text-[20px] font-medium text-white/95 max-w-xl leading-snug text-pretty">
                    Defendiendo tus derechos y construyendo el futuro de nuestra universidad
                  </p>

                  {/* Botones Principales del Hero */}
                  <div className="pt-3 flex flex-wrap items-center gap-3.5 sm:gap-4">
                    {/* Botón primario en color rojo */}
                    <button
                      type="button"
                      onClick={() => navigateTo('atencion')}
                      data-component-id="hero-cta-primary"
                      className="inline-flex items-center justify-center px-7 py-3.5 bg-[#E11D2E] hover:bg-[#C21423] text-white font-headline text-sm sm:text-[15px] font-bold rounded-full shadow-lg hover:shadow-xl transition-all duration-150 cursor-pointer whitespace-nowrap"
                    >
                      Servicios y Becas
                    </button>

                    {/* Botón secundario con borde blanco (outline) */}
                    <a
                      href={buildDynamicWhatsAppUrl(
                        portalConfig.whatsappDefensoria,
                        'Hola Defensoría FUL UAGRM, deseo escribir una consulta o denuncia estudiantil.'
                      )}
                      target="_blank"
                      rel="noopener noreferrer"
                      data-component-id="hero-cta-secondary"
                      className="inline-flex items-center justify-center px-7 py-3.5 border-2 border-white/90 text-white hover:bg-white hover:text-[#002855] font-headline text-sm sm:text-[15px] font-bold rounded-full transition-all duration-150 cursor-pointer whitespace-nowrap backdrop-blur-[2px]"
                    >
                      Escríbenos / Denuncias
                    </a>
                  </div>
                </div>
              </div>
            </section>

            {/* 3. SECCIÓN: CARRUSEL HORIZONTAL DE EVENTOS ACTIVOS */}
            <section
              id="eventos"
              className="py-16 lg:py-24 bg-light-surface-container border-b border-light-outline/40"
            >
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Encabezado de Sección con Controles de Flechas */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
                  <div>
                    <div className="inline-flex items-center gap-2 text-secondary font-headline text-label-md font-bold uppercase tracking-wider mb-2">
                      <span className="material-symbols-outlined text-[18px]">event</span>
                      <span>Participación Universitaria</span>
                    </div>
                    <h2 className="font-headline text-headline-md sm:text-headline-lg text-primary font-bold tracking-tight">
                      Eventos y Convocatorias Vigentes
                    </h2>
                    <p className="font-body text-body-md text-light-on-surface-container mt-1 max-w-2xl">
                      Entérate de las actividades deportivas, académicas, de innovación y culturales organizadas por la FUL para toda la comunidad Gabriel René Moreno.
                    </p>
                  </div>

                  {/* Controles de Flechas Laterales */}
                  <div className="flex items-center gap-3 shrink-0">
                    <button
                      type="button"
                      onClick={() => scrollCarousel(-1)}
                      aria-label="Anterior evento"
                      className="w-12 h-12 rounded-full bg-white text-primary border border-light-outline/60 flex items-center justify-center shadow-xs hover:bg-primary hover:text-on-primary hover:border-primary transition-all duration-150 cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[24px]">
                        chevron_left
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() => scrollCarousel(1)}
                      aria-label="Siguiente evento"
                      className="w-12 h-12 rounded-full bg-white text-primary border border-light-outline/60 flex items-center justify-center shadow-xs hover:bg-primary hover:text-on-primary hover:border-primary transition-all duration-150 cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[24px]">
                        chevron_right
                      </span>
                    </button>
                  </div>
                </div>

                {/* Carrusel Horizontal con Barra de Desplazamiento */}
                <div
                  ref={carouselRef}
                  className="flex gap-6 overflow-x-auto pb-6 pt-2 custom-scrollbar snap-x snap-mandatory scroll-smooth"
                  tabIndex={0}
                  aria-label="Carrusel de convocatorias vigentes"
                >
                  {homeEvents.map((ev) => renderEventCard(ev, true))}
                </div>

                {/* Ayuda visual de scroll para usuario */}
                <div className="mt-4 flex flex-wrap items-center justify-between gap-2 text-xs text-light-on-surface-container/70 font-body">
                  <span className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-[16px]">swipe</span>
                    <span>Desliza horizontalmente para ver más convocatorias</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => navigateTo('eventos')}
                    className="text-secondary font-headline font-semibold hover:underline cursor-pointer"
                  >
                    Ver calendario semestral completo →
                  </button>
                </div>
              </div>
            </section>

            {/* 4. SECCIÓN: ATENCIÓN AL ESTUDIANTE Y DEFENSA DE DERECHOS */}
            <section
              id="atencion"
              className="py-16 lg:py-24 bg-white border-b border-light-outline/40"
            >
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center max-w-3xl mx-auto mb-14">
                  <span className="inline-flex items-center gap-2 text-accent font-headline text-label-md font-bold uppercase tracking-wider mb-2">
                    <span className="material-symbols-outlined text-[18px]">gavel</span>
                    <span>Defensoría y Respaldo Universitario</span>
                  </span>
                  <h2 className="font-headline text-headline-md sm:text-headline-lg text-primary font-bold tracking-tight">
                    Atención al Estudiante y Defensa de Derechos
                  </h2>
                  <p className="font-body text-body-md text-light-on-surface-container mt-2">
                    La FUL 2026-2028 vela permanentemente por la legalidad, equidad académica y bienestar integral de cada estudiante de la René Moreno.
                  </p>
                </div>

                {/* Bloque dividido en 2 columnas */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                  {/* Columna Izquierda (7 cols) */}
                  <div className="lg:col-span-7 space-y-6">
                    <div className="p-6 rounded-2xl bg-light-surface-container border border-light-outline/40">
                      <h3 className="font-headline text-title-lg text-primary font-bold mb-4 flex items-center gap-2.5">
                        <span className="w-9 h-9 rounded-lg bg-primary text-white flex items-center justify-center shrink-0">
                          <span className="material-symbols-outlined text-[20px]">
                            balance
                          </span>
                        </span>
                        <span>Áreas de Respaldo y Asesoría Permanente</span>
                      </h3>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {STUDENT_SERVICES.map((srv) => (
                          <div
                            key={srv.id}
                            className="bg-white p-4 rounded-xl border border-light-outline/30 shadow-2xs flex flex-col justify-between"
                          >
                            <div>
                              <div className="flex items-center gap-2 text-secondary font-headline font-bold text-sm mb-1.5">
                                <span className="material-symbols-outlined text-[18px]">
                                  {srv.icon}
                                </span>
                                <span>{srv.title}</span>
                              </div>
                              <p className="text-xs text-light-on-surface-container leading-relaxed mb-3">
                                {srv.description}
                              </p>
                            </div>
                            <a
                              href={buildDynamicWhatsAppUrl(
                                portalConfig.whatsappDefensoria,
                                srv.whatsappMessage
                              )}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-[11px] font-headline font-bold text-accent hover:underline"
                            >
                              <span className="material-symbols-outlined text-[14px]">
                                chat
                              </span>
                              <span>Consultar área por WhatsApp</span>
                            </a>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Acceso Rápido a Reglamentos */}
                    <div className="p-6 rounded-2xl bg-white border border-light-outline/60 shadow-xs">
                      <h4 className="font-headline text-title-md text-primary font-bold mb-3 flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary text-[20px]">
                          library_books
                        </span>
                        <span>Reglamentos y Normativas para Descarga Inmediata</span>
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        {OFFICIAL_REGULATIONS.map((reg) => (
                          <button
                            key={reg.id}
                            type="button"
                            onClick={() => setSelectedRegulation(reg)}
                            className="p-3 rounded-lg border border-light-outline/50 hover:border-secondary hover:bg-secondary/5 transition-colors group flex items-center justify-between text-left cursor-pointer"
                          >
                            <div>
                              <div className="font-headline text-xs font-bold text-primary group-hover:text-secondary">
                                {reg.title}
                              </div>
                              <div className="text-[11px] text-light-on-surface-container/70">
                                {reg.subtitle}
                              </div>
                            </div>
                            <span className="material-symbols-outlined text-secondary text-[18px]">
                              download
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Columna Derecha (5 cols): Tarjeta de contacto rápido prioritario */}
                  <div className="lg:col-span-5">
                    <div className="bg-gradient-to-b from-primary to-[#001c3d] text-white rounded-2xl p-6 sm:p-8 shadow-xl border border-primary/40 relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-accent/20 rounded-full blur-2xl pointer-events-none"></div>

                      <div className="flex items-center gap-3 mb-6">
                        <div className="w-12 h-12 rounded-xl bg-accent text-on-accent flex items-center justify-center shadow shrink-0">
                          <span className="material-symbols-outlined text-[28px]">
                            support_agent
                          </span>
                        </div>
                        <div>
                          <span className="text-xs font-headline uppercase font-semibold text-accent tracking-wider">
                            Canal Prioritario FUL
                          </span>
                          <h3 className="font-headline text-title-lg font-bold text-white">
                            Secretaría de Atención Estudiantil
                          </h3>
                        </div>
                      </div>

                      <p className="font-body text-body-sm text-white/85 mb-6 leading-relaxed">
                        ¿Tienes algún problema con tu inscripción, docente o trámite universitario? Nuestro equipo legal y de representación estudiantil te asesora de forma confidencial y gratuita.
                      </p>

                      {/* Botón Grande de WhatsApp */}
                      <a
                        href={buildDynamicWhatsAppUrl(
                          portalConfig.whatsappDefensoria,
                          'Hola Secretaría de Atención Estudiantil FUL UAGRM, solicito apoyo con mi caso'
                        )}
                        target="_blank"
                        rel="noopener noreferrer"
                        data-component-id="button-whatsapp-secretaria"
                        className="w-full py-4 px-6 bg-accent text-on-accent font-headline text-label-lg font-bold rounded-xl shadow-lg hover:bg-accent/90 hover:shadow-xl transition-all duration-150 flex items-center justify-center gap-3 mb-6 cursor-pointer text-center"
                      >
                        <span className="material-symbols-outlined text-[24px]" aria-hidden="true">
                          chat
                        </span>
                        <span>Escribir a Secretaría de Atención Estudiantil</span>
                      </a>

                      {/* Horarios y Datos de Oficinas */}
                      <div className="space-y-3.5 pt-4 border-t border-white/15 text-xs text-white/90">
                        <div className="flex items-start gap-3">
                          <span className="material-symbols-outlined text-accent text-[18px] shrink-0 mt-0.5">
                            schedule
                          </span>
                          <div>
                            <span className="font-bold text-white block">
                              Horarios de Atención Continua:
                            </span>
                            <span>{portalConfig.horarioAtencion}</span>
                          </div>
                        </div>

                        <div className="flex items-start gap-3">
                          <span className="material-symbols-outlined text-accent text-[18px] shrink-0 mt-0.5">
                            apartment
                          </span>
                          <div>
                            <span className="font-bold text-white block">
                              Ubicación Física en Campus:
                            </span>
                            <span>{portalConfig.direccionCampus}</span>
                          </div>
                        </div>

                        <div className="flex items-start gap-3">
                          <span className="material-symbols-outlined text-accent text-[18px] shrink-0 mt-0.5">
                            mail
                          </span>
                          <div>
                            <span className="font-bold text-white block">
                              Correo Electrónico Institucional:
                            </span>
                            <span>{portalConfig.emailContacto}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* 5. SECCIÓN: REDES SOCIALES Y TIKTOK REELS */}
            <section
              id="reels"
              className="py-16 lg:py-24 bg-light-surface-container border-b border-light-outline/40"
            >
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
                  <div>
                    <div className="inline-flex items-center gap-2 text-secondary font-headline text-label-md font-bold uppercase tracking-wider mb-2">
                      <span className="material-symbols-outlined text-[18px]">
                        play_circle
                      </span>
                      <span>Contenido Dinámico Universitario</span>
                    </div>
                    <h2 className="font-headline text-headline-md sm:text-headline-lg text-primary font-bold tracking-tight">
                      La FUL en Movimiento (@ful.uagrm)
                    </h2>
                    <p className="font-body text-body-md text-light-on-surface-container mt-1">
                      Conoce de cerca las actividades de gestión, deportes, reclamos estudiantiles y la vida universitaria en Santa Cruz.
                    </p>
                  </div>

                  <a
                    href={portalConfig.tiktokUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-on-primary font-headline text-label-md font-bold rounded-full hover:bg-secondary transition-colors shrink-0 shadow-xs"
                  >
                    <span className="material-symbols-outlined text-[20px]">
                      smart_display
                    </span>
                    <span>Seguir en TikTok</span>
                  </a>
                </div>

                {/* Cuadrícula horizontal de 4 tarjetas verticales estilo 9:16 */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                  {reelsList.map((reel) => {
                    const catClass =
                      reel.categoryBg === 'secondary'
                        ? 'bg-secondary/85'
                        : reel.categoryBg === 'accent'
                        ? 'bg-accent/90'
                        : 'bg-primary/85';
                    return (
                      <div
                        key={reel.id}
                        onClick={() => setSelectedReel(reel)}
                        className="group relative rounded-2xl overflow-hidden aspect-[9/16] bg-primary shadow-md hover:shadow-xl transition-all duration-150 flex flex-col justify-end cursor-pointer"
                      >
                        <img
                          src={reel.image}
                          alt={reel.title}
                          className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-250"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent"></div>

                        {/* Botón de Play Central */}
                        <div className="absolute inset-0 flex items-center justify-center">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedReel(reel);
                            }}
                            aria-label={`Reproducir video ${reel.title}`}
                            className="w-14 h-14 rounded-full bg-secondary/90 text-white flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:bg-secondary transition-all duration-150 cursor-pointer"
                          >
                            <span className="material-symbols-outlined text-[32px] ml-0.5">
                              play_arrow
                            </span>
                          </button>
                        </div>

                        {/* Contador de Vistas y Categoría Superior */}
                        <div className="absolute top-3 left-3 right-3 flex items-center justify-between text-xs text-white">
                          <span className="bg-black/60 backdrop-blur-xs px-2.5 py-1 rounded-full font-mono text-[11px] flex items-center gap-1">
                            <span className="material-symbols-outlined text-[13px] text-secondary">
                              visibility
                            </span>
                            <span>{reel.views}</span>
                          </span>
                          <span
                            className={`${catClass} px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider`}
                          >
                            {reel.category}
                          </span>
                        </div>

                        {/* Pie del Reel */}
                        <div className="relative z-10 p-4 text-white">
                          <p className="font-headline text-sm font-bold line-clamp-2 mb-2 leading-snug">
                            {reel.caption}
                          </p>
                          <span className="inline-flex items-center gap-1.5 text-xs text-accent font-semibold group-hover:underline">
                            <span>Ver Reel interactivo</span>
                            <span className="material-symbols-outlined text-[14px]">
                              play_circle
                            </span>
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </section>

            {/* NUEVA SECCIÓN INSTITUCIONAL: COMUNICADOS Y GALERÍA EN FACEBOOK */}
            {renderFacebookGallerySection()}

            {/* 6. SECCIÓN: BLOG DE NOTICIAS E INICIATIVAS SOCIALES */}
            <section
              id="noticias"
              className="py-16 lg:py-24 bg-light-surface-container border-b border-light-outline/40"
            >
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-12">
                  <div>
                    <div className="inline-flex items-center gap-2 text-secondary font-headline text-label-md font-bold uppercase tracking-wider mb-2">
                      <span className="material-symbols-outlined text-[18px]">
                        newspaper
                      </span>
                      <span>Gestión y Transparencia</span>
                    </div>
                    <h2 className="font-headline text-headline-md sm:text-headline-lg text-primary font-bold tracking-tight">
                      Noticias, Proyectos e Impacto Social
                    </h2>
                    <p className="font-body text-body-md text-light-on-surface-container mt-1 max-w-2xl">
                      Información oportuna sobre los acuerdos institucionales, el trabajo comunitario y las obras de infraestructura que ejecuta la FUL.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => navigateTo('noticias')}
                    className="text-secondary font-headline font-bold text-label-lg hover:underline inline-flex items-center gap-1 shrink-0 cursor-pointer"
                  >
                    <span>Ver todas las publicaciones</span>
                    <span className="material-symbols-outlined text-[18px]">
                      arrow_forward
                    </span>
                  </button>
                </div>

                {/* Grid de 3 tarjetas estilo editorial */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {(homeNews.length > 0 ? homeNews : newsList).map((news) => {
                    const catBadge =
                      news.categoryBg === 'accent'
                        ? 'bg-accent text-on-accent'
                        : news.categoryBg === 'primary'
                        ? 'bg-primary text-on-primary'
                        : 'bg-secondary text-on-secondary';

                    return (
                      <article
                        key={news.id}
                        data-component-id={news.id}
                        onClick={() => setSelectedNews(news)}
                        className="bg-white rounded-2xl border border-light-outline/50 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-150 flex flex-col group cursor-pointer"
                      >
                        <div className="h-52 overflow-hidden bg-primary/10 relative">
                          <img
                            src={news.image}
                            alt={news.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-250"
                          />
                          <span
                            className={`absolute top-4 left-4 ${catBadge} px-3 py-1 rounded-full font-headline text-label-sm font-bold uppercase tracking-wider shadow`}
                          >
                            {news.category}
                          </span>
                        </div>
                        <div className="p-6 flex-1 flex flex-col justify-between">
                          <div>
                            <div className="flex items-center gap-2 text-xs text-light-on-surface-container/70 mb-3 font-body">
                              <span className="material-symbols-outlined text-[16px] text-secondary">
                                calendar_today
                              </span>
                              <span>{news.date}</span>
                            </div>
                            <h3 className="font-headline text-title-lg text-primary font-bold mb-3 group-hover:text-secondary transition-colors">
                              {news.title}
                            </h3>
                            <p className="font-body text-body-md text-light-on-surface-container line-clamp-2 mb-4">
                              {news.summary}
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedNews(news);
                            }}
                            className="inline-flex items-center gap-1.5 text-secondary font-headline text-label-lg font-bold hover:underline pt-2 cursor-pointer"
                          >
                            <span>Leer más</span>
                            <span className="material-symbols-outlined text-[18px]">
                              chevron_right
                            </span>
                          </button>
                        </div>
                      </article>
                    );
                  })}
                </div>
              </div>
            </section>
          </>
        )}

        {/* =========================================================
            VISTA 2: EVENTOS Y CONVOCATORIAS (VISTA DEDICADA)
           ========================================================= */}
        {activeView === 'eventos' && (
          <div className="animate-surface-enter">
            {/* Banner de Cabecera */}
            <section className="bg-primary text-white py-14 border-b border-primary/20 relative overflow-hidden">
              <div className="absolute inset-0 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:24px_24px] opacity-10 pointer-events-none"></div>
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-2 max-w-2xl">
                  <div className="inline-flex items-center gap-2 text-accent font-headline text-xs font-bold uppercase tracking-wider">
                    <span className="material-symbols-outlined text-[18px]">
                      event_available
                    </span>
                    <span>Agenda Semestral FUL 2026–2028</span>
                  </div>
                  <h1 className="font-headline text-headline-lg-mobile sm:text-headline-lg font-extrabold text-white">
                    Eventos y Convocatorias Estudiantiles
                  </h1>
                  <p className="font-body text-body-md text-white/85">
                    Postula e inscríbete en línea a los campeonatos interfacultativos, ferias de emprendimiento, audiciones culturales y cursos gratuitos de nivelación académica.
                  </p>
                </div>

                <div className="bg-white/10 backdrop-blur-xs border border-white/20 rounded-2xl p-4 text-xs space-y-1.5 shrink-0">
                  <div className="font-headline font-bold text-white flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-accent text-[18px]">
                      verified
                    </span>
                    <span>Acreditación Directa con Registro UAGRM</span>
                  </div>
                  <p className="text-white/80 max-w-xs">
                    Selecciona cualquier convocatoria para revisar sus bases oficiales y obtener tu código único de inscripción.
                  </p>
                </div>
              </div>
            </section>

            {/* Barra de Filtros y Buscador */}
            <section className="py-12 bg-light-surface-container min-h-[60vh]">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
                <div className="bg-white p-4 sm:p-5 rounded-2xl border border-light-outline/50 shadow-2xs flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
                  {/* Botones de Filtro por Categoría */}
                  <div className="flex flex-wrap items-center gap-2">
                    {(
                      [
                        'Todos',
                        'Deporte',
                        'Innovación y Negocios',
                        'Cultura',
                        'Académico',
                      ] as const
                    ).map((cat) => {
                      const active = eventCategoryFilter === cat;
                      return (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => setEventCategoryFilter(cat)}
                          className={`px-4 py-2 rounded-full font-headline text-xs font-bold transition-all cursor-pointer ${
                            active
                              ? 'bg-secondary text-on-secondary shadow-xs'
                              : 'bg-light-surface-container text-primary hover:bg-primary/10'
                          }`}
                        >
                          {cat}
                        </button>
                      );
                    })}
                  </div>

                  {/* Buscador */}
                  <div className="relative min-w-[260px]">
                    <span className="material-symbols-outlined text-[18px] text-light-on-surface-container/60 absolute left-3.5 top-1/2 -translate-y-1/2">
                      search
                    </span>
                    <input
                      type="text"
                      value={eventSearchQuery}
                      onChange={(e) => setEventSearchQuery(e.target.value)}
                      placeholder="Buscar torneo, feria o curso..."
                      className="w-full pl-10 pr-4 py-2 rounded-full border border-light-outline text-sm font-body focus:outline-none focus:border-primary"
                    />
                  </div>
                </div>

                {/* Cuadrícula de Convocatorias */}
                {filteredEvents.length === 0 ? (
                  <div className="bg-white rounded-2xl p-12 text-center border border-light-outline/50 space-y-3">
                    <span className="material-symbols-outlined text-[40px] text-secondary">
                      event_busy
                    </span>
                    <h3 className="font-headline text-title-lg font-bold text-primary">
                      No se encontraron convocatorias con ese criterio
                    </h3>
                    <button
                      type="button"
                      onClick={() => {
                        setEventCategoryFilter('Todos');
                        setEventSearchQuery('');
                      }}
                      className="px-5 py-2 rounded-full bg-primary text-white font-headline text-xs font-bold cursor-pointer"
                    >
                      Restablecer filtros
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredEvents.map((ev) => renderEventCard(ev, false))}
                  </div>
                )}
              </div>
            </section>
          </div>
        )}

        {/* =========================================================
            VISTA 3: ATENCIÓN AL ESTUDIANTE (VISTA DEDICADA)
           ========================================================= */}
        {activeView === 'atencion' && (
          <div className="animate-surface-enter">
            <section className="bg-primary text-white py-14 border-b border-primary/20">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-2 max-w-2xl">
                  <div className="inline-flex items-center gap-2 text-accent font-headline text-xs font-bold uppercase tracking-wider">
                    <span className="material-symbols-outlined text-[18px]">gavel</span>
                    <span>Defensoría Estudiantil y Bienestar UAGRM</span>
                  </div>
                  <h1 className="font-headline text-headline-lg-mobile sm:text-headline-lg font-extrabold text-white">
                    Atención al Estudiante y Defensa de Derechos
                  </h1>
                  <p className="font-body text-body-md text-white/85">
                    Canales directos con cada Secretaría de la FUL, descarga de reglamentos universitarios y acompañamiento gratuito en trámites académicos y becas.
                  </p>
                </div>

                <a
                  href={buildDynamicWhatsAppUrl(
                    portalConfig.whatsappDefensoria,
                    'Hola Secretaría de Atención Estudiantil FUL UAGRM, solicito asistencia prioritaria con mi caso.'
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-6 py-3.5 rounded-full bg-accent text-on-accent font-headline text-label-lg font-bold shadow-lg hover:bg-accent/90 transition-all inline-flex items-center gap-2 shrink-0"
                >
                  <span className="material-symbols-outlined text-[22px]">chat</span>
                  <span>Línea Directa Defensoría FUL</span>
                </a>
              </div>
            </section>

            <section className="py-12 bg-light-surface-container">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
                {/* Tarjetas Detalladas de Servicios Estudiantiles */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {STUDENT_SERVICES.map((srv) => (
                    <div
                      key={srv.id}
                      className="bg-white rounded-2xl p-6 border border-light-outline/50 shadow-xs flex flex-col justify-between space-y-5"
                    >
                      <div className="space-y-3">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <div className="w-11 h-11 rounded-xl bg-primary text-white flex items-center justify-center shrink-0">
                              <span className="material-symbols-outlined text-[24px]">
                                {srv.icon}
                              </span>
                            </div>
                            <div>
                              <span className="text-[11px] font-headline uppercase font-bold text-secondary">
                                {srv.responsibleSecretariat}
                              </span>
                              <h3 className="font-headline text-title-lg font-bold text-primary">
                                {srv.title}
                              </h3>
                            </div>
                          </div>
                          <span className="text-[11px] font-mono text-light-on-surface-container bg-light-surface-container px-2.5 py-1 rounded-md">
                            {srv.officeHours}
                          </span>
                        </div>

                        <p className="font-body text-body-md text-light-on-surface-container">
                          {srv.description}
                        </p>

                        <ul className="space-y-1.5 pt-2 border-t border-light-outline/40 text-xs text-primary">
                          {srv.details.map((d, index) => (
                            <li key={index} className="flex items-start gap-2">
                              <span className="material-symbols-outlined text-accent text-[16px] shrink-0 mt-0.5">
                                check_circle
                              </span>
                              <span>{d}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <a
                        href={buildDynamicWhatsAppUrl(
                          portalConfig.whatsappDefensoria,
                          srv.whatsappMessage
                        )}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full py-3 px-4 rounded-xl bg-accent text-on-accent font-headline text-label-md font-bold hover:bg-accent/90 transition-colors flex items-center justify-center gap-2 shadow-2xs"
                      >
                        <span className="material-symbols-outlined text-[18px]">chat</span>
                        <span>Contactar a {srv.title} por WhatsApp</span>
                      </a>
                    </div>
                  ))}
                </div>

                {/* Gaceta Oficial de Reglamentos */}
                <div className="bg-white rounded-2xl p-6 sm:p-8 border border-light-outline/60 shadow-xs space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <h2 className="font-headline text-headline-sm font-bold text-primary flex items-center gap-2">
                        <span className="material-symbols-outlined text-secondary text-[24px]">
                          library_books
                        </span>
                        <span>Gaceta Oficial Estudiantil y Normativas UAGRM</span>
                      </h2>
                      <p className="text-xs sm:text-sm text-light-on-surface-container mt-1">
                        Haz clic en cualquier documento para leer sus artículos fundamentales en el visor interactivo o descargar el compendio.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    {OFFICIAL_REGULATIONS.map((reg) => (
                      <div
                        key={reg.id}
                        className="p-5 rounded-xl bg-light-surface-container border border-light-outline/60 flex flex-col justify-between space-y-4"
                      >
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-mono font-bold text-secondary">
                              {reg.code}
                            </span>
                            <span className="text-light-on-surface-container/70">
                              {reg.pages} págs.
                            </span>
                          </div>
                          <h3 className="font-headline text-title-md font-bold text-primary">
                            {reg.title} ({reg.subtitle})
                          </h3>
                          <p className="text-xs text-light-on-surface-container leading-relaxed">
                            {reg.summary}
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={() => setSelectedRegulation(reg)}
                          className="w-full py-2.5 px-4 rounded-xl bg-primary text-white font-headline text-xs font-bold hover:bg-secondary transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-[16px]">
                            visibility
                          </span>
                          <span>Abrir Visor y Descargar</span>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>
          </div>
        )}

        {/* =========================================================
            VISTA 4: REDES FUL (@ful.uagrm) (VISTA DEDICADA)
           ========================================================= */}
        {activeView === 'reels' && (
          <div className="animate-surface-enter">
            <section className="bg-primary text-white py-14 border-b border-primary/20">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                <div className="space-y-2 max-w-2xl">
                  <div className="inline-flex items-center gap-2 text-accent font-headline text-xs font-bold uppercase tracking-wider">
                    <span className="material-symbols-outlined text-[18px]">
                      smart_display
                    </span>
                    <span>Comunidad Digital Universitaria</span>
                  </div>
                  <h1 className="font-headline text-headline-lg-mobile sm:text-headline-lg font-extrabold text-white">
                    La FUL en Movimiento (@ful.uagrm)
                  </h1>
                  <p className="font-body text-body-md text-white/85">
                    Reproduce nuestros Reels oficiales sobre defensa estudiantil, resúmenes deportivos, ensayos culturales y tutoriales de becas y trámites.
                  </p>
                </div>

                <a
                  href={portalConfig.tiktokUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-6 py-3.5 rounded-full bg-secondary text-white font-headline text-label-lg font-bold shadow-lg hover:bg-secondary/90 transition-all inline-flex items-center gap-2 shrink-0"
                >
                  <span className="material-symbols-outlined text-[20px]">open_in_new</span>
                  <span>Seguir a @ful.uagrm en TikTok</span>
                </a>
              </div>
            </section>

            <section className="py-12 bg-light-surface-container">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
                {/* Filtros de Reels */}
                <div className="flex flex-wrap items-center gap-2">
                  {['Todos', 'Gestión', 'Deportes', 'Cultura', 'Tutorial'].map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setReelCategoryFilter(cat)}
                      className={`px-4 py-2 rounded-full font-headline text-xs font-bold transition-colors cursor-pointer ${
                        reelCategoryFilter === cat
                          ? 'bg-secondary text-white shadow-xs'
                          : 'bg-white text-primary border border-light-outline/50 hover:bg-primary/5'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>

                {/* Cuadrícula de Reels */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                  {filteredReels.map((reel) => (
                    <div
                      key={reel.id}
                      onClick={() => setSelectedReel(reel)}
                      className="group relative rounded-2xl overflow-hidden aspect-[9/16] bg-primary shadow-md hover:shadow-xl transition-all duration-150 flex flex-col justify-end cursor-pointer"
                    >
                      <img
                        src={reel.image}
                        alt={reel.title}
                        className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-250"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent"></div>

                      <div className="absolute inset-0 flex items-center justify-center">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedReel(reel);
                          }}
                          className="w-14 h-14 rounded-full bg-secondary/90 text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-all cursor-pointer"
                          aria-label={`Reproducir ${reel.title}`}
                        >
                          <span className="material-symbols-outlined text-[32px] ml-0.5">
                            play_arrow
                          </span>
                        </button>
                      </div>

                      <div className="absolute top-3 left-3 right-3 flex items-center justify-between text-xs text-white">
                        <span className="bg-black/60 backdrop-blur-xs px-2.5 py-1 rounded-full font-mono text-[11px] flex items-center gap-1">
                          <span className="material-symbols-outlined text-[13px] text-secondary">
                            visibility
                          </span>
                          <span>{reel.views}</span>
                        </span>
                        <span className="bg-primary/85 px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider">
                          {reel.category}
                        </span>
                      </div>

                      <div className="relative z-10 p-4 text-white">
                        <p className="font-headline text-sm font-bold line-clamp-2 mb-2 leading-snug">
                          {reel.caption}
                        </p>
                        <span className="inline-flex items-center gap-1.5 text-xs text-accent font-semibold">
                          <span>Reproducir en visor</span>
                          <span className="material-symbols-outlined text-[14px]">
                            play_circle
                          </span>
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          </div>
        )}

        {/* =========================================================
            VISTA 5: NOTICIAS E INICIATIVAS (VISTA DEDICADA)
           ========================================================= */}
        {activeView === 'noticias' && (
          <div className="animate-surface-enter">
            <section className="bg-primary text-white py-14 border-b border-primary/20">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-2">
                <div className="inline-flex items-center gap-2 text-accent font-headline text-xs font-bold uppercase tracking-wider">
                  <span className="material-symbols-outlined text-[18px]">newspaper</span>
                  <span>Boletín Oficial de Prensa y Gestión</span>
                </div>
                <h1 className="font-headline text-headline-lg-mobile sm:text-headline-lg font-extrabold text-white">
                  Noticias, Proyectos e Impacto Social
                </h1>
                <p className="font-body text-body-md text-white/85 max-w-2xl">
                  Transparencia informativa sobre brigadas barriales, convenios de pasantías, obras de infraestructura estudiantil y resoluciones académicas.
                </p>
              </div>
            </section>

            <section className="py-12 bg-light-surface-container">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
                <div className="flex flex-wrap items-center gap-2">
                  {[
                    'Todos',
                    'Proyección Social',
                    'Gestión',
                    'Infraestructura',
                    'Académico',
                  ].map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setNewsCategoryFilter(cat)}
                      className={`px-4 py-2 rounded-full font-headline text-xs font-bold transition-colors cursor-pointer ${
                        newsCategoryFilter === cat
                          ? 'bg-secondary text-white shadow-xs'
                          : 'bg-white text-primary border border-light-outline/50 hover:bg-primary/5'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {filteredNews.map((news) => {
                    const catBadge =
                      news.categoryBg === 'accent'
                        ? 'bg-accent text-on-accent'
                        : news.categoryBg === 'primary'
                        ? 'bg-primary text-on-primary'
                        : 'bg-secondary text-on-secondary';

                    return (
                      <article
                        key={news.id}
                        onClick={() => setSelectedNews(news)}
                        className="bg-white rounded-2xl border border-light-outline/50 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-150 flex flex-col group cursor-pointer"
                      >
                        <div className="h-52 overflow-hidden bg-primary/10 relative">
                          <img
                            src={news.image}
                            alt={news.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-250"
                          />
                          <span
                            className={`absolute top-4 left-4 ${catBadge} px-3 py-1 rounded-full font-headline text-label-sm font-bold uppercase tracking-wider shadow`}
                          >
                            {news.category}
                          </span>
                        </div>
                        <div className="p-6 flex-1 flex flex-col justify-between">
                          <div>
                            <div className="flex items-center gap-2 text-xs text-light-on-surface-container/70 mb-3 font-body">
                              <span className="material-symbols-outlined text-[16px] text-secondary">
                                calendar_today
                              </span>
                              <span>{news.date}</span>
                              <span>·</span>
                              <span>{news.readTime}</span>
                            </div>
                            <h3 className="font-headline text-title-lg text-primary font-bold mb-3 group-hover:text-secondary transition-colors">
                              {news.title}
                            </h3>
                            <p className="font-body text-body-md text-light-on-surface-container line-clamp-3 mb-4">
                              {news.summary}
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedNews(news);
                            }}
                            className="inline-flex items-center gap-1.5 text-secondary font-headline text-label-lg font-bold hover:underline pt-2 cursor-pointer"
                          >
                            <span>Leer nota completa</span>
                            <span className="material-symbols-outlined text-[18px]">
                              chevron_right
                            </span>
                          </button>
                        </div>
                      </article>
                    );
                  })}
                </div>
              </div>
            </section>
          </div>
        )}

        {/* =========================================================
            VISTA 6: NOSOTROS (ESTRUCTURA Y GESTIÓN FUL 2026-2028)
           ========================================================= */}
        {activeView === 'nosotros' && (
          <div className="animate-surface-enter">
            <section className="bg-primary text-white py-14 border-b border-primary/20">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-8">
                <div className="space-y-3 max-w-2xl">
                  <div className="inline-flex items-center gap-2 text-accent font-headline text-xs font-bold uppercase tracking-wider">
                    <span className="material-symbols-outlined text-[18px]">
                      account_balance
                    </span>
                    <span>Institucionalidad y Cogobierno Moreniano</span>
                  </div>
                  <h1 className="font-headline text-headline-lg-mobile sm:text-headline-lg font-extrabold text-white">
                    Federación Universitaria Local — Gestión 2026–2028
                  </h1>
                  <p className="font-body text-body-md text-white/85 leading-relaxed">
                    Representamos con firmeza, transparencia y vocación de servicio a los más de 100.000 estudiantes de las 18 facultades y unidades integrales de la Universidad Autónoma Gabriel René Moreno.
                  </p>
                </div>

                <div className="flex items-center gap-4 bg-white p-4 rounded-2xl shadow-lg shrink-0">
                  <img
                    src={OFFICIAL_LOGOS.ful}
                    alt="Logo FUL"
                    className="w-16 h-16 object-contain rounded-full"
                  />
                  <div className="h-12 w-px bg-light-outline"></div>
                  <img
                    src={OFFICIAL_LOGOS.uagrmShield}
                    alt="Escudo UAGRM"
                    className="h-14 w-auto object-contain"
                  />
                </div>
              </div>
            </section>

            <section className="py-12 bg-light-surface-container">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
                {/* Pilares Institucionales */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-white p-6 rounded-2xl border border-light-outline/50 shadow-2xs space-y-2">
                    <div className="w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center">
                      <span className="material-symbols-outlined text-[22px]">shield</span>
                    </div>
                    <h3 className="font-headline text-title-md font-bold text-primary">
                      Misión Estudiantil
                    </h3>
                    <p className="text-xs sm:text-sm text-light-on-surface-container leading-relaxed">
                      Defender la Autonomía Universitaria, el cogobierno paritario y los derechos académicos y sociales de cada estudiante moreniano en la capital y las provincias cruceñas.
                    </p>
                  </div>

                  <div className="bg-white p-6 rounded-2xl border border-light-outline/50 shadow-2xs space-y-2">
                    <div className="w-10 h-10 rounded-xl bg-secondary text-white flex items-center justify-center">
                      <span className="material-symbols-outlined text-[22px]">
                        visibility
                      </span>
                    </div>
                    <h3 className="font-headline text-title-md font-bold text-primary">
                      Visión 2026–2028
                    </h3>
                    <p className="text-xs sm:text-sm text-light-on-surface-container leading-relaxed">
                      Consolidar una Federación moderna, de puertas abiertas, digitalizada y enfocada en la excelencia académica, la inserción laboral juvenil y el bienestar estudiantil.
                    </p>
                  </div>

                  <div className="bg-white p-6 rounded-2xl border border-light-outline/50 shadow-2xs space-y-2">
                    <div className="w-10 h-10 rounded-xl bg-accent text-white flex items-center justify-center">
                      <span className="material-symbols-outlined text-[22px]">
                        handshake
                      </span>
                    </div>
                    <h3 className="font-headline text-title-md font-bold text-primary">
                      Transparencia y Puertas Abiertas
                    </h3>
                    <p className="text-xs sm:text-sm text-light-on-surface-container leading-relaxed">
                      Rendición pública de cuentas, fiscalización permanente de becas IDH y Comedor, y atención directa sin burocracia en el edificio central de la FUL.
                    </p>
                  </div>
                </div>

                {/* Directiva y Secretarías */}
                <div className="space-y-6">
                  <div>
                    <h2 className="font-headline text-headline-sm font-bold text-primary">
                      Directiva y Secretarías de Gestión (2026–2028)
                    </h2>
                    <p className="text-xs sm:text-sm text-light-on-surface-container">
                      Comunícate directamente con el Comité Ejecutivo de la Federación Universitaria Local.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {EXECUTIVE_BOARD.map((member) => (
                      <div
                        key={member.id}
                        className="bg-white rounded-2xl p-6 border border-light-outline/60 shadow-2xs flex flex-col justify-between space-y-4"
                      >
                        <div className="space-y-2">
                          <span className="inline-block px-3 py-0.5 rounded-full bg-secondary/10 text-secondary font-headline text-xs font-bold">
                            {member.role}
                          </span>
                          <h3 className="font-headline text-title-lg font-bold text-primary">
                            {member.name}
                          </h3>
                          <p className="text-xs font-mono text-primary/70">{member.faculty}</p>
                          <p className="text-xs sm:text-sm text-light-on-surface-container leading-relaxed pt-1">
                            {member.description}
                          </p>
                        </div>

                        <a
                          href={buildDynamicWhatsAppUrl(
                            portalConfig.whatsappGeneral,
                            member.whatsappText
                          )}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 text-xs font-headline font-bold text-accent hover:underline"
                        >
                          <span className="material-symbols-outlined text-[16px]">chat</span>
                          <span>Escribir por WhatsApp</span>
                        </a>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Las Facultades Integradas */}
                <div className="bg-white rounded-2xl p-6 sm:p-8 border border-light-outline/50 space-y-4">
                  <h3 className="font-headline text-title-lg font-bold text-primary flex items-center gap-2">
                    <span className="material-symbols-outlined text-secondary text-[22px]">
                      school
                    </span>
                    <span>
                      Las {facultiesList.length} Facultades y Unidades Integrales Representadas
                    </span>
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
                    {facultiesList.map((fac, idx) => (
                      <div
                        key={fac.id}
                        className="p-3 rounded-xl bg-light-surface-container border border-light-outline/40 flex items-start gap-2.5"
                      >
                        <span className="font-mono font-bold text-secondary shrink-0">
                          {String(idx + 1).padStart(2, '0')}.
                        </span>
                        <span className="font-medium text-primary">{fac.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>
          </div>
        )}

        {/* =========================================================
            VISTA 7: PANEL ADMINISTRADOR PROTEGIDO (/admin)
           ========================================================= */}
        {activeView === 'admin' && (
          <AdminDashboard
            onBackToHome={() => navigateTo('inicio')}
            onPreviewFacebookPost={(post) => setSelectedFacebookPost(post)}
          />
        )}
      </main>

      <Footer
        onNavigate={navigateTo}
        onOpenRegulation={(regDoc) => setSelectedRegulation(regDoc)}
        portalConfig={portalConfig}
      />

      {/* MODALES INTERACTIVOS */}
      <EventRegistrationModal
        event={selectedEvent}
        onClose={() => setSelectedEvent(null)}
        faculties={facultiesList}
        whatsappNumber={portalConfig.whatsappGeneral}
      />
      <NewsReaderModal
        news={selectedNews}
        onClose={() => setSelectedNews(null)}
        whatsappNumber={portalConfig.whatsappGeneral}
      />
      <ReelPlayerModal
        reel={selectedReel}
        onClose={() => setSelectedReel(null)}
        onSelectReel={(r) => setSelectedReel(r)}
        allReels={reelsList}
      />
      <RegulationViewerModal
        regulation={selectedRegulation}
        onClose={() => setSelectedRegulation(null)}
        whatsappNumber={portalConfig.whatsappDefensoria}
      />
      <FacebookPostModal
        post={selectedFacebookPost}
        onClose={() => setSelectedFacebookPost(null)}
      />
    </div>
  );
}

