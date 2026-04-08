# VitalLens

VitalLens is a mobile-first web application designed for scanning, searching, and evaluating food and cosmetic products. It provides users with a detailed breakdown of ingredients, nutritional information, and personalized scoring based on their health goals and preferences.

## Tech Stack

*   **Frontend Framework**: React 19
*   **Routing**: React Router DOM v7
*   **Build Tool**: Vite
*   **Styling**: Tailwind CSS v4 (via `@tailwindcss/vite`)
*   **State Management**: Zustand (used primarily for user profile persistence)
*   **Local Storage**: IndexedDB (using the `idb` package for offline storage of scanned/saved products and history)
*   **External APIs**: Open Food Facts API (for retrieving product data)
*   **Barcode Scanning**: `@zxing/browser` and `@zxing/library`

## Project Architecture

*   `src/api/`: Contains functions for interacting with external APIs, primarily `openFoodFacts.ts`.
*   `src/components/`: Reusable UI components (e.g., `IngredientItem`).
*   `src/data/`: Static data and type definitions related to ingredients.
*   `src/lib/`: Utility functions and local storage logic (`idb.ts`, `productOverrides.ts`).
*   `src/pages/`: Main route components (`Home`, `Scan`, `Search`, `Saved`, `Profile`, `Product`).
*   `src/scoring/`: Core logic for evaluating products:
    *   `universalScore.ts`: Computes a baseline objective score for a product based on its ingredients and nutritional value.
    *   `personalScore.ts`: Computes a personalized score adjusted against the user's profile (goals, allergies, skin type).
    *   `confidence.ts`: Evaluates the reliability and completeness of the retrieved product data.
*   `src/store/`: Zustand stores for global state (`profileStore.ts`).
*   `src/types/`: TypeScript interface definitions for core domain objects (`product.ts`, `profile.ts`).

## Core Features & Workflows

1.  **Product Discovery**: Users can discover products by scanning a barcode (`Scan.tsx`) using their device camera or manually searching for product names (`Search.tsx`).
2.  **Product Evaluation**: When a product is loaded (`Product.tsx`), the application fetches data from Open Food Facts, calculates both Universal and Personal scores, and displays warnings for potential allergens or harmful ingredients.
3.  **User Profile**: Users can configure their dietary goals, allergies, and skin types (`Profile.tsx`). This data is persisted via Zustand and heavily influences the "Personal Score" of any viewed product.
4.  **History & Saving**: Viewed products are automatically added to a local history, and users can explicitly "save" products for quick access later (`Saved.tsx`), all backed by IndexedDB.

## Development Conventions

*   **TypeScript**: Strictly typed definitions are used throughout. Prefer defining types in the `src/types/` directory for domain models.
*   **Styling**: Utilize Tailwind CSS utility classes directly within the JSX `className` attributes. The design is explicitly mobile-first, typically constrained within a `max-w-[430px]` container to emulate a mobile app experience on desktop browsers.
*   **State Management**: Use Zustand for global state that requires persistence (like user profiles). Keep component-specific state local using `useState`. Use IndexedDB for large or structured local data (like product history).
*   **Error Handling**: Pages fetching external data (like `Product.tsx` and `Scan.tsx`) implement explicit state machines (`idle`, `loading`, `error`, `found`, etc.) to render appropriate fallback UI.
