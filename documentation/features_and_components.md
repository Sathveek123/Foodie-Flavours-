# 🧩 Features & Frontend Components

> Last updated: **June 28, 2026** — reflects the production-ready state of all Flavora Kitchen components including all Tier 1 & Tier 2 dashboard extensions.

This document describes every frontend component in **Flavora Kitchen** — its purpose, layout, images used, animations, and key implementation notes.

---

## 🖥️ Layout Shell Components

### 1. Loader / Splash Screen (`App.tsx`)
- **Purpose**: Full-screen luxury branded entry transition on first page mount.
- **Visual Layout**: radial dark background (`#2a1f17` to `#0d0a08`), background SVG noise, 3 rising steam wisps behind the logo, a pulsing orange light spotlight glow, and two floating polaroid food cards.
- **Animations**:
  - *FLAVORA reveal*: Staggered letter-by-letter blur-to-sharp resolve (0.6s delay, 0.04s stagger).
  - *Gold Underline*: Animates width `0%` to `100%` under the logo after letter resolve.
  - *Polaroids*: Entry spring settle, transitioning into infinite slow vertical floating drift loops.
  - *Exit*: Circular `clip-path` iris-out collapse (`circle(0% at 50% 50%)`) over 1000ms.
- **Session Control**: Checked via `sessionStorage` (`flavoraLoaderPlayed`). Plays only once per session. Can be forced to replay for testing by appending `?forceLoader=true` to the URL.

### 2. AnnouncementBar (`AnnouncementBar.tsx`)
- **Purpose**: Fixed top announcement banner displaying promo copy (e.g. Free Shipping / Offers).
- **Style**: Amber/orange gradient background, text centered, and close icon button.
- **Behavior**: Dismissible — state is persisted in `sessionStorage` (`announcementDismissed`). Pushes the Navbar down when visible.

### 3. Navbar (`Navbar.tsx`)
- **Purpose**: Floating header holding navigation anchors, mute toggle, and shopping cart trigger.
- **Style**: Transparent on top of Hero -> transforms to `bg-warm-ink/90 backdrop-blur-md` with border on scroll.
- **Features**:
  - SVG self-drawing logo.
  - Interactive anchors: Home, Menu, About, Reservations, Gallery, Contact.
  - Web Audio mute/unmute button (synced to `localStorage` `flavora_muted`).
  - Cart toggle button with live count badge (`id="cart-btn"`).
  - Mobile hamburger toggle sliding drawer.

---

## 🍽️ Page Sections (In Render Order)

### 4. Hero (`Hero.tsx` + `Hero3DScene.tsx`)
- **Purpose**: Dynamic 10-dish slider displaying typographic highlights and interactive 3D plates.
- **Layout**: Asymmetric 12-column grid. Left 7 cols show editorial typography and buttons. Right 5 cols host R3F 3D Canvas.
- **Slides**: 10 distinct slides auto-cycle every 5 seconds.
- **R3F Scene**:
  - Each plate is composited from 4 circular meshes (food texture, white ceramic base, metallic gold rim, drop shadow).
  - Incoming plates slide in horizontally; outgoing plates slide out in the same direction (cubic ease-out curve).
  - Slow breathing scale applied to settled active plate group.
  - Volumetric ambient orange light backdrop glow with zoom flash on slide change.
  - Gentle cursor tilt tracking for 3D depth perception.
  - Shadows disabled and DPR locked to `[1, 1]` to safeguard GPU memory.
- **CTA Actions**: "Order Now" has infinite box-shadow orange glow pulse.
- **Interactive Stagger**: Title dish name resolves letter-by-letter blur-to-sharp (stagger `0.03s`).
- **Scroll Cue**: Fades out progressively when scrolling down.

### 5. SocialProofBar (`SocialProofBar.tsx`)
- **Purpose**: Horizontal highlight chip strip between Hero and Categories.
- **Chips**: Displays trust metrics (e.g., "Google Rating 4.9★", "Michelin Guide Approved", "15+ Culinary Awards", "Fresh Hygiene Certified").
- **Style**: Soft borders, text centered, layout aligned.

