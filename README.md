# My Health Integral - Backend API

Express.js backend API for the My Health Integral healthcare platform.

## Overview

RESTful API (`/api/v1/*`) providing:
- Authentication & Authorization
- User Management (Patients, Providers, Partners)
- Content Management (CMS)
- Media Management
- Team & Navigation Management
- Analytics & Audit Logging
- Zoho CRM Integration

## Tech Stack

- **Runtime**: Node.js 20.x
- **Framework**: Express.js
- **Database**: PostgreSQL (Neon serverless)
- **ORM**: Drizzle ORM
- **Validation**: Zod
- **Authentication**: Passport.js + JWT
- **Session**: express-session with PostgreSQL store

## Setup

1. Install dependencies:
```bash
npm install
```

2. Configure environment variables (`.env`):
```env
DATABASE_URL=your_postgresql_url
ADMIN_DEFAULT_PASSWORD=secure_password
ZOHO_CLIENT_ID=your_zoho_client_id
ZOHO_CLIENT_SECRET=your_zoho_client_secret
ZOHO_REFRESH_TOKEN=your_zoho_refresh_token
ZOHO_DATA_CENTER=your_data_center
```

3. Push database schema:
```bash
npm run db:push
```

4. Start development server:
```bash
npm run dev
```

## API Structure

```
/api/v1
├── /auth          # Authentication endpoints
├── /users         # User management
├── /content       # CMS content
├── /media         # Media library
├── /team          # Team members
├── /navigation    # Site navigation
├── /dashboard     # Admin analytics
└── /videos        # Video content
```

## Architecture

- **Modular Design**: Feature-based module organization
- **Repository Pattern**: Data access abstraction
- **Middleware Stack**: Auth, validation, error handling
- **Type Safety**: Full TypeScript with Zod validation

## Production

Build for production:
```bash
npm run build
npm start
```

## Environment

Required environment variables:
- `DATABASE_URL` - PostgreSQL connection string
- `ADMIN_DEFAULT_PASSWORD` - Default admin password
- Zoho CRM credentials (optional)
