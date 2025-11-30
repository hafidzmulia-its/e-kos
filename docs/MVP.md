# ITS KosFinder – MVP Specification

## 1. Project Overview

**Name (working title)**  
ITS KosFinder – A Web GIS platform to discover boarding houses (“kos”) around ITS campus.

**Elevator pitch**  
ITS KosFinder helps new ITS students quickly find nearby boarding houses by visualizing kos locations on an interactive map, with filters for price, gender type, and facilities. Boarding house owners or seniors can log in with Google to add and manage their kos data.

---

## 2. Goals and Scope

### 2.1 Goals

- Provide a practical and usable Web GIS for kos around ITS campus.
- Demonstrate:
  - A relational database design in PostgreSQL.
  - Integration of spatial and non-spatial data (locations on a map).
  - Role-based authentication and authorization (USER vs ADMIN).
  - A modern full-stack architecture using Next.js + Supabase.

### 2.2 MVP Scope

**Included in MVP**

1. Public map view that shows kos locations around ITS using an interactive map.
2. Kos detail page with price, gender, address, facilities, and location.
3. Basic filters:
   - Gender type (male / female / mixed).
   - Price range.
4. Google login (NextAuth) with two roles:
   - **USER** – can create, update, and delete their own kos.
   - **ADMIN** – can manage all kos.
5. Protected forms/pages for creating and editing kos listings.
6. Authorization rules:
   - Unauthenticated visitors can only read (map + details).
   - USER cannot modify kos created by other users.
   - ADMIN can modify any kos.

**Explicitly out of scope (future phases)**

- Booking or payment system.
- Complex photo gallery / file uploads at scale.
- Email notifications.
- Recommendation system, ML ranking, or advanced analytics.
- Complex review/reply system (beyond simple rating & comment).

---

## 3. User Roles and Permissions

### 3.1 Unauthenticated Visitor

- ✅ View map with all kos markers.
- ✅ View kos detail pages.
- ❌ Cannot create, edit, or delete kos.
- ❌ Cannot access dashboard/admin pages.

### 3.2 Authenticated USER

- ✅ All capabilities of Visitor.
- ✅ Create new kos listings (they become the `owner`).
- ✅ Edit and delete **only** their own kos.
- ❌ Cannot edit or delete kos owned by other users.
- ❌ Cannot change roles of other users.

### 3.3 Authenticated ADMIN

- ✅ All capabilities of USER.
- ✅ Edit and delete any kos listing.
- ✅ Access an admin dashboard to see all kos (and optionally all users).
- ✅ (Optional) Change roles of other users (USER ↔ ADMIN).

---

## 4. Tech Stack

### 4.1 Frontend

- **Next.js (App Router, TypeScript)**  
  - Full-stack React framework for SSR/ISR, API routes, and file-based routing.

- **TypeScript**  
  - Static typing for both server and client code.

- **Tailwind CSS**  
  - Utility-first CSS framework for fast and consistent styling.

- **Leaflet.js + OpenStreetMap**  
  - Leaflet for interactive map components.
  - OpenStreetMap as the base tile provider.

### 4.2 Backend / API

- **Next.js Route Handlers / Server Actions**  
  - REST-like endpoints under `/api` (e.g., `/api/kos`) for CRUD operations.
  - Server actions for form submissions where appropriate.

- **Supabase JavaScript Client (`@supabase/supabase-js`)**  
  - Direct access to Supabase PostgreSQL (queries, inserts, updates, deletes).
  - “Model” style code in `lib/models/*` (no ORM/ODM).

### 4.3 Database and GIS

- **Supabase PostgreSQL**  
  - Cloud-hosted PostgreSQL instance (free tier) used as the main relational database.

- **PostGIS (optional but recommended)**  
  - Extension to store geometry points (`geometry(Point, 4326)`) and perform spatial queries (distance, radius).

- **Main tables**

  - `users` – application users (linked to Google accounts, with `role`).
  - `kos_listings` – main kos entities that appear on the map.
  - `facility_types` – master data for facility options (WiFi, AC, etc.).
  - `kos_facilities` – linking table between kos and facilities (many-to-many).
  - `reviews` *(optional)* – user reviews for each kos.
  - `favorites` *(optional)* – user favorites/bookmarks.

