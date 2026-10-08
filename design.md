# Brand2Influence — Design System & Style Guide (`design.md`)

Welcome to the comprehensive design specification for **Brand2Influence** (`brandHUB`). This document details all design tokens, color codes, typography scales, background textures, component rules, and interaction patterns implemented across the platform.

---

## 1. Design Philosophy & Aesthetic

* **Theme**: **CodeAstra Luxury Editorial & Obsidian Dark SaaS**
* **Core Style**: High-contrast, minimal luxury inspired by Linear, Apple Keynote Bento Grids, and editorial typography.
* **Key Visual Identity**:
  * Deep Obsidian and Charcoal black surfaces (`#0B0B0A`)
  * Warm Antique Cream text and borders (`#F4F1E8`)
  * Electric Cobalt Blue primary accent (`#0047AB`)
  * Editorial italic serif accents (`Instrument Serif`) paired with geometric display typography (`Inter Tight`)
  * Tactile 3D card physics, depth blur, and glassmorphism

---

## 2. Color Palette & Tokens

### 2.1 Backgrounds & Surfaces

| Token Variable | Hex / RGBA Code | Description & Usage |
| :--- | :--- | :--- |
| `--cb-bg` / `--background` | `#0B0B0A` | Primary base page background (deep obsidian) |
| `--cb-bg-alt` | `#080807` | Darkest background variant for deep wells/sections |
| `--cb-bg-raised` | `#121211` | Raised background for modals, popovers, and elevated panels |
| `--cb-surface` | `#0E0E0D` | Surface level 1 (bento cards, standard cards) |
| `--cb-surface-2` | `#161615` | Surface level 2 (input fields, dropdowns, hovered cards) |
| `--surface-3` | `#181817` | Surface level 3 (deep nested containers) |
| `--cb-nav-bg` | `rgba(11, 11, 10, 0.85)` | Sticky navigation header with blur |
| `--cb-card-bg` | `rgba(244, 241, 232, 0.028)` | Subtle warm tint on card surfaces |

### 2.2 Text & Content Colors

| Token Variable | Hex / RGBA Code | Usage |
| :--- | :--- | :--- |
| `--cb-text` / `--text-primary` | `#F4F1E8` | Primary headings, prominent body copy (Warm Antique Cream) |
| `--cb-text-muted` / `--text-secondary` | `rgba(244, 241, 232, 0.65)` | Secondary body copy, descriptions, helper labels |
| `--cb-text-dim` / `--text-muted` | `rgba(244, 241, 232, 0.42)` | Tertiary captions, placeholders, inactive icons |
| `--color-text-inverse` | `#050505` | Text on light badges or bright surfaces |
| Text Highlight / Selection | Background: `#0A0A0A`, Text: `#FFFFFF` | Browser text selection |

### 2.3 Brand Accents & Interactive Colors

| Token / Usage | Hex / RGBA Code | Description |
| :--- | :--- | :--- |
| **Primary Accent (Cobalt)** | `#0047AB` | Primary CTA buttons, action tags, active focus rings |
| **Primary Hover** | `#003785` | Hover state for Cobalt buttons |
| **Accent Glow** | `rgba(0, 71, 171, 0.35)` | Box-shadow glow on buttons & featured highlights |
| **Pure White Accent** | `#FFFFFF` | Center focal points, active slider dots, verified checkmarks |
| **Secondary Neutral** | `#A0A0A0` | Secondary icons, subtle buttons |
| **Dot Accent** | `#F4F1E8` / `#FFFFFF` | Title terminal punctuation `.` and indicator pulses |

### 2.4 Borders & Dividers

| Token Variable | RGBA Code | Usage |
| :--- | :--- | :--- |
| `--cb-border` / `--border` | `rgba(244, 241, 232, 0.14)` | Standard card borders, section dividing lines |
| `--cb-border-strong` / `--border-light` | `rgba(244, 241, 232, 0.28)` | Hovered card borders, active card outlines |
| `--cb-card-border` | `rgba(244, 241, 232, 0.14)` | Default bento tile outline |
| `--border-focus` | `#F4F1E8` | Focused inputs, tab indicator borders |

### 2.5 Feedback & Status Colors

