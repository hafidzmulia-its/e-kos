# 🏠 ITS KosFinder

> **A modern Web GIS platform to discover boarding houses around ITS campus**

[![Next.js](https://img.shields.io/badge/Next.js-16-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://www.typescriptlang.org/)
[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black)](https://vercel.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

ITS KosFinder is a full-stack web application that helps new ITS (Institut Teknologi Sepuluh Nopember) students find boarding houses ("kos") near campus. With an interactive map, advanced filters, and role-based management system, students can easily discover their ideal accommodation while kos owners can manage their listings seamlessly.

## ✨ Key Features

### 🗺️ **Interactive Mapping**
- Real-time kos locations on interactive Leaflet map with OpenStreetMap
- Draggable bottom sheet on mobile for optimal UX
- Custom markers with clustering for better performance
- Click on markers to view instant kos details with popups
- Map controls with zoom and geolocation support

### 🔍 **Smart Filtering**
- Filter by gender type (Male, Female, Mixed)
- Price range slider for budget-friendly search
- Filter by available facilities (WiFi, AC, parking, etc.)
- Real-time map updates based on active filters

### 🔐 **Secure Authentication**
- Google OAuth integration via NextAuth.js
- JWT-based session management
- Role-based access control (USER/ADMIN)
- Protected routes and API endpoints

### 📝 **Listing Management**
- Create and manage kos listings with intuitive forms
- Multiple image uploads powered by Vercel Blob
- Interactive location picker with drag-and-drop pin
- Rich facility selection with visual icons
- Owner dashboard to track and edit listings

### 📱 **Responsive Design**
- Mobile-first approach with Tailwind CSS
- Adaptive layouts for all screen sizes
- Touch-optimized interactions for mobile devices
- Progressive Web App (PWA) ready

### 🛡️ **Admin Panel**
- Comprehensive admin dashboard for managing all listings
- User role management (upgrade/downgrade permissions)
- Activate/deactivate kos listings
- Monitor platform statistics

## 🚀 Tech Stack

### **Frontend**
- **[Next.js 16](https://nextjs.org/)** - React framework with App Router for SSR/CSR
- **[TypeScript 5](https://www.typescriptlang.org/)** - Type-safe development
- **[React 19](https://react.dev/)** - UI component library
- **[Tailwind CSS 4](https://tailwindcss.com/)** - Utility-first CSS framework
- **[Leaflet.js](https://leafletjs.com/)** - Interactive maps library
- **[React Leaflet 5](https://react-leaflet.js.org/)** - React components for Leaflet
- **[Lucide React](https://lucide.dev/)** - Beautiful icon system

### **Backend & Database**
- **[Next.js API Routes](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)** - Serverless API endpoints
- **[Supabase](https://supabase.com/)** - PostgreSQL database with real-time capabilities
- **[PostGIS](https://postgis.net/)** - Spatial database extension for geographic queries
- **[@supabase/supabase-js](https://supabase.com/docs/reference/javascript/introduction)** - JavaScript client library

### **Authentication**
- **[NextAuth.js 4](https://next-auth.js.org/)** - Authentication for Next.js
- **Google OAuth 2.0** - Social login provider

### **Media Management**
- **[Vercel Blob](https://vercel.com/docs/storage/vercel-blob)** - Serverless file storage with automatic CDN

### **Deployment & DevOps**
- **[Vercel](https://vercel.com/)** - Serverless deployment platform
- **[Git](https://git-scm.com/)** - Version control
- **[ESLint 9](https://eslint.org/)** - Code linting and quality

### **Development Tools**
- **[PostCSS](https://postcss.org/)** - CSS transformation
- **[clsx](https://github.com/lukeed/clsx)** & **[tailwind-merge](https://github.com/dcastil/tailwind-merge)** - Utility class management

## 🚀 Getting Started

### Prerequisites

Before you begin, ensure you have:
- **Node.js 20+** installed
- **npm** or **yarn** package manager
- **Supabase account** ([Sign up free](https://supabase.com))
- **Google Cloud Console account** for OAuth
- **Vercel account** for deployment and blob storage

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/hafidzmulia-its/e-kos.git
cd e-kos
```

### 2️⃣ Install Dependencies

```bash
npm install
```

### 3️⃣ Environment Configuration

Create a `.env.local` file in the root directory:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_generated_secret_here

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Vercel Blob Storage (automatically configured in production)
# For local development, you can leave this empty
BLOB_READ_WRITE_TOKEN=
```

> 💡 **Generate NEXTAUTH_SECRET**: Run `openssl rand -base64 32` or visit [generate-secret.vercel.app/32](https://generate-secret.vercel.app/32)

### 4️⃣ Database Setup

1. **Create Supabase Project**
   - Go to [supabase.com](https://supabase.com) and create a new project
   - Copy your project URL and API keys to `.env.local`

2. **Enable PostGIS Extension**
   ```sql
   CREATE EXTENSION IF NOT EXISTS postgis;
   ```

3. **Run Database Schema**
   - Open Supabase SQL Editor
   - Copy and execute contents of `db/schema.sql`

4. **Run Migrations** (if any)
   ```bash
   # Execute each migration file in db/migrations/ in order
   ```

5. **Optional: Seed Data**
   - Copy and execute contents of `db/seed.sql` for sample data

### 5️⃣ Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable **Google+ API**
4. Navigate to **APIs & Services → Credentials**
5. Create **OAuth 2.0 Client ID**
6. Configure OAuth consent screen
7. Add **Authorized redirect URIs**:
   ```
   http://localhost:3000/api/auth/callback/google
   ```
8. Copy Client ID and Client Secret to `.env.local`

### 6️⃣ Cloudinary Setup
### 6️⃣ Vercel Blob Setup (Optional for Local Development)

Vercel Blob is automatically configured when you deploy to Vercel. For local development:

1. Go to your [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project (or create one)
3. Go to **Storage** → **Create Database** → **Blob**
4. Copy the `BLOB_READ_WRITE_TOKEN` to `.env.local` (optional for local testing)

**Note:** In production, Vercel automatically sets the token for you!
### 7️⃣ Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser 🎉

### 8️⃣ Build for Production

```bash
npm run build
npm start
```

## 📁 Project Structure

```
e-kos/
├── src/
│   ├── app/                          # Next.js App Router (v16)
│   │   ├── api/                      # API Route Handlers
│   │   │   ├── auth/[...nextauth]/   # NextAuth.js endpoints
│   │   │   ├── kos/                  # Kos CRUD operations
│   │   │   │   ├── [id]/             # Individual kos operations
│   │   │   │   │   ├── images/       # Image management
│   │   │   │   │   └── reviews/      # Review endpoints
│   │   │   ├── upload/images/        # Vercel Blob uploadgs
│   │   │   ├── facilities/           # Facility types endpoint
│   │   │   ├── reviews/              # Review management
│   │   │   ├── upload/images/        # Cloudinary upload
│   │   │   └── admin/kos/            # Admin operations
│   │   ├── dashboard/                # Owner dashboard
│   │   │   └── kos/[id]/edit/        # Edit kos page
│   │   ├── map/                      # Interactive map page
│   │   ├── kos/[slug]/               # Kos detail page
│   │   ├── admin/                    # Admin panel
│   │   ├── layout.tsx                # Root layout with providers
│   │   ├── page.tsx                  # Landing page
│   │   └── globals.css               # Global styles + Tailwind
│   ├── components/                   # Reusable React components
│   │   ├── kos-map.tsx              # Main map component
│   │   ├── location-picker-leaflet.tsx # Map location selector
│   │   ├── image-upload.tsx         # Multi-image uploader
│   │   ├── image-gallery.tsx        # Fullscreen gallery
│   │   ├── facility-selector.tsx    # Facility checkboxes
│   │   ├── navigation.tsx           # Header navigation
│   │   └── providers/               # Context providers
│   │       └── auth-provider.tsx    # NextAuth session provider
│   ├── lib/                         # Utility libraries
│   │   ├── models/                  # Database models (ORM-like)
│   │   └── vercel-blob.ts          # Vercel Blob helperations
│   │   │   └── user.ts             # User operations
│   │   ├── supabase.ts             # Supabase client config
│   │   └── cloudinary.ts           # Cloudinary helper
│   └── types/                       # TypeScript definitions
│       └── database.ts              # DB types & interfaces
├── db/                              # Database files
│   ├── schema.sql                   # PostgreSQL + PostGIS schema
│   ├── seed.sql                     # Sample seed data
│   └── migrations/                  # Database migrations
│       ├── 001_add_image_columns.sql
│       └── 002_add_is_active_column.sql
├── docs/                            # Documentation
│   └── MVP.md                       # MVP specifications
├── public/                          # Static assets
├── .env.local                       # Environment variables (gitignored)
├── next.config.ts                   # Next.js configuration
├── tailwind.config.ts               # Tailwind CSS config
├── tsconfig.json                    # TypeScript config
├── DEPLOYMENT.md                    # Vercel deployment guide
└── package.json                     # Dependencies & scripts
```

## 🗄️ Database Architecture

### Entity Relationship Overview

```
┌─────────────┐       ┌──────────────────┐       ┌───────────────┐
│    users    │──1:N──│  kos_listings    │──N:M──│facility_types │
└─────────────┘       └──────────────────┘       └───────────────┘
                              │ 1:N                        
                              │                            
                      ┌───────┴────────┐                  
                      │                │                  
                ┌─────┴─────┐   ┌─────┴──────┐          
                │  reviews  │   │  favorites │          
                └───────────┘   └────────────┘          
```

### Main Tables

| Table | Description | Key Features |
|-------|-------------|--------------|
| **users** | User accounts from Google OAuth | `id`, `email`, `name`, `role` (USER/ADMIN), `image` |
| **kos_listings** | Boarding house listings | `id`, `owner_id`, `name`, `address`, `price`, `location` (PostGIS), `is_active` |
| **facility_types** | Master data for facilities | `id`, `name`, `icon`, `category` |
| **kos_facilities** | Junction table | Links kos to facilities (many-to-many) |
| **reviews** | User reviews | `kos_id`, `user_id`, `rating`, `comment` |
| **favorites** | User bookmarks | `user_id`, `kos_id` |

### Spatial Features

- Uses **PostGIS** `geography(Point, 4326)` for location storage
- Efficient spatial queries with `ST_DWithin` for proximity searches
- GeoJSON support for map rendering

## 🔑 API Routes

### Public Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/kos` | Get all active kos with filters (gender, price, facilities) |
| `GET` | `/api/kos/[id]` | Get specific kos details by ID |
| `GET` | `/api/facilities` | Get all facility types |

### Protected Endpoints (Require Authentication)

| Method | Endpoint | Description | Authorization |
|--------|----------|-------------|---------------|
| `POST` | `/api/kos` | Create new kos listing | USER/ADMIN |
| `POST` | `/api/upload/images` | Upload images to Vercel Blob | USER/ADMIN |
| `DELETE` | `/api/kos/[id]` | Delete kos listing | Owner or ADMIN |
| `GET` | `/api/kos/my` | Get user's own listings | USER/ADMIN |
| `POST` | `/api/upload/images` | Upload images to Cloudinary | USER/ADMIN |
| `POST` | `/api/kos/[id]/reviews` | Add review | USER/ADMIN |
| `GET` | `/api/admin/kos` | Get all kos (including inactive) | ADMIN only |

### Response Format

All API endpoints follow consistent response structure:

```typescript
// Success
{
  "data": { ... },
  "message": "Operation successful"
}

// Error
{
  "error": "Error message",
  "details": { ... }  // Optional
}
```

## 👥 User Roles & Permissions

### 🌐 Unauthenticated Visitor
- ✅ View interactive map with all active kos
- ✅ Browse kos details and galleries
- ✅ Use filters (gender, price, facilities)
- ❌ Cannot create, edit, or delete listings
- ❌ Cannot access dashboard

### 👤 Authenticated USER
- ✅ All visitor capabilities
- ✅ Create new kos listings
- ✅ Upload multiple images per listing
- ✅ Edit/delete **own** listings only
- ✅ Access personal dashboard
- ✅ Leave reviews
- ❌ Cannot modify other users' listings
- ❌ Cannot access admin panel

### 👑 ADMIN
- ✅ All USER capabilities
- ✅ View and edit **any** kos listing
- ✅ Activate/deactivate listings
- ✅ Access admin dashboard
- ✅ Manage user roles
- ✅ View platform statistics

## 🚀 Deployment to Vercel

This application is optimized for **Vercel** deployment with zero-config setup.

### Quick Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/hafidzmulia-its/e-kos)

### Manual Deployment Steps

1. **Push to GitHub**
   ```bash
   git push origin main
   ```

2. **Connect to Vercel**
   - Go to [vercel.com](https://vercel.com) and sign in with GitHub
   - Click **"Add New Project"**
   - Import `hafidzmulia-its/e-kos` repository
   - Vercel will auto-detect Next.js settings

3. **Configure Environment Variables**
   
   Add these in Vercel Dashboard → Settings → Environment Variables:
   
   ```env
   # Production Database
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_production_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_production_service_key
   
   # Production Auth (IMPORTANT!)
   NEXTAUTH_URL=https://your-app-name.vercel.app
   NEXTAUTH_SECRET=your_production_secret_here
   
   # Google OAuth (Production)
   # Vercel Blob (automatically configured by Vercel)
   # No manual configuration needed!
   NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   ```

4. **Update Google OAuth for Production**
   
   In [Google Cloud Console](https://console.cloud.google.com/):
   - Go to **APIs & Services → Credentials**
   - Edit your OAuth 2.0 Client
   - Add authorized redirect URI:
     ```
     https://your-app-name.vercel.app/api/auth/callback/google
     ```
   - Add authorized JavaScript origin:
     ```
     https://your-app-name.vercel.app
     ```

5. **Deploy**
   - Click **"Deploy"** in Vercel
   - Wait 2-5 minutes for build completion
   - Your app is live! 🎉

### Post-Deployment Checklist

- ✅ Test Google OAuth login on production
- ✅ Verify map loads with kos markers
- ✅ Test creating a new kos listing
- ✅ Check image uploads to Cloudinary
- ✅ Verify mobile responsiveness
- ✅ Test admin panel access
- ✅ Check database connections

### Custom Domain (Optional)

1. Go to Vercel Dashboard → Domains
2. Add your custom domain
3. Update DNS records as instructed
4. Update `NEXTAUTH_URL` and Google OAuth URIs

---

## 📱 Features Showcase

### Interactive Map with Mobile Bottom Sheet
- Desktop: Split view with sidebar and map
- Mobile: Full-screen map with draggable bottom sheet
- Touch gestures for expanding/collapsing listings
- Smooth animations and transitions

### Image Gallery
- Multiple image uploads per listing
- Fullscreen carousel view
- Cloudinary optimization and CDN delivery
- Lazy loading for performance

### Location Picker
- Drag-and-drop pin on map
- Reverse geocoding for address
- Real-time coordinate updates
- PostGIS integration for spatial queries

---

## 🎯 Roadmap

### ✅ Current MVP Features (Completed)
- [x] Interactive map with PostGIS spatial queries
- [x] Google OAuth authentication with NextAuth.js
- [x] Role-based access control (USER/ADMIN)
- [x] Full CRUD operations for kos listings
- [x] Multi-image upload with Cloudinary
- [x] Responsive design with mobile bottom sheet
- [x] Advanced filtering (gender, price, facilities)
- [x] Image gallery with fullscreen view
- [x] Active/inactive listing management
- [x] Owner dashboard
- [x] Admin panel

### 🚀 Future Enhancements

#### Phase 2 (Q1 2026)
- [ ] Review and rating system improvements
- [ ] Favorite/bookmark functionality
- [ ] Email notifications (welcome, listing approved)
- [ ] Advanced search (by distance, keyword)
- [ ] Kos comparison feature

#### Phase 3 (Q2 2026)
- [ ] Booking/reservation system
- [ ] Payment integration
- [ ] Real-time chat between student and owner
- [ ] Mobile app (React Native)
- [ ] Push notifications

#### Phase 4 (Future)
- [ ] AI-powered recommendation engine
- [ ] Virtual tour (360° images)
- [ ] Machine learning price prediction
- [ ] Analytics dashboard for owners
- [ ] Multi-language support (ID/EN)

---

## 🤝 Contributing

Contributions are welcome! Please follow these guidelines:

### How to Contribute

1. **Fork the repository**
   ```bash
   git clone https://github.com/your-username/e-kos.git
   ```

2. **Create a feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```

3. **Make your changes**
   - Follow existing code style
   - Write descriptive commit messages
   - Add comments for complex logic
   - Update documentation if needed

4. **Test your changes**
   ```bash
   npm run build
   npm run lint
   ```

5. **Commit and push**
   ```bash
   git commit -m "feat: add amazing feature"
   git push origin feature/amazing-feature
   ```

6. **Open a Pull Request**
   - Describe your changes clearly
   - Reference any related issues
   - Wait for review and feedback

### Code Style Guidelines

- Use TypeScript strict mode
- Follow Next.js App Router conventions
- Use Tailwind CSS for styling (avoid inline styles)
- Prefer named exports over default exports
- Write meaningful variable and function names
- Add JSDoc comments for complex functions

---

## 🐛 Troubleshooting

### Common Issues

**OAuth Error: redirect_uri_mismatch**
- Verify Google Cloud Console has correct redirect URIs
- Check `NEXTAUTH_URL` matches your domain exactly
- Clear browser cache and try incognito mode
- Wait 5-10 minutes for Google propagation

**Map not loading**
- Check browser console for errors
- Verify Leaflet CSS is imported
- Ensure `'use client'` directive in map components

**Database connection failed**
- Verify Supabase credentials in `.env.local`
- Check PostGIS extension is enabled
- Ensure schema.sql has been executed

**Image upload not working**
- Verify Cloudinary credentials
- Check upload preset configuration
- Ensure file size is under 10MB

**Build errors on Vercel**
- Check all environment variables are set
- Verify TypeScript types are correct
- Review build logs for specific errors

---

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

---

## 👨‍💻 Authors

**Hafidz Mulia**
- GitHub: [@hafidzmulia-its](https://github.com/hafidzmulia-its)
- ITS Student - Informatics Engineering

---

## 🙏 Acknowledgments

- **Institut Teknologi Sepuluh Nopember (ITS)** for the inspiration
- **Supabase** for amazing database platform
- **Vercel** for seamless deployment
- **Next.js team** for the incredible framework
- **OpenStreetMap** contributors for map data
- **Leaflet.js** for the mapping library

---

## 📞 Support

If you encounter any issues or have questions:

1. Check the [Documentation](docs/)
2. Review [DEPLOYMENT.md](DEPLOYMENT.md) for deployment help
3. Search existing [GitHub Issues](https://github.com/hafidzmulia-its/e-kos/issues)
4. Open a new issue with detailed description

---

## ⭐ Star History

If you find this project helpful, please consider giving it a star! ⭐

---

<div align="center">

**Made with ❤️ for ITS Students**

[View Demo](https://e-kos.vercel.app) · [Report Bug](https://github.com/hafidzmulia-its/e-kos/issues) · [Request Feature](https://github.com/hafidzmulia-its/e-kos/issues)

</div>