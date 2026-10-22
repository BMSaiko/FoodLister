# Design System

## Brand Identity
- **Brand Name:** FoodLister
- **Brand Description:** O teu diário de descobertas gastronómicas — encontra, organiza e partilha os melhores restaurantes.
- **Tone of Voice:** Editorial + casual ("Nunca mais esqueca um lugar incrível", "O teu próximo jantar perfeito começa aqui")
- **Language:** Português (PT) com fallback EN
- **Voice characteristics:** Warm, inviting, slightly editorial. 404/error states com tom humorístico leve (easter eggs).

## Color Palette

### Theme Approach
**Dark-only** por design. `data-theme="dark"` no `<html>`. Background base: `#050505` (quase preto). Foreground: `#f5f5f5`. Todas as cores usam CSS variables — **NUNCA** hardcoded colors em componentes.

### Primary Colors
| Token | Hex | Usage |
|-------|-----|-------|
| `--primary` | `#f59e0b` (amber-500) | CTA, brand, accent principal |
| `--primary-light` | amber 8% | Bg de botões hover, notification-unread |
| `--primary-lighter` | amber 6% | Mesh gradient background |
| `--primary-foreground` | `#f5f5f5` | Texto sobre primary |

### Semantic Colors
| Token | Hex | Usage |
|-------|-----|-------|
| `--success` | `#22c55e` (green-500) | Success feedback, valid states |
| `--warning` | `#f59e0b` (amber-500) | Warnings, pending states |
| `--error` | `#ef4444` (red-500) | Error feedback, validation errors |
| `--info` | `#3b82f6` (blue-500) | Info messages, links |

### Gray Scale (rgba white-based — dark theme)
| Token | Value | Usage |
|-------|-------|-------|
| `--gray-50` | `rgba(255,255,255,0.04)` | Super subtle backgrounds |
| `--gray-100` | `rgba(255,255,255,0.06)` | Cards, surfaces |
| `--gray-200` | `rgba(255,255,255,0.08)` | Borders |
| `--gray-300` | `rgba(255,255,255,0.10)` | Stronger borders |
| `--gray-400` | `rgba(255,255,255,0.15)` | Input borders |
| `--gray-500` | `rgba(255,255,255,0.25)` | Secondary text |
| `--gray-600` | `rgba(255,255,255,0.40)` | Muted text |
| `--gray-700` | `rgba(255,255,255,0.60)` | Secondary foreground |
| `--gray-800` | `rgba(255,255,255,0.80)` | Body text |
| `--gray-900` | `rgba(255,255,255,0.95)` | Primary foreground |

### Accent Colors
| Token | Hex | Usage |
|-------|-----|-------|
| `--amber` | `#f59e0b` scale 50-800 | Ratings, warm accents |
| `--orange` | `#f97316` scale 50-800 | Warm accents |
| `--yellow` | `#eab308` scale 50-800 | Highlights |
| `--green` | `#22c55e` scale 50-800 | Success |
| `--red` | `#ef4444` scale 50-800 | Error, delete |
| `--blue` | `#3b82f6` scale 50-800 | Links, info |
| `--purple` | `#a855f7` scale 50-800 | Badges, charts, hero accents |
| `--pink` | `#ec4899` scale 50-800 | Rare accents |
| `--teal` | `#14b8a6` scale 50-800 | Rare accents |

### Surface Colors
| Token | Hex | Usage |
|-------|-----|-------|
| `--background` | `#050505` | Base background |
| `--background-secondary` | `#0a0a0a` | Nested surfaces |
| `--background-tertiary` | `#111111` | Deep nested |
| `--card-bg` | `#0a0a0a` | Card backgrounds |
| `--card-border` | `rgba(255,255,255,0.08)` | Card borders |
| `--card-shadow` | 3-layer shadow | Card elevation |
| `--input-border` | `rgba(255,255,255,0.15)` | Input borders |
| `--foreground-secondary` | `rgba(255,255,255,0.6)` | Texto secundário |
| `--foreground-muted` | `rgba(255,255,255,0.4)` | Texto mutado |

## Typography

### Font Families
- **Primary Font:** `Geist` (next/font/google, weight variable) — `--font-geist-sans`
- **Secondary Font:** `Geist Mono` — `--font-geist-mono` (code, pre, monospace tracking)
- **System Fallback:** `system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`

