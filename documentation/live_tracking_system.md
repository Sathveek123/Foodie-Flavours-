# 🛵 Live Telemetry & GPS Tracking System

**Last updated: June 28, 2026**

This document describes the telemetry configurations, SVG mapping engines, user flows, and states backing the **Live Order Tracking Console** in Flavora Kitchen.

---

## 🧭 System Overview

Upon placing a gourmet order, customers are redirected to the **Live Tracking Console** tab. This interface acts as a simulation cockpit showing delivery progress updates, delivery vehicle routing on a vector map, and coordinates verification.

---

## 🧩 Key Features & Technical Details

### 1. Order Status Stepper
Tracks the order progression sequentially:
* **Order Placed**: Customer submits their gourmet order.
* **Accepted**: Kitchen staff reviews and confirms the order ticket.
* **Preparing**: Kitchen starts cooking the items.
* **Packed**: Items are packed in temperature-controlled bags.
* **Out For Delivery**: Courier picks up the order and starts navigation.
* **Delivered**: Courier arrives at the customer's coordinates.

```
[Order Placed] ➔ [Accepted] ➔ [Preparing] ➔ [Packed] ➔ [Out For Delivery] ➔ [Delivered]
```

### 2. SVG Path Telemetry Map
The vector map draws roads, landmarks, and rider coordinates live:
* **Background Grid**: A CSS/SVG pattern drawing layout boxes simulating city block subdivisions.
* **Delivery Roads**: Thick vector lines (`strokeWidth="12"`/`"16"`) representing street coordinates.
* **Rider Route Path**: A dashed path connecting the restaurant coordinates with the customer's destination address.
* **Scooter Indicator**: A floating emoji marker (`🛵`) representing the delivery rider. Its horizontal offset changes in real-time based on the computed progression:
  ```typescript
  left: `${15 + (mapProgress * 0.7)}%`
  ```
  This positions the courier smoothly on the route, shifting to 100% upon delivery.

### 3. Assigned Delivery Rider Profile
Upon order confirmation, a rider is assigned to the delivery:
* **State Properties**:
  ```typescript
  rider?: {
    name: string;
    phone: string;
    rating: string;
    avatar: string;
  }
  ```
* **Rider Card**: Renders the rider's name, rating, contact phone number, and avatar badge.

### 4. Address & Destination System
* **Predefined Addresses**: Supports Home, Work, and Friends House addresses.
* **Coordinates Mapping**: Includes lat/lng properties for mapping pins on coordinates.
* **GPS Coordinates Pin Simulator**: Allows users to enter a custom address and tap a pin icon to simulate latitude and longitude values dynamically.

### 5. Status Advance Simulator Control
* **Developer Control**: Includes an "Advance Simulated Status" action trigger button.
* **Behavior**: Updates the order status to the next step, increments `mapProgress` in increments of 20%, and prompts toast alerts until reaching `Delivered` status.

---

## 📂 Core Code References
* **Tracking Core Tab**: [DashboardPage.tsx](file:///d:/Client%20Projects/foodie-flavors-restaurant-main/flavora-kitchen/src/pages/DashboardPage.tsx) (Lines 2311 - 2477) — SVG paths, riders info, state transitions.
* **Delivery Address Systems**: [DashboardPage.tsx](file:///d:/Client%20Projects/foodie-flavors-restaurant-main/flavora-kitchen/src/pages/DashboardPage.tsx) (Lines 2012 - 2056) — Address selection, input text boxes, and coordinates setups.
* **Order Interface Schema**: [DashboardPage.tsx](file:///d:/Client%20Projects/foodie-flavors-restaurant-main/flavora-kitchen/src/pages/DashboardPage.tsx) (Lines 72 - 99) — Order states structure.
