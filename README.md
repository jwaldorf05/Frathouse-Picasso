# Frathouse Picasso

A [Next.js](https://nextjs.org) web application hosted on [Vercel](https://vercel.com).

## Tech Stack

- **Framework:** Next.js (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Hosting:** Vercel
- **Payments:** Stripe Checkout

## Getting Started

Install dependencies and run the development server:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

### Environment Variables

Create a `.env.local` file with:

```bash
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

For Vercel production, set:

- `STRIPE_SECRET_KEY`
- `NEXT_PUBLIC_SITE_URL` (your production domain, e.g. `https://yourdomain.com`)

## Project Structure

```
src/
  app/
    layout.tsx    # Root layout
    page.tsx      # Home page
    globals.css   # Global styles
public/           # Static assets
```

## Deployment

This app is configured for deployment on **Vercel**.

### Deploy via Vercel Dashboard

1. Push this repo to GitHub.
2. Import the repository in [Vercel](https://vercel.com/new).
3. Add `STRIPE_SECRET_KEY` and `NEXT_PUBLIC_SITE_URL` in **Project Settings → Environment Variables**.
4. Deploy.

### Build & Start Commands

- **Build:** `npm install && npm run build`
- **Start:** `npm run start`

Stripe Checkout sessions are created server-side via `/api/checkout` and redirect users to Stripe's hosted payment page.