> Schema and seed data are defined in `db/schema.sql` and `db/seed.sql` and can be executed through the Supabase SQL editor.

### 4.4 Authentication and Authorization

- **NextAuth.js**

  - Google provider for OAuth 2.0 login.
  - JWT session strategy (no Prisma, no database adapter required).
  - Custom callbacks to:
    - Sync Google user into `public.users` table in Supabase.
    - Attach `appUserId` and `role` to the JWT and session object.

- **Role-based Access Control (RBAC)**

  - `role` column in `public.users` table: `USER` or `ADMIN`.
  - Server-side checks in API routes and server components:
    - `USER` may only mutate resources where `owner_id === session.user.appUserId`.
    - `ADMIN` may mutate any resource.

### 4.5 Deployment & DevOps

- **Vercel**

  - Deployment target for the Next.js app.
  - Environment variables for Supabase and NextAuth:

    - `NEXT_PUBLIC_SUPABASE_URL`
    - `SUPABASE_SERVICE_ROLE_KEY` (server-side only)
    - `NEXT_PUBLIC_SUPABASE_ANON_KEY` (optional for client reads)
    - `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`
    - `NEXTAUTH_URL`, `NEXTAUTH_SECRET`

- **Supabase Dashboard**

  - Database hosting (PostgreSQL + PostGIS).
  - SQL editor for schema and seed scripts.
  - Monitoring and basic analytics.

---

## 5. Core Features (MVP Breakdown)

### 5.1 Public Map View

**User story**  
As a new student, I want to see the locations of kos around ITS on a map so I can quickly identify nearby options.

**Implementation**

- Route: `/` or `/map`.
- Use Leaflet with OpenStreetMap tiles, centered around ITS campus.
- Fetch kos data from `/api/kos` (Next.js route handler).
- Render markers with popups showing:
  - Title
  - Monthly price
  - Gender type
  - Short description
- Clicking a marker navigates to `/kos/[slug]`.

**Technologies**  
Next.js (App Router), Leaflet, Tailwind, `@supabase/supabase-js`.

---

### 5.2 Kos Detail Page

**User story**  
As a visitor, I want to see detailed information about a kos so I can judge whether it fits my needs.

**Implementation**

- Route: `/kos/[slug]`.
- Server component fetches data from Supabase:
  - `kos_listings`  
  - Related `facility_types` via `kos_facilities`
  - (Optional) aggregated review data
- Displays:
  - Title, description, gender, price.
  - Address and distance to ITS.
  - Facilities (badges/icons).
  - Small map with a single marker.
- (Optional) show average rating and list of latest reviews.

---

### 5.3 Google Login

**User story**  
As a kos owner or senior student, I want to log in via my Google account so I can easily add and manage my kos.

**Implementation**

- NextAuth configuration with:
  - Google provider.
  - `session: { strategy: "jwt" }`.
- `signIn` callback:
  - After a successful Google OAuth, check `public.users` in Supabase:
    - If email not found → insert new row with `role = 'USER'` by default.
    - If email matches a predefined admin email list → set `role = 'ADMIN'`.
  - Store `appUserId` (the `users.id` from Supabase) and `role` in the JWT.
- `session` callback:
  - Expose `session.user.appUserId` and `session.user.role` to the app.

**Technologies**  
NextAuth.js, Google OAuth, `@supabase/supabase-js`.

---

### 5.4 Create / Edit / Delete Kos (USER)

**User story**  
As a logged-in user, I want to create and update my kos listings so other students can find them.

**Implementation**

- Routes:
  - `/dashboard/kos` – list of kos owned by the current user.
  - `/dashboard/kos/new` – create form.
  - `/dashboard/kos/[id]/edit` – edit form.
- Form fields:
  - Title, description, address.
  - Gender type (enum).
  - Monthly price.
  - Latitude, longitude (manual or via map click).
  - Facilities (multi-select / checkboxes).
