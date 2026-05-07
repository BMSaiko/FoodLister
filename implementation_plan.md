# Implementation Plan

[Overview]
Implement support for Google Maps short URLs (e.g., maps.app.goo.gl) when importing restaurant data via the Google Maps modal. Currently, these short URLs (commonly used in mobile shares) cannot be parsed by the existing extractor, as they redirect to full Google Maps URLs with extractable data. The solution involves validating short URLs, resolving them server-side to avoid CORS issues, and extracting data from the final destination URL.

[Types]
No changes to existing type definitions are required. The GoogleMapsData interface remains unchanged, and the new API route uses standard Request/Response types.

[Files]
- **New Files**:
  - `app/api/resolve-google-maps-url/route.ts`: Server-side API route to resolve short Google Maps URLs to their final destination, avoiding CORS issues.
- **Modified Files**:
  - `utils/googleMapsExtractor.ts`: Update `isValidGoogleMapsUrl` to recognize `maps.app.goo.gl` and `goo.gl` as valid Google Maps domains.
  - `components/ui/RestaurantDetails/GoogleMapsModal.tsx`: Modify the `handleExtract` function to call the new API route to resolve short URLs before extracting data. Update user instructions to mention mobile share link support.
- **Deleted Files**: None.
- **Configuration Files**: None.

[Functions]
- **New Functions**:
  - `GET /api/resolve-google-maps-url`: Server-side API route handler that accepts a `url` query parameter, validates it, resolves redirects, and returns the final URL.
- **Modified Functions**:
  - `isValidGoogleMapsUrl` (utils/googleMapsExtractor.ts): Extended to accept `maps.app.goo.gl` and `goo.gl` hostnames.
  - `handleExtract` (GoogleMapsModal.tsx): Updated to first call the new API route to resolve short URLs, then extract data from the resolved URL.
- **Removed Functions**: None.

[Classes]
No class modifications are required. The solution uses existing functions and components.

[Dependencies]
No new dependencies are required. The solution uses existing libraries (Next.js, fetch API, etc.).

[Testing]
- Test the new API route with short URLs to ensure proper resolution.
- Test the Google Maps modal with the example mobile link `https://maps.app.goo.gl/PJcbsRHtRrLMvwaa8` to verify data extraction.
- Test existing full Google Maps URLs to ensure no regressions.
- Test error cases: invalid URLs, resolution failures, API errors.

[Implementation Order]
1. Update `utils/googleMapsExtractor.ts` to validate short Google Maps URLs.
2. Create `app/api/resolve-google-maps-url/route.ts` API route for server-side URL resolution.
3. Update `components/ui/RestaurantDetails/GoogleMapsModal.tsx` to use the new API route and update instructions.
4. Test all changes to ensure functionality and no regressions.