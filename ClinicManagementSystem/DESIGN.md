---
name: Clinic Management System
description: High-efficiency outpatient clinical workstation and practice operating system
colors:
  primary: "#0f766e"
  primary-active: "#0284c7"
  primary-light: "#f0fdfa"
  neutral-bg: "#f8fafc"
  surface: "#ffffff"
  surface-hover: "#f1f5f9"
  border: "#e2e8f0"
  border-strong: "#cbd5e1"
  text: "#0f172a"
  text-secondary: "#475569"
  text-muted: "#64748b"
  emerald: "#10b981"
  emerald-bg: "#ecfdf5"
  emerald-text: "#065f46"
  amber: "#f59e0b"
  amber-bg: "#fffbeb"
  amber-text: "#92400e"
  violet: "#8b5cf6"
  violet-bg: "#f5f3ff"
  violet-text: "#5b21b6"
  rose: "#ef4444"
  rose-bg: "#fef2f2"
  rose-text: "#991b1b"
typography:
  display:
    fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif"
    fontSize: "1.5rem"
    fontWeight: 700
    lineHeight: 1.25
    letterSpacing: "-0.01em"
  headline:
    fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif"
    fontSize: "1.25rem"
    fontWeight: 600
    lineHeight: 1.25
    letterSpacing: "-0.01em"
  title:
    fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif"
    fontSize: "1rem"
    fontWeight: 600
    lineHeight: 1.3
    letterSpacing: "normal"
  body:
    fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: "normal"
  label:
    fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 600
    lineHeight: 1.4
    letterSpacing: "0.03em"
rounded:
  sm: "4px"
  md: "6px"
  lg: "8px"
  full: "9999px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "12px"
  lg: "16px"
  xl: "24px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.surface}"
    rounded: "{rounded.md}"
    padding: "8px 16px"
  nav-item-active:
    backgroundColor: "{colors.primary-light}"
    textColor: "{colors.primary}"
    rounded: "{rounded.md}"
    padding: "8px 10px"
---

# Design System: Clinic Management System

## Overview

**Creative North Star: "The Precision Clinical Workstation"**

A surgical, high-efficiency interface engineered for high-throughput outpatient clinics and multi-specialty practices. Rather than dressing medical operations in generic SaaS dashboard tropes, the design favors dense scannability, rapid keyboard-driven spotlight access (`Ctrl+K`), contextual physician scope isolation, and zero-latency operational wayfinding.

The design language establishes a disciplined slate ground (`#f8fafc` to `#ffffff`) bounded by razor-thin hairline borders (`#e2e8f0`). High-contrast ink typography guarantees effortless readability under bright clinic ambient light, while semantic status colors are reserved strictly for clinical state indicators.

**Key Characteristics:**
- Restrained clinical slate chrome with surgical hairline dividers.
- Contextual doctor-ownership awareness (`Assigned Patients Only`).
- Touch-friendly ergonomic controls (minimum 44px hit heights) across desktop, tablet, and mobile.
- Zero-clutter typography using the native system UI font stack without external CDN dependencies.

## Colors

The palette is deliberately restrained, prioritizing clinical calm and rapid information scanning.

### Primary
- **Precision Teal** (`#0f766e`): Reserved for active navigation items, primary system actions, and clinic brand identification.
- **Cobalt Accent** (`#0284c7`): Secondary interaction focus and active state feedback.

### Neutral
- **Slate Ground** (`#f8fafc`): Base canvas background for the entire workstation.
- **Surface Card** (`#ffffff`): Pure white foreground surfaces for cards, sidebars, headers, and modal overlays.
- **Subtle Surface** (`#f1f5f9`): Hover states, table headers, and secondary control wells.
- **Hairline Divider** (`#e2e8f0`): 1px structural dividing lines throughout the interface.
- **Ink Primary** (`#0f172a`): High-contrast text for headers and primary data points.
- **Ink Secondary** (`#475569`): Descriptive copy and secondary field values.
- **Ink Muted** (`#64748b`): Icons, keyboard shortcut tags, and breadcrumb trails.

### Semantic
- **Clinical Emerald** (`#10b981` / `#ecfdf5`): Active patient encounters and verified records.
- **Queue Amber** (`#f59e0b` / `#fffbeb`): Waiting queue status and upcoming schedules.
- **Consultation Violet** (`#8b5cf6` / `#f5f3ff`): In-consultation status and physician notes.
- **Urgent Rose** (`#ef4444` / `#fef2f2`): Urgent alerts and cancellations.

