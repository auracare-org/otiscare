# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- `npm run dev` - Start development server with Vite
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run check` - Type check with svelte-check
- `npm run check:watch` - Type check in watch mode
- `npm run lint` - Run prettier and eslint checks
- `npm run format` - Format code with prettier
- `npm run test` - Run all tests once
- `npm run test:unit` - Run tests in watch mode

## Database Commands

- `npm run db:push` - Push schema changes to database
- `npm run db:generate` - Generate migrations from schema
- `npm run db:migrate` - Run pending migrations
- `npm run db:studio` - Open Drizzle Studio for database inspection

## Architecture Overview

This is a SvelteKit application with authentication and PostgreSQL database integration.

### Tech Stack
- **Framework**: SvelteKit with TypeScript
- **Styling**: Tailwind CSS v4 with custom theme and utilities in `app.css`
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Custom session-based auth using Oslo crypto libraries
- **Testing**: Vitest with Playwright browser testing for Svelte components

### Project Structure
- `/src/lib/server/` - Server-only code (auth, database)
- `/src/lib/server/db/` - Database schema and connection
- `/src/routes/` - SvelteKit routes and pages
- `/static/` - Static assets

### Database Schema
Located in `src/lib/server/db/schema.ts`. Current tables:
- `user` - User accounts with id and age fields
- `session` - Authentication sessions with expiration

### Authentication System
- Session-based authentication using SHA-256 hashed tokens
- 30-day session expiration with 15-day renewal window
- Middleware in `hooks.server.ts` validates sessions on each request
- User/session data available in `event.locals`

### Styling Guidelines
- Use `app.css` for all styling - contains comprehensive utility classes
- Healthcare-themed color palette with primary, healthcare, accent, success, and neutral colors
- Custom utilities: `btn`, `card`, `gradient-*`, `fade-in`, `slide-in-*`, etc.
- Follow UNIX philosophy and KISS principles

### Environment Setup
- Copy `.env.example` to `.env` and configure `DATABASE_URL`
- Run database migrations with `npm run db:push`

### Testing Structure
- Client-side component tests: `*.svelte.{test,spec}.{js,ts}` (uses Playwright)
- Server-side tests: `*.{test,spec}.{js,ts}` (uses Node environment)
- Separate test configurations for client and server environments