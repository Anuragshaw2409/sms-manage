# Coding Conventions
This document dictates the standard patterns and conventions in the codebase.

## Framework Usage
- **Next.js**: Preferred pattern is Server Components natively for fetching and Layouts/Pages for structured navigation. `use client` is explicitly required for any components requiring user interactivity (states, hooks, effects).
- **Styling**: `cn()` utility from `lib/utils` is widely adopted to merge Tailwind classes and avoid conditional logic hell.
- **Component Primitives**: shadcn/ui. Avoid deviating from its standard accessibility guarantees unless explicitly extending a primitive.

## File Organization
- Component filenames should be in `kebab-case.tsx` (e.g. `data-table.tsx`, `chart-area-interactive.tsx`).

## Tools & Linters
- Code is enforced to be strictly typed in TypeScript (`strict` true).
- ESLint ensures standard Next.js conventions (`eslint-config-next`) run gracefully against the code. Next formatting limits the usage of raw HTML primitives without accessibility rules.

## Dependencies Usage
- Forms rely on `react-hook-form` paired with `zod` schema resolvers.
- Icons must strictly be consumed via `lucide-react`.
- Tables are structured using TanStack React Table logic detached from their presentational markup.
