# UPHyd - Design System & Architecture

## Overview
UPHyd is a premium, tech-forward web application designed to showcase and connect the Hyderabad startup ecosystem. The design language borrows heavily from high-end editorial layouts, utilizing stark contrasts, massive typography, and sophisticated glassmorphism effects to create a "world-class" feel.

## Visual Identity

### 1. Typography
The application uses a highly deliberate typographic hierarchy to establish rhythm and importance:
*   **Headings (Display):** Uses `font-headline` combined with `font-black` and tight tracking (`tracking-tighter`). Line heights are compressed (`leading-[0.85]`) to make massive text look like cohesive graphic elements.
*   **Body:** Uses standard sans-serif (`font-sans`), typically set to `font-light` with relaxed line heights (`leading-relaxed`) to contrast against the heavy headings.
*   **Eyebrows & Labels:** A signature element of the design. Uses extremely small text (`text-[10px]`), `font-black`, `uppercase`, and extremely wide tracking (`tracking-[0.3em]` or `tracking-widest`). Used for categories, tags, and section pre-titles.

### 2. Color Palette
*   **Primary/Neutrals:** Deep slates (`slate-900`, `slate-950`) for dark mode sections and crisp whites/off-whites (`slate-50`) for light mode cards.
*   **Secondary/Accent:** A vibrant, electric blue (represented by the `secondary` Tailwind class and `rgba(0,86,197)` in gradients). Used sparingly for highlights, active states, and glowing effects.
*   **Gradients:** Subtle radial gradients are used in dark sections to create depth without overwhelming the content (e.g., `bg-[radial-gradient(circle_at_50%_50%,rgba(0,86,197,0.4)_0%,transparent_70%)]`).

### 3. Shape & Structure
*   **Border Radii:** The design avoids sharp corners. It uses exaggerated border radii (`rounded-[2rem]`, `rounded-[3rem]`, up to `rounded-[5rem]`) to create soft, organic containment shapes.
*   **Borders:** Delicate borders (`border-white/10` in dark mode, `border-slate-200` in light mode) define edges without adding visual weight.

## Core Components & Patterns

### Navigation
*   **Desktop:** A floating, glassmorphic pill (`backdrop-blur-md`, `bg-slate-900/80`) that transitions its styling based on scroll position.
*   **Mobile:** A smooth, slide-in drawer from the right side, utilizing `motion/react` for fluid entry and exit animations, complete with a backdrop blur overlay.

### Directory (Startup Database)
*   **Filtering:** Advanced multi-select dropdowns with custom UI, replacing standard HTML selects. Features active filter "pills" that can be individually dismissed.
*   **Views:** Toggleable Grid and List views.
*   **Cards:** High-contrast white cards on a light background, featuring hover states that lift the card (`-translate-y-3`), intensify the shadow (`shadow-2xl`), and reveal secondary brand colors.

### Resources (Interactive Map)
*   **Map Container:** A dark, immersive section containing a custom interactive map built with `react-zoom-pan-pinch`.
*   **Markers:** Animated, glowing pulse effects for map markers.
*   **Filtering:** Tag-based filtering system to toggle visibility of different hub types (Incubators, CoEs, etc.).
*   **Details:** A glassmorphic overlay that slides in from the bottom when a hub is selected.

### Events
*   **Calendar View:** A custom-built grid calendar displaying event density.
*   **List View:** Detailed event cards with clear calls to action.
*   **Sidebar:** A sticky sidebar featuring upcoming highlights and a newsletter subscription box.

## Animation & Interaction
*   **Library:** `motion/react` (Framer Motion) is used extensively.
*   **Philosophy:** Animations are purposeful. Elements fade and slide up on scroll (`initial={{ opacity: 0, y: 20 }}`). Layout changes (like filtering the directory or switching views) use `AnimatePresence` with `mode="popLayout"` for seamless transitions.
*   **Micro-interactions:** Buttons scale down slightly on tap (`whileTap={{ scale: 0.95 }}`), and cards elevate on hover.

## Technical Stack
*   **Framework:** React 19 + Vite
*   **Styling:** Tailwind CSS v4
*   **Icons:** Lucide React
*   **Animations:** Motion (Framer Motion)
*   **Routing:** Custom state-based tab routing (in `App.tsx`)
