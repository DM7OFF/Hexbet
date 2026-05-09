---
name: Hexbet Utility Core
colors:
  surface: '#10131a'
  surface-dim: '#10131a'
  surface-bright: '#363940'
  surface-container-lowest: '#0b0e15'
  surface-container-low: '#181c22'
  surface-container: '#1c2026'
  surface-container-high: '#272a31'
  surface-container-highest: '#32353c'
  on-surface: '#e0e2eb'
  on-surface-variant: '#c1c6d5'
  inverse-surface: '#e0e2eb'
  inverse-on-surface: '#2d3037'
  outline: '#8b919f'
  outline-variant: '#414753'
  surface-tint: '#aac7ff'
  primary: '#aac7ff'
  on-primary: '#002f64'
  primary-container: '#1475e1'
  on-primary-container: '#ffffff'
  inverse-primary: '#005db8'
  secondary: '#b2cadb'
  on-secondary: '#1d3340'
  secondary-container: '#334958'
  on-secondary-container: '#a1b8c9'
  tertiary: '#ffb68e'
  on-tertiary: '#532200'
  tertiary-container: '#c15800'
  on-tertiary-container: '#ffffff'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#d6e3ff'
  primary-fixed-dim: '#aac7ff'
  on-primary-fixed: '#001b3e'
  on-primary-fixed-variant: '#00458d'
  secondary-fixed: '#cee6f7'
  secondary-fixed-dim: '#b2cadb'
  on-secondary-fixed: '#051e2b'
  on-secondary-fixed-variant: '#334958'
  tertiary-fixed: '#ffdbc9'
  tertiary-fixed-dim: '#ffb68e'
  on-tertiary-fixed: '#331200'
  on-tertiary-fixed-variant: '#763300'
  background: '#10131a'
  on-background: '#e0e2eb'
  surface-variant: '#32353c'
typography:
  h1:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 32px
    letterSpacing: -0.02em
  h2:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
    letterSpacing: -0.01em
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '500'
    lineHeight: 24px
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
  body-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
  label-caps:
    fontFamily: Inter
    fontSize: 11px
    fontWeight: '700'
    lineHeight: 14px
    letterSpacing: 0.05em
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  unit: 4px
  container-padding: 16px
  gutter: 8px
  element-gap-sm: 4px
  element-gap-md: 12px
---

## Brand & Style

The design system is engineered for a high-performance betting environment where clarity and speed are paramount. It adopts an **Ultra-Minimalist and Utilitarian** style, stripping away the decorative "gamer" tropes of traditional betting platforms in favor of a professional, finance-adjacent aesthetic. 

The brand personality is disciplined, trustworthy, and efficient. By focusing on information density and functional contrast, this design system ensures that users can process complex betting data and live odds without cognitive overload. The emotional response is one of reliability and precision—shifting the user experience from a "casino game" to a "trading platform."

## Colors

This design system utilizes a sophisticated dark-mode palette rooted in deep slates and charcoals. The primary interactive color is a vibrant Indigo Blue, used sparingly to draw attention to actionable elements like "Place Bet" or "Deposit."

- **Backgrounds:** A tiered system using `#0f212e` for the global canvas and `#1a2c38` for cards and navigation panels.
- **Accents:** High-vibrancy Indigo (#1475e1) serves as the primary action color. 
- **Status:** Functional colors (Success Green, Danger Red) are used only for outcome indicators and critical errors, ensuring they pop against the neutral slate base.
- **Contrast:** Subtle borders in `#2f4553` are used to define boundaries instead of shadows.

## Typography

The design system relies exclusively on **Inter** to maintain a systematic and corporate feel. The hierarchy is built on font weight and subtle color shifts (white to slate-gray) rather than dramatic size changes.

- **Headlines:** Compact and bold, optimized for dashboard headers.
- **Numerical Data:** Medium to Semi-bold weights are used for odds and balances to ensure immediate legibility at small sizes.
- **Micro-copy:** Uppercase labels with slight letter spacing are utilized for table headers and secondary category labels to maximize space.

## Layout & Spacing

This design system employs a **Fluid Grid** logic optimized for high information density. The layout is designed to maximize the visible area for betting markets and live streams.

- **Rhythm:** A 4px baseline grid ensures consistent alignment of tight components.
- **Density:** Padding is intentionally kept minimal (often 8px or 12px within cards) to allow more data to be visible above the fold.
- **Structure:** Content is organized into modular blocks that expand to fill the container width, separated by consistent 8px gutters.

## Elevation & Depth

In alignment with the ultra-minimalist brief, this design system avoids shadows, blurs, and glows. Depth is created through **Tonal Layering and Low-Contrast Outlines**.

- **Level 0 (Canvas):** `#0f212e` (Deepest layer).
- **Level 1 (Cards/Panels):** `#1a2c38` (Surface layer).
- **Level 2 (In-set elements/Inputs):** Backgrounds that are slightly darker or lighter than the surface to indicate interactivity.
- **Separators:** 1px solid borders using `#2f4553` are the primary method for defining hierarchy and grouping elements.

## Shapes

The shape language is rigid and disciplined. To maintain the professional "trading platform" feel, corner radii are kept very low.

- **Standard Radius:** 4px for buttons, input fields, and cards.
- **Small Radius:** 2px for chips, tags, and status indicators.
- **Borders:** Crisp 1px solid strokes are used for all container outlines. Avoid pill-shaped buttons unless used for secondary "tag" filters.

## Components

### Buttons
- **Primary:** Solid `#1475e1` fill with white text. No gradients. Hover state is a subtle brightness increase.
- **Secondary:** Slate fill (`#2f4553`) or ghost variant with a 1px border.
- **State:** Disabled states use 30% opacity with a "not-allowed" cursor.

### Cards
- Flat surfaces (`#1a2c38`) with 1px `#2f4553` borders.
- Padding should be tight (12px) to support data-heavy tables and odds grids.

### Input Fields
- Darker background than the card surface.
- 1px border that shifts to Primary Blue on focus.
- Monospaced-style numeric display for bet amounts to prevent character jumping.

### Status Indicators
- **Odds Up/Down:** Small solid triangles in Success Green or Danger Red.
- **Live Badges:** Solid fill with white text, positioned in the top-left of cards or list items.

### Betting Slips
- Highly condensed lists with 4px vertical spacing between items.
- Use distinct dividers to separate different legs of a parlay.