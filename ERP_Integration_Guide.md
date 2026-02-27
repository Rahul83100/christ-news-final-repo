# Technical Integration Guide: CHRIST University News Portal (E-Luminate)

This document provides a comprehensive overview of the technical architecture, technology stack, and integration requirements for the E-Luminate News Portal. This guide is intended for the ERP/IT team to facilitate seamless connection with existing Christ University online infrastructure.

## 1. Technology Stack

### Frontend & Application Logic
- **Framework:** Next.js (App Router architecture)
- **Language:** TypeScript (TSX)
- **Styling:** Tailwind CSS (Vanilla CSS for custom components)
- **Animations:** Framer Motion
- **Interactive Components:** React-Pageflip (for the 3D newsletter viewer)

### Backend & Database (Supabase)
- **Database:** PostgreSQL (Version 17)
- **Backend-as-a-Service:** Supabase
- **Authentication:** Supabase Auth (JWT-based) with **Email OTP**
- **Storage:** Supabase Storage (S3-compatible) for PDFs and images

### External Services
- **PDF Processing:** PDF.js (for rendering and manipulation)

---

## 2. Database Schema & Models

The system utilizes a relational PostgreSQL database managed via Supabase. Key tables include:

- **`profiles`:** Extends Supabase Auth users. 
    - `id`: UUID (Primary Key, references `auth.users.id`)
    - `full_name`: TEXT
    - `role`: TEXT (Used for Role-Based Access Control: `admin` or `user`)
- **`editions`:** Stores newsletter edition metadata.
- **`articles`:** Individual articles linked to specific editions.
- **`challenges` & `submissions`:** Management for interactive puzzles/ riddles.

> [!NOTE]
> Database migrations and specific SQL setup scripts (e.g., `supabase_profiles_setup.sql`) are included in the repository for schema replication.

---

## 3. Backend Integration Points

### API Layer
The application uses **Next.js Server Actions** and **API Routes** for core business logic, reducing the need for a separate middleware server.

### Authentication & Authorization
- **Method:** The system uses **Supabase Email OTP (One-Time Password)** for user authentication. Users receive a 6-digit code via email to sign in or sign up.
- **Middleware:** A specialized `middleware.ts` handles session validation and RBAC.
- **Admin Protection:** Routes prefixed with `/admin` are protected and require a user profile with the `admin` role.
- **Public Access:** Regular users can view newsletters, but specific actions (e.g., downloads) may require authentication.

---

## 4. Environment Requirements

To host or integrate this application, the following environment variables are required:

| Key | Description |
| :--- | :--- |
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public anonymous key for client-side Supabase calls |
| `SUPABASE_SERVICE_ROLE_KEY` | Private key for server-side administrative tasks |

---

## 5. Deployment Recommendation

- **Frontend:** Vercel (highly recommended for Next.js) or any Node.js compatible environment.
- **Backend:** Supabase Cloud or a self-hosted Supabase instance.
- **Integration:** The application can be embedded into the main university website via Subdomain (e.g., `news.christuniversity.in`) or via Reverse Proxy.

## 6. Maintenance & Support

- **Languages Used:** TypeScript (90%+), SQL (for DB migrations), CSS (Tailwind).
- **Package Management:** `npm` (Standard Node.js environment).
- **Local Dev:** `npm run dev` starts the Next.js development server.

For any technical queries regarding this integration, please refer to the `README.md` or contact the development leads.