### Font Scale
| Token | Size | Weight | Line Height | Usage |
|-------|------|--------|-------------|-------|
| `--text-xs` | `0.75rem` | 400 | 1.25 | Tags, captions |
| `--text-sm` | `0.875rem` | 400 | 1.5 | Body small, metadata |
| `--text-base` | `1rem` | 400 | 1.625 | Body text |
| `--text-lg` | `1.125rem` | 500 | 1.5 | Subheadings |
| `--text-xl` | `1.25rem` | 600 | 1.4 | Section headings |
| `--text-2xl` | `1.5rem` | 700 | 1.3 | Page titles |
| `--text-3xl` | `1.875rem` | 700 | 1.2 | Hero headings |
| `--text-4xl` | `2.25rem` | 700 | 1.1 | Landing hero |
| `--text-5xl` | `3rem` | 700 | 1.1 | Large landing titles |
| `--text-6xl` | `3.75rem` | 700 | 1.1 | Display titles |

### Special Typography
- **Hero:** `text-4xl md:text-5xl lg:text-6xl font-bold tracking-tighter leading-[1.1]`
- **Body large:** `text-base md:text-lg` com `leading-relaxed`
- **Eyebrow text:** `tracking-[0.2em]` uppercase, font-mono
- **Mono labels:** `font-mono` — editorial flavor ("FoodLister Journal")
- **Tracking tightened:** `tracking-tighter` em headlines

## Spacing System
- **Base unit:** `4px`
- **Scale:** `0, 1, 2, 3, 4, 5, 6, 8, 10, 12, 16, 20, 24, 32, 40, 48, 64` (multipliers de 4px)

| Token | Value |
|-------|-------|
| `--space-1` | `4px` |
| `--space-2` | `8px` |
| `--space-3` | `12px` |
| `--space-4` | `16px` |
| `--space-5` | `20px` |
| `--space-6` | `24px` |
| `--space-8` | `32px` |
| `--space-10` | `40px` |
| `--space-12` | `48px` |
| `--space-16` | `64px` |

### Spacing Standards
- Card padding: `p-4 md:p-5`
- Section gaps: `gap-3` (small), `gap-4` (medium), `gap-12` (hero)
- Touch targets: `min-height: 44px` enforced via `@media (pointer: coarse)`
- Container: `Container` component (`components/ui/Container.tsx`)

### Tailwind Config (`tailwind.config.js`)
- **Primary colors:** `primary: { DEFAULT: '#f59e0b', light: '#fde68a', dark: '#b45309' }` — mapped to CSS vars
- **BorderRadius mapping:** `sm`, `md`, `lg`, `xl`, `2xl`, `3xl`, `full` → CSS variables (`var(--radius-sm)`, etc.) — 1:1 mapping com globals.css
- **Custom animations:** `fade-in` (0.5s ease-in-out), `slide-up` (0.3s ease-out) — definidos em `keyframes`
- **Content paths:** `app/**/*.{js,ts,jsx,tsx}`, `components/**/*.{js,ts,jsx,tsx}`

## Border Radius
| Token | Value | Usage |
|-------|-------|-------|
| `--radius-sm` | `0.125rem` (2px) | Micro accents |
| `--radius-md` | `0.375rem` (6px) | Tags, badges |
| `--radius-lg` | `0.5rem` (8px) | Cards default |
| `--radius-xl` | `0.75rem` (12px) | Cards, buttons default |
| `--radius-2xl` | `1rem` (16px) | Modais, sheets |
| `--radius-3xl` | `1.5rem` (24px) | Bottom sheets (top corners) |
| `--radius-full` | `9999px` | Pills, roulette wheel |

Mapping: `borderRadius` no `tailwind.config.js` mapeia vars 1:1 (ponte Tailwind ↔ CSS var).

## Responsive Breakpoints
| Token | Min Width | Max Width | Usage |
|-------|-----------|-----------|-------|
| `--breakpoint-sm` | `640px` | | Sm breakpoint |
| `--breakpoint-md` | `768px` | | Breakpoint principal mobile-first |
| `--breakpoint-lg` | `1024px` | | Breakpoint principal desktop |
| `--breakpoint-xl` | `1280px` | | Large desktop |

- **Mobile-first:** `md:` (768px) e `lg:` (1024px) são os breakpoints principais
- Bottom tab bar em mobile, navbar desktop
- `min-h-[100dvh]` em vez de `100vh` (mobile viewport unit)
- `safe-top/bottom/left/right` utility classes (`env(safe-area-inset-*)`)

## Reusable Components

### `<Card>`
- **Description:** Componente de card versátil com variantes default/elevated/outlined, wrap em framer-motion para interatividade.
- **Props:** `variant` (default/elevated/outlined), `interactive` (hover lift), `className`, `children`
- **Usage Example:**
  ```tsx
  <Card variant="elevated" interactive>
    <Card.Header>...</Card.Header>
    <Card.Footer>...</Card.Footer>
  </Card>
  ```