### 6. Categories (`Categories.tsx`)
- **Purpose**: Horizontal/Grid index of the 9 gourmet divisions of the menu.
- **Grid Balance**: Features **exactly 9 cards** (1 featured Burgers card spanning 2x2, 8 normal cards spanning 1x1). Resolves trailing cell layout gaps on mobile, tablet, and desktop grids.
- **Cards**:
  - ID list: Burgers, Pizza, Fried Chicken, Kebabs & Grills, Pasta, Sides & Fries, Rolls & Wraps, Starters, Desserts.
  - Emoji headers, items count indicator, and distinct accent glow colors.
  - Active card gets `bg-warm-ink` dark layout, with a Framer Motion `layoutId="activeBar"` colored border sliding into position.

### 7. PopularDishes (`PopularDishes.tsx`)
- **Purpose**: Bento catalog of 12 signature dishes with active shopping cart integrations.
- **Grid Layout**: 3 columns on desktop, 2 columns on tablet, 1 on mobile.
- **Featured Card**: 
  - First card (Flamin' Cheeseburger) spans 2x2 ONLY on desktop (`lg:col-span-2 lg:row-span-2`). On tablet (`md`), it behaves as a normal 1x1 card, avoiding grid trailing cell gaps.
  - Desktop Featured Card uses a **horizontal layout** (`flex-col lg:flex-row`). Image on left 50% width, content on right 50% width. This prevents vertical text stretching and empty padding space.
- **Features**:
  - Elastic 3D cursor tilt springs on hover.
  - Heart toggle button with scale pop.
  - Plus button add-to-cart: triggers synthesized Web Audio chimes, popup toast, and a parabolic flying thumbnail to the cart icon.

### 8. MenuPreviewTabs (`MenuPreviewTabs.tsx`)
- **Purpose**: Comprehensive menu browser divided into Starters, Main Course, Desserts, and Drinks.
- **Layout**: Tab bar switcher + horizontal scroll rail carousel with left/right navigation arrows.
- **Details**:
  - **Starters**: 11 items | **Main Course**: 11 items | **Desserts**: 7 items | **Drinks**: 8 items (37 items total).
  - Each card shows: dish image, name, price, ingredients, vegetarian dot indicator, and spice level (🌶️).
  - Smooth fade gradient overlays on the scroll rail left/right bounds for depth cues.
  - **Add-to-Cart Integration**: Each card has a `+` button wired to `CartContext` (`addToCart`), `playAddToCartSound()`, and the app-level toast notification via the `onAddToCart` prop callback.
  - `onError` image fallback to `/images/truffle_dish.png` for all cards with missing assets.
  - All card images have `loading="lazy"` + `decoding="async"` for performance.

### 9. OnlineOrdering (`OnlineOrdering.tsx`)
- **Purpose**: 4-step interactive ordering journey showing how orders are processed.
- **Steps**: Choose Dish -> Place Order -> We Prepare -> Delivered.
- **Layout**: Staggered icon capsules connected with dashed border lines.

### 10. SpecialOffers (`SpecialOffers.tsx`)
- **Purpose**: Limited-time 20% combo discount promo with countdown timer.
- **Layout**: Dark background, countdown clock left, image parallax deck right.
- **Features**:
  - Live clock showing hours:minutes:seconds, ticking in sync with synthesized click sounds.
  - Image deck: 3 layered plates peeking out (`combo_deal.png` foreground, `pizza1.png` and `burger1.png` background). Shifts dynamically according to cursor position.

### 11. Chef's Special (`ChefsSpecial.tsx`)
- **Purpose**: Magazine editorial layout showcasing the signature "Truffle Symphony" dish.
- **Layout**: Typography, ingredients list, and Executive Chef Mario's signature on the left. High-resolution plate image on the right.
- **Visuals**: Cursive signature using `Dancing Script` font, 3D mouse parallax container tilt, and floating details caption card.

### 12. MeetChefs (`MeetChefs.tsx`)
- **Purpose**: Focused single Executive Chef spotlight profile.
- **Details**: Executive Chef Mario Batali editorial showcase. Other culinary profiles are marked as undergoing validation in a footer note.
- **Assets**: High-fidelity custom portrait (`/images/chef_portrait.png`) and cursive signature display.

### 13. FoodGallery (`FoodGallery.tsx`)
- **Purpose**: Masonry bento collage of 10 kitchen prep and signature dish assets.
- **Layout**: Asymmetrical 4-column masonry grid.
- **Lightbox**: Clicking any image opens a high-fidelity fullscreen lightbox overlay.
- **Assets**: 100% real food photography from local static images (no generic Unsplash restaurant interiors).

### 14. Kitchen Stories Gallery (`InstagramFeed.tsx`)
- **Purpose**: Behind-the-scenes plating and preparation showcase.
- **Layout**: Horizontal circular windows snap scroll rail.
- **Visuals**: Overlay captions indicating prep and dish details (no live CTAs or fake like metrics to maintain trust).

### 15. StatsStrip (`StatsStrip.tsx`)
- **Purpose**: Counter panel displaying business milestones (e.g. 12,000+ Guests).
- **Animations**: Numbers count up from 0 to target when scrolling into view.

### 16. LoyaltyTeaser (`LoyaltyTeaser.tsx`)
- **Purpose**: Membership incentive section.
- **Visual**: 3D card tilt membership card on the right, displaying gold shine sweep reflections. Bullet points list on the left.
- **Interactivity**: Clicking "Join Rewards" triggers a dynamic app-level Toast explaining the feature is coming in Phase 2.

### 17. Events (`Events.tsx`)
- **Purpose**: Horizontal drag-scroll timeline for restaurant events.
- **Visuals**: 4 event cards (Acoustic Nights, Truffle Weekend, etc.) with dark themed layouts.
- **Interactivity**: Clicking "Explore Details" triggers a dynamic app-level Toast explaining the experience booking details will open soon.

### 18. Reviews (`Reviews.tsx`)
- **Purpose**: Snap scroll carousel of Google customer reviews.
- **Style**: Deep burgundy background (`#45101f`), watermark "REVIEWS" background.
- **Carousel**: 5 testimonial cards with fixed height (`h-[340px]`), drag scrolling enabled.

### 19. FAQ (`FAQ.tsx`)
- **Purpose**: Accordion panel answering restaurant FAQs.
- **Details**: 7 FAQ questions. Expand triggers chevron rotation and AnimatePresence height slide down.

### 20. NewsletterSection (`NewsletterSection.tsx`)
- **Purpose**: Standalone newsletter signup form.
- **Animations**: Success state triggers checkmark reveal and slide transition.

### 21. ContactLocation (`ContactLocation.tsx`)
- **Purpose**: Grid containing contact details, hours, input message form, and location coordinates.
- **Features**: Displays a verification-pending placeholder for maps when coordinates are pending. Directions button triggers a pending toast. Reads details from central `config.ts`.

### 22. Footer (`Footer.tsx`)
- **Purpose**: Watermark overlay, quick navigation index, social links, copyright.
- **Visuals**: Social cubes displaying spring-loaded text slides on hover. Social links and legal links trigger a dynamic toast explaining they will activate upon official launch.

---

## 🛒 Interactive Overlay Panels

### 23. CartDrawer (`CartDrawer.tsx`)
- **Purpose**: Checkout cart panel.
- **Flow**: Item listing -> checkout details form -> mock payment loader -> generated scalloped paper receipt.

### 24. ReservationModal (`ReservationModal.tsx`)
- **Purpose**: Dine-in table booking panel.
- **Flow**: Details input slot validator -> mock loading spinner -> scalloped boarding ticket pass receipt.

### 25. StickyUtilities (`StickyUtilities.tsx`)
- **Purpose**: Floating call widgets, WhatsApp messenger link, and scroll-to-top shortcut.

---

## 🔊 Audio UX System (`lib/sounds.ts`)

Micro-sounds are synthesized live in the browser using the Web Audio API (zero file size):

| Sound | Trigger | Frequency / Waveform | Duration |
|---|---|---|---|
| `playAddToCartSound()` | Plus card button click | Double ascending Sine chimes (`523.25Hz`, `659.25Hz`) | 0.4s |
| `playDrawerOpenSound()` | Open cart icon click | Triangle whoosh sweep (`180Hz` to `240Hz`) | 0.35s |
| `playTickSound()` | Offers clock second change | High frequency Sine woodblock tick (`1400Hz`) | 0.05s |

---

## 🔐 Authentication & Gated Portal Components

### 26. AuthGateModal (`AuthGateModal.tsx`)
- **Purpose**: Glassmorphic overlay card shown when unauthenticated users attempt to access gated actions (add to cart, book table, explore details, join rewards).
- **Style**: Dark editorial radial background matching the luxury design system. Prompts users to log in or register.

### 27. LoginPage (`LoginPage.tsx`)
- **Purpose**: Brand-continuation credential verification page.
- **Visuals**: Features a blurred full-cover feast image background overlayed with dark radial gradients, warm-ink card container, and orange login button. Normalizes user inputs.

### 28. SignupPage (`SignupPage.tsx`)
- **Purpose**: Brand-continuation profile registration page.
- **Visuals**: Shared cover backdrop alignment. Trims name and email inputs to prevent spaces mismatch bugs.

### 29. ProtectedRoute (`ProtectedRoute.tsx`)
- **Purpose**: Guard component that verifies whether an active session exists in `AuthContext` before loading private children, otherwise intercepts and redirects to `/login`.

### 30. DashboardPage (`DashboardPage.tsx`)
- **Purpose**: Protected Gastronomy Portal (`/app`) acting as the unified hub for single-restaurant gourmet orders and table reservation scheduling.
- **Header & Welcomes (Time-Aware Greeting)**:
  - Displays dynamic welcomes based on client local time (e.g., "Good morning", "Good afternoon", "Good evening", or "Good night") combined with the user's registered first name.
  - Hosts a real-time ticking clock showing the current date and time (running on a 1-second `setInterval` hook).
  - Renders an outlet operating indicator ("Kitchen Open" in green vs "Kitchen Closed" in red, bound to 11:00 AM - 11:00 PM operating hours).
- **Brand Identity & Social Row**:
  - Highlights a profile summary of the Flavora Kitchen brand with location coordinate pins, daily operational details, and custom social link shortcuts.
  - Icons are rendered as valid JSX component tags (`<IconComponent size={14} />`) to satisfy strict TypeScript checking.
  - Links to the Android App download CTA (simulated for Phase 3 launch).
- **🍔 Gated Food Ordering Engine**:
  - For full details, see the dedicated [Gourmet Online Order System Guide](file:///d:/Client%20Projects/foodie-flavors-restaurant-main/documentation/online_order_system.md).
  - **Menu Tab**: Offers local keyword search, sorting filters (Relevance, Rating, Popularity, Cost Low-to-High / High-to-Low), dietary pills (Veg, Non-Veg, Vegan), and pricing filters (Under ₹300, Under ₹500). Includes item customizer popup details modals (managing sizes, wood-fired crust options, toppings checklists, spice levels, and notes).
  - **Checkout Hub**: Integrates a live calculations matrix containing subtotals, 5% GST surcharge, ₹10 platform fee, ₹40 delivery fee, custom rider tips, and coupon discount calculations (validates code `FLAVORA50` to apply a 50% discount). Includes a delivery address selector (supporting Home, Work, and Friends House locations, or adding custom locations via a GPS coordinates pin simulator) and multiple payment options (UPI, secure Card inputs, COD, and a Split Bill calculator showing split payer counts and split request invites).
- **🍽️ Gated Table Booking System (12 Core Reservation Modules)**:
  - For full details, see the dedicated [Dine-In Table Seating Reservation Guide](file:///d:/Client%20Projects/foodie-flavors-restaurant-main/documentation/table_booking_system.md).
  - **Availability Engine & Scheduler (Modules 3 & 5)**: Integrates date calendar picker constraints (today's min date), guest count headcount inputs, and duration selectors (1h, 1.5h, 2h, 3h). Displays a real-time availability slots grid showing available slots in green and booked-out slots in red.
  - **Seating Management & Table Types (Module 4)**: Renders a visual floor plan layout grid based on selected table type (Couple Table, Family Table, Private Cabin, Rooftop, Outdoor, Window Seat, VIP Room). Clicking an available table selects its physical ID node. Booked tables are disabled.
  - **Dining Packages & Requests (Modules 6, 7 & 8)**: Supports event party options (Standard Dining, Birthday party, Corporate dinner, Family gathering, Engagement celebration), gala dining packages (Standard, Romantic Package +₹1500, Family Package +₹2500, Premium Tasting +₹3000, Chef Experience +₹5000), and special request tick lists (Birthday/Anniversary setup, baby chairs, quiet areas).
  - **Reminders, SVG QR Tickets & Management (Modules 9, 10 & 11)**: Generates unique booking IDs and registers SVG check-in QR codes. Simulates email/SMS confirmation check alerts, active timeline reminders (24h warning, 2h warning, and maps directions links), and management actions (Reschedule dates, Upgrade table seats, Add Guests headcount, and Cancel reservations).
  - **Waitlist, Check-In & Feedback (Modules 12, 13 & 14)**:
    - *Waitlist*: Allows users to join a queue for booked-out timeslots, showing their position (e.g. #2) and automatically promoting them if another booking is cancelled.
    - *Check-in*: Simulates scanning the QR check-in code to seat guests ("Seated") and complete meals ("Completed").
    - *Feedback*: Opens a post-dining scorecard rating Food, Ambience, and Service Quality (1-5 stars) along with review comments.
- **🛵 Live Track Telemetry**:
  - For full details, see the dedicated [Live Telemetry & GPS Tracking Guide](file:///d:/Client%20Projects/foodie-flavors-restaurant-main/documentation/live_tracking_system.md).
  - Computes order status progress (Placed ➔ Accepted ➔ Preparing ➔ Packed ➔ Out for Delivery ➔ Delivered) and draws a visual SVG map showing a delivery vehicle (scooter icon) moving smoothly along a vector street coordinate grid.
- **Concierge Help Desk chatbot (Module 15)**:
  - Houses a live scrolling chat panel containing auto-responses from Chef Bot.
  - Chef Bot analyzes active checkout carts, order tracking status, and reservation records to answer support queries. Includes quick suggestion chips for easy entry.
- **Supabase Authentication Gateway**:
  - Restricts access via a `ProtectedRoute` component.
  - Links to the authenticated user's metadata to fetch custom initials (`userInitial`) and display names (`userDisplayName`) in a custom dropdown navbar utility.
- **Toast Notifications**:
  - Displays elegant green (success), red (error), or amber (info) glassmorphic slide-down banners for user actions.
- **TypeScript Integrity**:
  - 100% type-safe compilation checks (`tsc --noEmit`) with zero errors.
- **Vite Bundler**:
  - Bundles cleanly via Rollup into high-performance static pages.

---

## 🧩 Tier 1 Features — Dashboard Enhancement Systems

The following features were added to the authenticated dashboard portal (`/app`) as self-contained, low-risk systems that reuse existing infrastructure (contexts, data, and component patterns).

---

### 31. Wishlist / Favorites System

**Architecture**: Global `FavoritesContext.tsx` following the exact same Provider/Consumer pattern as `CartContext.tsx`. Mounted in `main.tsx` wrapping the entire app tree, ensuring the same persistent list is accessible from every surface.

- **State**: `favorites: string[]` (array of dish IDs as strings), persisted to `localStorage` under the key `flavora_favorites` and hydrated on mount.
- **API**: `toggleFavorite(dishId)` adds or removes a dish ID. `isFavorited(dishId)` returns a boolean for read-only checks.
- **Wiring Locations**:
  - `PopularDishes.tsx` (public landing) — Heart button on every dish card uses `useFavorites()` context.
  - `MenuPreviewTabs.tsx` (public landing) — Heart button added to every card in the horizontal tab rail, auth-gated (calls `onTriggerAuthGate` if the visitor is a guest).
  - `DashboardPage.tsx` Menu tab — Heart icons on all dashboard dish cards call `toggleFavorite` with a toast confirmation.
  - `DashboardPage.tsx` Home tab — Displays a "Your Saved Favorites" grid section when favorites exist.
- **Favorites Tab** (`activeTab === "favorites"`):
  - Header row shows dish count.
  - 3-column grid (1 col on mobile) reusing the same dish card component style from the Menu tab.
  - **Empty state**: Pulsing heart icon + italic copy *"Nothing saved yet"* + CTA button linking back to the Menu tab.

---

### 32. Invoice Download + Repeat Order (History Log Tab Extension)

**Repeat Order (`handleReorder`)**: Re-populates `CartContext` with all items from the selected historical order (preserving quantities via `addToCart(item, qty)`), plays the add-to-cart audio chime, and navigates directly to the Checkout tab.

**Invoice Download (`handleDownloadInvoice`)**: Generates a branded PDF invoice client-side via `jsPDF`:
- **Header block**: "FLAVORA KITCHEN" in Times serif bold 28pt, italic orange tagline underneath, thick orange horizontal rule divider.
- **Invoice meta block**: Order ID, Date, Payment Method on the left; Delivery Address on the right.
- **Item table**: Dark header row (white text on `#1a1a1a` background), line items with Qty/Unit Price/Total separated by `#e5e7eb` horizontal rules.
- **Fee summary matrix**: Subtotal, GST (5%), Delivery Fee (`FREE` if waived), Platform Fee (₹10), Rider Tip (if any).
- **Total paid**: Orange highlighted row showing the final `totalAmountPayable`.
- **Footer**: Italic thank-you message and support email centered in gray.
- **File naming**: `Flavora_Invoice_{orderId}.pdf`.

Both buttons are placed side-by-side in the History Log tab order history card footer.

---

### 33. Voucher System (Extended Checkout Coupon Engine)

**Data File**: `src/config/vouchers.ts` — defines 4 distinct voucher codes as typed `Voucher[]` objects:

| Code | Type | Value | Description |
|---|---|---|---|
| `FLAVORA50` | `percent` | 50 | 50% off the entire cart subtotal |
| `WELCOME100` | `flat` | 100 | ₹100 flat deduction |
| `FREESHIP` | `free_shipping` | 0 | Waives delivery fee entirely (does not touch subtotal) |
| `BDAY2026` | `flat` | 150 | ₹150 birthday month flat deduction |

**Distinct Math per Type**:
- `percent`: `discountAmount = Math.round(cartTotal × (value / 100))`
- `flat`: `discountAmount = Math.min(cartTotal, value)` (cannot exceed subtotal)
- `free_shipping`: `deliveryFee = 0` (the base fee is bypassed; does not affect item subtotal math)

**UX Feedback**:
- ✅ Success: Green inline confirmation badge showing the applied code + description, live total updates instantly.
- ❌ Invalid: Non-judgmental message: *"That code doesn't look right — double-check and try again"*.

**Referral Code Integration**:
- `SignupPage.tsx` includes an optional `Referral Code` input field (🎁 icon).
- On successful signup with a code, the value is written to `localStorage("flavora_applied_referral")`.
- On first `DashboardPage.tsx` mount, if `flavora_applied_referral` is set and `flavora_referral_welcomed` is not yet `"true"`, the `WELCOME100` voucher is automatically pre-applied to checkout state, and a welcome toast fires 1.5s after load: *"Welcome! Here's ₹100 off your first order — code WELCOME100 has been applied for you"*.
- The `flavora_referral_welcomed` flag is then set to prevent the toast from firing again.

---

### 34. Upsell / "Complete Your Meal" Strip

**Trigger Logic** (in a `useEffect` watching `[cart, allDishesList, lastCartLength]`):
1. Fires only when cart transitions from **0 → 1 item** (`cart.length === 1 && lastCartLength === 0`).
2. Checks if the first item's category is **Main Course** by matching against `allDishesList`.
3. If matched, picks the **highest-rated Starter** from `allDishesList.filter(d => d.category === "Starters").sort((a,b) => b.rating - a.rating)[0]`.
4. Sets `upsellSuggestion` and `showUpsell = true`.

**Strip UI** (rendered in `AnimatePresence` in the sticky toast zone, above tab content):
- Slides in from above with spring animation.
- Shows: `✨ Complete Your Meal` label, dish name + price.
- **"+ Add" button**: Adds the suggestion to cart, plays chime, closes strip, shows toast.
- **X button**: Dismisses the strip with no other side effects.
- Never blocks or delays the primary add-to-cart flow — it is a secondary, non-modal, non-required prompt.

---

## 🧩 Tier 2 Dashboard Extensions (June 2026)

These five systems were added to the authenticated `/app` Dashboard, each building on existing data and context — no new infrastructure or pages.

---

### 35. Customer Profile System

**Tab**: `profile` (accessible via the 👤 icon in the dashboard nav)

**State Variables** (in `DashboardPage.tsx`):
- `userProfile` (`UserProfile`): Stores `name`, `phone`, `birthday`, `allergens[]`, `preferredPayment`, and `dietaryPref`.
- `profileEditMode` (boolean): Toggles between view mode (glass-card display) and edit mode (inline form inputs).
- `profilePhoto` (string | null): Optional base64 or URL string for profile avatar. A simulated upload button triggers `handleSimulatePhotoUpload()`.

**Features**:
- Editable fields: Full name, phone number, birthday date, and dietary preference dropdown (Any / Veg / Non-Veg / Vegan).
- Allergen multi-select: checkboxes for Nuts, Dairy, Gluten, Shellfish, Eggs.
- Preferred payment picker: UPI / Card / Cash on Delivery / Split Bill.
- Pre-populated from auth context on first mount — reads `user.email` and parsed `user.user_metadata?.name`.
- Saves to `localStorage("flavora_profile")` for offline persistence between sessions.
- Avatar edit button simulates file upload with a toast confirmation: `"📸 Profile photo updated!"`.

---

### 36. Delivery Zone Validation System

**Library**: [`deliveryZone.ts`](file:///d:/Client%20Projects/foodie-flavors-restaurant-main/flavora-kitchen/src/lib/deliveryZone.ts)

**Formula**: Haversine great-circle distance formula between the user's saved address `coords` and the restaurant origin at `{ lat: 19.4180, lng: 72.8200 }` (Mumbai).

**Zone Tiers**:

| Distance | Zone Status | Delivery Fee | ETA |
|---|---|---|---|
| 0–3 km | `in_zone` | ₹0 (Free) | 15–20 min |
| 3–7 km | `mid_zone` | ₹40 | 25–35 min |
| 7–12 km | `far_zone` | ₹80 | 40–55 min |
| 12–20 km | `far_zone` | ₹140 | 60–75 min |
| > 20 km | `out_of_zone` | N/A | Not available |

**Integration in Checkout Hub**:
- `getDeliveryZone()` is called reactively whenever `selectedAddressId` changes.
- The result updates `deliveryFee` in the billing summary in real-time.
- Out-of-zone addresses display a banner: `"⚠️ This address is outside our current delivery area"`.
- A GPS pin simulator allows dragging to test new coordinates and see live zone + fee recalculations.

---

### 37. Dining Waitlist System

**Tab**: Nested inside the `bookings` tab (Table Bookings section).

**Interface**: `WaitlistEntry { id, name, guests, phone, joinedAt, position, status }`

**State Variables**:
- `waitlist` (`WaitlistEntry[]`): Live list of queued guests, persisted to `localStorage("flavora_waitlist")`.
- `waitlistName`, `waitlistPhone`, `waitlistGuests`: Form inputs for joining queue.

**User Flow**:
1. When a user selects a time slot that is **fully booked**, a `"🔴 Fully Booked — Join Waitlist"` CTA appears.
2. Clicking opens a compact inline join form (name, phone, guest count).
3. On submit, a `WaitlistEntry` is created with `position = waitlist.length + 1` and `status: "waiting"`.
4. The user is confirmed with a toast: `"You're #N in the waitlist — we'll notify you when a table opens!"`.
5. **Auto-promotion simulation**: A `useEffect` timer checks every 15 seconds. If any entry has `status: "waiting"`, it transitions to `status: "ready"` and fires a toast: `"🎉 Your table is ready! Please check in within 15 minutes."`
6. Host can manually mark guests as `"seated"` via the active waitlist panel.

---

### 38. Inventory / Availability System

**Data Map**: `DISH_STOCK: Record<number, StockStatus>` (defined at the top of `DashboardPage.tsx` — keyed by dish ID).

**StockStatus type**: `"available" | "low" | "sold_out"`

**Visual Indicators**:
- `available`: No badge — dish renders normally.
- `low`: Amber `"Low Stock"` pill badge on dish card.
- `sold_out`: Red `"Sold Out"` overlay pill + `pointer-events-none` + reduced opacity on the Add to Cart button.

**Behavior**:
- `sold_out` items cannot be added to cart (button is disabled).
- `low` items add with a toast warning: `"⚠️ Only a few left — add quickly!"`
- The inventory map is a static seed (not live API) — the file has a `TODO` comment flagging where to wire in an API call to a backend inventory service.

---

### 39. Group Ordering System

**Tab**: Accessible as a sub-section inside the `checkout` tab.

**Interface**: `GroupOrderMember { id, name, phone, items: { name, price }[], paid }`

**State Variables**:
- `groupMembers` (`GroupOrderMember[]`): The invited collaborators in the split session.
- `groupLink` (string): A deterministic share link generated from the active order timestamp.
- `groupOrderActive` (boolean): Toggles group mode on/off in the checkout flow.

**Features**:
- **Start Group Order**: A `"👥 Group Order"` button in the Checkout Hub header activates the feature.
- **Share Link**: Generates a unique share URL (e.g., `https://flavora.menu/group?s=ABC123`) displayed in a copyable input field.
- **Member Roster**: Displays each invited member's name, their items, and a `✅ Paid` / `⏳ Pending` badge.
- **Split Billing Summary**: Shows the total split-bill allocation — `grandTotal / members.length` — per head breakdown.
- **Simulate Join**: A `"+ Simulate Guest Join"` button adds a mock guest with random sample items to demonstrate the roster update live.
- Real-time payment sync is marked with a `TODO` comment for WebSocket/backend integration.

