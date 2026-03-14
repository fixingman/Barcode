# CLAUDE.md

## Project Overview

**Barcode** — Organic grocery order planner. A mobile-first web app for managing grocery lists across multiple providers, with delivery scheduling and organic/value prioritization.

- License: MIT
- Primary branch: `main`
<<<<<<< ours
<<<<<<< ours

## Project State

The repository currently contains only:
- `README.md` — placeholder header
- `LICENSE` — MIT

No source code, build system, dependencies, or tests have been set up.

## Development Notes

- Tech stack is not yet defined
- No build commands exist
- No test commands exist
- No `.gitignore` has been created yet

## Skills

### design-heuristics
Located at `.claude/skills/design-heuristics.md`.

Apply this skill when:
- Reviewing, critiquing, or creating any UI/UX design
- Discussing colors, typography, spacing, buttons, navigation, forms, cards, lists, or modals
- Evaluating accessibility or WCAG compliance
- Working with motion, transitions, or micro-interactions
- Implementing designs in Figma via the API

The skill consolidates the full Design Bible (17 modules, ~3,560 lines) into actionable rules covering: core principles, UX laws (Fitts, Hick, Jakob, Miller, etc.), Gestalt, layout/spacing (8px grid), typography, colors, buttons/CTAs, forms, navigation, cards/lists, feedback states, motion (M3 system), micro-interactions, accessibility (WCAG 2.2), Nielsen's 10 heuristics, anti-patterns, and Figma execution rules.

---

## Getting Started

Once the tech stack is chosen, update this file with:
- Build/run commands
- Test commands
- Environment setup instructions
- Architecture overview
=======
=======
>>>>>>> theirs
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
<<<<<<< ours
>>>>>>> theirs
=======
>>>>>>> theirs
