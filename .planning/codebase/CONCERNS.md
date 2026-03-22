# Codebase Concerns
This document identifies potential risks, tech debt, and architectural concerns in the current state of the application.

## 1. Testing Coverage
**Severity: High**
There are no apparent testing dependencies (`jest`, `vitest`, `playwright`, `cypress`) in `package.json`. This makes autonomous verification or aggressive refactoring significantly more risky, enforcing heavy reliance on manual QA.

## 2. Database Migrations
**Severity: Medium**
The presence of a massive `migration.sql` (106KB) at the project root instead of localized within `prisma/migrations` suggests a potentially manual or unmanaged state of database migrations. This could lead to schema collisions or non-reproducible database states if Prisma migrations aren't synced perfectly with production.

## 3. Client Components "Fatigue"
**Severity: Unknown**
Heavy interactive elements like Drag and Drop (`dnd-kit`), Data Tables (`@tanstack/react-table`), and Charts (`recharts`) heavily force React boundary crossings (`"use client"`). We must ensure critical data-fetching happens mostly SERVER-SIDE before hydrating these client components to avoid waterfall performance issues.

## 4. Scalability of `actions` or `api` Routes
**Severity: Low**
Currently, `app/api/` exists but standard `actions` folders are unseen. Keeping Server Actions decoupled and re-usable might become a concern as the app scales its dashboard functionality.
