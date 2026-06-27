---
type: dp
project: FoodLister
title: "DP — Notifications Dropdown & ScheduleMealModal Refactor"
date: 2026-06-28
triggered_by: DR research/2026-06-28-notifications-meals-refactor-dr.md
estimated_effort: "~4h"
build_gate: npx tsc --noEmit + npx next build --no-lint
design_system: taste-skill v2.0 (dark theme, anti-slop, motion=intent)
scope: UI refactor — NotificationsDropdown + ScheduleMealModal
---

# DP — Notifications & Meals Modal Refactor

> 2026-06-28 | UI/UX Focus | ~4h | Design: dark theme, motion-as-intent
> DR: `research/2026-06-28-notifications-meals-refactor-dr.md`
> Taste Skill: loaded (dark theme default, anti-default discipline, motion=intent)

## Design Brief

**Reading this as:** Product notification center + meal scheduling wizard for food-savvy users, with a dark editorial aesthetic, leaning toward Linear-tier design system with intentional micro-interactions.

**Three Dials:** VARIANCE: 7 | MOTION: 4 | DENSITY: 3

**Anti-default:** No purple gradients, no glassmorphism, no bounce animations, no Inter font.

## Scope

| Component | Current | Target | Effort |
|-----------|---------|--------|--------|
| NotificationsDropdown.tsx (311L) | Monolithic, motion-heavy | Split: NotificationItem + NotificationGroup + hooks | 2h |
| ScheduleMealModal.tsx (440L) | Single-file wizard | Multi-step wizard (3 steps) | 2h |

---

## Fase 1: NotificationsDropdown Refactor (2h)

### Current Problems
1. 311L single file — handles icon mapping, time formatting, dropdown animation, item rendering
2. `motion/react` animations on every item (heavy re-render)
3. No group-by-date (flat list)
4. No "mark all as read" button
5. No empty state illustration
6. Polling indicator is just a number — no visual feedback

### Architecture (Split)

```
components/ui/notifications/
  ├── NotificationsDropdown.tsx (~80L) — trigger button + dropdown container
  ├── NotificationItem.tsx (~50L) — single notification row
  ├── NotificationGroup.tsx (~40L) — date group header + list
  ├── NotificationEmptyState.tsx (~30L) — illustration + CTA
  └── NotificationBadge.tsx (~20L) — unread count pulse
```

### Design Specs (Taste Skill Applied)

**Dropdown Container:**
- `max-w-sm w-full` (384px, mobile-friendly)
- `max-h-[70vh]` with internal scroll
- `rounded-2xl` with `ring-1 ring-white/[0.08]`
- No `motion` animation on open — CSS `transition-all duration-200 ease-out`
- Backdrop: `bg-black/40 backdrop-blur-sm` (click to close)

**Groups:**
- Sticky group headers: `sticky top-0 z-10 bg-[var(--card-bg)]/95 backdrop-blur-sm`
- Group labels: `text-[10px] uppercase tracking-wider text-white/25 font-medium`
- Groups: "Hoje", "Esta semana", "Mais antigo" (relative date grouping)

**Notification Item:**
- Hover: `bg-white/[0.04]` (subtle, no motion)
- Unread indicator: `w-2 h-2 rounded-full bg-amber-500` (left side)
- Icon: 32x32 rounded-lg with type-specific bg color
- Title: `text-sm text-white/85 font-medium truncate`
- Subtitle: `text-xs text-white/40 truncate`
- Time: `text-[10px] text-white/25` (formatTimeAgo)
- Active/focus: `ring-1 ring-amber-500/50 bg-amber-500/5`

**Empty State:**
- Centered illustration (Bell icon, 48x48, `text-white/10`)
- Title: "Tudo limpo!" `text-white/60 font-medium`
- Subtitle: "As tuas notificacoes aparecem aqui" `text-white/30 text-sm`

**Mark All Read:**
- Text button: "Marcar todas como lidas"
- Sticky footer or header right side
- Only visible when unread > 0
- `text-xs text-amber-400/70 hover:text-amber-400 transition-colors`

### Code Patterns

```typescript
// No motion — CSS transitions only
<div className={`overflow-hidden transition-all duration-200 ease-out
  ${isOpen ? 'max-h-[70vh] opacity-100' : 'max-h-0 opacity-0'}`}>

// Unread dot
{!notification.read && (
  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-2 h-2 
    rounded-full bg-amber-500 animate-pulse" />
)}
```

### Files to Change
1. `components/ui/navigation/NotificationsDropdown.tsx` — rewrite (keep export API)
2. `components/ui/notifications/NotificationItem.tsx` — NEW
3. `components/ui/notifications/NotificationGroup.tsx` — NEW
4. `components/ui/notifications/NotificationEmptyState.tsx` — NEW

### Verification
- Desktop: dropdown opens with click, shows groups, scroll works
- Mobile: full-width dropdown, touch targets >=44px, no horizontal scroll
- Keyboard: ArrowUp/Down navigates, Enter opens, Escape closes
- Screen reader: proper aria-labels, role="listbox", aria-live="polite"
- `npx tsc --noEmit`

