# DocGen

DocGen is a high-performance, monolithic Next.js 15 application designed for professional report generation and multi-tenant organization management. It provides a seamless experience for members, administrators, and platform-wide super admins.

## 🚀 Key Features

- **Secure OTP Signup**: Integrated **Resend** for two-step email verification, ensuring every new user is verified via a 6-digit code before account creation.
- **Strict Password Security**: Real-time password strength enforcement (8+ chars, uppercase, lowercase, numbers, special chars) with an interactive UI checklist.
- **AI-Powered Elaboration**: Integrated Google Gemini AI to transform simple keywords into comprehensive, professional report narratives automatically.
- **Multi-Tenant Architecture**: Support for multiple organizations with distinct branding, members, and data isolation.
- **Single-Session Security**: Military-grade session management that prevents concurrent logins. Includes real-time cross-device invalidation and logout notifications.
- **High-Fidelity Reporting**: Generate, preview, and manage professional documents with custom letterheads, seals, and intelligent page-breaking logic.
- **Dynamic Workspaces**: Instantly switch between multiple organizations directly from the dashboard.
- **Advanced Admin Controls**: Scoped management for organization admins with professional confirmation safeguards (Discard, Delete, Save & Exit).
- **Integrated Payments & Email**: Built-in Razorpay for subscriptions and Resend for professional contact form handling.
- **Cloud-Powered Assets**: Automatic management of organization branding via Cloudinary.
- **Comprehensive Audit Logs**: Every critical action is tracked for security and accountability.
- **Modern UI/UX**: Built with Framer Motion animations, sleek Lucide iconography, and a premium Glassmorphism-inspired design.

## 🛠 Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Runtime**: React 18, TypeScript
- **AI Engine**: Google Gemini API
- **Email Service**: Resend SDK
- **Styling**: Tailwind CSS
- **State & Data**: TanStack Query (React Query)
- **Database**: MongoDB with Mongoose (ODM)
- **Security**: Bcrypt password hashing & SID-based secure sessions
- **Validation**: Zod (Schema-first validation)
- **UI Components**: Radix UI Primitives
- **Visuals**: Framer Motion & Recharts

## 👥 User Roles

- **Member**: Create and manage reports, view history, and handle personal settings.
- **Admin**: Oversee organization-specific users, reports, and branding configurations.
- **Super Admin**: Full platform oversight, including global analytics, audit logs, organization management, and site-wide settings.

## ⚙️ How It Works

### Frontend Architecture
- **Route Protection**: Middleware-level access control based on user roles.
- **Responsive Layouts**: Optimized for mobile, tablet, and desktop viewing.
- **Session Handling**: `AuthContext` with real-time invalidation detection and user feedback.

### Backend Infrastructure
- **Serverless APIs**: Built using Next.js Route Handlers.
- **Session Layer**: SID-based cookie sessions verified against the database for every request.
- **Data Persistence**: Aggregated MongoDB lookups for performant analytics and search.

## 📂 Project Structure

```text
src/
  app/
    api/              # RESTful API Endpoints
    admin/            # Admin Workspace
    dashboard/        # Member Workspace
    super-admin/      # Global Management
    setup/            # Onboarding & Pricing
  components/
    layout/           # Shared Layout Components
    ui/               # Reusable UI Primitives
  hooks/              # Custom React Hooks (Auth, API, etc.)
  lib/                # Database, Session, and Schema Definitions
```

## 🏁 Getting Started

### 1. Requirements
Ensure you have Node.js 18+ and a MongoDB instance (Local or Atlas) ready.

### 2. Installation
```bash
npm install
```

### 3. Environment Setup
Create a `.env` file from the provided template:
```bash
cp .env.example .env
```
Fill in your credentials for **MongoDB**, **Cloudinary**, and **Razorpay**.

### 4. Development Run
```bash
npm run dev
```
The app will be available at `http://localhost:3000`.

### 5. Default Credentials (Seeded Data)
If starting with an empty database, the app will auto-seed these users:
- **Member**: `member@example.com` / `password`
- **Admin**: `admin@example.com` / `password`
- **Super Admin**: `superadmin@example.com` / `password`

## 📦 Deployment
The project is optimized for **Vercel**. Simply connect your GitHub repository and add the environment variables defined in `.env.example`.

## 🔒 Security
- **Bcrypt**: All passwords are cryptographically hashed using salt.
- **Session Locks**: Unique SID validation ensures cross-device security.
- **Middleware**: Server-side route guards prevent unauthorized access to restricted layouts.

---
Built with ❤️ by the DocGen Team.
