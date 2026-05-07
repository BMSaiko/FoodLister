# Implementation Plan

[Overview]
Fix four critical UI/UX issues in the FoodLister application: missing navbar during list editing, incorrect visited/unvisited status display on list detail pages, malformed CSS on the Google Maps extractor confirmation button, and incorrect map link generation in the restaurant creation flow. These issues affect core user workflows including list management, restaurant visit tracking, restaurant creation, and map integration. The fixes involve targeted modifications to existing components, no new files or dependencies are required.

[Types]
Update the `MapModalData` interface in `contexts/ModalContext.tsx` to include an optional `source_url` field for storing the extracted Google Maps URL. All other type definitions (`GoogleMapsData`, `VisitData`, `RestaurantWithDetails`) are already correctly defined and require no changes.

```typescript
// Updated MapModalData interface in contexts/ModalContext.tsx
interface MapModalData {
  location: string;
  latitude?: number;
  longitude?: number;
  source_url?: string; // New field for extracted Google Maps URL
}
```

[Files]
Modify 6 existing files to resolve the four issues. No new files are required.

1. **components/pages/EditList.jsx**
   - Add `<Navbar />` and wrapper div to the main content return path (non-loading state) to fix missing navbar during list editing.

2. **app/lists/[id]/page.tsx**
   - Import `useVisitsData` hook, fetch user-specific visit data for list restaurants, and pass `visitsData`, `loadingVisits`, and `onVisitsDataUpdate` props to `RestaurantCard` components to fix incorrect visited status display.

3. **components/ui/RestaurantDetails/GoogleMapsModal.tsx**
   - Correct Tailwind CSS arbitrary value syntax for CSS variables (remove `var()` wrapper) and add missing focus utility classes to the "Usar estas informações" button to fix malformed CSS.

4. **contexts/ModalContext.tsx**
   - Add `source_url?: string` to the `MapModalData` interface to support passing extracted Google Maps URLs to the map modal.

5. **components/restaurant/CreateRestaurantModal.jsx**
   - Pass `source_url` from extracted Google Maps data when calling `openMapModal` to ensure the correct Google Maps URL is available in the map modal.

6. **components/ui/RestaurantCard/RestaurantCardFooter.tsx** (map links component)
   - Update Google Maps link generation to use `source_url` from `mapModalData` if available, fall back to coordinate-based URL. Use latitude/longitude for all other map providers (Waze, Apple Maps, etc.).

[Functions]
Modify component functions to handle new props and logic. No new functions are required, and no functions are removed.

1. **EditListContent (components/pages/EditList.jsx)**
   - Update the main return path (non-loading state) to wrap `<ListForm />` in a container div that includes `<Navbar />`, matching the structure used in the loading state.

2. **ListDetails (app/lists/[id]/page.tsx)**
   - Add `useVisitsData` hook call: `const { visitsData, loadingVisits, handleVisitsDataUpdate } = useVisitsData(restaurants, user);`
   - Update `RestaurantCard` rendering to pass visit-related props:
     ```tsx
     <RestaurantCard 
       key={restaurant.id} 
       restaurant={restaurant} 
       visitsData={visitsData[restaurant.id] || null}
       loadingVisits={loadingVisits}
       onVisitsDataUpdate={handleVisitsDataUpdate}
     />
     ```

3. **GoogleMapsModal (components/ui/RestaurantDetails/GoogleMapsModal.tsx)**
   - Update the "Usar estas informações" button `className` to fix CSS variable syntax and add focus classes:
     ```tsx
     className="flex-1 px-4 py-3 bg-gradient-to-r from-[--green-600] to-[--emerald-600] text-white rounded-xl hover:from-[--green-700] hover:to-[--emerald-700] font-semibold transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
     ```

4. **CreateRestaurantModal (components/restaurant/CreateRestaurantModal.jsx)**
   - When opening the map modal after extracting Google Maps data, pass `source_url`:
     ```tsx
     openMapModal({
       location: extractedData.location,
       latitude: extractedData.latitude,
       longitude: extractedData.longitude,
       source_url: extractedData.source_url
     });
     ```

5. **Map Links Rendering Function (components/ui/RestaurantCard/RestaurantCardFooter.tsx)**
   - Update Google Maps link generation:
     ```tsx
     const { mapModalData } = useModal();
     const googleMapsUrl = mapModalData?.source_url || (mapModalData?.latitude && mapModalData?.longitude 
       ? `https://maps.google.com/?ll=${mapModalData.latitude},${mapModalData.longitude}` 
       : `https://maps.google.com/?q=${encodeURIComponent(mapModalData?.location || '')}`);
     ```
   - Keep Waze, Apple Maps, and other links using coordinates only.

[Classes]
No class definitions are modified. All changes are to functional components using React hooks.

[Dependencies]
No new dependencies are required. All changes use existing packages: Next.js, React, Tailwind CSS, Supabase JS client.

[Testing]
Manual testing is required for each fix:
1. **Navbar Fix**: Navigate to any list, click "Editar", verify the navbar is visible in the edit form view.
2. **Visited Status Fix**: Log in, open a list with restaurants, verify visited/unvisited buttons reflect the user's actual visit status. Toggle a status and verify it updates.
3. **Button CSS Fix**: Open the Google Maps extractor modal, extract data, verify the "Usar estas informações" button has correct gradient, focus state, and no visual artifacts.
4. **Map Links Fix**: Create a new restaurant, extract Google Maps data, open map links, verify Google Maps uses the extracted URL, Waze uses coordinates.

[Implementation Order]
Execute changes in this order to minimize conflicts and ensure dependencies are met:
1. Update `contexts/ModalContext.tsx` to add `source_url` to `MapModalData` (prerequisite for map links fix).
2. Fix missing navbar: Modify `components/pages/EditList.jsx` to include `<Navbar />` in the edit list view.
3. Fix button CSS: Correct Tailwind classes in `components/ui/RestaurantDetails/GoogleMapsModal.tsx`.
4. Fix map links: Update `components/restaurant/CreateRestaurantModal.jsx` to pass `source_url`, then update the map links component to use `source_url` for Google Maps.
5. Fix visited status: Modify `app/lists/[id]/page.tsx` to fetch and pass visit data to `RestaurantCard` components.