---
name: "FUL UAGRM 2026-2028"
description: "Sistema de diseño institucional, moderno y universitario para el portal oficial de la Federación Universitaria Local de la UAGRM."
---

## Overview

El portal web oficial de la Federación Universitaria Local (FUL 2026-2028) de la Universidad Autónoma Gabriel René Moreno (UAGRM) en Santa Cruz de la Sierra encarna autoridad institucional, transparencia y cercanía con la comunidad estudiantil. El diseño combina el azul marino corporativo universitario con el rojo enérgico característico de la FUL, un blanco puro y un gris de alta pulcritud, acentuados con el verde institucional cruceño para servicios de gestión y atención directa. La arquitectura visual está pensada para una experiencia fluida tipo portal multipágina lista para ser trasladada con fidelidad a Wix Studio.

## Colors

La paleta institucional se extrae con fidelidad de los escudos y logos oficiales de la FUL y la UAGRM:

- **Azul Marino Profundo (#002855):** Simboliza solidez académica, pertenencia moreniana y prestigio institucional.
- **Rojo Carmesí (#D90429):** Transmite liderazgo estudiantil, vigor, dinamismo y llamado a la acción.
- **Verde Institucional (#007A33):** Representa la identidad cruceña, esperanza y canales de atención estudiantil (WhatsApp y gestión).
- **Blanco puro (#FFFFFF) y Gris claro (#F4F6F9):** Garantizan una lectura limpia, contraste óptimo y sensación de modernidad.

```yaml
colors:
  primary: "#002855"
  on-primary: "#FFFFFF"
  secondary: "#D90429"
  on-secondary: "#FFFFFF"
  accent: "#007A33"
  on-accent: "#FFFFFF"
  whatsapp: "#25D366"
  on-whatsapp: "#494949"
  light:
    surface: "#FFFFFF"
    on-surface: "#1A202C"
    surface-container: "#F4F6F9"
    on-surface-container: "#2D3748"
    surface-variant: "#E9ECEF"
    outline: "#CBD5E1"
  dark:
    surface: "#0A192F"
    on-surface: "#F8FAFC"
    surface-container: "#112240"
    on-surface-container: "#E2E8F0"
    surface-variant: "#1E293B"
    outline: "#334155"
```

## Typography

Se implementa una jerarquía tipográfica con Montserrat para títulos y encabezados de alta presencia, complementada con Roboto para cuerpo de texto y lectura prolongada, junto con Spline Sans Mono para identificadores, folios y fechas.

```yaml
typography:
  display-lg:
    fontFamily: "Montserrat"
    fontSize: 48px
    fontWeight: 800
    lineHeight: 56px
    letterSpacing: -1px
  display-lg-mobile:
    fontFamily: "Montserrat"
    fontSize: 32px
    fontWeight: 800
    lineHeight: 40px
    letterSpacing: -0.5px
  headline-lg:
    fontFamily: "Montserrat"
    fontSize: 36px
    fontWeight: 700
    lineHeight: 44px
    letterSpacing: -0.5px
  headline-lg-mobile:
    fontFamily: "Montserrat"
    fontSize: 28px
    fontWeight: 700
    lineHeight: 36px
  headline-md:
    fontFamily: "Montserrat"
    fontSize: 28px
    fontWeight: 700
    lineHeight: 36px
  headline-sm:
    fontFamily: "Montserrat"
    fontSize: 22px
    fontWeight: 600
    lineHeight: 30px
  title-lg:
    fontFamily: "Montserrat"
    fontSize: 20px
    fontWeight: 600
    lineHeight: 28px
  title-md:
    fontFamily: "Montserrat"
    fontSize: 18px
    fontWeight: 600
    lineHeight: 26px
  body-lg:
    fontFamily: "Roboto"
    fontSize: 16px
    fontWeight: 400
    lineHeight: 26px
  body-md:
    fontFamily: "Roboto"
    fontSize: 14px
    fontWeight: 400
    lineHeight: 22px
  label-lg:
    fontFamily: "Montserrat"
    fontSize: 14px
    fontWeight: 600
    lineHeight: 20px
    letterSpacing: 0.2px
  label-md:
    fontFamily: "Montserrat"
    fontSize: 12px
    fontWeight: 600
    lineHeight: 18px
    letterSpacing: 0.3px
  label-sm:
    fontFamily: "Roboto"
    fontSize: 11px
    fontWeight: 500
    lineHeight: 16px
```

## Layout & Spacing

El portal sigue una cuadrícula de 12 columnas con un ancho máximo de 1280px para escritorio y fluida para dispositivos móviles. La escala base de 8px asegura consistencia rítmica en márgenes y separaciones.

```yaml
spacing:
  gutter-xs: 4px
  gutter-sm: 8px
  gutter-md: 16px
  gutter-lg: 24px
  gutter-xl: 32px
  section: 64px
  page-margin: 24px
```

## Elevation & Depth

La elevación utiliza sombras ambientales suaves con tintes neutros y bordes limpios de bajo contraste (1px en `#E2E8F0`) para garantizar máxima compatibilidad con las capacidades modulares de Wix, facilitando el montaje por bloques y secciones.

## Shapes

Se utiliza una geometría equilibrada de esquinas ligeramente redondeadas (8px a 12px para tarjetas y contenedores, 9999px para botones de llamada a la acción y píldoras de estado).

```yaml
rounded:
  sm: 4px
  DEFAULT: 8px
  md: 12px
  lg: 16px
  xl: 24px
  full: 9999px
```

## Motion & Micro-interaction

Microinteracciones sutiles en botones y tarjetas que simulan elevación y desplazamiento de 2px a 4px, con transiciones en 150ms-250ms que transmiten agilidad sin saturar la experiencia de navegación.

```yaml
motion:
  state-change:
    duration: 150ms
    delay: 0ms
    timingFunction: ease-out
  surface-enter:
    duration: 250ms
    delay: 0ms
    timingFunction: cubic-bezier(0.16, 1, 0.3, 1)
```

## Voice & Content Strategy

- **Tono institucional y cercano:** Formal, transparente, enérgico y solidario con la realidad del universitario cruceño.
- **Capitalización:** Oraciones en títulos y verbos directos en llamadas a la acción ("Ver Eventos Activos", "Contactar por WhatsApp", "Escribir a Secretaría").
- **Identidad regional:** Respeto y orgullo por la Universidad Autónoma Gabriel René Moreno y la juventud de Santa Cruz de la Sierra.

## Components

Component implementations live as individual HTML sticker sheet files in
`components/`. Each file contains the canonical, styled HTML components with
`<!-- COMPONENT: name -->` comment markers. Read each file before use.

- **Banner** → `@components/banner.html`: `banner-info`, `banner-with-action`, `banner-dismissible`
- **Button** → `@components/button.html`: `button-primary`, `button-icon`, `button-with-icon`
- **Card** → `@components/card.html`: `card-elevated`, `card-action`, `card-interactive`, `card-interactive-2`