- **Variants:** default, elevated, outlined
- **Accessibility:** `role="article"`, `aria-label` opcional

### `<RestaurantGrid>`
- **Description:** Grid de restaurantes em layout masonry CSS columns (1 col mobile, 2 sm, 3 lg).
- **Props:** `restaurants[]`, `variant` (default)

### `<RestaurantMap>`
- **Description:** Mapa interativo com Leaflet + react-leaflet-cluster. OpenStreetMap tiles (sem API key).
- **Props:** `restaurants[]`, `selectedId`, `focusCenter`, `focusZoom`, `userLocation`

### `<RestaurantRoulette>`
- **Description:** Componente de roleta de restaurantes com swipe (mobile) e seleção aleatória.
- **Props:** `restaurants[]`, `selectedId`

### `<Skeleton>`
- **Description:** Esqueleto de loading com pulse shimmer.

### `<Tooltip>`
- **Description:** Tooltip component (radix-ui).

### `<Nearby>`
- **Description:** Bar de restaurantes próximos (geolocation).
- **Props:** `loading`, `error`, `locationError`, `requestLocation`

### `<RestaurantManagement>`
- **Description:** Dashboard de gestão de restaurantes para admin.

### `<GlobalSearch>`
- **Description:** Command palette ⌘K (10.9KB). Mountado uma vez em `app/layout.js`.

### `<Modal>`
- **Description:** Sistema de modal custom com 3 variantes (dialog, bottom-sheet, full-screen). Portal-based para evitar stacking-context bugs.
- **Props:** `variant` (dialog/bottom-sheet/full-screen), `isOpen`, `onClose`, `size` (sm/md/lg/xl/full), `closeOnEsc`, `closeOnBackdrop`, `ariaLabel`
- **Variants:** dialog, bottom-sheet, full-screen
- **A11y:** `aria-hidden="true"` + `inert` no `<main>` quando aberto, focus trap nativo

### `<common/>
- **Description:** 15+ helpers — FAQSection, EmptyState, PerformanceDashboard, PriceLevelDisplay, ReportButton, ScrollToTopButton, TruncateText, MentionInput/Text, MultiplePhoneInput, CreatorLink, FormActions, FormSection, ErrorBoundary

### `<Button>`
- **Description:** Botão primário/secondary com `min-height: 44px`, magnetic-hover (translateY -1px), glass variants.
- **Variants:** primary, secondary, ghost, outline
- **A11y:** `min-height: 44px` via `@media (pointer: coarse)`

### `<Input>`
- **Description:** Input field com label, validation states, CSS variable borders.
- **Props:** `label`, `error`, `disabled`, `placeholder`

### `<FeatureGate>`
- **Description:** Componente de gating de features baseado em tier (free < premium < pro).
- **Props:** `feature` (string key), `children`, `fallback`
- **Usage:** `<FeatureGate feature="ai_marketing"><MarketingDashboard /></FeatureGate>`

### `<RestaurantCard>`
- **Description:** Card de restaurante decomposto em 6 sub-componentes (Header, Footer, Categories, Actions, ImagePlaceholder). Composition > monolith.
- **Composition:** index.tsx + Header + Footer + Categories + Actions + ImagePlaceholder

### `<RestaurantDetails>`
- **Description:** Página de detalhes do restaurante com 20 sub-componentes (HeroSection, MenuCarousel, ReviewsFeed, ReviewForm, RestaurantStickyNavbar, etc.).
- **Structure:** Domain-driven numa única page route (`app/restaurants/[id]/page.tsx` 31KB)

### `<GlobalSearch>`
- **Description:** Command palette ⌘K (10.9KB). Mounted once in `app/layout.js`.
- **A11y:** Keyboard nav, ESC close

### `<Navbar>`
- **Description:** Top navbar desktop (17KB) com glass effect, scroll-shrink (72px → 56px), logo-breathe animation, language combobox, notifications dropdown.
- **Features:** `navbar-glass`, scroll shrink, `magnetic-hover` links

### `<LoadingProvider>` / `<PageLoader>`
- **Description:** Loading states globais. `PageLoader` com 3 keyframes (`loader-spin/spin-reverse/pulse`). `prefers-reduced-motion` desativa loader animations.

### `<Glass>` system
| Variant | CSS | Usage |
|---------|-----|-------|
| `.glass` | bg rgba(255,255,255,0.03) + backdrop-blur(12px) + border 0.06 | Navbar, dropdowns |
| `.glass-strong` | bg rgba(255,255,255,0.06) + backdrop-blur(20px) + border 0.10 | Modais |
| `.glass-card` | glass + radius xl + transition + hover lift + shadow 8/32 | Cards interativos |
| `.navbar-glass` | rgba(10,10,10,0.8) blur(24px) border 0.08 | Navbar |

