# Full-Stack Deployment Guide: Christ University Newsletter

This guide provides a comprehensive, step-by-step roadmap for deploying the Christ University Newsletter platform into a production environment.

## 🚀 1. Frontend Deployment (Next.js)

### Build Process
1. **Local Verification**: Run `npm run build` locally to catch any TypeScript or linting errors.
2. **Environment Variables**: Ensure all variables in `.env.local` are transitioned to the production hosting provider.

### Hosting (Recommended: Vercel)
1. **Connect Repository**: Link your GitHub/GitLab repository to Vercel.
2. **Configure Build Settings**:
   - Build Command: `next build`
   - Output Directory: `.next`
   - Install Command: `npm install`
3. **Environment Variables**: Add `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, and `GEMINI_API_KEY` in the Vercel dashboard.

---

## 🛠️ 2. Backend & API (Supabase & Next.js API Routes)

### Supabase Setup
1. **New Project**: Create a new production project in the Supabase Dashboard.
2. **Database Schema**:
   - Run existing migrations or use the SQL Editor to recreate tables (`editions`, `articles`, `announcements`).
   - Enable **Row Level Security (RLS)** for all tables.
3. **Storage**:
   - Create a public bucket (e.g., `newsletter-pdfs`) for storing PDF files.
   - Configure RLS to allow public read but restricted write (Admin only).

---

## 🔐 3. Environment & Security

### API Keys & Secrets
- **Gemini API**: Ensure the key used in production has appropriate rate limits and is not restricted to localhost.
- **Supabase Service Role**: **NEVER** expose the `SERVICE_ROLE_KEY` in the frontend (`NEXT_PUBLIC_`). Use it only in server-side logic (e.g., `middleware.ts` or Admin API routes).

### CORS Configuration
1. In the Supabase Dashboard, go to **Settings > API**.
2. Add your production domain (e.g., `https://christ-newsletter.vercel.app`) to the **Allowed Origins List**.

---

## 📋 4. Production Checklist

- [ ] **Build Verification**: Run `npm run build && npm run start` to verify the production bundle.
- [ ] **Error Handling**: Ensure custom 404 and 500 pages are implemented for a professional experience.
- [ ] **Logging**: Integrate a tool like **Sentry** or **LogRocket** for real-time error tracking.
- [ ] **Asset Optimization**: Use `next/image` for all images to ensure automatic WebP conversion and lazy loading.
- [ ] **SEO**: Verify `metadata` in `layout.tsx` includes proper titles, descriptions, and OpenGraph tags.

---

## ⚠️ 5. Common Pitfalls to Avoid

- **Exposing Secrets**: Double-check that `.env` files are in `.gitignore`.
- **Database Migrations**: Always test migrations on a staging database before applying to production.
- **Cold Boot Performance**: If using heavy libraries, monitor build sizes to avoid slow initial loads.
- **Rate Limiting**: Implement basic rate limiting on API routes to prevent abuse of the Gemini AI assistant.
