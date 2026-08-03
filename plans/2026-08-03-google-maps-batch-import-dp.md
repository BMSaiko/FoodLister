---
type: dp
project: FoodLister
title: "DP — Google Maps Batch Import (Approach A + B roadmap)"
date: 2026-08-03
triggered_by: User request — import restaurants from Google Maps list
estimated_effort: "~6h (A) + ~12h (B)"
build_gate: npx tsc --noEmit + npx next build --no-lint
design_system: taste-skill v2.0 (dark theme, anti-slop, motion=intent)
scope: Batch import of restaurants via Google Maps URLs with progress visualization
---

# DP — Google Maps Batch Import

> 2026-08-03 | Feature | ~6h (A) + ~12h (B) | Design: dark theme, existing components
> DR: completed inline | Taste Skill: loaded

## Design Brief

**Reading this as:** A batch import flow where the user pastes multiple Google Maps URLs (one per line), the system extracts data for each, shows a preview with per-row status, and creates all restaurants in a single action. Reuses the existing `GoogleMapsModal` extraction pipeline, `RestaurantFormProgress` for step indication, `RestaurantFormPreview` for card previews, and `RestaurantFormCelebration` for success feedback.

**Three Dials:** VARIANCE: 6 | MOTION: 5 | DENSITY: 3

**Anti-default:** No purple gradients, no glassmorphism, no bounce animations. The progress dashboard is the visual centerpiece — clean, data-dense, status-driven.

---

## Scope

### Phase A — Batch URL Import (MVP)

| Component | Current | Target | Effort |
|-----------|---------|--------|--------|
| Batch import UI | Does not exist | "Importar do Google Maps" button added to RestaurantForm header → opens modal with 3 input tabs (URLs/CSV/JSON) + preview table + progress dashboard | 2h |
| Batch extraction util | `utils/googleMapsExtractor.ts` (single URL) | New `utils/googleMapsBatchExtractor.ts` — parses N URLs, calls extractGoogleMapsData per URL, deduplicates | 1h |
| Batch API route | `app/api/restaurants/route.ts` (single POST, admin-only) | New `app/api/restaurants/batch/route.ts` — accepts array of GoogleMapsData, creates N restaurants. Auth: all authenticated users + admins | 1.5h |
| Progress tracking | Does not exist | Per-URL status tracking (pending → extracting → geocoding → creating → done/fail) with inline status indicators | 1h |
| Error handling | Single-restaurant try/catch | Per-row error capture — failed rows don't block successful ones | 0.5h |
| Post-import prompt | Does not exist | After successful import, show "Finalizar" vs "Adicionar dados" prompt | 0.5h |
| Input formats | — | Support 3 input types: raw URLs (one per line), CSV (url column), JSON (array of url strings) | 0.5h |
| Limit | — | Max 50 URLs per batch | 0.25h |

### Phase B — Google Maps List Scraping (future)

| Component | Target | Effort |
|-----------|--------|--------|
| List URL detection | Extend `isValidGoogleMapsUrl()` to recognize `/maps/d/` paths | 0.5h |
| Server-side scraper | New `app/api/import-google-maps-list/route.ts` — fetches list page, parses embedded JSON for restaurant entries | 4h |
| List import UI | Extend batch import page to accept list URLs alongside individual URLs | 1h |
| Rate limiting | Queue-based processing respecting Nominatim 1 req/sec limit | 1h |

---

## Architecture

### Data Flow (Phase A)

