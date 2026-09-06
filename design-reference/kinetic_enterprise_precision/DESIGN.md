---
name: Kinetic Enterprise Precision
colors:
  surface: '#0b1326'
  surface-dim: '#0b1326'
  surface-bright: '#31394d'
  surface-container-lowest: '#060e20'
  surface-container-low: '#131b2e'
  surface-container: '#171f33'
  surface-container-high: '#222a3d'
  surface-container-highest: '#2d3449'
  on-surface: '#dae2fd'
  on-surface-variant: '#c7c4d7'
  inverse-surface: '#dae2fd'
  inverse-on-surface: '#283044'
  outline: '#908fa0'
  outline-variant: '#464554'
  surface-tint: '#c0c1ff'
  primary: '#c0c1ff'
  on-primary: '#1000a9'
  primary-container: '#8083ff'
  on-primary-container: '#0d0096'
  inverse-primary: '#494bd6'
  secondary: '#93ccff'
  on-secondary: '#003351'
  secondary-container: '#3198dc'
  on-secondary-container: '#002c47'
  tertiary: '#4edea3'
  on-tertiary: '#003824'
  tertiary-container: '#00885d'
  on-tertiary-container: '#000703'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#e1e0ff'
  primary-fixed-dim: '#c0c1ff'
  on-primary-fixed: '#07006c'
  on-primary-fixed-variant: '#2f2ebe'
  secondary-fixed: '#cce5ff'
  secondary-fixed-dim: '#93ccff'
  on-secondary-fixed: '#001d31'
  on-secondary-fixed-variant: '#004b73'
  tertiary-fixed: '#6ffbbe'
  tertiary-fixed-dim: '#4edea3'
  on-tertiary-fixed: '#002113'
  on-tertiary-fixed-variant: '#005236'
  background: '#0b1326'
  on-background: '#dae2fd'
  surface-variant: '#2d3449'
typography:
  display-lg:
    fontFamily: Inter
    fontSize: 36px
    fontWeight: '700'
    lineHeight: 44px
    letterSpacing: -0.025em
  headline-lg:
    fontFamily: Inter
    fontSize: 28px
    fontWeight: '600'
    lineHeight: 36px
    letterSpacing: -0.02em
  headline-lg-mobile:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.015em
  headline-md:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
    letterSpacing: -0.015em
  headline-sm:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '600'
    lineHeight: 24px
    letterSpacing: -0.01em
  body-lg:
    fontFamily: Inter
    fontSize: 15px
    fontWeight: '400'
    lineHeight: 22px
    letterSpacing: -0.005em
  body-md:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 20px
    letterSpacing: 0em
  body-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 18px
    letterSpacing: 0em
  label-md:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.01em
  label-sm:
    fontFamily: Inter
    fontSize: 11px
    fontWeight: '500'
    lineHeight: 14px
    letterSpacing: 0.02em
  code-tabular:
    fontFamily: JetBrains Mono
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
    letterSpacing: 0em
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  space-2xs: 0.125rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 0.75rem
  space-lg: 1rem
  space-xl: 1.5rem
  space-2xl: 2rem
  space-3xl: 3rem
  gutter-compact: 0.75rem
  gutter-default: 1.25rem
  margin-page: 1.5rem
---

## Brand & Style
The design system targets high-velocity product teams, engineering leads, and project directors requiring information-dense workspaces without visual noise. It merges the disciplined focus and dark-mode elegance of Linear, the document fluidity of Notion, and the structural scale of modern enterprise platforms.

Key attributes:
- **Calm, High-Precision Ergonomics**: Every pixel, divider, and token respects spatial efficiency, optimizing scanability across dense backlogs, kanban boards, and interactive spreadsheets.
- **Architectural Hierarchy**: Visual weight relies heavily on typographic weight, subtle hairline borders, and subdued badge accents rather than heavy decorative fills.
- **Dynamic Adaptability**: Instant tactile responsiveness with crisp micro-transitions (100ms–150ms cubic-bezier eases) reflecting performance and developer-grade control.