---

## Fase 2: ScheduleMealModal Refactor (2h)

### Current Problems
1. 440L single component — search, date, time, participants, validation all in one
2. No step validation (can submit empty form)
3. User search is inline — should be dedicated step
4. No visual progress indicator
5. Heavy re-renders (all state in one useState cluster)

### Architecture (Multi-Step Wizard)

```
components/ui/RestaurantDetails/
  ├── ScheduleMealModal.tsx (~60L) — wizard container + navigation
  └── steps/
      ├── MealDetailsStep.tsx (~100L) — date, time, meal type, duration
      ├── ParticipantsStep.tsx (~100L) — search + selected list
      └── ConfirmStep.tsx (~60L) — review + submit
```

### Design Specs (Taste Skill Applied)

**Modal Container:**
- `max-w-md` (448px) — narrower than current, more focused
- `rounded-2xl` with `ring-1 ring-white/[0.08]`
- Step indicator: 3 dots at top, `w-2 h-2 rounded-full`
  - Active: `bg-amber-500`
  - Completed: `bg-amber-500/40`
  - Pending: `bg-white/10`
- Transitions: CSS `translate-x` with `transition-transform duration-200`

**Step 1 — Meal Details:**
- Date input: native `type="date"` styled with dark theme
- Time input: native `type="time"`
- Meal type: horizontal scroll pills
  - Inactive: `bg-white/[0.04] text-white/50`
  - Active: `bg-amber-500 text-black`
  - Hover: `bg-white/[0.08]`
- Duration: 30min increments, 1h-4h range
- Layout: `space-y-5` with labels `text-xs text-white/40 uppercase tracking-wider`

**Step 2 — Participants:**
- Search input: debounce 300ms, loading spinner
- Results: dropdown below input, max 5, click to add
- Selected: chip list with remove, `bg-white/[0.06] rounded-full px-3 py-1`
- Empty hint: "Adiciona amigos para esta refeição"
- Validation: min 1 participant (besides self)

**Step 3 — Confirm:**
- Summary card: restaurant, date/time, participants count
- Google Calendar toggle: switch component (amber when on)
- Submit: "Agendar Refeicao" full-width, `bg-amber-500 text-black font-medium`
- Loading: spinner + "A agendar..."

**Navigation:**
- Back/Next buttons at bottom (not sticky — within modal scroll)
- Back disabled on step 1
- Next disabled until step valid
- Submit on step 3
- `text-sm font-medium` with `transition-colors`

### Code Patterns

```typescript
// Step indicator dots
<div className="flex items-center justify-center gap-2 py-4">
  {[1, 2, 3].map(step => (
    <div key={step} className={`w-2 h-2 rounded-full transition-colors duration-200
      ${step === currentStep ? 'bg-amber-500' : 
        step < currentStep ? 'bg-amber-500/40' : 'bg-white/10'}`} />
  ))}
</div>

// Horizontal scroll pills (meal types, no motion)
<div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
  {MEAL_TYPES.map(type => (
    <button key={type.value} className={`flex-shrink-0 px-3 py-1.5 rounded-full 
      text-xs font-medium transition-colors
      ${selectedType === type.value 
        ? 'bg-amber-500 text-black' 
        : 'bg-white/[0.04] text-white/50 hover:bg-white/[0.08]'}`}>
      {type.icon} {type.label}
    </button>
  ))}
</div>

// Navigation buttons
<div className="flex gap-3 pt-4 border-t border-white/[0.06]">
  {currentStep > 1 && (
    <button onClick={goBack} className="flex-1 py-2.5 rounded-xl text-sm 
      font-medium text-white/60 hover:text-white/80 transition-colors
      bg-white/[0.04] hover:bg-white/[0.06]">
      Voltar
    </button>
  )}
  <button onClick={goNext} disabled={!isValid} className="flex-1 py-2.5 rounded-xl 
    text-sm font-medium transition-colors bg-amber-500 text-black
    hover:bg-amber-400 disabled:opacity-40 disabled:cursor-not-allowed">
    {currentStep === 3 ? 'Agendar' : 'Proximo'}
  </button>
</div>
```

### Files to Change
1. `components/ui/RestaurantDetails/ScheduleMealModal.tsx` — rewrite as wizard container
2. `components/ui/RestaurantDetails/steps/MealDetailsStep.tsx` — NEW
3. `components/ui/RestaurantDetails/steps/ParticipantsStep.tsx` — NEW
4. `components/ui/RestaurantDetails/steps/ConfirmStep.tsx` — NEW

### Verification
- Desktop: 3-step wizard, smooth transitions, validation works
- Mobile: full-width steps, keyboard doesn't hide inputs
- Submit: creates meal + sends notifications to participants
- `npx tsc --noEmit`

---

## Build Gates

| Gate | Command | When |
|------|---------|------|
| Type check | `npx tsc --noEmit` | After each phase |
| Build | `npx next build --no-lint` | After all phases |

## Commit Strategy

- Commit 1: `refactor: split NotificationsDropdown into components + groups + empty state`
- Commit 2: `refactor: split ScheduleMealModal into 3-step wizard`
