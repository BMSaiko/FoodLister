# FoodLister — Feature Visualization Workflow

Complete guide to view and test all features after setup.

## Prerequisites

```bash
cd foodlister
npm install
cp .env.local.example .env.local  # Fill in your credentials
npm run dev
```

Open: **http://localhost:3000**

---

## Environment Variables Required

| Variable | Required For | How to Get |
|----------|-------------|------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Everything | Supabase Dashboard → Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Everything | Supabase Dashboard → Settings → API |
| `SUPABASE_SERVICE_ROLE_KEY` | Admin APIs | Supabase Dashboard → Settings → API |
| `CLOUDINARY_*` | Image uploads | Cloudinary Dashboard |
| `STRIPE_SECRET_KEY` | Payments | Stripe Dashboard → API keys |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Payments | Stripe Dashboard → API keys |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhooks | Stripe Dashboard → Webhooks |
| `OPENAI_API_KEY` | Marketing AI | platform.openai.com |
| `NEXT_PUBLIC_VAPID_PUBLIC_KEY` | Push notifications | `npx web-push generate-vapid-keys` |
| `VAPID_PRIVATE_KEY` | Push notifications | `npx web-push generate-vapid-keys` |

---

## Feature Testing Workflow

### 1. Core Features (No extra config needed)

**Homepage + Restaurant Discovery:**
1. Open http://localhost:3000
2. Browse restaurant grid
3. Use search bar to filter by name
4. Click filter button → try cuisine, features, dietary filters
5. Click "Aberto Agora" tab → see only open restaurants
6. Click "Ordenar" tab → sort by rating/price/name/popularity

**Restaurant CRUD:**
1. Sign in → Click "+" to create restaurant
2. Fill name, description, location, price, rating
3. Upload image (requires Cloudinary)
4. Save → View detail page
5. Edit → Update fields → Save

**List Management:**
1. Click "Lists" in navbar
2. Create new list (public or private)
3. Add restaurants to list
4. Reorder by dragging
5. Share list → copy link

**Reviews:**
1. Open restaurant detail page
2. Click "Write Review"
3. Rate (1-5 stars) + comment
4. Submit → See on restaurant page

**Meal Scheduling:**
1. Open restaurant detail → "Schedule Meal"
2. Pick date, time, meal type
3. Invite participants
4. View in "Meals" page

---

### 2. Authentication & User Profiles

**Sign Up / Sign In:**
1. Click "Sign In" → "Create Account"
2. Enter email + password
3. Check email for verification link
4. Click link → Account verified

**User Profile:**
1. Click avatar → "Profile"
2. View stats (reviews, restaurants, lists)
3. Edit profile (name, bio, location, website)
4. Toggle public/private profile

**Account Security:**
1. Sign in with wrong password 5 times
2. Account locks for 15 minutes
3. Wait or use "Forgot Password"

---

### 3. Collaboration Features

**List Collaboration:**
1. Open a list you own
2. Click "Share" → "Add Collaborator"
3. Enter user email
4. Collaborator can edit (editor) or view (viewer)

**List Comments:**
1. Open a list
2. Scroll to comments section
3. Write comment → Submit
4. Delete own comments

**List Activity Feed:**
1. Open a list
2. Click "Activity" tab
3. See all changes (restaurant added/removed, list updated, collaborator added)

---

### 4. Admin Dashboard (Requires admin role)

**Setup Admin:**
```sql
-- In Supabase SQL Editor:
UPDATE profiles SET is_admin = true WHERE user_id = 'your-user-uuid';
```

**Access Admin:**
1. Sign in as admin
2. Click avatar → "Admin Dashboard"
3. View statistics (users, restaurants, reviews, lists, meals)
4. Manage users (search, toggle admin)
5. Manage restaurants (list, delete)
6. Manage reviews (list, delete)

---

### 5. Subscription System (Requires Stripe config)

