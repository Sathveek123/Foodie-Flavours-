# 📂 Project Folder Structure

**Last updated: June 28, 2026**

This document outlines the directory structure of the **Foodie Flavors / Flavora Kitchen** workspace to help developers navigate and understand where different modules, styles, and assets reside.

---

## 🌳 Directory Tree

Below is the directory tree of the workspace root:

```text
foodie-flavors-restaurant-main/
├── README.md                      # General overview of the Foodie Flavors project
├── PLACEHOLDERS.md                # Checklist for pre-launch asset swaps
├── documentation/                 # Documentation Markdown files
│   ├── README.md                  # Documentation index & technical overview
│   ├── architecture.md            # Architecture & tech stack overview
│   ├── features_and_components.md # Details of interactive components
│   ├── folder_structure.md        # Folder structure explanation (this file)
│   ├── live_tracking_system.md    # Live telemetry scooter GPS tracking console
│   ├── online_order_system.md     # Catalog search filters, modifiers customization, and split bills
│   ├── setup_and_scripts.md       # Environment setup & command scripts
│   ├── state_and_data_flow.md     # React state and context architecture
│   ├── table_booking_system.md    # Multi-module table booking, 2D floor plans, waitlist & feedback
│   ├── ui_ux_design.md            # Design system, visual identity, colors & animations
│   └── website_flow.md            # Flow diagrams and user journeys
└── flavora-kitchen/               # Main frontend React & Vite application
    ├── assets/                    # Static assets
    ├── src/                       # Application source code
    │   ├── components/            # UI & WebGL Components
    │   │   ├── AnnouncementBar.tsx    # Dismissible top announcement banner strip
    │   │   ├── AuthGateModal.tsx      # Gated interactive prompt Modal for unauthenticated guests
    │   │   ├── CartDrawer.tsx         # Shopping Cart Drawer with Checkout form
    │   │   ├── Categories.tsx         # Asymmetric categories grid (9 category cards)
    │   │   ├── ChefsSpecial.tsx       # Magazine-spread signature dish section
    │   │   ├── ContactLocation.tsx    # Contact form + iframe Google Map + details
    │   │   ├── CustomCursor.tsx       # Spring-animated custom mouse indicator
    │   │   ├── Events.tsx             # Horizontal drag-scroll event cards rail
    │   │   ├── FAQ.tsx                # Dynamic accordion-based FAQ list
    │   │   ├── FoodGallery.tsx        # Bento Masonry Food gallery grid + Lightbox modal
    │   │   ├── Footer.tsx             # Footer with brand watermark and social links
    │   │   ├── Hero.tsx               # Asymmetrical Hero copy & CTAs
    │   │   ├── Hero3DScene.tsx        # WebGL scene with glossy porcelain plate & particles
    │   │   ├── InstagramFeed.tsx      # Circular drag-scroll Instagram feed widgets
    │   │   ├── LoyaltyTeaser.tsx      # 3D interactive Loyalty Membership card
    │   │   ├── MeetChefs.tsx          # Grid showing restaurant chefs profiles
    │   │   ├── MenuPreviewTabs.tsx    # Tabbed menu showcase with horizontal carousel
    │   │   ├── Navbar.tsx             # Navigation, drawing logo, mute control
    │   │   ├── NewsletterSection.tsx  # Standalone Newsletter subscription form
    │   │   ├── OnlineOrdering.tsx     # Animated step-by-step ordering system
    │   │   ├── PopularDishes.tsx      # Bento signature dishes grid with horizontal featured card
    │   │   ├── ProtectedRoute.tsx     # Session guard wrapper gating dashboard /app page
    │   │   ├── ReservationModal.tsx   # Booking table modal with slots validation
    │   │   ├── Reviews.tsx            # Testimonial cards snap rail
    │   │   ├── SmoothScroll.tsx       # Inertial Lenis scroll integration
    │   │   ├── SocialProofBar.tsx     # Sticky highlights bar (ratings, awards, delivery)
    │   │   ├── SpecialOffers.tsx      # Countdown clock promo block (combo deals)
    │   │   ├── StatsStrip.tsx         # 4-block animated count-up statistics
    │   │   └── StickyUtilities.tsx    # Floating sticky buttons (WhatsApp, Call, Top Scroll)
    │   ├── context/               # React State Providers
    │   │   ├── AuthContext.tsx        # Session logic, mock database fallbacks & Supabase integrations
    │   │   ├── CartContext.tsx        # Global shopping cart context & hooks
    │   │   └── FavoritesContext.tsx   # Persistent dish wishlist/favorites context
    │   ├── config/                # Static data configurations
    │   │   └── vouchers.ts            # Voucher code definitions (FLAVORA50, WELCOME100, FREESHIP, BDAY2026)
    │   ├── lib/                   # Utility scripts & libraries
    │   │   ├── deliveryZone.ts        # Haversine delivery zone calculator & fee tiers
    │   │   ├── plannerSolver.ts       # Greedy knapsack Smart Meal Planner algorithm
    │   │   ├── sounds.ts              # Synthesized Web Audio API sound triggers
    │   │   ├── supabaseClient.ts      # Instantiates Supabase connection
    │   │   └── utils.ts               # Class merging utilities (cn)
    │   ├── pages/                 # Full Page Templates
    │   │   ├── DashboardPage.tsx      # Multi-flow interactive user hub (Delivery + Floor Map reservations)
    │   │   ├── LoginPage.tsx          # Luxury-ambient user login portal
    │   │   └── SignupPage.tsx         # Luxury-ambient user registration portal
    │   ├── App.tsx                # Page shell, loader, and portal hooks
    │   ├── index.css              # Theme tokens, custom cursors, font faces
    │   ├── main.tsx               # Application mount bootstrapper
    │   ├── types.ts               # Shared TypeScript schemas & interfaces
    │   └── vite-env.d.ts          # Vite env type definitions
    ├── index.html                 # Browser HTML DOM root entry
    ├── package.json               # Dependencies, scripts and package parameters
    ├── tsconfig.json              # TypeScript engine configurations
    └── vite.config.ts             # Vite server and Tailwind CSS plugins configuration
```

