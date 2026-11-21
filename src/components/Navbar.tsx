import React, { useEffect, useState } from 'react';
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

interface NavItemConfig {
  key: string;
  view: PortalViewId;
  label: string;
  mobileLabel?: string;
}

const NAV_ITEMS: NavItemConfig[] = [
  { key: 'inicio', view: 'inicio', label: 'Inicio' },
  { key: 'la-ful', view: 'nosotros', label: 'La FUL' },
  { key: 'secretarias', view: 'nosotros', label: 'Secretarías' },
  {
    key: 'servicios',
    view: 'atencion',
    label: 'Servicios al Estudiante',
  },
  {
    key: 'noticias-eventos',
    view: 'eventos',
    label: 'Noticias y Eventos',
  },
  { key: 'transparencia', view: 'noticias', label: 'Transparencia' },
  { key: 'contacto', view: 'atencion', label: 'Contacto' },
];

function getDefaultKeyForView(view: PortalViewId): string {
  switch (view) {
    case 'inicio':
      return 'inicio';
    case 'nosotros':
      return 'la-ful';
    case 'atencion':
      return 'servicios';
    case 'eventos':
      return 'noticias-eventos';
    case 'noticias':
      return 'transparencia';
    default:
      return '';
  }
}

export const Navbar: React.FC<NavbarProps> = ({
  activeView,
  onNavigate,
  portalConfig = DEFAULT_PORTAL_CONFIG,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [selectedNavKey, setSelectedNavKey] = useState<string>(() =>
    getDefaultKeyForView(activeView)
  );

  useEffect(() => {
    setSelectedNavKey((prevKey) => {
      const matchingItem = NAV_ITEMS.find((item) => item.key === prevKey);
      if (matchingItem && matchingItem.view === activeView) {
        return prevKey;
      }
      return getDefaultKeyForView(activeView);
    });
  }, [activeView]);

  const handleSelectNavItem = (item: NavItemConfig) => {
    setSelectedNavKey(item.key);
    onNavigate(item.view);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectView = (view: PortalViewId, key?: string) => {
    setSelectedNavKey(key ?? getDefaultKeyForView(view));
    onNavigate(view);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      {/* FRANJA SUPERIOR INSTITUCIONAL AZUL OSCURO */}
      <div className="bg-[#05152C] text-white/90 py-1.5 px-4 border-b border-white/10 text-xs">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 text-[11px] sm:text-xs text-white/75 truncate">
            <span className="font-headline font-semibold text-[#F59E0B] whitespace-nowrap">
              Gestión 2026–2028
            </span>
            <span className="hidden sm:inline text-white/30" aria-hidden="true">
              ·
            </span>
            <span className="hidden sm:inline truncate">
              Universidad Autónoma Gabriel René Moreno · Santa Cruz, Bolivia
            </span>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={() => handleSelectView('atencion', 'servicios')}
              className="text-white/90 hover:text-[#F59E0B] font-headline text-[11px] sm:text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap"
            >
              <span>Trámites y Servicios</span>
              <span className="material-symbols-outlined text-[14px]" aria-hidden="true">
                arrow_forward
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* 1. BARRA DE NAVEGACIÓN SUPERIOR (STICKY - AZUL MARINO INSTITUCIONAL) */}
      <header className="sticky top-0 z-40 bg-[#082144] text-white shadow-lg border-b border-white/10 transition-all duration-150">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between gap-3 xl:gap-6">
          {/* Izquierda: Logos Oficiales FUL y UAGRM */}
          <div className="flex items-center shrink-0">
            <button
              type="button"
              onClick={() => handleSelectView('inicio', 'inicio')}
              className="flex items-center gap-2.5 sm:gap-3 group shrink-0 cursor-pointer text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#F59E0B] rounded-lg"
              title="Inicio - FUL UAGRM 2026-2028"
            >
              {/* Logo FUL 2026-2028 */}
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full overflow-hidden bg-white p-0.5 border-2 border-white/80 shadow-md group-hover:scale-105 transition-transform duration-150 shrink-0 flex items-center justify-center">
                <img
                  src={OFFICIAL_LOGOS.ful}
                  alt="Logo Oficial FUL 2026-2028"
                  className="w-full h-full object-contain rounded-full"
                />
              </div>

              {/* Wordmark Institucional FUL UAGRM */}
              <div className="flex flex-col leading-none shrink-0">
                <span className="font-headline text-lg sm:text-[22px] font-extrabold tracking-tight text-white">
                  FUL
                </span>
                <span className="font-headline text-[10px] sm:text-[11px] font-bold tracking-[0.14em] text-white/85 uppercase mt-0.5">
                  UAGRM
                </span>
              </div>

              {/* Separador sutil */}
              <div className="h-8 sm:h-9 w-px bg-white/20 shrink-0 hidden xs:block sm:block"></div>

              {/* Logo UAGRM */}
              <div className="h-8 sm:h-9 bg-white/95 px-2 py-1 rounded-lg shadow-xs flex items-center shrink-0">
                <img
                  src={OFFICIAL_LOGOS.uagrmWordmark}
                  alt="Logo UAGRM"
                  className="h-5 sm:h-6 w-auto object-contain shrink-0 block"
                />
              </div>
            </button>
          </div>

          {/* Centro: Enlaces de Navegación Principales */}
          <nav
            className="hidden lg:flex items-center justify-center gap-1 xl:gap-4 min-w-0"
            aria-label="Navegación principal"
          >
            {NAV_ITEMS.map((item) => {
              const isActive = selectedNavKey === item.key;
              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => handleSelectNavItem(item)}
                  aria-current={isActive ? 'page' : undefined}
                  className={
                    isActive
                      ? 'px-2 py-2 font-headline text-[12px] xl:text-[13px] font-bold text-[#F59E0B] border-b-2 border-[#F59E0B] cursor-pointer whitespace-nowrap shrink-0 transition-colors'
                      : 'px-2 py-2 font-headline text-[12px] xl:text-[13px] font-medium text-white/90 hover:text-[#F59E0B] border-b-2 border-transparent hover:border-[#F59E0B]/50 transition-colors cursor-pointer whitespace-nowrap shrink-0'
                  }
                >
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* Derecha: Botón de acción WhatsApp FUL + Menú móvil */}
          <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
            <a
              href={buildDynamicWhatsAppUrl(
                portalConfig.whatsappGeneral,
                'Hola FUL UAGRM, necesito atención estudiantil'
              )}
              target="_blank"
              rel="noopener noreferrer"
              data-component-id="button-whatsapp-nav"
              className="inline-flex items-center gap-2 px-4 sm:px-5 py-2.5 bg-[#F28C0F] hover:bg-[#DC7A06] text-white font-headline text-xs sm:text-[13px] font-bold rounded-full shadow-md hover:shadow-lg transition-all duration-150 cursor-pointer shrink-0 whitespace-nowrap focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            >
              <span className="material-symbols-outlined text-[18px]" aria-hidden="true">
                chat
              </span>
              <span className="hidden sm:inline">WhatsApp FUL</span>
              <span className="sm:hidden">WhatsApp</span>
            </a>

            {/* Botón Menú Móvil */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              className="lg:hidden p-2 rounded-lg text-white hover:bg-white/10 transition-colors cursor-pointer"
              aria-label={mobileMenuOpen ? 'Cerrar menú' : 'Abrir menú'}
              aria-expanded={mobileMenuOpen}
            >
              <span className="material-symbols-outlined text-[26px]">
                {mobileMenuOpen ? 'close' : 'menu'}
              </span>
            </button>
          </div>
        </div>

        {/* Menú Desplegable Móvil */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-white/15 bg-[#061A36] px-4 py-4 space-y-1.5 shadow-xl animate-surface-enter">
            {NAV_ITEMS.map((item) => {
              const isActive = selectedNavKey === item.key;
              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => handleSelectNavItem(item)}
                  className={
                    isActive
                      ? 'w-full text-left block px-3.5 py-2.5 rounded-lg font-headline text-sm font-bold text-[#F59E0B] bg-white/10 cursor-pointer'
                      : 'w-full text-left block px-3.5 py-2.5 rounded-lg font-headline text-sm font-medium text-white/90 hover:bg-white/10 hover:text-white cursor-pointer'
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
