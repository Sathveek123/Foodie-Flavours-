# 🏗️ Architecture & Technology Stack

> Last updated: **June 28, 2026** — reflects current production state of Flavora Kitchen.

This document describes the architectural design and technology stack of **Flavora Kitchen**, a premium fine-dining web application built with a modern React + WebGL + animated UI stack.

---

## 🛠️ Technology Stack

### Frontend Core

| Technology | Version | Role |
|---|---|---|
| **React** | 19.0.1 | UI component tree, hooks, state |
| **TypeScript** | 5.x | Type safety across all components |
| **Vite** | 6.2.3 | Build tool, HMR dev server on port 3000 |
| **React Router** | 7.18.0 | Client-side routing (`/`, `/login`, `/signup`, `/app`) |
| **Supabase Client** | 2.108.2 | Secure authentication SDK |

### Styling & Animation

| Technology | Version | Role |
|---|---|---|
| **Tailwind CSS v4** | 4.1.14 | Utility CSS via `@tailwindcss/vite` plugin |
| **Framer Motion** (`motion`) | 12.23.24 | All transitions, parallax, springs, page reveals |
| **Lenis + @lenis/react** | latest | Inertia-based smooth scrolling |

### Authentication & Routing Architecture

To pivot the landing page from a direct transactional model to a pure marketing showcase + lead-generation funnel, we implemented a decoupled routing and session gating system:
- **Client Routing**: Managed via React Router (`BrowserRouter` + `<Routes>`).
  - `/` (Public Landing Page): A visual marketing experience. Clicking any transactional CTA (Order Now, Book Table, Add to Cart, or Navbar Cart) triggers gating checks.
  - `/login` / `/signup`: Account credentials pages styled in the brand's signature luxury dark-radial aesthetics.
  - `/app` (Gated Sanctum): A protected dashboard route gated via a custom `ProtectedRoute` guard. This houses the actual transactional cart and reservation systems.
- **Protected Operations Portal (`/app`)**:
  - Houses the **authenticated Food Ordering Engine** and the **authenticated Table Booking System** inside a cohesive single-page dashboard.
  - Coordinates multi-view tab layout transitions between Overview, Menu, Table Bookings, Checkout Hub, Live Tracker, History logs, Loyalty points, and Chat support.
