# External Integrations
This document outlines the third-party services, APIs, and integrations within the system.

## Database
- **PostgreSQL**: Primary relational database. Managed via Prisma ORM under a remote IP address (`158.220.107.49`) for development (`academy_db_dev`).

## Authentication
- **NextAuth**: Used for user session management and authentication handling. Specific providers (e.g., credentials, OAuth) would be configured in the NextAuth options.

## Environment Variables
The application relies on:
- `DATABASE_URL`: Connection string for PostgreSQL.
(Other standard NextAuth secrets or keys may be defined loosely or passed during deployment).

*No other major 3rd party API integrations (like Stripe, AWS, SendGrid) are apparent from current dependencies or env files.*