### Named Rules
**The Restrained Accent Rule.** Brand and status accents are never used decoratively on large surfaces. They appear exclusively as 1px hairline badges, active navigation indicators, or status dots.

## Typography

**Display Font:** `system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif`  
**Body Font:** `system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif`  
**Mono Font:** `ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace`

**Character:** Clean, distraction-free system UI stack rendering instantly with zero layout shifts and zero network latency.

### Hierarchy
- **Headline** (600, 1.25rem, 1.25): Workspace view titles.
- **Title** (600, 1rem, 1.3): Card headings, dialog titles, and category labels.
- **Body** (400, 0.875rem, 1.5): Standard clinical descriptions and detail fields.
- **Label** (600, 0.75rem, 1.4, uppercase, 0.03em tracking): Field tags and status pills.
- **Tabular Mono** (500, 0.8125rem, tabular-nums): Clocks, badge counts, and keyboard shortcut labels.

## Layout

The spatial model balances high workstation density on desktop with fluid responsive adaptation on smaller viewports.

- **Desktop (>= 1024px)**: Slim 240px left-rail navigation (collapsible to 68px icon-rail), 56px sticky workstation header, and a spacious fluid main content canvas (up to 1400px wide).
- **Tablet (768px - 1023px)**: Compact sidebar rail with icon-centered touch navigation and fluid grid restructuring.
- **Mobile (< 768px)**: Fixed top mobile header with hamburger menu button, off-canvas sliding drawer with dark translucent backdrop, and zero horizontal viewport overflow.

## Elevation & Depth

Surfaces are primarily flat with subtle 1px hairline dividers (`#e2e8f0`). Depth is conveyed through tonal separation and soft directional drop shadows rather than colored halos.

### Shadow Vocabulary
- **Surface Elevation** (`0 1px 2px 0 rgba(15, 23, 42, 0.05)`): Standard cards and table containers.
- **Modal Elevation** (`0 10px 15px -3px rgba(15, 23, 42, 0.08)`): Command search palette and dropdown menus.
- **Drawer Elevation** (`8px 0 24px rgba(15, 23, 42, 0.12)`): Mobile off-canvas navigation drawer.

## Shapes

- **Corners**: Subtle, disciplined radius (`4px` for pills/tags, `6px` for buttons and navigation items, `8px` for modal dialogues and workspace cards).
- **Icons**: Drawn inline SVG with consistent 1.75 stroke-width and geometric clarity.

## Components

### Navigation Rail
- **Expanded**: 240px wide, category groupings, role badge, route label, and active status pill.
- **Collapsed**: 68px wide with centered SVG icons and accessible hover/focus tooltips.
- **Active State**: Precision Teal background tint (`#f0fdfa`) with `#0f766e` icon and text.

### Header Workstation Bar
- **Height**: 56px sticky top bar.
- **Features**: Real-time clinic clock, Command search trigger button with `Ctrl K` badge, contextual `Assigned Patients Only` physician indicator, and session role tag.

### Command Palette
- **Trigger**: `Ctrl+K` / `Cmd+K` or search bar button.
- **Layout**: Centered modal on desktop; touch-friendly bottom-sheet on mobile.
- **Interaction**: Keyboard navigation (`Up`/`Down`/`Enter`/`Esc`), real-time route search, quick action triggers, and dev role switching.

### Dev Role Simulator
- **Position**: Floating bottom-right corner.
- **Isolation**: Guarded strictly for development mode; zero interference with real tokens, auth, or backend state.

## Do's and Don'ts

### Do:
- **Do** maintain minimum 44x44px touch targets for all interactive controls.
- **Do** preserve tabular numbers (`font-variant-numeric: tabular-nums`) for timestamps, dates, and counters.
- **Do** display the doctor scope indicator (`Assigned Patients Only`) strictly when the Doctor role is active.
- **Do** test layouts across desktop, tablet, and mobile viewports.

### Don't:
- **Don't** use external font CDNs or Google Fonts.
- **Don't** invent fake patient data or mock clinical records.
- **Don't** use `backdrop-filter` or glassmorphism on the mobile drawer overlay.
- **Don't** use gradient text or colored accent borders on cards.