- On submit:
  - Use server action or POST `/api/kos`.
  - Set `owner_id` from `session.user.appUserId`.
  - Compute:
    - `geom = ST_SetSRID(ST_MakePoint(longitude, latitude), 4326)` if PostGIS is enabled.
    - `distance_to_its_km` (optional) using a database function.
- Update and delete endpoints check ownership:
  - `if (session.user.role === 'ADMIN' || kos.owner_id === session.user.appUserId)` → allowed.

**Technologies**  
Next.js (forms + server actions), `@supabase/supabase-js`, NextAuth (session), PostGIS (optional).

---

### 5.5 Admin Dashboard

**User story**  
As an admin, I want to see and moderate all kos listings so the platform stays clean and useful.

**Implementation**

- Route: `/admin/kos`.
- Protected via middleware:
  - Only accessible if `session.user.role === 'ADMIN'`.
- Displays a table of all kos:
  - Title, price, gender, owner email, created date.
- Actions:
  - Edit and delete any listing.
- (Optional) Additional route `/admin/users` to view users and roles.

**Technologies**  
Next.js, `@supabase/supabase-js`, NextAuth (role checks).

---

## 6. Data Model (High-Level)

**users**

- `id: text` – primary key, referenced in sessions/JWT as `appUserId`.
- `name: text`
- `email: text` (unique)
- `image_url: text`
- `role: user_role enum ('USER', 'ADMIN')`
- `created_at: timestamptz`
- `updated_at: timestamptz`

**kos_listings**

- `id: bigserial`
- `owner_id: text` → `users.id`
- `title: text`
- `slug: text (unique)`
- `description: text`
- `address: text`
- `gender: gender_type enum ('PUTRA', 'PUTRI', 'CAMPUR')`
- `monthly_price: integer`
- `latitude: numeric(9,6)`
- `longitude: numeric(9,6)`
- `geom: geometry(Point, 4326)` (optional)
- `distance_to_its_km: numeric(5,2)` (optional)
- `available_rooms: integer`
- `total_rooms: integer`
- `created_at`, `updated_at`

**facility_types**

- `id: smallserial`
- `name: text (unique)` – e.g. WiFi, AC, Private Bathroom.
- `icon: text` – icon key for the frontend.

**kos_facilities**

- `kos_id: bigint` → `kos_listings.id`
- `facility_id: smallint` → `facility_types.id`
- `is_available: boolean`
- `extra_price: integer`
- `primary key (kos_id, facility_id)`

**reviews (optional)**

- `id: bigserial`
- `kos_id: bigint` → `kos_listings.id`
- `user_id: text` → `users.id`
- `rating: smallint` (1–5)
- `comment: text`
- `created_at: timestamptz`
- `unique (kos_id, user_id)`

**favorites (optional)**

- `user_id: text` → `users.id`
- `kos_id: bigint` → `kos_listings.id`
- `created_at: timestamptz`
- `primary key (user_id, kos_id)`

---

## 7. API Endpoints (MVP)

- `GET /api/kos`
  - Returns list of kos for map markers.
  - Query params: `gender`, `minPrice`, `maxPrice`.

- `GET /api/kos/[slug]`
  - Returns full details for a single kos (including facilities).

- `POST /api/kos` *(auth: USER/ADMIN)*
  - Creates a kos with `owner_id = session.user.appUserId`.

- `PUT /api/kos/[id]` *(auth: owner or ADMIN)*
  - Updates kos data.

- `DELETE /api/kos/[id]` *(auth: owner or ADMIN)*
  - Deletes kos listing.

---

## 8. Non-Functional Requirements

- **Performance**
  - Map view should load within ~3 seconds for initial dataset (≤100 kos).
- **Security**
  - All write operations protected by NextAuth session & role checks on the server.
  - No sensitive keys (Supabase service key, NextAuth secret) exposed to the client.
- **Reliability**
  - Use Supabase and Vercel free tiers; handle basic network errors gracefully.
- **Maintainability**
  - Shared TypeScript types for database rows and API responses.
  - Clear separation of concerns:
    - `lib/models/*` for database access.
    - `app/api/*` for route handlers.
    - `app/*` for UI pages and components.