| State | Background Tint | Border Color | Text / Icon Color |
| :--- | :--- | :--- | :--- |
| **Success** | `rgba(16, 185, 129, 0.10)` | `rgba(16, 185, 129, 0.25)` | `#10B981` (Emerald Green) |
| **Error / Alert** | `rgba(239, 68, 68, 0.10)` | `rgba(239, 68, 68, 0.25)` | `#EF4444` (Coral Red) |
| **Warning** | `rgba(245, 158, 11, 0.10)` | `rgba(245, 158, 11, 0.25)` | `#F59E0B` (Amber Gold) |
| **Verified Badge** | `#F4F1E8` background | None | `#0B0B0A` (Dark Icon) |

---

## 3. Typography Hierarchy

### 3.1 Font Families

```css
/* Display & Headlines */
--font-display: "Inter Tight", "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;

/* Editorial Italic Accents (used inside <em> or hero accents) */
--font-serif: "Instrument Serif", Georgia, "Times New Roman", serif;

/* Technical Identifiers, Numbers, Codes, Eyebrows */
--font-mono: "JetBrains Mono", "DM Mono", SFMono-Regular, Menlo, monospace;

/* General Body Copy */
--font-body: "Inter Tight", "Inter", -apple-system, BlinkMacSystemFont, sans-serif;
```

### 3.2 Font Scale & Specs

| Hierarchy Level | Font Family | Size | Weight | Line Height | Letter Spacing | Usage Example |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Hero Display (H1)** | `Inter Tight` | `56px – 84px` | 800 (Bold) | `1.05 – 1.12` | `-0.035em` | Landing Page Hero Header |
| **Editorial Serif Accent** | `Instrument Serif` | Matching size | 400 (Italic) | Inherit | Normal | `<em>Brand Partnerships.</em>` |
| **Section Title (H2)** | `Inter Tight` | `36px – 52px` | 700 / 800 | `1.15` | `-0.03em` | Section headings (`[ 04 ] Featured`) |
| **Subsection / Card (H3)**| `Inter Tight` | `20px – 28px` | 700 | `1.25` | `-0.02em` | Profile Card & Campaign titles |
| **Card Header (H4)** | `Inter Tight` | `16px – 18px` | 700 | `1.30` | `-0.01em` | Compact card names |
| **Primary Body** | `Inter Tight` | `16px – 17px` | 400 / 500 | `1.65` | `-0.005em` | Paragraphs, feature explanations |
| **Secondary Body** | `Inter Tight` | `14px – 15px` | 400 / 500 | `1.60` | Normal | Card descriptions, bio previews |
| **Eyebrow / Overline** | `JetBrains Mono` | `11px – 13px` | 600 | `1.20` | `+0.08em – 0.1em` | `[ 01 ] SPOTLIGHT`, section tags |
| **Micro / Stats / Badge** | `JetBrains Mono` | `10px – 12px` | 600 / 700 | `1.0` | `+0.04em` | Counters `01 / 06`, follower pills |

---

## 4. Background Effects, Overlays & Depth

1. **Obsidian Foundation**:
   * The page base uses `#0B0B0A` with no harsh pure white glare.
   * Subtle ambient gradients give focal depth without visual noise.

2. **Glassmorphism**:
   * `backdrop-filter: blur(12px)` to `blur(20px)`
   * Used on navigation bar, counter badges, and modal overlays.

3. **Card Photo Gradient Overlays**:
   * Multi-stop gradient ensures maximum text readability over bright photos:
   ```css
   background: linear-gradient(
     180deg,
     rgba(0, 0, 0, 0.10) 0%,
     rgba(9, 9, 11, 0.20) 35%,
     rgba(9, 9, 11, 0.80) 70%,
     rgba(9, 9, 11, 0.98) 100%
   );
   ```

4. **Edge Fade Viewports**:
   * Horizontal slider tracks feature soft vignette edges:
   * Left: `linear-gradient(to right, #0B0B0A 20%, rgba(11, 11, 10, 0) 100%)`
   * Right: `linear-gradient(to left, #0B0B0A 20%, rgba(11, 11, 10, 0) 100%)`

---

## 5. Border Radii & Elevation

### 5.1 Border Radius Tokens

```css
--radius-xs: 2px;
--radius-sm: 4px;
--radius-md: 6px;
--radius-lg: 8px;
--radius-xl: 10px;
--radius-2xl: 12px;
--radius-pill: 9999px;
--card-radius: 24px;
```

