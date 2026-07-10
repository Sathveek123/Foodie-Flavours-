# Pre-Launch Placeholder Inventory

**Last updated: June 24, 2026**

This document flags all pending content that must be replaced with real business assets before the official launch. The codebase has been refactored to pull contact details from a single central configuration file: [config.ts](file:///d:/Client%20Projects/foodie-flavors-restaurant-main/flavora-kitchen/src/config.ts).

---

## ⚙️ 1. Central Configuration Variables
The following contact and deployment details are configured in [config.ts](file:///d:/Client%20Projects/foodie-flavors-restaurant-main/flavora-kitchen/src/config.ts). Update this file with real client details to automatically propagate them across the landing page:
- **Phone Number Display**: `BUSINESS_CONFIG.phoneDisplay` (Currently shows `+91 (Pending Verification)`)
- **Secondary Phone**: `BUSINESS_CONFIG.phoneDisplaySecondary`
- **Call URL Scheme**: `BUSINESS_CONFIG.phoneCallUrl`
- **WhatsApp API URL**: `BUSINESS_CONFIG.whatsappUrl`
- **Primary Email**: `BUSINESS_CONFIG.email` (Currently shows `concierge@flavorakitchen.com`)
- **Secondary Email**: `BUSINESS_CONFIG.emailSecondary`
- **Physical Address**: `BUSINESS_CONFIG.address` (Currently shows pending)
- **Map Verification Toggle**: `BUSINESS_CONFIG.isLocationPending` (Set to `true` to render a premium glassmorphic map placeholder; set to `false` to render the Google Maps iframe)

---

## 👨‍🍳 2. Culinary Team Portraits
Located in [MeetChefs.tsx](file:///d:/Client%20Projects/foodie-flavors-restaurant-main/flavora-kitchen/src/components/MeetChefs.tsx):
- **Current State**: The component has been streamlined to a luxury single-chef feature focusing on **Executive Chef Mario Batali** using his real verified asset `/images/chef_portrait.png`.
- **Pre-Launch Handoff**: If the client wishes to restore the 4-chef team grid, they must provide verified portrait assets for the following team members and add them to `/public/images/`:
  - **Marco Rossi (Sous Chef)**: Currently offline.
  - **Elena Rostova (Pastry Chef)**: Currently offline.
  - **Kabir Mehta (Grill Master)**: Currently offline.

---

## 🖼️ 3. Food Gallery Images
Located in [FoodGallery.tsx](file:///d:/Client%20Projects/foodie-flavors-restaurant-main/flavora-kitchen/src/components/FoodGallery.tsx):
- **Current State**: All generic stock interior shots of other restaurants have been removed. The gallery has been cleaned up to display 100% real food photography from existing `/public/images/` assets.
- **Pre-Launch Handoff**: Once the restaurant shoots real photos of their actual dining rooms or grand lounges, the following items can be swapped back in:
  - **Classic Margherita Pizza** (Item 4) -> Real interior Lounge shot.
  - **Gourmet Party Feast** (Item 6) -> Real kitchen prep shot.
  - **Golden Crispy Tenders** (Item 8) -> Real dining room environment shot.

---

## 📣 4. Dead-End CTAs & Interactive Portals
The following clickable elements are wired to trigger elegant, custom Toast notifications stating they are upcoming Phase 2 features *for anonymous users*, or redirect to `/app` for authenticated users:
- **Join Rewards** button in [LoyaltyTeaser.tsx](file:///d:/Client%20Projects/foodie-flavors-restaurant-main/flavora-kitchen/src/components/LoyaltyTeaser.tsx) (Triggers Auth Gate Modal for guests, fully functional inside `/app` dashboard).
- **Explore Details** link in [Events.tsx](file:///d:/Client%20Projects/foodie-flavors-restaurant-main/flavora-kitchen/src/components/Events.tsx) (Triggers Auth Gate Modal for guests, active reservations map and scheduling is fully functional inside `/app` dashboard).
- **Social Media Icons & Terms links** in [Footer.tsx](file:///d:/Client%20Projects/foodie-flavors-restaurant-main/flavora-kitchen/src/components/Footer.tsx).
- **Call / WhatsApp buttons** in [StickyUtilities.tsx](file:///d:/Client%20Projects/foodie-flavors-restaurant-main/flavora-kitchen/src/components/StickyUtilities.tsx) when `isPhonePending` is `true`.
- **Get Directions** button in [ContactLocation.tsx](file:///d:/Client%20Projects/foodie-flavors-restaurant-main/flavora-kitchen/src/components/ContactLocation.tsx) when `isLocationPending` is `true`.

