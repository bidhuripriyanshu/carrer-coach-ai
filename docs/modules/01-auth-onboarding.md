# Module 01 — Auth & Onboarding

## Purpose

Authenticate users via Clerk, sync them into the application database, and collect profile data (industry, skills, experience, bio) required for personalized AI features.

---

## Current Implementation

### Key Files

| File | Role |
|------|------|
| `middleware.js` | Protects routes; redirects unauthenticated users |
| `lib/checkUser.js` | Upserts Clerk user → Prisma `User` on page load |
| `components/header.jsx` | Calls `checkUser()` on render |
| `actions/user.js` | `updateUser`, `getUserOnboardingStatus` |
| `app/(main)/onboarding/` | Onboarding form UI |
| `data/industries.js` | Industry + sub-industry options |

### Auth Flow

```text
1. User signs in via Clerk (/sign-in)
2. Header mounts → checkUser() → upsert User { clerkUserId, email, name, imageUrl }
3. Middleware blocks protected routes without session
4. Dashboard checks onboarding → redirect to /onboarding if no industry
5. Onboarding form → updateUser() → AI generates IndustryInsight if missing
```

### Protected Routes (middleware)

- `/dashboard(.*)`
- `/resume(.*)`
- `/interview(.*)`
- `/ai-cover-letter(.*)`
- `/onboarding(.*)`

**Missing:** `/ats-score(.*)`

### Onboarding Data Model

On submit, `updateUser` stores:

- `industry` — slug like `tech-software-development`
- `experience` — years (integer)
- `skills` — string array
- `bio` — professional summary

---

## Server Actions

### `updateUser(data)`

1. Auth check via Clerk
2. Find or create `IndustryInsight` for selected industry (AI call if new)
3. Update `User` with profile fields
4. `revalidatePath("/")`

**Returns:** Updated user object (not `{ success: true }`)

### `getUserOnboardingStatus()`

**Returns:** `{ isOnboarded: boolean }` — true when `user.industry` is set.

---

## Known Gaps

| Issue | Impact | Severity |
|-------|--------|----------|
| Onboarding only enforced on `/dashboard` | Users can skip profile on resume/interview/cover letter | High |
| `onboarding-form.jsx` may check `updateResult?.success` | Redirect after onboarding may not fire | High |
| `checkUser()` swallows errors | Silent auth sync failures | Medium |
| No email verification gate | Low-quality signups | Low |
| No profile edit page post-onboarding | Users can't update industry/skills | Medium |

---

## Recommendations (Product-Grade)

### P0 — Onboarding Middleware

Create a shared onboarding guard used by all `(main)` routes:

```javascript
// lib/requireOnboarding.js
export async function requireOnboarding() {
  const status = await getUserOnboardingStatus();
  if (!status.isOnboarded) redirect("/onboarding");
}
```

Call from each main page server component or a shared `(main)/layout.js`.

### P1 — Profile Settings Module

Add `/settings/profile` for editing industry, skills, experience, bio after onboarding.

### P1 — Fix Onboarding Redirect

Align form handler with `updateUser` return shape:

```javascript
const user = await updateUser(data);
if (user?.industry) router.push("/dashboard");
```

### P2 — Clerk Webhooks

Replace header-time `checkUser()` with Clerk `user.created` / `user.updated` webhooks for reliable DB sync.

---

## Future Implementation Checklist

- [ ] Add `/ats-score` to protected routes in `middleware.js`
- [ ] Enforce onboarding on all `(main)` routes via layout
- [ ] Fix onboarding redirect bug
- [ ] Add `/settings/profile` page
- [ ] Add Clerk webhook handler (`/api/webhooks/clerk`)
- [ ] Add account deletion flow (GDPR)
- [ ] Add `onboardingCompletedAt` timestamp on User model