- **Authentication Provider (`AuthContext.tsx`)**:
  - Exposes `user`, `session`, `loading` states, and `login`, `signup`, `logout` async operations.
  - **Supabase Auth Engine**: Operates seamlessly over standard Supabase OAuth / email credential APIs.
  - **Local Mock Auth Fallback**: If environment parameters (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`) are missing, it switches to a local storage mock engine. This manages registration databases and session persistence in `localStorage`, guaranteeing that development and local preview builds remain fully testable without crashes.
- **Unified Gating Helpers**:
  - Gated CTAs in `Navbar`, `Hero`, `PopularDishes`, `MenuPreviewTabs`, `ChefsSpecial`, `LoyaltyTeaser`, and `Events` are bound to `handleCartGate` and `handleReservationGate` in `App.tsx`.
  - If a user is **unauthenticated**, these actions display a glassmorphic `AuthGateModal` prompting them to Log In or Sign Up.
  - If a user is **authenticated**, they are smoothly redirected to the protected `/app` portal where transaction fulfillment occurs.
- **Hash-Aware Smooth Scroll**:
  - Clicking single-page scroll links (e.g. `/#menu-section`) from external routes like `/login` or `/signup` navigates back to `/`, where a hash listener in `App.tsx` triggers a smooth Lenis scroll to the target container.

### 3D WebGL

| Technology | Version | Role |
|---|---|---|
| **Three.js** | latest | WebGL scene engine |
| **@react-three/fiber** | latest | React bindings for Three.js |
| **@react-three/drei** | latest | Sparkles and helper primitives |

> ⚠️ **Known harmless warning**: `THREE.Clock` deprecated — this is an internal react-three-fiber library warning, not fixable from application code. Does not affect functionality.

### Audio

| Technology | Role |
|---|---|
| **Howler.js** | Synthesized Web Audio API micro-feedback (no MP3 files) |
| **Web Audio API** | Sine/triangle oscillators for chimes, whooshes, and ticks |

### Backend / AI (Optional Layer)

| Technology | Role |
|---|---|
| **Express.js** 4.21.2 | Static server + future API route handler |
| **@google/genai** 2.4.0 | Gemini AI SDK for future smart recommendation features |

---

## 🎨 Design System

### Typography

| Role | Font | Source |
|---|---|---|
| **Display / Headings** | Playfair Display (400–900, italic) | Google Fonts → `--font-serif` |
| **Body / UI** | Inter | Google Fonts → `--font-sans` |
| **Accent / Cursive** | Dancing Script | Google Fonts → `--font-cursive` |

### Color Palette

| Token | Hex | Usage |
|---|---|---|
| `cream` | `#faf6f0` | Page backgrounds, card surfaces |
| `warm-ink` | `#1a1410` | Primary text, dark sections |
| Brand Orange | `#f97316` | CTAs, active states, glow accents |
| Brand Red | `#ef4444` | Gradient combos, badge highlights |
| Burgundy | `#45101f` | Reviews section background |

### Interaction Design Patterns

- **WebGL Plate Slider**: 10-slide hero with horizontal CSS-parallax transitions, auto-advancing every 5 seconds, pointer-tilt micro-feedback. Shadows disabled to prevent GPU `Context Lost` crashes.
- **Parabolic Cart Fly**: Adding items from PopularDishes fires a thumbnail along a parabolic arc to the Navbar cart icon.
- **Menu Tab Cart Integration**: Adding items from MenuPreviewTabs triggers the shared CartContext, add-to-cart chime, and app-level toast notification (no flying arc).
- **3D Card Tilt**: Dish cards, category cards, and review cards all apply mouse-tracked `rotateX/Y` spring parallax. All tilt wrappers use `will-change: transform` for GPU compositing.
- **Custom Cursor**: Spring-guided dot that morphs and scales on interactive elements. Hidden on touch screens.
- **Glassmorphic Overlays**: `backdrop-blur-md` overlays on Navbar, modal card surrounds, and checkout panels.
- **Synthesized Audio**: Web Audio oscillators fire on cart adds, drawer opens, and countdown ticks. Mute state persists in `localStorage`.
- **Checkout Hub Calculations**: Live inline calculation matrix detailing subtotal, 5% GST, ₹10 platform charges, ₹40 delivery, custom tips, and voucher percentage discounts. Includes address selector coordinates and simulated payment validation loops. (See the detailed [Gourmet Online Order System Guide](file:///d:/Client%20Projects/foodie-flavors-restaurant-main/documentation/online_order_system.md)).
- **Live Map Progress Telemetry**: Simulated delivery route SVG street layout map tracing vehicle path (scooter emoji progress coordinates) relative to status stages (placed to delivered). (See the detailed [Live Telemetry & GPS Tracking Guide](file:///d:/Client%20Projects/foodie-flavors-restaurant-main/documentation/live_tracking_system.md)).
- **Table Booking Interactive Plan**: Graphical 2D floor grid mapping available/booked states per table node (Table 01 to 06) matching chosen table type capacity bounds. Can book, cancel, reschedule, upgrade, or add guests dynamically. Contains waitlists and check-in QR code SVGs. (See the detailed [Dine-In Table Seating Reservation Guide](file:///d:/Client%20Projects/foodie-flavors-restaurant-main/documentation/table_booking_system.md)).

---

## 🖼️ Asset Strategy

All images are served from `/public/images/` (Vite static serving) using plain string URL paths — **no ES module imports from paths containing spaces**. This avoids TypeScript module resolution failures with the `assets/fast food/` folder name.

```
flavora-kitchen/public/images/
├── burger1.png – burger2.png – burger3.png – burger4.png
├── pizza1.png – pizza2.png – pizza3.png – pizza4.png
├── chicken1.png – chicken2.png
├── fries1.png – fries2.png – fries3.png
├── kebab1.png – kebab2.png
├── pasta1.png
├── springroll1.png
├── chickenroll1.png
├── slider1.png
├── cheesyfries1.jpg
├── combo_deal.png        ← AI-generated combo meal spread
├── truffle_dish.png      ← AI-generated chef's special dish
└── chef_portrait.png     ← AI-generated chef portrait
```

> [!NOTE]
> Unsplash placeholder images are used in the **Desserts** and **Drinks** tabs of `MenuPreviewTabs.tsx`, in 3 cells of `FoodGallery.tsx` (interior/kitchen photos), and for 3 chef portraits in `MeetChefs.tsx`. See [PLACEHOLDERS.md](file:///d:/Client%20Projects/foodie-flavors-restaurant-main/PLACEHOLDERS.md) for the full list.
