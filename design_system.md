---
name: Lumina Trade Finance
colors:
  surface: '#051424'
  surface-dim: '#051424'
  surface-bright: '#2c3a4c'
  surface-container-lowest: '#010f1f'
  surface-container-low: '#0d1c2d'
  surface-container: '#122131'
  surface-container-high: '#1c2b3c'
  surface-container-highest: '#273647'
  on-surface: '#d4e4fa'
  on-surface-variant: '#c7c4d7'
  inverse-surface: '#d4e4fa'
  inverse-on-surface: '#233143'
  outline: '#908fa0'
  outline-variant: '#464554'
  surface-tint: '#c0c1ff'
  primary: '#c0c1ff'
  on-primary: '#1000a9'
  primary-container: '#8083ff'
  on-primary-container: '#0d0096'
  inverse-primary: '#494bd6'
  secondary: '#bcc7de'
  on-secondary: '#263143'
  secondary-container: '#3e495d'
  on-secondary-container: '#aeb9d0'
  tertiary: '#ffb95f'
  on-tertiary: '#472a00'
  tertiary-container: '#ca8100'
  on-tertiary-container: '#3e2400'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#e1e0ff'
  primary-fixed-dim: '#c0c1ff'
  on-primary-fixed: '#07006c'
  on-primary-fixed-variant: '#2f2ebe'
  secondary-fixed: '#d8e3fb'
  secondary-fixed-dim: '#bcc7de'
  on-secondary-fixed: '#111c2d'
  on-secondary-fixed-variant: '#3c475a'
  tertiary-fixed: '#ffddb8'
  tertiary-fixed-dim: '#ffb95f'
  on-tertiary-fixed: '#2a1700'
  on-tertiary-fixed-variant: '#653e00'
  background: '#051424'
  on-background: '#d4e4fa'
  surface-variant: '#273647'
typography:
  display-lg:
    fontFamily: Inter
    fontSize: 48px
    fontWeight: '700'
    lineHeight: '1.2'
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '600'
    lineHeight: '1.25'
  headline-md:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.3'
  title-lg:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '500'
    lineHeight: '1.4'
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: '1.5'
  label-md:
    fontFamily: JetBrains Mono
    fontSize: 12px
    fontWeight: '500'
    lineHeight: '1.2'
    letterSpacing: 0.05em
  headline-lg-mobile:
    fontFamily: Inter
    fontSize: 28px
    fontWeight: '600'
    lineHeight: '1.2'
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  unit: 8px
  container-padding: 24px
  gutter: 16px
  sidebar-width: 280px
  compact-gap: 4px
  default-gap: 12px
  section-gap: 32px
---

## Brand & Style
The design system is engineered for the high-stakes world of international trade finance. It embodies **Professionalism, Security, and Modernity**. The goal is to transform complex regulatory workflows into intuitive, high-speed digital experiences.

The aesthetic follows a **Modern Corporate Glassmorphism** approach. It leverages deep atmospheric layers to provide a sense of vast digital space, using translucency to maintain context while focusing on data-dense interfaces. This style bridges the gap between traditional banking reliability and the cutting-edge efficiency of AI-driven fintech.

**Target Audience:** Corporate treasurers, trade finance officers, and compliance auditors.
**Emotional Response:** High confidence, clarity under pressure, and a sense of technological edge.

## Colors
The palette is optimized for long-duration focus in a dark environment.

- **Primary (Electric Indigo):** Used exclusively for primary calls to action, active states, and critical path highlights.
- **Background (Deep Navy):** A rich, dark foundation that reduces eye strain and provides high contrast for white text.
- **Accents (Amber):** Reserved for compliance alerts, pending approvals, and "Attention Required" status badges.
- **Neutrals:** A scale of slates and grays used for borders, secondary iconography, and metadata.
- **Success/Error:** Emerald (#10B981) for completed transactions and Rose (#F43F5E) for rejected LCs or failed validation.

## Typography
This design system utilizes **Inter** for all UI elements to ensure maximum legibility and a systematic feel. 

For technical data—such as SWIFT codes, LC reference numbers, and currency amounts—we use **JetBrains Mono**. This monospaced font ensures that numerical data aligns perfectly in tables and forms, facilitating rapid scanning for discrepancies. 

**Hierarchy Rules:**
- Use `display-lg` only for dashboard hero stats (e.g., Total Exposure).
- `label-md` (Monospace) should be used for all status badges and reference IDs.
- Ensure 4.5:1 contrast ratio for all body text against the dark glass background.

## Layout & Spacing
The layout is **Desktop-First**, prioritizing a high-density 12-column grid to accommodate complex data tables and side-by-side document comparisons.

- **Sidebar:** A fixed left-hand navigation at 280px, collapsible to 80px for power users.
- **Grid:** 12-column system with 16px gutters.
- **Margins:** 24px outer margins on desktop, scaling down to 16px on mobile.
- **Rhythm:** An 8px base unit drives all padding and margin decisions. 
- **AI Panels:** Right-hand contextual drawers (320px - 400px) that slide over content to provide real-time LC clause analysis.

## Elevation & Depth
Depth is achieved through **Glassmorphism** rather than traditional drop shadows. This creates a "Control Center" vibe where layers appear to float over a deep space background.

1.  **Base Layer:** Deep Navy (#111827) - The void.
2.  **Surface Layer (Cards/Panels):** `rgba(30, 41, 59, 0.7)` with a `backdrop-filter: blur(16px)`. A 1px border of `rgba(255, 255, 255, 0.1)` is required to define edges.
3.  **Raised Layer (Modals/Popovers):** `rgba(51, 65, 85, 0.9)` with a `backdrop-filter: blur(24px)`.
4.  **Shadows:** When used, shadows should be extremely subtle and large: `0 20px 50px rgba(0, 0, 0, 0.5)`.

This hierarchy ensures that high-priority AI insights or urgent alerts feel physically closer to the user.

## Shapes
The shape language is **Soft (0.25rem - 0.75rem)**. While the system is professional, hard 0px corners are avoided to keep the interface feeling modern and accessible.

- **Buttons & Inputs:** 0.25rem (4px) corner radius for a precise, "instrumented" feel.
- **Cards & AI Panels:** 0.5rem (8px) corner radius.
- **Outer Containers:** 0.75rem (12px) for large layout wrappers.
- **Status Badges:** Fully pill-shaped (999px) to distinguish them clearly from interactive buttons.

## Components

### Buttons
- **Primary:** Electric Indigo background, white text. Subtle inner glow on hover.
- **Secondary:** Transparent with a 1px Slate border.
- **Ghost:** No border, Indigo text. Used for low-priority dashboard actions.

### Data Tables
- **Header:** Slate-900 background, uppercase Monospace labels.
- **Rows:** Alternating subtle translucency. Row hover state should use a primary-tinted glass effect.
- **Status Badges:** High-contrast backgrounds (e.g., Amber for "Pending", Emerald for "Issued") with dark text for maximum readability.

### KPI Cards
- Large Monospace numbers.
- A background mini-sparkline showing 7-day trend.
- Glassmorphic container with 1px border.

### Multi-step Forms
- Vertical progress stepper on the left.
- Field groups separated by subtle horizontal dividers.
- Inline validation using the Accent (Amber) color for warnings and Rose for errors.

### AI Insight Panels
- Anchored to the right. 
- Features a subtle "pulsing" indigo border to indicate active AI processing.
- Uses a slightly more transparent glass effect than standard cards to feel "lighter."
