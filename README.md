# Frathouse Picasso

A [Next.js](https://nextjs.org) web application hosted on [Render.com](https://render.com).

## Tech Stack

- **Framework:** Next.js (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Hosting:** Render.com

## Getting Started

Install dependencies and run the development server:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

## Project Structure

```
src/
  app/
    layout.tsx    # Root layout
    page.tsx      # Home page
    globals.css   # Global styles
public/           # Static assets
render.yaml       # Render.com deployment blueprint
```

## Deployment

This app is configured for deployment on **Render.com** using the `render.yaml` blueprint.

### Deploy via Render Dashboard

1. Push this repo to GitHub.
2. Go to [Render Dashboard](https://dashboard.render.com/) and click **New > Blueprint Instance**.
3. Connect your GitHub repo.
4. Render will detect `render.yaml` and configure the service automatically.

### Build & Start Commands

- **Build:** `npm install && npm run build`
- **Start:** `node .next/standalone/server.js`

The app uses Next.js **standalone output** mode for an optimized production build.
