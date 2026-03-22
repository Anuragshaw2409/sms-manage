# System Architecture
This document provides a high-level overview of the application's architectural design.

## Core Paradigm
The application follows a **Full-Stack Monolith** architecture built on **Next.js 16** using the **App Router** paradigm. It leverages React Server Components (RSC) heavily for performance and server-side data fetching.

## Key Layers

1. **Presentation Layer (Frontend)**:
   - React components utilizing a utility-first CSS approach with Tailwind v4.
   - UI primitive abstraction through `shadcn/ui` components located in `components/ui`.
   - Complex interactive elements isolated in client components (e.g., `data-table.tsx`, charts, global search).

2. **Routing & Controllers (Next.js App Router)**:
   - File-system based routing in the `app/` directory.
   - Protected routes grouped under `app/(protected)` representing authenticated dashboards (plans, taxes, transactions, users).
   - API layer located at `app/api/` serving Next.js Route Handlers.

3. **Data Access Layer (Prisma ORM)**:
   - Prisma Client acts as the data access layer connecting the application to PostgreSQL.
   - Located in the `prisma/` directory, exposing models to both Server Actions and Route Handlers.

4. **Authentication (NextAuth)**:
   - Middleware and higher-order validation protecting the `(protected)` route group.
   - Manages identity and sessions.

## Execution Flow
- Requests entering `/(protected)/*` are gated by NextAuth middleware.
- Valid requests render Server Components natively, fetching data securely via Prisma without exposing endpoints where possible.
- Client mutations are typically handled through Server Actions or hitting the `app/api/` endpoints.
