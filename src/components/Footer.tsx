import React from 'react';
import {
  OFFICIAL_LOGOS,
  PortalViewId,
  RegulationDoc,
  OFFICIAL_REGULATIONS,
} from '../data/portalData';
import {
  buildDynamicWhatsAppUrl,
  DEFAULT_PORTAL_CONFIG,
  PortalConfig,
} from '../firebase';

interface FooterProps {
  onNavigate: (view: PortalViewId) => void;
  onOpenRegulation: (doc: RegulationDoc) => void;
  portalConfig?: PortalConfig;
}

export const Footer: React.FC<FooterProps> = ({
  onNavigate,
  onOpenRegulation,
  portalConfig = DEFAULT_PORTAL_CONFIG,
}) => {
  const handleNav = (view: PortalViewId) => {
    onNavigate(view);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      {/* 7. FOOTER INSTITUCIONAL */}
      <footer id="nosotros" className="bg-primary text-white border-t border-primary/20 pt-16 pb-12 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Fila Superior Footer: Logos, Liderazgo y Redes */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 pb-12 border-b border-white/15">
            {/* Bloque Institucional y Logos (4 cols) */}
            <div className="lg:col-span-4 space-y-4">
              <div className="flex items-center gap-3">
                {/* Logo FUL */}
                <div className="w-14 h-14 rounded-full bg-white p-1 border border-white/20 shadow flex items-center justify-center overflow-hidden shrink-0">
                  <img
                    src={OFFICIAL_LOGOS.ful}
                    alt="FUL 2026-2028"
                    className="w-full h-full object-contain rounded-full"
                  />
                </div>
                {/* Logo UAGRM Escudo + Sigla */}
                <div className="h-14 flex items-center gap-2 bg-white px-2.5 py-1.5 rounded-xl shadow">
                  <img
                    src={OFFICIAL_LOGOS.uagrmShield}
                    alt="Escudo Oficial UAGRM"
                    className="h-11 w-auto object-contain"
                  />
                  <img
                    src={OFFICIAL_LOGOS.uagrmWordmark}
                    alt="Sigla Oficial UAGRM"
                    className="h-8 w-auto object-contain"
                  />
                </div>
              </div>

              <h3 className="font-headline text-title-lg font-bold text-white tracking-wide">
                Federación Universitaria Local (FUL)
              </h3>
              <p className="font-body text-sm text-white/80 leading-relaxed">
                Órgano máximo de representación y defensa de los derechos de más de 100.000 estudiantes de la Universidad Autónoma Gabriel René Moreno.
              </p>

              {/* Mención Destacada al Secretario Ejecutivo */}
              <div className="pt-2">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/10 border border-white/15 text-xs text-white">
                  <span className="w-2 h-2 rounded-full bg-secondary"></span>
                  <span>
                    <strong>Secretario Ejecutivo:</strong> Yordy Roca
                  </span>
                  <span className="text-accent font-mono font-semibold">(2026–2028)</span>
                </div>
              </div>
            </div>

            {/* Enlaces Rápidos a Páginas Internas (3 cols) */}
            <div className="lg:col-span-3 space-y-3">
              <h4 className="font-headline text-label-lg font-bold text-white uppercase tracking-wider border-b border-white/10 pb-2">
                Enlaces del Portal
              </h4>
              <ul className="space-y-2 text-sm text-white/80 font-body">
                <li>
                  <button
                    type="button"
                    onClick={() => handleNav('inicio')}
                    className="hover:text-secondary transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[14px]">chevron_right</span>
                    <span>Inicio</span>
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => handleNav('eventos')}
                    className="hover:text-secondary transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[14px]">chevron_right</span>
                    <span>Eventos y Convocatorias</span>
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => handleNav('atencion')}
                    className="hover:text-secondary transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[14px]">chevron_right</span>
                    <span>Atención al Estudiante y Defensoría</span>
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => handleNav('reels')}
                    className="hover:text-secondary transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[14px]">chevron_right</span>
                    <span>Redes FUL (@ful.uagrm)</span>
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => handleNav('noticias')}
                    className="hover:text-secondary transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[14px]">chevron_right</span>
                    <span>Noticias e Impacto Social</span>
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => handleNav('nosotros')}
                    className="hover:text-secondary transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[14px]">chevron_right</span>
                    <span>Estructura y Gestión FUL</span>
                  </button>
                </li>
              </ul>
            </div>

            {/* Ubicación en Campus y Contacto (3 cols) */}
            <div className="lg:col-span-3 space-y-3">
              <h4 className="font-headline text-label-lg font-bold text-white uppercase tracking-wider border-b border-white/10 pb-2">
                Ubicación y Atención
              </h4>
              <div className="space-y-2.5 text-xs text-white/80 font-body">
                <div className="flex items-start gap-2">
                  <span className="material-symbols-outlined text-secondary text-[18px] shrink-0 mt-0.5">
                    location_on
                  </span>
                  <span>{portalConfig.direccionCampus}</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="material-symbols-outlined text-secondary text-[18px] shrink-0 mt-0.5">
                    schedule
                  </span>
                  <span>{portalConfig.horarioAtencion}</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="material-symbols-outlined text-secondary text-[18px] shrink-0 mt-0.5">
                    mail
                  </span>
                  <span>{portalConfig.emailContacto}</span>
                </div>
              </div>
            </div>

            {/* Redes Sociales Oficiales (2 cols) */}
            <div className="lg:col-span-2 space-y-3">
              <h4 className="font-headline text-label-lg font-bold text-white uppercase tracking-wider border-b border-white/10 pb-2">
                Síguenos
              </h4>
              <p className="text-xs text-white/70">Comunidad activa @ful.uagrm</p>
              <div className="flex flex-wrap gap-2.5 pt-1">
                {/* TikTok */}
                <a
                  href={portalConfig.tiktokUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="TikTok FUL UAGRM"
                  className="w-10 h-10 rounded-full bg-white/10 hover:bg-secondary hover:text-white flex items-center justify-center transition-colors shadow-xs"
                >
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64c.29 0 .58.04.86.12V9.4a6.33 6.33 0 0 0-.86-.06A6.34 6.34 0 0 0 3 15.68a6.34 6.34 0 0 0 10.82 4.47 6.27 6.27 0 0 0 1.87-4.48V8.71a8.16 8.16 0 0 0 4.9 1.63v-3.65z"></path>
                  </svg>
                </a>
                {/* Facebook */}
                <a
                  href={portalConfig.facebookUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Facebook FUL UAGRM"
                  className="w-10 h-10 rounded-full bg-white/10 hover:bg-secondary hover:text-white flex items-center justify-center transition-colors shadow-xs"
                >
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"></path>
                  </svg>
                </a>
                {/* Instagram */}
                <a
                  href={portalConfig.instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram FUL UAGRM"
                  className="w-10 h-10 rounded-full bg-white/10 hover:bg-secondary hover:text-white flex items-center justify-center transition-colors shadow-xs"
                >
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"></path>
                  </svg>
                </a>
              </div>
            </div>
          </div>

          {/* Fila Inferior Footer: Derechos y Créditos */}
          <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-white/60">
            <div>
              © 2026–2028 Federación Universitaria Local (FUL) · Universidad Autónoma Gabriel René Moreno. Todos los derechos reservados.
            </div>
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => onOpenRegulation(OFFICIAL_REGULATIONS[0])}
                className="hover:text-white transition-colors cursor-pointer"
              >
                Estatuto Orgánico
              </button>
              <span>•</span>
              <button
                type="button"
                onClick={() => handleNav('nosotros')}
                className="hover:text-white transition-colors cursor-pointer"
              >
                Transparencia Estudiantil
              </button>
              <span>•</span>
              <button
                type="button"
                onClick={() => handleNav('admin')}
                className="hover:text-white text-white/50 transition-colors cursor-pointer inline-flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-[13px]">settings</span>
                <span>Panel Admin (/admin)</span>
              </button>
            </div>
          </div>
        </div>
      </footer>

      {/* BOTÓN FLOTANTE PERMANENTE DE WHATSAPP (ESQUINA INFERIOR DERECHA) */}
      <aside className="fixed bottom-6 right-6 z-40">
        <a
          href={buildDynamicWhatsAppUrl(
            portalConfig.whatsappGeneral,
            'Hola FUL UAGRM, necesito asistencia inmediata'
          )}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Atención directa por WhatsApp FUL UAGRM"
          className="group relative flex items-center gap-3 px-5 py-3.5 bg-accent text-on-accent rounded-full shadow-2xl hover:scale-105 hover:bg-accent/90 transition-all duration-150 cursor-pointer"
        >
          {/* Indicador de pulso activo */}
          <span className="absolute -top-1 -right-1 flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-secondary opacity-75"></span>
            <span className="relative inline-flex rounded-full h-4 w-4 bg-secondary"></span>
          </span>

          <span className="material-symbols-outlined text-[26px]" aria-hidden="true">
            chat
          </span>
          <span className="font-headline text-label-md font-bold pr-1">Atención FUL</span>
        </a>
      </aside>
    </>
  );
};
