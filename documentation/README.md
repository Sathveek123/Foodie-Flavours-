# 🍽️ Flavora Kitchen — Documentation Hub

**Last updated: June 28, 2026**

Welcome to the central documentation hub for **Flavora Kitchen** (also referred to as **Foodie Flavors**). This directory contains detailed guides, blueprints, flow diagrams, and architectural references for the frontend React + WebGL + Web Audio application.

---

## 🧭 Documentation Index

Select a document below to explore specific parts of the project. All links are clickable absolute file references.

| Document | Icon & Title | Description | Key Sections covered |
|:---|:---|:---|:---|
| [`architecture.md`](file:///d:/Client%20Projects/foodie-flavors-restaurant-main/documentation/architecture.md) | 🏗️ Architecture & Tech Stack | Technical foundations, Supabase Auth/Mock setups, WebGL configuration, and Web Audio synthesis setup. | Frontend Core, 3D WebGL, Audio Engine, Design Tokens, Routing, Asset Paths. |
| [`features_and_components.md`](file:///d:/Client%20Projects/foodie-flavors-restaurant-main/documentation/features_and_components.md) | 🧩 Features & Component Guide | In-depth layout details for Loader, Hero, Bento Grid, and all Gated Dashboard UI modules. | Splash Screen, Hero Slider, Bento Catalog, Table bookings floor plan, Checkout Hub. |
| [`folder_structure.md`](file:///d:/Client%20Projects/foodie-flavors-restaurant-main/documentation/folder_structure.md) | 📂 Folder & Directory Structure | High-level map of the codebase files, folder structure, helper modules, and context providers. | Directory Tree, Key UI Files, Shared Contexts, Utility Libraries. |
| [`setup_and_scripts.md`](file:///d:/Client%20Projects/foodie-flavors-restaurant-main/documentation/setup_and_scripts.md) | ⚙️ Setup & Terminal Scripts | Prerequisites, local environmental configuration, dependencies, and shell commands. | Environment Variables (`.env`), Package Installation, npm script list. |
| [`state_and_data_flow.md`](file:///d:/Client%20Projects/foodie-flavors-restaurant-main/documentation/state_and_data_flow.md) | 🔄 State & Data Flow | State transitions, data passing, custom hooks, and context APIs coordinating the app. | Global Cart State, Auth Gate, Addresses system, Live Telemetry tracking. |
| [`ui_ux_design.md`](file:///d:/Client%20Projects/foodie-flavors-restaurant-main/documentation/ui_ux_design.md) | 🎨 UI/UX Design System | In-depth review of luxury design choices, fonts, micro-interactions, responsive grids, and visual animations. | Typography, Colors, 3D Card Tilt, 2D Seating Layout, Custom Sounds. |
| [`website_flow.md`](file:///d:/Client%20Projects/foodie-flavors-restaurant-main/documentation/website_flow.md) | 🗺️ User Flow & Journeys | High-level user journeys, category filters, interactive cart lifecycle, and reservation flows. | Page Navigation, Add-To-Cart Loop, Checkout Receipts, Seating Reservations. |
| [`online_order_system.md`](file:///d:/Client%20Projects/foodie-flavors-restaurant-main/documentation/online_order_system.md) | 🍔 Gourmet Online Order System | In-depth catalog browsing, dietary sorting matrix, modifier selection modals, checkout billing formulas, and split-payment invites. | Customizer Modals, Billing Surcharges, Coupon Validation, Split Bills. |
| [`table_booking_system.md`](file:///d:/Client%20Projects/foodie-flavors-restaurant-main/documentation/table_booking_system.md) | 🍽️ Dine-In Table Booking System | Multi-module dine-in booking matrix, interactive 2D table floor plans, waitlist queues, QR scan check-ins, and post-dining feedback stars. | Seating Floor Plans, Waitlist Managers, QR Code Tickets, Scorecards. |
| [`live_tracking_system.md`](file:///d:/Client%20Projects/foodie-flavors-restaurant-main/documentation/live_tracking_system.md) | 🛵 Live Telemetry & GPS Tracking | Visual order progress steppers, real-time path telemetry maps (Rider Scooter icons), assigned driver detail badges, and address coordinates simulators. | Status Steppers, SVG Telemetry Paths, Delivery Riders, Coordinates Pin. |

---

## 🚀 Application Technical Pillars

Flavora Kitchen implements several high-performance interactive features that distinguish it as a premium luxury web application:

### 1. WebGL 3D Plate Slider
*   **Location**: [Hero3DScene.tsx](file:///d:/Client%20Projects/foodie-flavors-restaurant-main/flavora-kitchen/src/components/Hero3DScene.tsx)
*   **Details**: Utilizes Three.js, `@react-three/fiber`, and `@react-three/drei` to render 3D-composited porcelain food plates. Plates are built from geometry circles stacked on the Z-axis, utilizing metalness and roughness values rather than heavy standard 3D meshes.
*   **Optimization**: Locked to a standard Device Pixel Ratio (`dpr={[1, 1]}`) and wrapped in a `<CanvasErrorBoundary>` to prevent GPU memory depletion or UI crashes.

### 2. Zero-Weight Synthesizer Audio
*   **Location**: [sounds.ts](file:///d:/Client%20Projects/foodie-flavors-restaurant-main/flavora-kitchen/src/lib/sounds.ts)
*   **Details**: Standard audio files (MP3/WAV) introduce network latency. Instead, Flavora Kitchen uses the browser's native **Web Audio API** to compile sound waves live.
*   **Tones**: Ascending C5-E5 chimes for add-to-cart clicks, triangle wave sweeps for drawer slides, and 1400Hz ticks for timers. Mute preferences are persisted in `localStorage`.

### 3. Smooth Inertial Scroll
*   **Location**: [SmoothScroll.tsx](file:///d:/Client%20Projects/foodie-flavors-restaurant-main/flavora-kitchen/src/components/SmoothScroll.tsx)
*   **Details**: Integrates Lenis to override jerky native browser scrolling with inertia-based scroll physics. Features a wheel multiplier of `0.8` and duration of `0.75s` to avoid visual floatiness.

---

## 📊 High-Level Component Flow

```mermaid
graph TD
    App[App.tsx Page Shell] --> Loader[Loader Overlay]
    App --> Announcement[AnnouncementBar]
    App --> Nav[Navbar.tsx Header]
    App --> Router[React Router Routes]
    Router --> Public[/ Route: Public Landing Page]
    Router --> Auth[/login / /signup Portal]
    Router --> Gated[/app Protected Route: DashboardPage.tsx]

    Public --> Hero[Hero.tsx & Hero3DScene.tsx]
    Public --> Popular[PopularDishes.tsx Bento Catalog]
    Public --> Tabs[MenuPreviewTabs.tsx Carousel]
    Public -->|Gating Checks| AuthGateModal[AuthGateModal.tsx Prompt]

    Gated --> CheckoutHub[Checkout Hub Tab]
    Gated --> BookingsHub[Table Bookings Tab]
    Gated --> LiveTrack[Live Scooter Map Tracking]
    Gated --> HistoryLog[Transaction Ledgers & Reviews]

    Popular -->|Context addToCart| Cart[CartContext.tsx Provider]
    Tabs -->|Context addToCart| Cart
    Cart -->|Fills Cart Details| CheckoutHub
```

---

## 🛠️ Quick Commands Cheat-Sheet

To manage the project, execute the following commands in the [flavora-kitchen](file:///d:/Client%20Projects/foodie-flavors-restaurant-main/flavora-kitchen) directory:

*   **Install Dependencies**: `npm install`
*   **Boot Development Server (Port 3000)**: `npm run dev`
*   **Compile Production Bundle**: `npm run build`
*   **Preview Production Build**: `npm run preview`
*   **Typecheck Typescript Files**: `npm run lint`
*   **Clean Build Directories**: `npm run clean`

For detailed setup guides, check the [setup_and_scripts.md](file:///d:/Client%20Projects/foodie-flavors-restaurant-main/documentation/setup_and_scripts.md) guide.