---

## 🔍 Core Files Explained

### 1. WebGL & 3D Sections
* **`Hero3DScene.tsx`**: Sets up the React Three Fiber Canvas, physical studio lighting, and glossy food primitives. Optimized without heavy post-processing shaders to guarantee high frame rates.

### 2. Global Utilities & State Layers
* **`CartContext.tsx`**: Distributes quantities, cart additions, subtotals, and clearance events to all components.
* **`FavoritesContext.tsx`**: Provides `favorites[]`, `toggleFavorite()`, and `isFavorited()` to the entire app tree. Persists to `localStorage("flavora_favorites")`.
* **`AuthContext.tsx`**: Implements session state, local fallback credentials check, and normalizes inputs to guarantee reliable login validations.
* **`sounds.ts`**: Initialises and executes Web Audio oscillator chimes, whooshes, and clock ticks, default-muted with support for local storage state persistence.
* **`deliveryZone.ts`**: Implements the Haversine great-circle distance formula. Accepts a `coords` object and returns tiered delivery fee, ETA label, and zone status.
* **`plannerSolver.ts`**: Greedy knapsack algorithm that takes budget, headcount, dietary filters, and occasion type to generate an optimal meal plan from the dish dataset.
* **`vouchers.ts`**: Central config for all coupon codes. Used by the Checkout Hub for validation and discount arithmetic.
* **`SmoothScroll.tsx`**: Seamlessly overrides default browser scrolling mechanics with Lenis inertia physics and custom hash-scroll handlers.
* **`CustomCursor.tsx`**: Subscribes to global mouse hover events, mapping spring parameters to scale and morph cursor labels.

### 3. Portal Pages
* **`DashboardPage.tsx`**: The core authenticated operations dashboard. Contains 11 distinct tab modules: Home greeting, Menu catalog with inventory badges, Smart Meal Planner, Checkout Hub with Delivery Zone validation and Group Ordering, Live GPS Scooter Tracking, Order History with PDF invoices, Loyalty Rewards, Favorites Wishlist, Support Concierge, Customer Profile, and Table Bookings with 2D floor layout, waitlist queue, QR ticket check-in, and post-dining feedback scorecards.