```
User clicks "Importar do Google Maps" button in RestaurantForm header
        │
        ▼
  Modal opens with 3 input tabs:
  ├── Tab 1: Textarea (paste URLs, one per line)
  ├── Tab 2: CSV upload (url column)
  └── Tab 3: JSON upload (array of url strings)
        │
        ▼
  [BatchExtractor.extractAll(urls)]  — max 50 URLs
  ├── For each URL: extractGoogleMapsData(url)
  ├── For each result with coords: OSMService.reverseGeocode(lat, lng)
  ├── Deduplicate by place_id or (lat, lng)
  └── Return Array<{ data: GoogleMapsData, status: 'ready' | 'error', error?: string }>
        │
        ▼
  UI: Preview table inside modal (reuses RestaurantFormPreview card pattern)
  ├── Each row: name | address | coords | status badge | remove button
  ├── "Importar N restaurantes" button (disabled until ≥1 valid)
  └── Per-row error messages inline
        │
        ▼
  User clicks "Importar"
        │
        ▼
  POST /api/restaurants/batch  { restaurants: GoogleMapsData[] }
  Auth: all authenticated users (not admin-only)
        │
        ▼
  Server: for each → POST to Supabase (same shape as single POST)
  ├── Success: cacheInvalidatePrefix('restaurants:')
  └── Per-row result: { id, name, status: 'created' | 'failed', error? }
        │
        ▼
  UI: Progress bar + per-row status update (optimistic → confirmed)
        │
        ▼
  On all done: Post-import prompt inside modal
  ├── List of all imported restaurants with "Abrir restaurante" buttons
  │   └── "Abrir restaurante" → opens `/restaurants/{id}` in new tab via window.open
  └── "Finalizar" → close modal, call onSuccess
  Modal closes, form stays open for more imports
```

### File Changes

**New files:**
1. `utils/googleMapsBatchExtractor.ts` — batch extraction with dedup, 50 URL limit, 3 input formats (URLs/CSV/JSON)
2. `app/api/restaurants/batch/route.ts` — batch creation endpoint (authenticated users + admins)
3. `components/restaurant/GoogleMapsBatchImport.tsx` — batch import UI component (modal content)
4. `components/restaurant/BatchImportProgress.tsx` — progress dashboard

**Modified files:**
1. `utils/googleMapsExtractor.ts` — extend `isValidGoogleMapsUrl()` for `/maps/d/` (Phase B)
2. `components/restaurant/RestaurantForm.tsx` — add "Importar do Google Maps" button to form header, integrate `GoogleMapsBatchImport` modal

**No changes:**
- `components/ui/navigation/Navbar.tsx` — no nav item needed (button is inside RestaurantForm)

**Reused components (no changes):**
- `GoogleMapsModal` — extraction logic (called by BatchExtractor)
- `RestaurantFormProgress` — step indicator (import = step 1, preview = step 2, import action = step 3, done = step 4)
- `RestaurantFormPreview` — card preview pattern for each restaurant row
- `RestaurantFormCelebration` — success feedback (adapted for batch count)
- `Modal` — wrapper for the import modal

---

## UI/UX Design

### Page Layout (`/import-google-maps`)

```
┌─────────────────────────────────────────────┐
│ Navbar                                      │
├─────────────────────────────────────────────┤
│                                             │
│  Importar do Google Maps                    │
│  ─────────────────────────────────────────  │
│                                             │
│  [Step indicator: 1. URLs → 2. Preview →   │
│   3. Importar → 4. Concluído]              │
│                                             │
│  Step 1: Textarea (placeholder com 2-3     │
│  exemplos de URLs)                          │
│  ┌─────────────────────────────────────┐    │
│  │ https://maps.google.com/place/...  │    │
│  │ https://maps.google.com/place/...  │    │
│  │ https://maps.google.com/place/...  │    │
│  └─────────────────────────────────────┘    │
│  "Extrair dados" button                     │
│                                             │
│  Step 2: Preview table                      │
│  ┌──────────┬──────────┬──────┬────────┐   │
│  │ Nome     │ Endereço │Coords│ Status │   │
│  ├──────────┼──────────┼──────┼────────┤   │
│  │ Restaurante│ Rua X  │41.7  │ ✅ Ready│  │
│  │ Outro    │ Rua Y   │—     │ ❌ Sem coords││
│  └──────────┴──────────┴──────┴────────┘   │
│  "Importar N restaurantes" button           │
│                                             │
│  Step 3: Progress dashboard                 │
│  ┌─────────────────────────────────────┐    │
│  │ ████████████░░░░ 6/8 (75%)         │    │
│  │ ✅ Restaurante A — criado           │    │
│  │ ❌ Restaurante B — erro: duplicates │    │
│  │ ⏳ Restaurante C — a criar...       │    │
│  └─────────────────────────────────────┘    │
│                                             │
│  Step 4: Celebration (adapted)              │
│  "8 restaurantes importados com sucesso!"   │
│                                             │
└─────────────────────────────────────────────┘
```

