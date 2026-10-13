# UWAXtreme Website

Production Next.js site for the UWAXtreme hackathon, hosted at **uvaxtreme.dev** on Vercel.

- **Public site** — existing pages at `/`, `/events/v1`, `/events/v2`, `/past-events`
- **Finance Portal** — protected portal at `/finance` for the Finance Team (8 members)

---

## Table of Contents

1. [Tech Stack](#tech-stack)
2. [Repository Structure](#repository-structure)
3. [Local Development](#local-development)
4. [Finance Portal Setup](#finance-portal-setup)
   - [Prerequisites](#prerequisites)
   - [1 · Supabase](#1--supabase)
   - [2 · Resend](#2--resend)
   - [3 · Cloudflare Email Routing](#3--cloudflare-email-routing)
   - [4 · Environment Variables](#4--environment-variables)
   - [5 · Create the Admin User](#5--create-the-admin-user)
5. [Vercel Deployment](#vercel-deployment)
6. [Running Tests](#running-tests)
7. [Finance Portal — Feature Reference](#finance-portal--feature-reference)
8. [Free-Tier Limits](#free-tier-limits)
9. [Troubleshooting](#troubleshooting)

---

## Tech Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 16.2.9 (App Router, Turbopack) |
| Language | TypeScript (strict) |
| Styling | Tailwind CSS v4 (PostCSS) |
| Auth & DB | Supabase (Free tier) |
| Email sending | Resend (Free tier — 3 000 emails/month) |
| Email forwarding | Cloudflare Email Routing (free, unlimited) |
| Hosting | Vercel (Hobby — free) |
| Validation | Zod |
| Testing | Vitest v2 |

---

## Repository Structure

```
uvaxtreme-website/
├── app/
│   ├── (public site pages)         ← DO NOT MODIFY — existing public site
│   ├── finance/                    ← Finance Portal (all new code lives here)
│   │   ├── layout.tsx
│   │   ├── page.tsx                ← portal entry / redirect
│   │   ├── login/
│   │   ├── dashboard/
│   │   ├── history/
│   │   ├── proposals/new/
│   │   └── admin/
│   │       ├── page.tsx
│   │       ├── members/
│   │       └── settings/
│   ├── actions/finance/            ← Server actions (auth, email, admin)
│   ├── api/finance/webhooks/       ← Resend webhook endpoint
│   └── globals.css                 ← Finance styles appended (.fp-* namespace)
├── lib/finance/                    ← Shared server-only utilities
│   ├── supabase.ts                 ← Supabase client factories
│   ├── session.ts                  ← Server-side session helpers
│   ├── validators.ts               ← Zod schemas
│   ├── audit.ts                    ← Audit log writer
│   ├── attachments.ts              ← File validation helpers
│   └── database.types.ts           ← Generated DB types
├── supabase/migrations/
│   └── 001_finance_portal.sql      ← Complete schema + seed data
├── __tests__/finance/              ← Vitest test suites
├── proxy.ts                        ← Next.js 16 middleware (route protection)
├── .env.example                    ← Copy → .env.local, fill in secrets
└── vitest.config.ts
```

> **Important:** Never modify files outside `app/finance/`, `lib/finance/`,
> `app/actions/finance/`, `app/api/finance/`, `supabase/migrations/`,
> `__tests__/finance/`, or `proxy.ts` unless you are working on the public site.

---

## Local Development

```bash
# 1. Install dependencies
npm install

# 2. Copy the example env file and fill in your values (see below)
cp .env.example .env.local

# 3. Start the dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) for the public site.  
Open [http://localhost:3000/finance](http://localhost:3000/finance) for the portal.

---

## Finance Portal Setup

### Prerequisites

You need accounts at (all free):

- [supabase.com](https://supabase.com) — database + authentication
- [resend.com](https://resend.com) — outgoing email
- [Cloudflare](https://cloudflare.com) — incoming email routing

---

### 1 · Supabase

#### 1a. Create a Supabase Project

1. Go to [app.supabase.com](https://app.supabase.com) → **New project**
2. Choose a strong database password (save it — you won't see it again)
3. Select the nearest region (e.g. Singapore)
4. Wait ~2 minutes for provisioning

#### 1b. Run the Database Migration

1. In your project, go to **SQL Editor** → **New query**
2. Open `supabase/migrations/001_finance_portal.sql` from this repo
3. Paste the entire contents and click **Run**

This creates all tables, RLS policies, indexes, triggers, and seeds the default proposal template.

#### 1c. Create the Private Storage Bucket

1. Go to **Storage** in your Supabase dashboard
2. Click **New bucket**
3. Name: `finance-attachments`
4. **Public bucket**: ❌ OFF (must be private)
5. Click **Save**

#### 1d. Disable Public Sign-ups

1. Go to **Authentication → Providers → Email**
2. Toggle **"Allow new users to sign up"** → **OFF**
3. Save

> This ensures only admin-provisioned accounts can log in. Members cannot self-register.

#### 1e. Copy Your API Keys

Go to **Settings → API** and copy:

| Variable | Where to find it |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `anon` `public` key |
| `SUPABASE_SERVICE_ROLE_KEY` | `service_role` key (keep secret!) |

---

### 2 · Resend

#### 2a. Create a Resend Account

1. Go to [resend.com](https://resend.com) → Sign up (free)
2. Verify your personal email

#### 2b. Add and Verify the Domain

1. Go to **Domains** → **Add domain**
2. Enter `uvaxtreme.dev`
3. Resend will show you DNS records to add. Add all of them to **Name.com**:

| Type | Name | Value |
|---|---|---|
| TXT | `@` (or `uvaxtreme.dev`) | `v=spf1 include:amazonses.com ~all` *(exact value shown by Resend)* |
| TXT | `resend._domainkey` | *(DKIM key shown by Resend)* |
| CNAME | `em` | *(tracking subdomain — optional)* |

> DNS propagation can take **up to 48 hours**. Resend shows verification status in the dashboard.  
> **Do not attempt to send emails until the domain shows as Verified.**

#### 2c. Create an API Key

1. Go to **API Keys** → **Create API key**
2. Name: `uvaxtreme-finance-portal`
3. Permission: **Sending access**
4. Domain: select `uvaxtreme.dev`
5. Copy the key → add to `.env.local` as `RESEND_API_KEY`

#### 2d. Configure the Webhook

1. Go to **Webhooks** → **Add webhook**
2. Endpoint URL: `https://uvaxtreme.dev/api/finance/webhooks/resend`
3. Enable events:
   - `email.delivered`
   - `email.bounced`
   - `email.complained`
   - `email.delivery_delayed`
4. Copy the **signing secret** → add to `.env.local` as `RESEND_WEBHOOK_SECRET`

> Webhooks update the delivery status of sent emails in the portal history.

---

### 3 · Cloudflare Email Routing

Cloudflare Email Routing forwards `member@uvaxtreme.dev` → each member's personal Gmail.  
It is **completely free** and requires no code changes.

#### 3a. Add uvaxtreme.dev to Cloudflare

> **Check first:** If `uvaxtreme.dev` is already using Cloudflare for DNS (nameservers point to Cloudflare), skip to step 3b.

1. Log in to [dash.cloudflare.com](https://dash.cloudflare.com) → **Add a site**
2. Enter `uvaxtreme.dev` → choose **Free plan**
3. Cloudflare will import your existing DNS records automatically — review them carefully
4. Update the nameservers at **Name.com** to point to the two Cloudflare nameservers shown
5. Wait for propagation (usually minutes, up to 24h)

> ⚠️ **Critical:** After switching to Cloudflare nameservers, all DNS management moves to Cloudflare. The Resend DNS records from step 2b must also be present there.

#### 3b. Enable Email Routing

1. In your Cloudflare domain dashboard → **Email** → **Email Routing**
2. Click **Enable Email Routing**
3. Cloudflare will ask you to add MX records — click **Add records automatically**

| Priority | MX Record |
|---|---|
| 42 | `route1.mx.cloudflare.net` |
| 43 | `route2.mx.cloudflare.net` |
| 58 | `route3.mx.cloudflare.net` |

#### 3c. Create Forwarding Rules (per member)

Go to **Email Routing → Routing Rules** and add one rule per Finance Team member:

| Custom address | Destination |
|---|---|
| `amal@uvaxtreme.dev` | `amal.personal@gmail.com` |
| `kasun@uvaxtreme.dev` | `kasun.personal@gmail.com` |
| *(repeat for all 8 members)* | |

> Each destination Gmail must accept the verification email Cloudflare sends before forwarding activates.

#### 3d. Verify Catch-All (Optional)

Consider adding a catch-all rule forwarding `*@uvaxtreme.dev` to the admin monitor address so no messages are silently dropped.

---

### 4 · Environment Variables

Copy `.env.example` to `.env.local` and fill in every value:

```bash
cp .env.example .env.local
```

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...   # SERVER ONLY — never expose

# Resend
RESEND_API_KEY=re_...              # SERVER ONLY — never expose
RESEND_WEBHOOK_SECRET=whsec_...    # SERVER ONLY — never expose

# Finance Portal
FINANCE_ADMIN_BCC_EMAIL=finance-monitor@uvaxtreme.dev   # SERVER ONLY
FINANCE_SESSION_SECRET=<random 32+ char string>         # SERVER ONLY

# App
NEXT_PUBLIC_APP_URL=https://uvaxtreme.dev
```

Generate a secure session secret:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

> **Never commit `.env.local`.** It is already excluded by `.gitignore` (`\.env*`).

---

### 5 · Create the Admin User

Member accounts cannot be created through public sign-up. The first admin must be created via the Supabase dashboard.

#### Step 1 — Create the Auth user

1. In Supabase dashboard → **Authentication → Users** → **Add user**
2. Enter the admin's email and a strong temporary password
3. Toggle **"Auto Confirm User"** ON
4. Copy the generated `user.id` UUID

#### Step 2 — Create the profile row

In **SQL Editor**, run (replace values with real data):

```sql
INSERT INTO public.profiles (id, full_name, member_id, domain_email, role, is_active)
VALUES (
  'paste-user-id-uuid-here',   -- UUID from step 1
  'Admin Name',
  'admin-001',
  'admin@uvaxtreme.dev',
  'admin',
  true
);
```

The admin can then log in at `/finance/login` and create the remaining 8 Finance Team members through the **Admin → Members** dashboard.

#### Creating Additional Members (via Admin UI)

1. Log in as admin → `/finance/admin/members` → **Add Member**
2. Fill in: Full name, Member ID, Domain email, Role
3. A Supabase invite email is sent to the member's login email
4. The member sets their password via the invite link
5. They can then log in at `/finance/login`

---

## Vercel Deployment

The portal deploys automatically with the existing site — no separate build configuration is needed.

#### Add Environment Variables in Vercel

1. Go to your Vercel project → **Settings → Environment Variables**
2. Add every variable from `.env.local` (all environments: Production, Preview, Development)
3. **Mark these as sensitive / server-only** (do not expose to browser):
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `RESEND_API_KEY`
   - `RESEND_WEBHOOK_SECRET`
   - `FINANCE_ADMIN_BCC_EMAIL`
   - `FINANCE_SESSION_SECRET`

#### Deploy

```bash
git add .
git commit -m "feat: add Finance Portal"
git push origin main   # Vercel auto-deploys
```

After deployment, visit `https://uvaxtreme.dev/finance` to confirm the portal loads.

---

## Running Tests

```bash
# Run all tests once
npm test

# Watch mode (re-runs on file save)
npm run test:watch

# Type-check without building
npm run type-check
```

Current test coverage:

| Suite | Tests | Status |
|---|---|---|
| `validators.test.ts` | 14 | ✅ Pass |
| `security.test.ts` | 11 | ✅ Pass |
| **Total** | **25** | ✅ **All passing** |

---

## Finance Portal — Feature Reference

### Routes

| Route | Access | Description |
|---|---|---|
| `/finance` | Public | Entry point — redirects to dashboard or login |
| `/finance/login` | Public | Sign-in page |
| `/finance/dashboard` | Member | Overview + quick actions |
| `/finance/proposals/new` | Member | Compose & send sponsorship proposal |
| `/finance/history` | Member | Sent email history with delivery status |
| `/finance/admin` | Admin | Admin overview (stats + recent activity) |
| `/finance/admin/members` | Admin | Manage team members |
| `/finance/admin/settings` | Admin | Email config + system health |

### Security Model

- **No anonymous access** — `proxy.ts` intercepts all `/finance/*` requests and verifies the Supabase session server-side
- **Role-based access** — `admin` role required for `/finance/admin/*`; enforced server-side
- **Sender identity from server** — `From:` address always read from the authenticated user's `profiles.domain_email`, never from client input
- **BCC monitoring** — every outgoing proposal is BCCed to `FINANCE_ADMIN_BCC_EMAIL` (never visible to members)
- **Idempotency** — duplicate send protection via idempotency key per send attempt
- **Audit log** — all significant actions (login, send, admin changes) written to `audit_logs` table
- **Rate limiting** — login attempts and email sends limited server-side

### Email Status Tracking

Resend delivery webhooks update each email record:

| Status | Meaning |
|---|---|
| `queued` | Accepted by Resend, not yet delivered |
| `delivered` | Confirmed delivered to recipient's mail server |
| `bounced` | Permanent delivery failure |
| `complained` | Recipient marked as spam |
| `failed` | API or send error |

### PDF Attachment Limits

- Maximum file size: **40 MB** (Resend API limit)
- Accepted type: `application/pdf`
- Files are validated server-side (MIME type + magic bytes)
- Filenames are sanitised (path traversal prevention)
- Files are not stored permanently; they are streamed to Resend at send time

---

## Free-Tier Limits

| Service | Limit | Notes |
|---|---|---|
| Resend | 3 000 emails/month · 100/day | Sufficient for proposal volume |
| Supabase | 500 MB DB · 1 GB storage · 50 K MAU | Well within Finance Team usage |
| Cloudflare Email Routing | Unlimited | Free forever |
| Vercel Hobby | Unlimited deploys · 100 GB bandwidth | No issues expected |

**Features not deliverable for free:**

- Full-text search across stored email bodies at scale (would require a search index)
- Email open/click tracking (requires a paid Resend plan or third-party tool)
- More than ~3 000 outgoing proposal emails per month

---

## Troubleshooting

### `/finance` redirects to login even after logging in

- Check that `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are set correctly in `.env.local`
- Ensure the user exists in both `auth.users` and `public.profiles`
- Check that the user's `is_active` is `true` in the profiles table

### Emails fail to send

- Confirm `uvaxtreme.dev` is **Verified** in the Resend dashboard (green check)
- Confirm `RESEND_API_KEY` starts with `re_` and is a Sending Access key scoped to `uvaxtreme.dev`
- Check Resend dashboard → **Logs** for the specific error

### Webhook events not updating email status

- Confirm the webhook URL is `https://uvaxtreme.dev/api/finance/webhooks/resend` (exact)
- Confirm `RESEND_WEBHOOK_SECRET` matches the secret in Resend dashboard → Webhooks
- Check Vercel function logs for any 4xx/5xx errors on the webhook route

### Cloudflare forwarding not working

- Confirm the destination Gmail accepted the Cloudflare verification email
- Check **Email Routing → Activity** in Cloudflare for delivery status
- Ensure MX records point to Cloudflare routing servers (not Google or any old provider)
- Check that no conflicting MX records exist in your DNS

### TypeScript errors after pulling changes

```bash
npm run type-check
```

If errors appear in `lib/finance/database.types.ts`, re-generate it:

```bash
npx supabase gen types typescript --project-id YOUR_PROJECT_ID > lib/finance/database.types.ts
```

### Build fails with "proxy.ts" warning

Next.js 16 uses `proxy.ts` (not `middleware.ts`) as the request interceptor. The file at `proxy.ts` in this repo is already correctly named and exports a `proxy` function — no action required.