## Colors
The color architecture relies on a dark slate canvas paired with a sharp, vibrant indigo/violet primary scale and high-utility semantic functional accents.

- **Primary Canvas & Neutrals**: 
  - Canvas Deep: `#0F172A` (Slate 900)
  - Surface Raised / Card: `#1E293B` (Slate 800)
  - Surface Hover / Elevated: `#334155` (Slate 700)
  - Hairline Dividers & Outlines: `#334155` (Dark Mode), `#E2E8F0` (Light Mode)
  - Text Primary: `#F8FAFC` (Slate 50)
  - Text Secondary / Muted: `#94A3B8` (Slate 400)
- **Primary & Accent Tokens**:
  - Indigo/Violet Primary: `#6366F1` (Default), `#4F46E5` (Hover), `#4338CA` (Active/Pressed)
  - Subtle Indigo Tint: `rgba(99, 102, 241, 0.12)` (Pill backgrounds, focused container highlights)
- **Semantic & Status Mapping**:
  - Success / Completed: `#10B981` (Emerald), Surface: `rgba(16, 185, 129, 0.12)`
  - Warning / In-Progress / Medium Priority: `#F59E0B` (Amber), Surface: `rgba(245, 158, 11, 0.12)`
  - Destructive / High Priority / Blocker: `#F43F5E` (Rose), Surface: `rgba(244, 63, 94, 0.12)`
  - Information / Observer / Metadata: `#0284C7` (Sky/Cyan), Surface: `rgba(2, 132, 199, 0.12)`

## Typography
Typographic discipline prioritizes instant scanning, clarity, and structural balance:
- **Display and Headers**: Tight negative tracking (`-0.025em` to `-0.01em`) ensures headlines read as cohesive, deliberate anchor blocks.
- **Body Copy**: Standard 13px base sizing provides Notion-grade density, letting power users view 30% more records per viewport compared to traditional 16px designs.
- **Numerical & Status Indicators**: Numerical counts, project keys (e.g., `ENG-402`), timestamps, metrics, and progress percentages render in `JetBrains Mono` or with CSS `font-variant-numeric: tabular-nums` to eliminate jitter when state changes occur.

## Layout & Spacing
The layout model employs an adaptive 12-column fluid grid system paired with strict 4px/8px micro-increments.

- **Grid and Canvas Structure**:
  - Desktop (>= 1280px): Fixed or collapsable multi-pane workspace layout (sidebar 240px–280px, main viewport 1fr, optional contextual detail pane 380px–440px) with 1.25rem (20px) gutters.
  - Tablet (768px - 1279px): Sidebar defaults to rail view (56px) or overlay; table views swap to horizontally scrollable viewports.
  - Mobile (< 768px): Single pane view with bottom navigation bar, full-width cards, edge margins of 1rem (16px), and bottom sheet detail overlays.
- **Density Controls**:
  - Tight baseline rhythm using `space-xs` (4px) and `space-sm` (8px) for list items, table rows, and status badges.
  - High-breathing zones for headers and empty states use `space-2xl` (32px) and `space-3xl` (48px).

## Elevation & Depth
Depth is created through low-contrast hairline borders combined with deep ambient shadows, avoiding heavy, skeuomorphic drop shadows.