### Progress Dashboard (`BatchImportProgress`)
- Top: progress bar (completed/total) with percentage
- Middle: scrollable list with per-row status icons
  - `✅` created — green
  - `❌` failed — red, show error on hover
  - `⏳` in progress — amber spinner
  - `⏭️` skipped (duplicate) — muted
- Bottom: summary stats (success count, fail count, skip count)
- "Ver restaurantes" link to `/restaurants` on completion

### Visual Reuse
- Step indicator: `RestaurantFormProgress` (4 steps instead of 6)
- Preview cards: `RestaurantFormPreview` pattern (compact table variant)
- Celebration: `RestaurantFormCelebration` (batch count in message)
- Modal wrapper: existing `Modal` component

---

## API Design

### POST /api/restaurants/batch

**Request body:**
```json
{
  "restaurants": [
    {
      "name": "string (required)",
      "location": "string",
      "source_url": "string",
      "latitude": "number | null",
      "longitude": "number | null",
      "address": "string | null",
      "place_id": "string | null"
    }
  ]
}
```

**Response (200):**
```json
{
  "results": [
    { "name": "Restaurante A", "status": "created", "id": "uuid" },
    { "name": "Restaurante B", "status": "failed", "error": "duplicate" },
    { "name": "Restaurante C", "status": "created", "id": "uuid" }
  ],
  "summary": { "total": 3, "created": 2, "failed": 1 }
}
```

**Validation:**
- `name` required per entry (same as single POST)
- Coordinates validated same as single POST (`isValidCoordinates`)
- Duplicate detection: check `source_url` or `place_id` against existing restaurants
- Admin-only (same `requireAdmin` gate as single POST)

---

## Pitfalls & Decisions

1. **Nominatim rate limit (1 req/sec):** Batch geocoding must be sequential with 1s delay between calls. Use `await new Promise(r => setTimeout(r, 1000))` between reverse geocode calls.

2. **Duplicate detection:** Google Maps list often contains the same restaurant multiple times (different URLs, same place). Dedup by `place_id` first, then by `(latitude, longitude)` proximity (< 100m).

3. **Google Maps list pages are JS-rendered:** Phase B scraping cannot use simple `fetch()` — the restaurant data is in JS state, not HTML. Need either: (a) a headless browser (too heavy for serverless), or (b) parse the embedded `APP_INITIALIZATION_STATE` JSON from the HTML response (fragile but works for public lists).

4. **Auth gate:** The batch endpoint uses `requireUser` (not `requireAdmin`). Any authenticated user can import restaurants. This is consistent with the user's request.

5. **`RestaurantFormProgress` has 6 steps for restaurant creation:** For batch import, remap to 4 steps (URL input → Preview → Importing → Done). The component accepts `currentStep` and `onStepClick` — just pass different STEPS array.

---

## Verification

- `npx tsc --noEmit` passes for our files (pre-existing errors in `reviews/[id]/route.ts` unrelated)
- `npx next build --no-lint` passes for our files (pre-existing webpack error in `reviews/[id]/route.ts` unrelated)
- "Importar do Google Maps" button added to RestaurantForm header
- GoogleMapsBatchImport modal opens with 3 input tabs (URLs, CSV, JSON)
- 50 URL limit enforced in `googleMapsBatchExtractor.ts`
- Preview table shows per-row extraction status
- Batch import calls `POST /api/restaurants/batch`
- Progress dashboard shows per-row import status (created/failed)
- All authenticated users can import (not admin-only)
- No Navbar changes (button is inside RestaurantForm)