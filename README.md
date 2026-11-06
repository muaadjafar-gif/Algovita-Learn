# Algovita Learn - LMS by Algovita Digital

Production-ready Learning Management System: Next.js (App Router, TypeScript, `src/` layout), Tailwind CSS v4, MongoDB (Mongoose) and Razorpay payments. UI follows the Supahub style reference (violet `#862fe7` on white, Bricolage Grotesque + Inter, gradient orbs, 12px buttons, pill avatars).

## Quick start (Windows friendly)

```bash
npm install
copy .env.example .env.local      # then fill in the values
npm run seed                      # loads 7 courses + creates your admin account
npm run dev                       # runs: next dev --webpack
```

Open http://localhost:3000. Log in with `ADMIN_EMAIL` / `ADMIN_PASSWORD` to reach `/admin`.

Requires Node 20.9+ (Next.js 16). `dev` and `build` use `--webpack`, so Turbopack is never involved.

## Environment variables

| Variable | Purpose |
|---|---|
| `MONGODB_URI` | MongoDB connection string |
| `JWT_SECRET` | 32+ char random string for session tokens |
| `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET` | Razorpay API keys (use `rzp_test_` while developing) |
| `RAZORPAY_WEBHOOK_SECRET` | Secret you set on the Razorpay webhook |
| `NEXT_PUBLIC_SITE_URL` | Public URL (metadata) |
| `ADMIN_NAME`, `ADMIN_EMAIL`, `ADMIN_PASSWORD` | Used by `npm run seed` to create the first admin |

## Razorpay flow

1. `POST /api/payments/create-order` - server loads the course price from MongoDB (the client never sets the amount), creates a Razorpay order and a `Payment` record.
2. Browser opens Razorpay Checkout with the returned `orderId`.
3. On success the browser calls `POST /api/payments/verify`; the server verifies the HMAC-SHA256 signature (`order_id|payment_id`) with a timing-safe compare, marks the payment `paid` and activates the enrollment.
4. `POST /api/payments/webhook` is the safety net if the buyer closes the tab: add `https://YOUR-DOMAIN/api/payments/webhook` in Razorpay Dashboard > Webhooks with events `payment.captured`, `order.paid`, `payment.failed`. Both paths share one idempotent function, so no duplicate enrollments.

For local webhook testing use a tunnel (ngrok / cloudflared).

## Route protection

`src/proxy.ts` (Next 16's replacement for middleware) guards `/dashboard/*` (any logged-in user) and `/admin/*` (admin role). Every admin API route also re-checks the role server-side.

## Hydration safety

The footer year is set in `useEffect`/`useState`, scroll-reveal is armed after mount, and auth state loads client-side with a stable skeleton, so server and client HTML match.

## File tree

```
algovita-lms/
├─ package.json  tsconfig.json  next.config.ts  postcss.config.mjs
├─ .env.example  .gitignore  README.md
├─ scripts/seed.ts
└─ src/
   ├─ proxy.ts
   ├─ types/index.ts
   ├─ models/        User.ts  Course.ts  Enrollment.ts  Payment.ts
   ├─ lib/           db.ts  jwt.ts  auth.ts  api.ts  client.ts  validators.ts
   │                 razorpay.ts  fulfil.ts  data.ts  seed-data.ts  utils.ts
   ├─ components/    AuthProvider  Navbar  Footer  Logo  Reveal  ProgressBar
   │                 CourseCard  CatalogClient  EnrollButton  AuthForm  HeroPreview
   │  └─ admin/      AdminOverview  AdminCourses  CourseForm  AdminStudents  AdminEnrollments
   └─ app/
      ├─ globals.css  layout.tsx  page.tsx  not-found.tsx
      ├─ login/  register/
      ├─ courses/  courses/[slug]/
      ├─ dashboard/  dashboard/learn/[slug]/
      ├─ admin/
      └─ api/
         ├─ auth/        register  login  logout  me
         ├─ courses/     (list)  [slug]
         ├─ enrollments/ (mine, free enroll)  [courseId]/progress
         ├─ learn/[slug]
         ├─ payments/    create-order  verify  webhook
         └─ admin/       stats  courses  courses/[id]  students  students/[id]
                         enrollments  enrollments/[id]
```

## Before going live

- Replace the sample testimonials and copy on the landing page (`src/app/page.tsx`) with real ones.
- Add lesson video URLs (YouTube/Vimeo) per lesson from Admin > Courses > Edit.
- Switch to live Razorpay keys, set a strong `JWT_SECRET`, and serve over HTTPS.
- Consider rate limiting `/api/auth/*` (e.g. Upstash) for public traffic.
