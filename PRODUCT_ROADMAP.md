# VitalLens Master Product Roadmap

This document aligns our current build with the **VitalLens PRD v1**. It tracks implementation progress and defines the technical logic for upcoming "Decision Support" features.

---

## 🟢 Phase 1: Foundation (Completed)

### 🧬 Discovery & Identification
- [x] **Omni-Channel Scan:** High-speed barcode scanning via camera + fuzzy manual search.
- [x] **Auto-Categorization:** Logic-driven detection of Food vs. Cosmetics.
- [x] **Centered Mobile UI:** Floating action button (FAB) for scanning, optimized for one-handed use.

### 📊 Scoring Engines
- [x] **Dual Scoring Architecture:** Distinct Universal (Objective) and Personal (User-fit) scores.
- [x] **"The Coca-Cola Rule":** Empty calorie detection that penalizes high sugar when lacking fiber/protein.
- [x] **Goal Stacking:** Ability to select and aggregate multiple goals (Weight Loss + Muscle Gain).
- [x] **Exposure Weighting (Cosmetic):** Hazard penalties adjusted by product type (Rinse-off vs. Leave-on).

---

## 🟢 Phase 2: Coverage & Serving Impact (Completed)

### 🥄 Feature A: Serving-Based Impact
- [x] **Data Extraction:** Extract `serving_size` from API (e.g., "330ml").
- [x] **DV% Integration:** Show `% of Daily Value` based on user age/weight/sex/goals.
- [x] **UI Toggle:** User can flip between "Per 100g" and "Per Serving" views.

### 📸 Feature B: OCR Fallback (Zero Dead-Ends)
- [x] **Camera Capture:** Snap ingredient list from unknown products.
- [x] **OCR Engine:** Integration of Tesseract.js (client-side) for label analysis.
- [x] **Community Contribution:** "Contribute to Registry" button for saving OCR data locally.
- [x] **Robust Parsing:** Balanced parentheses awareness for complex ingredient lists.

---

## 🟠 Phase 3: Behavioral Utility & Post-Purchase

### 🛒 Feature C: Basket Mode (Cumulative Impact)
- **Problem:** Scanning is currently a "one-off" activity.
- **Logic:**
    - **Session Persistence:** A temporary "Basket" that holds all items scanned in one shop.
    - **Aggregate Risks:** Warning if the *total* basket is excessively high in one nutrient (e.g., "High Cumulative Sodium").
    - **Smart Swaps:** "Before you checkout" summary suggesting one high-impact substitution.

### 💄 Feature D: The Virtual Vanity & Pantry
- **Logic:**
    - **Shelf-Life Tracking:** Track PAO (Period After Opening) for cosmetics.
    - **Expiry Alerts:** Low-noise "Serene Notifications" when products are nearing expiry.
    - **Routine Layering:** Analyze ingredient compatibility (e.g., Retinol + Vitamin C) for better timing.

---

## 🟠 Phase 4: Advanced Personalization & Social Trust

### 🍱 Feature E: The Harmony Map & Glow Index
- **Logic:**
    - **Bio-Individual Goals:** Dynamic scoring based on wearable data (glucose/recovery).
    - **Glow Index:** Skincare scoring adjusted by local weather (UV, humidity, AQI).
    - **The Harmony Map:** Visualizing the balance of a week's intake (Antioxidants, Fiber, Hydration).

### 🏛️ Feature F: Curator Circles (Social Trust)
- **Logic:**
    - **Shared Pantries:** Follow "Curators" (Derms, Chefs) to see their verified collections.
    - **Community Trust:** Upvote OCR results to raise global confidence tiers.
    - **The Editorial Pivot:** High-end magazine-style "Better Swap" recommendations.

---

## 🔴 Phase 5: Next-Gen Health Oracle (Future-Proofing)

### 👁️ Feature G: VitalVision™ (AI Vision)
- **Logic:** Real-time nutrient decomposition for raw and barcode-less foods (Spatial Volume Estimation).
- **Efficacy:** Selfie-to-Ingredient correlation ("Lumina Mirror™") to track skin changes vs. products.

### 🔗 Feature H: BioPulse Sync™ (IoT & Environment)
- **Logic:**
    - **Wearable Sync:** Real-time metabolic scoring (CGM, Apple Watch).
    - **Hydro-Aura™:** Adjusting cosmetic scores based on local tap water hardness.
    - **Gene-Lens™:** DNA-matched personalization (23andMe import) for caffeine/metabolism variants.

---

## 📈 Success Metrics (KPIs)
- **Time to Result:** < 2 seconds.
- **Onboarding Completion:** % of users who set at least one goal.
- **The "Better Swap" Rate:** % of users who click an alternative after scanned a low-score product.
- **Archive Growth:** Number of user-contributed OCR products per month.

---
*Last Updated: April 2026*