## Animations & Motion

**Stack:** `framer-motion ^12.27.5` + CSS `@keyframes`. Padrão 0.2-0.3s com `cubic-bezier(0.16, 1, 0.3, 1)` (easeOutExpo).

| Nome | Uso | Detalhe |
|---|---|---|
| `fadeUp` | page enter | opacity + translateY 16px + blur 4px |
| `fadeIn` | generic fade | opacity only |
| `slideInRight` | panels | translateX 20px |
| `modalIn/Out` + `backdropIn/Out` | modais | scale 0.95→1 + translateY 8px |
| `sheetIn/Out` | bottom sheets | translateY 100%→0 |
| `pulse-glow` | primary CTAs | box-shadow amber oscillation |
| `notification-glow` | bell badge | amber box-shadow ring |
| `card-image-zoom` | restaurant cards | scale(1.05) on `.group:hover` 0.5s |
| `particle-burst` | celebration after submit | CSS var `--tx/--ty` per particle |
| `loader-spin/spin-reverse/pulse` | loaders | com `prefers-reduced-motion` |

**Prefers-reduced-motion:** Desliga loaders. Resto não tem override explícito (gap conhecido — potential a11y improvement).

## Glass System (efeito distintivo)

3 níveis de "ethereal glass" definidos em `globals.css`:
```css
.glass         { bg rgba(255,255,255,0.03);  backdrop-blur(12px); border 0.06 }
.glass-strong  { bg rgba(255,255,255,0.06);  backdrop-blur(20px); border 0.10 }
.glass-card    { glass + radius xl + transition + hover lift + shadow 8/32 }
```

## i18n
- `LanguageContext` + `LanguageCombobox` (PT default, EN suportado)
- Microcopy hardcoded em PT/EN nos componentes (sem i18n framework)
- Date/number formatting via `Intl` API nativa
- `lang="pt"` no `<html>`

## A11y
- `aria-hidden` + `inert` no main quando modal aberto
- Focus management nos modais (escape + backdrop)
- `prefers-reduced-motion` respeitado em loaders
- 44px touch targets em `@media (pointer: coarse)`
- Color contrast: dark theme (#f5f5f5 sobre #050505 = 19.5:1 AAA)
- Keyboard nav nativa (Tab, Enter, Esc)
- Gap: sem audit a11y formal (axe-core), sem skip-to-content link, alguns modais com botao X não funcional

## PWA Design
- `manifest.json` em `/public`
- `next-pwa` service worker (auto-generated)
- Theme color: `#050505` (status bar match dark)
- `viewportFit: 'cover'` para safe areas
- `min-h-[100dvh]` em vez de `100vh`
- Install prompt no NavbarActions/NotificationsDropdown

## Component Conventions
- **Default Server Component** — `'use client'` só quando necessário
- **Naming:** PascalCase components (.tsx), camelCase hooks/libs, kebab-case tipos
- **Composition > monolith** — RestaurantCard/RestaurantDetails decompostos
- **Re-exports via index** — `components/index.ts` barrel
- **Feature gates** — `<FeatureGate feature="key">` com tier hierarchy
- **Types** — `libs/types.ts` (domínio), `types/database.ts` (Supabase gerados)

## Claude Design (design system para mockups)

O design system FoodLister vive no projeto **«FoodLister»** do Claude Design (`e5405688-d8f4-4a4b-aa8c-06eb00e00533`), criado com `/design-sync` a partir de `app/globals.css`, `tailwind.config.js` e `components/ui/*` (só leitura; o código não foi alterado).

- **Conteúdo:** `tokens.css` (bloco `:root` copiado), cartões de cores, tipografia (Geist), raios e sombras, ícones (roleta, «+», sino, pin, marcador, lista), mascote Tovi (6 expressões) e componentes botão, cartão de restaurante (Tovi quando não há imagem) e navbar (logo, links, pesquisa centrada com `Ctrl K`, «+», roleta, sino e avatar com sessão; só «Entrar» sem sessão).
- **Tema:** escuro único (fundo `#050505`, primário âmbar `#f59e0b`). Espaçamento e escala tipográfica são os do Tailwind por defeito.
- **Fonte de verdade:** o código. Se `globals.css` mudar, voltar a correr `/design-sync` para atualizar os tokens.
- **Uso:** os SPs `foodlister-reformular-*-mockups` geram os mockups com `/design` com este design system.
