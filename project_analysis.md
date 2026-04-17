# DocGen Project Analysis & Architecture

## 📋 Executive Summary
DocGen is a next-generation report automation platform designed for educational institutions and corporate organizations. It streamlines the lifecycle of event reporting—from keyword-based data entry to AI-enhanced professional document generation and secure PDF archival.

---

## 🛠 Technology Stack

### Core Framework
- **Next.js 15 (App Router)**: Utilizing React Server Components (RSC) and Server Actions for high-performance rendering.
- **TypeScript**: Ensuring type-safety across the entire monolithic codebase.

### Styling & UI
- **Tailwind CSS**: Utility-first CSS for rapid, responsive design.
- **Framer Motion**: Advanced micro-animations and smooth layout transitions.
- **Radix UI**: Accessible, unstyled primitives for complex components (Dialogs, Tabs, etc.).
- **Lucide React**: Vector-based iconography.

### State & Data Management
- **TanStack Query (React Query)**: Powerful asynchronous state management for server data fetching/caching.
- **Zod**: Schema-first validation for API requests and persistent data.

### Infrastructure & Security
- **MongoDB + Mongoose**: Scalable NoSQL persistence with strong ODM modeling.
- **Bcrypt**: Cryptographic hashing for secure credential storage.
- **Custom SID Session Management**: Real-time cross-device session invalidation policy.
- **Cloudinary**: Cloud-native asset management for organization branding.
- **Razorpay**: Integrated payment infrastructure for subscription-based access.

---

## 🏗 System Architecture

### 1. Multi-Tenant Model
The system uses an **Organization-Scoped** architecture.
- **isolation**: Reports and users are linked to `organizationId`.
- **RBAC (Role-Based Access Control)**:
  - `Member`: Scoped to their own organization and individual data.
  - `Admin`: Scoped to their organization but with management oversight.
  - `Super Admin`: Global scope across all organizations and site settings.

### 2. Security & Auth Flow
- **Session Locking**: A unique `sessionId` is generated on every login.
- **API Middleware**: Every request validates the browser's session ID against the database's `currentSessionId`.
- **Invalidation**: If a user logs in on a new device, the old session ID in the DB is overwritten, rendering the previous device unauthorized immediately.

### 3. Report Lifecycle
1. **Input**: User enters metadata (title, date, participants) and keywords.
2. **AI Processing**: Keywords are sent to an LLM (e.g., Gemini) via a server-side route.
3. **Elaboration**: The AI expands keywords into professional, context-aware paragraphs.
4. **Branding**: The system dynamically overlays the organization's letterhead and seal (from Cloudinary).
5. **PDF Generation**: High-fidelity client-side PDF generation using `jsPDF` and `html2canvas`.

---

## 📊 Database Schema (Key Collections)

### Users (`users`)
| Field | Type | Description |
|---|---|---|
| `email` | String | Unique identifier |
| `password` | String | Bcrypt hashed |
| `role` | Enum | member, admin, super_admin |
| `organizationId` | String | Link to tenant |
| `currentSessionId`| String | Security lock for active session |

### Organizations (`organizations`)
| Field | Type | Description |
|---|---|---|
| `name` | String | Display name |
| `slug` | String | URL-friendly identifier |
| `plan` | String | starter, professional, enterprise |
| `headerImage` | String | Cloudinary URL for letterhead |
| `footerImage` | String | Cloudinary URL for seal |

### Reports (`reports`)
| Field | Type | Description |
|---|---|---|
| `userId` | String | Creator's ID |
| `title` | String | Event title |
| `details` | String | Raw keywords (JSON format) |
| `content` | String | AI-generated professional description |
| `createdAt` | Date | Generation timestamp |

---

## 🤖 AI-Powered Generation Logic
The platform utilizes a prompt-engineering strategy to transform fragmented keywords into cohesive reports.

**Prompt Strategy:**
> "Act as a professional academic event coordinator. Transform the following keywords into a formal 3-paragraph report. Use professional vocabulary, ensure logical flow between events, and highlight the participant impact."

**PDF Export Engine:**
The export engine captures the styled HTML dashboard preview, preserving fonts, branding, and spacing precisely as seen on screen, ensuring "what you see is what you get" (WYSIWYG) output.

---

## 📈 Roadmap & Scalability
- **Bulk Exports**: Ability for Admins to download an entire semester's reports in a single ZIP.
- **Collaborative Editing**: Real-time multi-user editing of report content.
- **Enhanced Analytics**: Deep-learning based insights on event success rates across departments.
