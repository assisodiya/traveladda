# TravelAdda

A Next.js App Router starter with TypeScript and Tailwind CSS for a growing collection of flight and train tools.

## Local development

Use Node.js 24 (`nvm use` reads `.nvmrc`).

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## Production checks

```bash
npm run build
npm start
```

## Project structure

- `src/app/page.tsx`: responsive homepage and planned tool categories
- `src/app/layout.tsx`: shared layout and default SEO metadata
- `src/app/globals.css`: Tailwind import and global styles
- `public/`: static assets

The tool cards are explicitly marked coming soon; travel APIs and individual tools are not implemented yet. Add future tools as individual routes under `src/app/`, with descriptive page metadata and useful content.

Before deployment, configure your real domain for canonical URLs, a sitemap, robots directives, and social sharing metadata. No production domain is assumed in this starter.

Based on the official create-next-app Tailwind starter: https://nextjs.org/docs/app/getting-started/installation

## Verification notes

TypeScript validation: `npx tsc --noEmit`. The production build needs an environment that allows Turbopack to open a local port; the restricted setup environment blocks this. npm reported 16 moderate dependency vulnerabilities during installation; review these before production deployment.
