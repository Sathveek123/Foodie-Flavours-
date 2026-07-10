# 🍽️ Dine-In Table Booking System

**Last updated: June 28, 2026**

This document describes the architecture, layout, state variables, and execution modules of the **Dine-In Table Booking System** in Flavora Kitchen.

---

## 🧭 System Overview

The table reservation portal is a unified booking interface integrated inside the gated customer dashboard under the `bookings` tab. It guides customers through selecting scheduling options, choosing interactive tables from a 2D seating floor plan, opting for premium dining packages, and managing active reservations.

---

## 🧩 12 Core Seating Reservation Modules

The booking panel consists of exactly **12 modules** representing complete end-to-end booking life cycle coverage:

### 1. Date Calendar Picker Constraints
* **Logic**: Prevents booking past events by setting the calendar input's minimum bound (`min`) constraint to the active current date.
* **State**: Bound to `bookingDate` (initialized to today's date).

### 2. Time Slot Availability Grid Matrix
* **Layout**: Displays a horizontal grid of dining slots (e.g., `11:00`, `13:00`, `17:00`, `19:00`, `21:00`, `22:00`).
* **Visual Status**:
  - Green border badges show `Available` slots.
  - Red border badges represent `Booked-Out` slots.
* **Interactive Behavior**: Selecting a slot resets visual table nodes to clear mismatch errors.

### 3. Guest Count Headcount Selector
* **Range**: Accepts guest headcounts from `1` up to a maximum of `12` diners.
* **Logic**: Syncs with visual table layout filters to advise matching table capacities.

### 4. Duration Selector
* **Options**: Dropdown selector supporting `1 hour`, `1.5 hours`, `2 hours`, or `3 hours`.
* **Purpose**: Reserves table blocks, preventing overlapping customer seatings.

### 5. Seating Categories & Table Types
* **Categories**: Separated into 4 primary selections:
  - `Couple Table`: Intimate table layouts tailored for 2.
  - `Family Table`: Larger dining tables supporting 4-6 guests.
  - `Private Cabin`: Secluded, quiet indoor dining cells.
  - `Rooftop / VIP / Outdoor / Window`: Premium scenic seating options.
* **Pricing**: Specific categories carry custom dining package requirements.

### 6. Interactive 2D Floor Plan Grid
* **Visuals**: A grid viewport mapping individual tables (e.g. `T-C1`, `T-F3`, `T-VIP2`) based on the active seating category selection.
* **Color States**:
  - Green dots: Available for selection.
  - Orange body: Currently selected table.
  - Red / Gray disabled: Already reserved by another party (prevents overlapping bookings).
* **Code Logic**: `getSeatingTablesForType(bookingTableType)` yields specific capacity bounds and booking locks.

### 7. Event Booking Selection
* **Types**: Standard Dining, Birthday party, Corporate dinner, Family gathering, Engagement celebration.
* **Purpose**: Coordinates kitchen operations, menu choices, and decoration pre-sets.

### 8. Gala Dining Packages
* **Packages**:
  - `Standard Seating`: Basic table reservation with no surcharge.
  - `Romantic Package (+₹1500)`: Includes rose petals, candlelight, and complimentary champagne.
  - `Family Package (+₹2500)`: Custom group platters and kid-friendly desserts.
  - `Premium Tasting (+₹3000)`: A multi-course tasting menu curated by Chef Mario.
  - `Chef Experience (+₹5000)`: Front-row seating with live plating demonstrations by the Executive Chef.

### 9. Notifications & SVG QR Ticket Generator
* **Channels**: Checkboxes to choose SMS confirmation, Email notifications, or both.
* **SVG Ticket**: Renders a readable custom check-in ticket showing a simulated QR matrix, date/time stamps, and guest counts.

### 10. Booking Operations Manager
Allows users to perform four core actions on active reservations:
* **Cancel**: Invalidates the booking and frees up the table node in the floor plan.
* **Reschedule**: Opens a modal to modify the reservation date and time.
* **Upgrade Seat**: Opens a modal to change the seating category (e.g., from Couple Table to VIP Rooftop).
* **Add Guests**: Extends headcounts for current tables, validating capacity.

### 11. Waitlist Queue System
* **Trigger**: Fires when a customer selects a slot marked as fully booked.
* **Behavior**: Registers the booking with `waitlisted: true` and calculates a waitlist position (e.g., `#2`).
* **Logic**: If an active booking in that slot is cancelled, the system automatically promotes the waitlisted ticket.

### 12. QR Check-In & Post-Dining Feedback
* **Check-In Scanner**: Toggles status values (Confirmed ➔ Seated ➔ Completed) simulating host scans.
* **Feedback Scorecard**: Renders star rating sliders (1-5★) evaluating:
  - *Food Quality*
  - *Ambience Experience*
  - *Service Quality*
  - *Comments Text Box*: Saves customer reviews to history.

---

## 🔄 State Structure & Schema

An active reservation conforms to the TypeScript `Booking` structure:

```typescript
interface Booking {
  id: string; // e.g. FL-BOOK-124982
  date: string;
  time: string;
  guests: number;
  duration: string;
  tableType: string;
  tableId: string;
  event: string;
  diningPackage: string;
  requests: string[];
  status: "Confirmed" | "Seated" | "Completed" | "Cancelled";
  emailNotification: boolean;
  smsNotification: boolean;
  reminders: {
    alert24h: boolean;
    alert2h: boolean;
    alertNav: boolean;
  };
  waitlisted: boolean;
  waitlistPosition?: number;
  feedbackSubmitted?: boolean;
  feedback?: {
    food: number;
    ambience: number;
    service: number;
    comment: string;
  };
}
```

---

## 📂 Core Code References
* **Booking State & Scheduler**: [DashboardPage.tsx](file:///d:/Client%20Projects/foodie-flavors-restaurant-main/flavora-kitchen/src/pages/DashboardPage.tsx) (Lines 310 - 425) — State initializers and package descriptions.
* **Booking Engine & Logic**: [DashboardPage.tsx](file:///d:/Client%20Projects/foodie-flavors-restaurant-main/flavora-kitchen/src/pages/DashboardPage.tsx) (Lines 826 - 990) — Place, cancel, upgrade, and reschedule logic.
* **Reservation Interface Tab**: [DashboardPage.tsx](file:///d:/Client%20Projects/foodie-flavors-restaurant-main/flavora-kitchen/src/pages/DashboardPage.tsx) (Lines 1559 - 1954) — Availability selectors, 2D floor plans, active tickets.