**Setup Stripe:**
1. Create Stripe account at stripe.com
2. Create products: Premium (€4.99/mo, €49.99/yr), Pro (€9.99/mo, €99.99/yr)
3. Copy price IDs to `subscription_plans` table:
```sql
UPDATE subscription_plans SET stripe_price_monthly_id = 'price_xxx' WHERE name = 'Premium';
UPDATE subscription_plists SET stripe_price_yearly_id = 'price_yyy' WHERE name = 'Premium';
-- Same for Pro
```
4. Set `STRIPE_SECRET_KEY`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` in .env.local
5. For webhooks: `stripe listen --forward-to localhost:3000/api/stripe/webhook`

**Test Subscription:**
1. Sign in as regular user
2. Click "Pricing" in navbar
3. View 3 plans (Free, Premium, Pro)
4. Click "Subscribe Monthly" on Premium
5. Stripe Checkout opens → Use test card: `4242 4242 4242 4242`
3. Complete payment → Redirect to success page
4. Profile now shows "Premium" badge

**Feature Gating:**
1. As free user → Visit /pricing → See upgrade CTA
2. As premium user → All premium features unlocked
3. Marketing AI dashboard requires Pro tier

---

### 6. Notifications

**In-App Notifications:**
1. Sign in
2. Perform actions that trigger notifications (add collaborator, etc.)
3. Click bell icon in navbar → See notification dropdown
4. Click notification → Navigate to related content
5. Click "Mark all as read"

**Notification Preferences:**
1. Sign in → Settings → Notifications
2. Toggle: Email, Push, Weekly Digest
3. Toggle: Meal invitations, Collaborator updates, List activity, System updates
4. Changes save automatically

**Push Notifications (Requires VAPID keys):**
```bash
npx web-push generate-vapid-keys
# Copy public key to NEXT_PUBLIC_VAPID_PUBLIC_KEY
# Copy private key to VAPID_PRIVATE_KEY
```
1. Sign in → Settings → Notifications
2. Enable "Push Notifications"
3. Browser asks for permission → Allow
4. Subscribe → Push subscription saved
5. Test: Send push from service worker

---

### 7. Marketing AI (Requires OpenAI API key)

**Setup:**
1. Get API key from platform.openai.com
2. Set `OPENAI_API_KEY` in .env.local
3. Sign in as Pro user (feature gated)

**Test AI Content Generation:**
1. Sign in → Visit /marketing
2. Click "Posts" tab
3. Click "New Post"
4. Select a restaurant
5. Select platform (Twitter, Instagram, etc.)
6. Check "Generate with AI"
7. Click "Create Post"
8. AI generates content → Review draft
9. Edit if needed → Schedule or Publish

**AI Workflows:**
1. In /marketing → "Workflows" tab
2. Click "New Workflow"
3. Set name, trigger type (new restaurant, weekly digest, etc.)
4. Set platform + prompt template
5. Save → Workflow runs automatically on trigger

---

### 8. PWA & Offline

**Install PWA:**
1. Open http://localhost:3000 in Chrome
2. Click install icon in address bar
3. App installs as desktop/mobile app

**Offline Support:**
1. Load the app while online
2. Disconnect from network
3. App still works (cached pages)
4. Service worker serves offline fallback

---

### 9. Testing

**Run Tests:**
```bash
npm test                 # Run all tests
npm run test:watch       # Watch mode
npm run test:coverage    # Coverage report
```

**E2E Tests (Playwright):**
```bash
npm run e2e              # Run E2E tests
npm run e2e:ui           # Run with UI
```

**Storybook:**
```bash
npm run storybook        # Open Storybook at localhost:6006
```

---

## Quick Reference — All Pages

| Page | URL | Auth | Description |
|------|-----|------|-------------|
| Homepage | `/` | No | Restaurant discovery + filters |
| Sign In | `/auth/signin` | No | Login page |
| Sign Up | `/auth/signup` | No | Registration |
| Lists | `/lists` | No | Browse public lists |
| List Detail | `/lists/[id]` | No | View list with restaurants |
| Create List | `/lists/create` | Yes | Create new list |
| Restaurants | `/restaurants` | No | Browse restaurants |
| Restaurant Detail | `/restaurants/[id]` | No | View restaurant |
| Create Restaurant | `/restaurants/create` | Yes | Add new restaurant |
| Meals | `/meals` | Yes | Scheduled meals |
| Notifications | `/notifications` | Yes | In-app notifications |
| Pricing | `/pricing` | No | Subscription plans |
| Subscribe Success | `/subscribe/success` | Yes | Post-checkout |
| Subscribe Canceled | `/subscribe/canceled` | Yes | Canceled checkout |
| Marketing | `/marketing` | Pro | AI marketing dashboard |
| User Profile | `/users/[id]` | No | Public profile |
| Settings | `/users/settings` | Yes | Profile settings |
| Notification Settings | `/users/settings/notifications` | Yes | Notification preferences |
| Admin Dashboard | `/admin` | Admin | Statistics + management |

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Build fails: `STRIPE_SECRET_KEY not set` | Lazy init handles this — ensure `libs/stripe.ts` uses `getStripe()` |
| Build fails: `Module not found: stripe` | Run `npm install stripe @stripe/stripe-js openai web-push` |
| Stripe checkout doesn't work | Set up Stripe products + price IDs in database |
| AI generation fails | Check `OPENAI_API_KEY` is valid |
| Push notifications don't work | Generate VAPID keys + set in env |
| Admin dashboard 403 | Set `is_admin = true` in profiles table |
| Images don't upload | Check Cloudinary env vars |
| Tests fail with mock errors | Known issue — 10 test suites have complex mock chain issues |
