# Bizskip

A web application that allows users to discover and book appointments with service providers.

## Tech Stack

- **Framework:** Next.js 16 (React 19)
- **Database & Auth:** Supabase
- **Styling:** Tailwind CSS, Radix UI, shadcn/ui
- **Forms:** React Hook Form + Zod
- **Language:** TypeScript

## Getting Started

1. **Install dependencies**
   ```bash
   pnpm install
   ```

2. **Configure environment**

   Create a `.env.local` file in the project root and add your Supabase credentials:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
   ```

3. **Run the development server**
   ```bash
   pnpm dev
   ```

   Open [http://localhost:3000](http://localhost:3000) in your browser.

## Features

### Authentication
- User sign up, sign in, and sign out via Supabase Auth
- Session-based middleware that protects provider and seeker routes

### Seeker (Customer) Side
- **Search:** Form to filter providers by category, service type, location, and urgency
- **Results:** Browse matched providers and view details in a slide-out sheet
- **Waitlists:** Join provider waitlists with preferred time windows; view and manage active waitlists

### Provider Side
- **Onboarding:** Multi-step wizard to set up business info, services offered, location, and hours
- **Dashboard:** Overview of stats, recent seeker requests, nearby demand, and schedule summary
- **Requests:** Review and respond to incoming seeker requests (accept, notify, dismiss)
- **Availability:** Manage availability slots and toggle real-time availability status

### Notifications
- Notification center with read/unread tracking and tabbed filtering

### Backend API (Supabase-backed)
- Provider search using a geospatial RPC (`get_available_providers_nearby`)
- Waitlist management: join, list, and leave waitlists
- Availability slot creation, editing, and deletion
- Booking confirmation tied to waitlist entries
- Provider dashboard stats and request feeds via database RPCs
- Notification fetch and mark-as-read endpoints

### Planned / In Progress
- Google Maps / Places integration for location-based provider discovery
- SMS notifications via Twilio
