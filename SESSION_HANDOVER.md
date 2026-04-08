# Session Handover: VitalLens Development

This document provides a comprehensive summary of the project state as of April 2026. Use this to catch up a new AI session or developer.

---

## 🚀 Current Project State
VitalLens is a mobile-first PWA for food and cosmetic evaluation. It is fully functional, using **React 19**, **Zustand** (Profile), **IndexedDB** (History/Saved), and the **Open Food Facts API**.

### 🛠 Key Features Implemented (This Session)
1.  **Centered Bottom Navigation:** A custom floating Scan button visually aligned (+5px shift) and integrated into the flex layout for one-handed use.
2.  **Multiple Goal Stacking:** The Profile now supports selecting multiple concurrent goals (e.g., Weight Loss + Muscle Gain).
3.  **The "Coca-Cola Rule" (Scoring):**
    *   **Universal Score:** Improved baseline (60). Implemented "Empty Calorie" detection (-15 points) for products with high sugar but <1g protein/fiber.
    *   **Personal Score:** Implemented "Dampened Aggregation"—the first goal has 100% impact, subsequent goals have 50% impact to prevent score overflow.
4.  **Serving-Based Impact:**
    *   Added physiological data to Profile (Age, Sex, Weight, Activity).
    *   Product page now has a **"Per 100g" vs "Per Serving" toggle**.
    *   Implemented **DV% Progress Bars** that calculate intake based on the user's specific BMR and chosen goals.
5.  **OCR Fallback Engine:**
    *   Integrated `tesseract.js` for client-side OCR.
    *   Added **"Analyze with Camera"** for unrecognized barcodes to extract macros and ingredients locally.
6.  **Ingredient Intelligence:**
    *   Enhanced `IngredientItem` to display **"Nutritional Benefit"** (High Benefit, Empty Calorie, etc.) alongside regulatory "Safe" status.

---

## 🏗 Technical Architecture Highlights
-   **Scoring Logic:** Located in `src/scoring/`. `universalScore.ts` handles objective data; `personalScore.ts` handles user-fit.
-   **Daily Values:** `src/lib/dailyValues.ts` contains the math for BMR-based daily limits and serving size string parsing.
-   **State Management:** `src/store/profileStore.ts` persists the User Profile.
-   **Local DB:** `src/lib/idb.ts` handles the heavy lifting for history and saved products.

---

## ⚠️ Critical Fixes & Gotchas
-   **Blank Page Issues / Type Errors:** Resolved a "white screen" crash. Fixes involved:
    *   Replacing `React.lazy` and `Suspense` in `App.tsx` with standard static imports to stabilize routing and fix the crash.
    *   Completely overhauling `Product.tsx` to fix async React rendering bugs and ensure correct `import type` usage for Vite transpilation.
-   **OCR Dependencies:** `tesseract.js` is installed using `--legacy-peer-deps` due to a conflict with the PWA plugin.
-   **PRD Alignment:** We established `PRODUCT_ROADMAP.md` aligned with the latest PRD to prioritize behavioral utility (basket mode, daily logging) over just static scoring.

---

## 📋 Next Steps
Based on a recent comprehensive frontend code review and the `PRODUCT_ROADMAP.md`, the next priorities are:

### Frontend Technical Debt
1.  **Refactor `Product.tsx`:** Extract the inline sub-components (e.g., `ProductHeader`, `ScoreGrid`, `ImpactAnalysis`) to improve maintainability, as it has become a "God Component".
2.  **Restore Code Splitting:** Re-implement `React.lazy` in `App.tsx` with a proper `Suspense` fallback now that the component tree is more stable.
3.  **Consolidate API Logic:** Centralize search fetch logic from `Search.tsx` into `src/api/openFoodFacts.ts`.
4.  **Shared UI Components:** Extract `ProductListItem` to eliminate redundant layout code in `Home.tsx`, `Search.tsx`, and `Saved.tsx`.

### Feature Development (Phase 3)
1.  **Basket Mode (🛒 Feature C):** Allow users to scan multiple items into a "Shopping Session" and view aggregate household risks.
2.  **Daily Intake Logging (📅 Feature D):** Allow users to "Add to Day" to track their cumulative nutrient intake against their DV limits.
3.  **Smart Substitutions (🔄 Feature E):** Implement the engine to suggest higher-scoring alternatives in the same category.

---
**Master Reference Documents:**
- `PRODUCT_ROADMAP.md`: Detailed feature specifications and PRD alignment.
- `SESSION_HANDOVER.md`: This file.
- `src/types/product.ts`: The central data model for the application.