* **Editorial Buttons**: Sharp rectangles (`border-radius: 0 !important`) for high-fashion editorial brutalism.
* **Showcase Cards**: Rounded corners (`20px` to `24px`) with soft clipped borders.
* **Badges & Pills**: Capsule style (`9999px`).
* **Inputs & Fields**: Minimal radius (`8px` to `10px`).

### 5.2 Shadows & Depth

```css
--shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.80);
--shadow-md: 0 4px 16px rgba(0, 0, 0, 0.85);
--shadow-lg: 0 12px 32px rgba(0, 0, 0, 0.95);
--shadow-card: 0 12px 36px rgba(0, 0, 0, 0.60);
--shadow-bento: 0 0 0 1px var(--cb-border);
--shadow-glow-cobalt: 0 8px 24px rgba(0, 71, 171, 0.35);
```

---

## 6. Layout & Spacing Rules

* **Max Content Width**: `1440px` (`--max-content-width`)
* **Standard Grid Container**:
  * Desktop: `margin: 0 auto; padding: 0 32px;`
  * Tablet: `padding: 0 24px;`
  * Mobile: `padding: 0 16px;`
* **Section Vertical Spacing**: `96px – 128px` between major page sections.
* **Bento Grid Spacing**: `20px – 28px` grid gap.

---

## 7. Component Specifications

### 7.1 Buttons (`.ui-button`)

* **Primary Button**:
  * Background: `#0047AB` (Electric Cobalt)
  * Hover Background: `#003785`
  * Text Color: `#F4F1E8`
  * Border: `1px solid #0047AB`
  * Typography: `Inter Tight`, 14px, Weight: 800, Uppercase, `letter-spacing: 0.08em`
  * Padding: `17px 30px`
  * Box-Shadow Hover: `0 8px 24px rgba(0, 71, 171, 0.35)`

* **Secondary Button**:
  * Background: Transparent
  * Border: `1px solid rgba(244, 241, 232, 0.30)`
  * Text Color: `#F4F1E8`
  * Hover: `rgba(244, 241, 232, 0.08)` background, `#FFFFFF` text

### 7.2 Interactive 3D Focus Card Slider (`FocusCardSlider`)

* **Center Active Card**:
  * Scale: `1.02`
  * Blur: `0px`
  * Opacity: `1.0`
  * Z-Index: `12`
* **Distance 1 (Adjacent Cards)**:
  * Scale: `0.96`
  * Blur: `0px`
  * Opacity: `0.90`
  * Z-Index: `8`
* **Distance 2 (Outer Cards)**:
  * Scale: `0.88`
  * Blur: `2px`
  * Opacity: `0.65`
  * Z-Index: `4`
* **Touch & Drag Controls**:
  * Native touch event tracking (`onTouchStart`, `onTouchMove`, `onTouchEnd`)
  * `touch-action: pan-y !important`
  * Real-time gesture angle detection (smooth vertical page scrolling when dragging vertically, silky horizontal slide when swiping sideways)
  * Click-capture suppression during gestures to avoid accidental profile navigation.

### 7.3 Creator Profile Card (`ProfileCard`)

* Height: `480px` (max `520px`)
* Radius: `24px`
* Background: Photo cover with `object-fit: cover` and non-draggable attributes
* 3D Tilt: Mouse-driven subtle perspective tilt on desktop (disabled on touch devices to ensure smooth swiping)
* Metric Pills: Follower count & Engagement rate in monospaced high-contrast chips

### 7.4 Brand Card (`BrandCard`)

* Height: `420px`
* Radius: `20px`
* Border: `1px solid rgba(244, 241, 232, 0.15)`
* Hover Effect: `translateY(-4px)`, border brightness boost, image scale `1.05`
* Action: Full-width "View Brand Campaigns" glass button

---

## 8. Motion & Transitions

* **Spring Physics**: `cubic-bezier(0.16, 1, 0.3, 1)` (`--ease-spring`)
* **Transition Durations**:
  * Fast (buttons, micro-hovers): `200ms`
  * Normal (card transforms, drawer reveals): `300ms`
  * Slow (page transitions, spring settling): `380ms – 400ms`
* **Spring Stiffness / Damping**:
  * Slider track: `stiffness: 280 – 300`, `damping: 28 – 30`, `mass: 0.8`
