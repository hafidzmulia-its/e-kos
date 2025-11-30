# ITS KosFinder

A Web GIS platform to discover boarding houses ("kos") around ITS campus. Built with Next.js, TypeScript, Supabase, and Leaflet.

## 🎯 MVP Features

- **Interactive Map**: View kos locations on an interactive map with filters
- **Role-based Access**: Google OAuth with USER and ADMIN roles
- **Detailed Listings**: Comprehensive kos information with facilities and pricing
- **Easy Management**: Simple interface for kos owners to manage listings
- **Spatial Data**: PostgreSQL with PostGIS for location-based queries

## 🛠️ Tech Stack

- **Frontend**: Next.js 16 (App Router), TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Supabase PostgreSQL
- **Authentication**: NextAuth.js with Google OAuth
- **Maps**: Leaflet.js with OpenStreetMap
- **Database**: Supabase (PostgreSQL + PostGIS)
- **Deployment**: Ready for Vercel

## 🚀 Quick Start

### 1. Environment Setup

Copy the environment template and fill in your values:

```bash
cp .env.local.example .env.local
```

Required environment variables:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret_key

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

### 2. Database Setup

1. Create a new Supabase project at [supabase.com](https://supabase.com)
2. Enable PostGIS extension in your Supabase SQL Editor:
   ```sql
   CREATE EXTENSION IF NOT EXISTS postgis;
   ```
3. Run the schema file in Supabase SQL Editor:
   ```bash
   # Copy contents of db/schema.sql and execute in Supabase SQL Editor
   ```
4. Run the seed data (optional):
   ```bash
   # Copy contents of db/seed.sql and execute in Supabase SQL Editor
   ```

### 3. Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URIs:
   - `http://localhost:3000/api/auth/callback/google` (development)
   - `https://your-domain.vercel.app/api/auth/callback/google` (production)

### 4. Install Dependencies

```bash
npm install
```

### 5. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   │   ├── auth/          # NextAuth endpoints
│   │   └── kos/           # Kos CRUD endpoints
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── components/            # React components
│   └── providers/         # Context providers
├── lib/                   # Utility libraries
│   ├── models/            # Database models
│   └── supabase.ts        # Supabase client
└── types/                 # TypeScript type definitions

db/
├── schema.sql             # Database schema
└── seed.sql               # Sample data
```

## 🗄️ Database Schema

The database includes these main tables:

- **users**: User accounts linked to Google OAuth
- **kos_listings**: Main boarding house entities
- **facility_types**: Master data for facilities
- **kos_facilities**: Many-to-many relationship for kos facilities
- **reviews**: User reviews (optional)
- **favorites**: User bookmarks (optional)

## 🔑 API Endpoints

- `GET /api/kos` - Get all kos with optional filters
- `POST /api/kos` - Create new kos (requires auth)
- `GET /api/kos/[id]` - Get specific kos details
- `PUT /api/kos/[id]` - Update kos (requires ownership/admin)
- `DELETE /api/kos/[id]` - Delete kos (requires ownership/admin)

## 👥 User Roles

- **Unauthenticated**: View map and kos details only
- **USER**: Create and manage own kos listings
- **ADMIN**: Manage all kos listings and users

## 🚀 Deployment

### Vercel Deployment

1. Push code to GitHub repository
2. Connect repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy!

### Environment Variables for Production

Remember to update these for production:
- `NEXTAUTH_URL` should be your production domain
- Google OAuth redirect URIs should include production URLs

## 🎯 Roadmap

### Current MVP Scope ✅
- [x] Interactive map with kos locations
- [x] Google OAuth authentication
- [x] Role-based access control
- [x] CRUD operations for kos listings
- [x] Database schema with PostGIS

### Future Enhancements 🚀
- [ ] Photo upload and gallery
- [ ] Advanced search and filters
- [ ] Booking system integration
- [ ] Email notifications
- [ ] Mobile app (React Native)
- [ ] Review system improvements
- [ ] Recommendation engine

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

If you encounter any issues:
1. Check the environment variables are correctly set
2. Ensure Supabase database is properly configured
3. Verify Google OAuth credentials
4. Check the development server logs for errors

For more help, please open an issue in the repository.