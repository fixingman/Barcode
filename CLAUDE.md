# CLAUDE.md

## Project Overview

**Barcode** — Organic grocery order planner. A mobile-first web app for managing grocery lists across multiple providers, with delivery scheduling and organic/value prioritization.

- License: MIT
- Primary branch: `main`
- Stack: React 18 + TypeScript + Vite 5

## Design Principles

- Wabi-sabi aesthetic: warm earth tones, aged paper texture, organic shapes
- Typography: DM Serif Display (headings) + DM Sans (body)
- Minimalist, clean UI with brush-stroke accents and grain texture

## Commands

```bash
npm install       # Install dependencies
npm run dev       # Start dev server at http://localhost:5173
npm run build     # Type-check + production build
npm run preview   # Preview production build
```

## Architecture

```
src/
  types.ts           # All TypeScript types
  store.ts           # State persistence (localStorage), utilities
  index.css          # Full design system (CSS variables + components)
  App.tsx            # Main app shell, routing, state
  main.tsx           # Entry point
  components/
    AddItemSheet.tsx      # Bottom sheet: add grocery item
    AddProviderSheet.tsx  # Bottom sheet: add provider
    ItemRow.tsx           # Single grocery item row
    ProviderCard.tsx      # Provider card with delivery info
```

## Key Features

- **Three views**: List (by category), Providers (with delivery schedule), History
- **Providers**: configure delivery days, order cut-off deadlines, urgent alerts
- **Items**: organic flag, priority, value rating, price estimates, recurring/weekly
- **Smart filtering**: by provider or category
- **Delivery scheduling**: calculates next delivery + order deadline per provider
- **Recurring items**: weekly staples can be reset in bulk
- **Persistence**: all data stored in localStorage

## Environment Setup

No environment variables required. Pure client-side app.
