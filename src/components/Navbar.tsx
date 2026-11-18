import React, { useState } from 'react';
import {
  OFFICIAL_LOGOS,
  PortalViewId,
} from '../data/portalData';
import {
  buildDynamicWhatsAppUrl,
  DEFAULT_PORTAL_CONFIG,
  PortalConfig,
} from '../firebase';

interface NavbarProps {
  activeView: PortalViewId;
  onNavigate: (view: PortalViewId) => void;
  portalConfig?: PortalConfig;
}

const NAV_ITEMS: { id: PortalViewId; label: string; mobileLabel?: string }[] = [
  { id: 'inicio', label: 'Inicio' },
  { id: 'eventos', label: 'Eventos y Convocatorias' },
  { id: 'atencion', label: 'Atención al Estudiante' },
  { id: 'reels', label: 'Redes FUL', mobileLabel: 'Redes Sociales (@ful.uagrm)' },
  { id: 'noticias', label: 'Noticias e Iniciativas' },
  { id: 'nosotros', label: 'Nosotros' },
];

export const Navbar: React.FC<NavbarProps> = ({
  activeView,
  onNavigate,
  portalConfig = DEFAULT_PORTAL_CONFIG,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSelectView = (view: PortalViewId) => {
    onNavigate(view);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      {/* TOP BAR INSTITUCIONAL / AVISO */}
      <div className="bg-primary/95 text-on-primary py-2 px-4 border-b border-primary/20 text-xs">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 font-headline font-semibold text-accent bg-white/10 px-2.5 py-0.5 rounded-full">
              <span className="w-2 h-2 rounded-full bg-accent animate-pulse"></span>
              Gestión 2026–2028
            </span>
            <span className="hidden sm:inline text-white/80">
              Universidad Autónoma Gabriel René Moreno · Santa Cruz, Bolivia
            </span>
          </div>
          <div className="flex items-center gap-4 text-white/90">
            <span className="hidden md:inline font-medium">
              Sec. Ejecutivo: <strong className="text-white">Yordy Roca</strong>
            </span>
            <span className="text-white/40">|</span>
            <button
              type="button"
              onClick={() => handleSelectView('atencion')}
              className="hover:text-accent flex items-center gap-1 transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-[15px]">location_on</span>
              <span>Campus Universitario</span>
            </button>
          </div>
        </div>
      </div>

      {/* 1. BARRA DE NAVEGACIÓN SUPERIOR (STICKY) */}
      <header className="sticky top-0 z-40 bg-white shadow-sm border-b border-light-outline/40 transition-all duration-150">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between gap-3 sm:gap-4">
          {/* Izquierda: Logos Oficiales FUL y UAGRM */}
          <div className="flex items-center gap-2.5 sm:gap-4 shrink-0">
            <button
              type="button"
              onClick={() => handleSelectView('inicio')}
              className="flex items-center gap-2 sm:gap-3 group shrink-0 cursor-pointer text-left"
              title="Inicio - FUL UAGRM 2026-2028"
            >
              {/* Logo FUL 2026-2028 */}
              <div className="w-10 h-10 sm:w-13 sm:h-13 max-w-[40px] max-h-[40px] sm:max-w-[52px] sm:max-h-[52px] rounded-full overflow-hidden bg-white p-0.5 border border-primary/20 shadow-xs group-hover:scale-105 transition-transform duration-150 shrink-0 flex items-center justify-center">
                <img
                  src={OFFICIAL_LOGOS.ful}
                  alt="Logo Oficial FUL 2026-2028"
                  className="w-full h-full object-contain rounded-full"
                />
              </div>
              {/* Separador sutil */}
              <div className="h-7 sm:h-9 w-px bg-light-outline/60 shrink-0"></div>
              {/* Logo UAGRM */}
              <div className="h-7 sm:h-9 max-h-[36px] flex items-center shrink-0">
                <img
                  src={OFFICIAL_LOGOS.uagrmWordmark}
                  alt="Logo UAGRM"
                  className="h-6 sm:h-8 max-h-[32px] w-auto object-contain shrink-0 block"
                />
              </div>
            </button>
          </div>

          {/* Centro: Enlaces Multipágina */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-2" aria-label="Navegación principal">
            {NAV_ITEMS.map((item) => {
              const isActive = activeView === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleSelectView(item.id)}
                  aria-current={isActive ? 'page' : undefined}
                  className={
                    isActive
                      ? 'px-3.5 py-2 font-headline text-label-lg font-bold text-secondary border-b-2 border-secondary cursor-pointer whitespace-nowrap transition-colors'
                      : 'px-3.5 py-2 font-headline text-label-lg font-medium text-primary hover:text-secondary hover:bg-light-surface-container rounded-lg transition-colors cursor-pointer whitespace-nowrap'
                  }
                >
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* Derecha: Botón destacado en verde institucional WhatsApp con ícono */}
          <div className="flex items-center gap-3 shrink-0">
            <a
              href={buildDynamicWhatsAppUrl(
                portalConfig.whatsappGeneral,
                'Hola FUL UAGRM, necesito atención estudiantil'
              )}
              target="_blank"
              rel="noopener noreferrer"
              data-component-id="button-whatsapp-nav"
              className="inline-flex items-center gap-2 px-4 sm:px-5 py-2.5 bg-accent text-on-accent font-headline text-label-lg font-semibold rounded-full shadow hover:bg-accent/90 hover:shadow-md transition-all duration-150 cursor-pointer shrink-0 whitespace-nowrap"
            >
              <span className="material-symbols-outlined text-[20px]" aria-hidden="true">
                chat
              </span>
              <span className="hidden sm:inline">Atención Directa</span>
              <span className="sm:hidden">WhatsApp</span>
            </a>

            {/* Botón Menú Móvil */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              className="lg:hidden p-2 rounded-lg text-primary hover:bg-light-surface-container transition-colors cursor-pointer"
              aria-label={mobileMenuOpen ? 'Cerrar menú' : 'Abrir menú'}
              aria-expanded={mobileMenuOpen}
            >
              <span className="material-symbols-outlined text-[28px]">
                {mobileMenuOpen ? 'close' : 'menu'}
              </span>
            </button>
          </div>
        </div>

        {/* Menú Desplegable Móvil */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-light-outline/40 bg-white px-4 py-4 space-y-2 shadow-lg animate-surface-enter">
            {NAV_ITEMS.map((item) => {
              const isActive = activeView === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleSelectView(item.id)}
                  className={
                    isActive
                      ? 'w-full text-left block px-3 py-2.5 rounded-md font-headline font-bold text-secondary bg-secondary/10 cursor-pointer'
                      : 'w-full text-left block px-3 py-2.5 rounded-md font-headline font-medium text-primary hover:bg-light-surface-container cursor-pointer'
                  }
                >
                  {item.mobileLabel || item.label}
                </button>
              );
            })}
          </div>
        )}
      </header>
    </>
  );
};