- **Level 0 (Flat Canvas)**: Neutral base color (`#0F172A`). Used for root dashboards and board backgrounds.
- **Level 1 (Panels & Cards)**: Raised surface (`#1E293B`) with a single hairline border: `1px solid rgba(255, 255, 255, 0.07)` (or `slate-700`). No initial shadow required.
- **Level 2 (Dropdowns, Popovers, Hover Cards)**: Elevated surface (`#1E293B`) with `box-shadow: 0 4px 20px -2px rgba(0, 0, 0, 0.45), 0 2px 6px -1px rgba(0, 0, 0, 0.3)` and hairline stroke `1px solid rgba(255, 255, 255, 0.1)`.
- **Level 3 (Modals & Command Palettes)**: Surface `#1E293B` or semi-translucent `#1E293B/95` with `backdrop-filter: blur(12px)`, bordered by `1px solid rgba(255, 255, 255, 0.12)`, lifted by `box-shadow: 0 24px 48px -12px rgba(0, 0, 0, 0.65)`.
- **Modal Scrim**: Darkened backdrop using `rgba(15, 23, 42, 0.75)` with subtle `backdrop-filter: blur(4px)`.

## Shapes
The shape language implements modern geometric curves focused within the 8px to 12px range (`rounded-md` to `rounded-lg` equivalents), ensuring crisp alignment across dense UI components.

- **Base Controls (Buttons, Inputs, Pill Badges)**: 6px to 8px border radius for compact, surgical appearance.
- **Container Surfaces (Cards, Modals, Flyouts)**: 10px to 12px border radius.
- **Status Pills and Avatars**: Fully rounded `rounded-full` (9999px) for unambiguous entity and tag differentiation.
- **Interior Elements**: Child elements nested within containers always use an internal radius offset (outer radius minus padding) to maintain geometric concentricity.

## Components

### Buttons
- **Primary**: Background `#6366F1`, text `#FFFFFF`, radius 8px, hover `#4F46E5`, active `#4338CA`. Subtle inset top highlight: `inset 0 1px 0 rgba(255, 255, 255, 0.15)`.
- **Secondary / Outline**: Background transparent, border `1px solid #334155`, text `#F8FAFC`, hover background `#1E293B`.
- **Ghost**: Background transparent, text `#94A3B8`, hover text `#F8FAFC`, hover background `#1E293B`.
- **Destructive**: Background `rgba(244, 63, 94, 0.15)`, text `#F43F5E`, border `1px solid rgba(244, 63, 94, 0.3)`, hover background `#F43F5E`, hover text `#FFFFFF`.

### Inputs & Selects
- Height: 36px (compact) / 40px (default).
- Surface: `#0F172A`, border `1px solid #334155`, radius 8px, text `#F8FAFC`, placeholder `#64748B`.
- Focus state: Border color `#6366F1`, paired with `box-shadow: 0 0 0 1px #6366F1, 0 0 0 4px rgba(99, 102, 241, 0.2)`.

### Badges & Pill Tags
- Monospaced / Semibold 11px label font.
- Height: 22px, radius `rounded-full` or 6px.
- Subtle fills:
  - **Completed**: `#10B981/15` text `#10B981`, border `1px solid #10B981/30`.
  - **In Progress**: `#F59E0B/15` text `#F59E0B`, border `1px solid #F59E0B/30`.
  - **Urgent**: `#F43F5E/15` text `#F43F5E`, border `1px solid #F43F5E/30`.
  - **Metadata/Viewer**: `#0284C7/15` text `#0284C7`, border `1px solid #0284C7/30`.

### Data Cards & Table Rows
- **Board Cards**: Background `#1E293B`, border `1px solid #334155`, radius 10px, padding 12px–16px. Hover displays an uplift border shift to `#475569` and `translateY(-1px)`.
- **Table Rows**: Row height 40px (compact) to 48px (spacious), bottom border `1px solid #1E293B`, hover state `#1E293B/60`.

### Selection Controls (Checkboxes & Radios)
- Checkboxes: 16x16px, 4px radius, border `1.5px solid #475569`. Checked: background `#6366F1`, border `#6366F1` with white checkmark icon.
- Radios: 16x16px circular, same border schema, with a centered 6px primary dot when active.

### Command Menu (Palette) & Modals
- Command dialog: 640px max-width, elevated surface `#1E293B`, 12px radius, centered search bar with leading 16px shortcut hints (`Cmd+K`), item keyboard navigability highlighted with `#334155`.