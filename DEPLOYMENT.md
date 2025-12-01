# Deploying ITS KosFinder to Vercel

## Step-by-Step Deployment Guide

### Prerequisites Checklist
- ✅ GitHub repository pushed (hafidzmulia-its/e-kos)
- ⚠️ Environment variables ready
- ⚠️ Supabase project configured
- ⚠️ Cloudinary account set up
- ⚠️ Google OAuth credentials for production

---

## 🚀 Deployment Steps

### Step 1: Prepare Environment Variables

You'll need these environment variables in Vercel. Get them ready:

#### **Database (Supabase)**
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

#### **Authentication (NextAuth.js)**
```
NEXTAUTH_URL=https://your-domain.vercel.app
NEXTAUTH_SECRET=generate_a_random_secret_string
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

#### **Image Upload (Cloudinary)**
```
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

**To generate NEXTAUTH_SECRET**, run in terminal:
```bash
openssl rand -base64 32
```
Or use: https://generate-secret.vercel.app/32

---

### Step 2: Update Google OAuth for Production

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project
3. Go to **APIs & Services** → **Credentials**
4. Click on your OAuth 2.0 Client ID
5. Add authorized redirect URIs:
   ```
   https://your-app-name.vercel.app/api/auth/callback/google
   https://your-custom-domain.com/api/auth/callback/google (if using custom domain)
   ```
6. Add authorized JavaScript origins:
   ```
   https://your-app-name.vercel.app
   https://your-custom-domain.com (if using custom domain)
   ```

---

### Step 3: Deploy to Vercel

#### Option A: Via Vercel Dashboard (Recommended for first time)

1. **Go to [Vercel](https://vercel.com/)**
   - Sign in with GitHub

2. **Import Project**
   - Click "Add New..." → "Project"
   - Select "Import Git Repository"
   - Find and select `hafidzmulia-its/e-kos`
   - Click "Import"

3. **Configure Project**
   - **Framework Preset:** Next.js (should auto-detect)
   - **Root Directory:** `./` (leave as default)
   - **Build Command:** `npm run build` (auto-filled)
   - **Output Directory:** `.next` (auto-filled)
   - **Install Command:** `npm install` (auto-filled)

4. **Add Environment Variables**
   - Click "Environment Variables"
   - Add all variables from Step 1 (one by one)
   - Make sure to add them for all environments (Production, Preview, Development)

5. **Deploy**
   - Click "Deploy"
   - Wait 2-5 minutes for build to complete

#### Option B: Via Vercel CLI

```bash
# Install Vercel CLI globally
npm i -g vercel

# Login to Vercel
vercel login

# Deploy from project directory
cd d:\Downloads\e-kos
vercel

# Follow prompts:
# - Set up and deploy? Yes
# - Which scope? Select your account
# - Link to existing project? No
# - Project name? e-kos (or your preference)
# - Directory? ./ 
# - Override settings? No

# Add environment variables via CLI or dashboard
```

---

### Step 4: Post-Deployment Configuration

1. **Get your Vercel URL**
   - Example: `https://e-kos.vercel.app`

2. **Update NEXTAUTH_URL**
   - Go to Vercel Dashboard → Your Project → Settings → Environment Variables
   - Update `NEXTAUTH_URL` to your actual Vercel URL
   - Redeploy: Settings → Deployments → Click "..." → Redeploy

3. **Update Google OAuth**
   - Add your Vercel URL to Google OAuth (as mentioned in Step 2)

4. **Test Authentication**
   - Visit your deployed site
   - Try signing in with Google
   - Verify database connections work

---

### Step 5: Database Migration (If needed)

If you haven't run migrations on production Supabase:

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Go to **SQL Editor**
4. Run these in order:
   ```sql
   -- Run main schema
   (paste content from db/schema.sql)
   
   -- Run migrations
   (paste content from db/migrations/001_add_image_columns.sql)
   (paste content from db/migrations/002_add_is_active_column.sql)
   
   -- Run seed data
   (paste content from db/seed.sql)
   ```

---

## 🔍 Troubleshooting

### Build Fails
- Check Vercel build logs for errors
- Ensure all TypeScript errors are fixed locally
- Verify all dependencies are in `package.json`

### Authentication Not Working
- Verify `NEXTAUTH_URL` matches your Vercel URL
- Check Google OAuth redirect URIs
- Ensure `NEXTAUTH_SECRET` is set

### Database Connection Issues
- Verify Supabase environment variables
- Check Supabase project is not paused
- Ensure RLS policies allow access

### Images Not Uploading
- Verify Cloudinary credentials
- Check API rate limits
- Ensure CORS is configured in Cloudinary

---

## 🎨 Custom Domain (Optional)

1. Go to Vercel Project Settings → Domains
2. Add your custom domain
3. Update DNS records as instructed
4. Update `NEXTAUTH_URL` to custom domain
5. Update Google OAuth with custom domain

---

## 🔒 Security Checklist

- ✅ All environment variables added to Vercel
- ✅ `.env.local` added to `.gitignore` (never commit secrets)
- ✅ `SUPABASE_SERVICE_ROLE_KEY` only on server-side
- ✅ Supabase RLS (Row Level Security) policies enabled
- ✅ Google OAuth restricted to production domains
- ✅ Cloudinary upload presets secured

---

## 📊 Monitoring

After deployment, monitor:
- Vercel Analytics (built-in)
- Vercel Logs for errors
- Supabase Database Dashboard
- Google OAuth usage

---

## 🔄 Continuous Deployment

Vercel automatically redeploys when you push to GitHub:
```bash
git add .
git commit -m "Your commit message"
git push origin main
```

Vercel will:
1. Detect the push
2. Build the project
3. Run tests (if configured)
4. Deploy automatically

---

## 📝 Quick Reference

**Vercel Dashboard:** https://vercel.com/dashboard
**Project URL:** Will be provided after deployment
**Build Logs:** Vercel Dashboard → Your Project → Deployments
**Environment Variables:** Settings → Environment Variables
**Domain Settings:** Settings → Domains

---

## Need Help?

- Vercel Documentation: https://vercel.com/docs
- Next.js Deployment: https://nextjs.org/docs/deployment
- Supabase Documentation: https://supabase.com/docs
- GitHub: https://github.com/hafidzmulia-its/e-kos
