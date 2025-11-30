<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

# GitHub Copilot Instructions for ITS KosFinder

## Project Overview
This is a Next.js TypeScript application for finding boarding houses (kos) around ITS campus with PostGIS spatial data support.

## Tech Stack
- Next.js 16 with App Router
- TypeScript
- Tailwind CSS
- Supabase (PostgreSQL + PostGIS)
- NextAuth.js with Google OAuth
- Leaflet.js for maps

## Code Style Guidelines
- Use TypeScript strict mode
- Prefer named exports over default exports for components
- Use Tailwind CSS for styling
- Follow Next.js App Router conventions
- Use server components by default, client components when needed

## Database Guidelines
- Use PostGIS for spatial queries
- Follow the established schema in `db/schema.sql`
- Use the model classes in `lib/models/` for database operations
- Always handle database errors gracefully

## Authentication
- Use NextAuth.js with session strategy JWT
- Implement role-based access control (USER/ADMIN)
- Always validate user permissions on the server side

## Component Structure
- Place reusable components in `src/components/`
- Use TypeScript interfaces for prop types
- Implement proper error boundaries
- Follow accessibility best practices

## API Routes
- Use proper HTTP status codes
- Implement proper error handling
- Always validate input data
- Use consistent response format with `{ data, message, error }`