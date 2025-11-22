# GiGSHUB

A modern data bundle purchasing platform built with React, Vite, and Cloudflare Workers.

## 🚀 Tech Stack

### Frontend
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Routing**: React Router v6
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **Animations**: Framer Motion
- **State Management**: SWR for data fetching
- **Payment Integration**: Paystack

### Backend
- **Runtime**: Cloudflare Workers
- **Framework**: Hono
- **Database**: Cloudflare D1 (SQLite)
- **Authentication**: JWT with bcrypt

## 📋 Prerequisites

- Node.js 18+ and npm
- Cloudflare account
- Paystack account (for payment processing)

## 🛠️ Local Development Setup

### 1. Clone the Repository
```bash
git clone <repository-url>
cd gigshub-web
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Variables

Create a `.env` file in the root directory:
```bash
cp .env.example .env
```

Update the values:
```env
VITE_PAYSTACK_PUBLIC_KEY=pk_test_your_public_key_here
VITE_API_URL=http://localhost:8788
```

### 4. Configure Wrangler

The `wrangler.toml` file is already configured. Update if needed:
- Database ID
- Paystack secret key (for production)

### 5. Start Development Servers

**Terminal 1 - Frontend (Vite):**
```bash
npm run dev
```
Frontend runs on: http://localhost:5173

**Terminal 2 - Backend (Cloudflare Worker):**
```bash
npm run api:dev
```
API runs on: http://localhost:8788

## 📦 Deployment

### Frontend Deployment (Vercel)

#### 1. Push to GitHub
```bash
git add .
git commit -m "Your commit message"
git push origin main
```

#### 2. Deploy to Vercel

**Via Vercel Dashboard:**
1. Go to [vercel.com](https://vercel.com)
2. Import your GitHub repository
3. Configure build settings:
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

#### 3. Add Environment Variables in Vercel

Go to **Project Settings → Environment Variables** and add:

| Variable | Value | Environment |
|----------|-------|-------------|
| `VITE_PAYSTACK_PUBLIC_KEY` | `pk_test_...` or `pk_live_...` | Production, Preview, Development |
| `VITE_API_URL` | Your Cloudflare Worker URL | Production, Preview, Development |

**Example Production Values:**
```
VITE_PAYSTACK_PUBLIC_KEY=pk_live_your_production_key
VITE_API_URL=https://gigshub.your-account.workers.dev
```

#### 4. Deploy
Click **Deploy** or push to your repository to trigger automatic deployment.

---

### Backend Deployment (Cloudflare Workers)

#### 1. Login to Cloudflare
```bash
npx wrangler login
```

#### 2. Create D1 Database (if not exists)
```bash
npx wrangler d1 create gigshub-db
```

Copy the database ID and update `wrangler.toml`:
```toml
[[d1_databases]]
binding = "DB"
database_name = "gigshub-db"
database_id = "your-database-id-here"
```

#### 3. Run Database Migrations
```bash
# Apply schema
npx wrangler d1 execute gigshub-db --remote --file=./schema.sql

# Seed data (if needed)
npx wrangler d1 execute gigshub-db --remote --file=./seed.sql
```

#### 4. Set Environment Variables in Cloudflare

Go to **Cloudflare Dashboard → Workers & Pages → Your Worker → Settings → Variables**

Add:
- **Variable Name**: `PAYSTACK_SECRET_KEY`
- **Value**: `sk_test_...` or `sk_live_...` (for production)
- **Type**: Encrypted

#### 5. Deploy Worker
```bash
npm run deploy
# or
npx wrangler deploy
```

Your API will be live at: `https://gigshub.your-account.workers.dev`

#### 6. Update Frontend API URL

After deploying the worker, update `VITE_API_URL` in Vercel to point to your production worker URL.

---

## 🔐 Security Notes

### ⚠️ IMPORTANT: Environment Variables

**NEVER commit these to Git:**
- `.env` files
- Secret keys (Paystack secret key)
- Database credentials

**Safe to commit:**
- `.env.example` (template without real values)
- `wrangler.toml` (without secrets)

### Environment Variable Separation

| Variable | Frontend (Vercel) | Backend (Cloudflare) |
|----------|-------------------|----------------------|
| `VITE_PAYSTACK_PUBLIC_KEY` | ✅ Add here | ❌ Not needed |
| `VITE_API_URL` | ✅ Add here | ❌ Not needed |
| `PAYSTACK_SECRET_KEY` | ❌ NEVER add | ✅ Add here |
| `DB` (D1 Binding) | ❌ Not applicable | ✅ Configure here |

**Why?**
- Vercel hosts the **frontend** (React app)
- Cloudflare hosts the **backend** (API/Worker)
- Secret keys should ONLY be in the backend

---

## 📁 Project Structure

```
gigshub-web/
├── src/
│   ├── app/                    # Application pages
│   │   ├── dashboard/          # Dashboard pages (user, agent, admin)
│   │   ├── checkout/           # Checkout flow
│   │   ├── stores/             # Store browsing
│   │   └── wallet/             # Wallet management
│   ├── components/             # Reusable components
│   │   ├── ui/                 # shadcn/ui components
│   │   ├── nav/                # Navigation components
│   │   └── dashboard/          # Dashboard-specific components
│   ├── contexts/               # React contexts (Auth, Cart)
│   ├── lib/                    # Utilities and helpers
│   │   ├── permissions.ts      # Role-based access control
│   │   ├── dashboard-utils.ts  # Dashboard utilities
│   │   └── utils.ts            # General utilities
│   ├── styles/                 # Global styles
│   └── worker.ts               # Cloudflare Worker (API)
├── public/                     # Static assets
├── .env.example                # Environment variables template
├── wrangler.toml               # Cloudflare Worker configuration
├── vite.config.ts              # Vite configuration
└── package.json                # Dependencies and scripts
```

---

## 🎨 Features

### User Roles & Permissions
- **Regular Users**: Purchase data bundles, manage wallet
- **Agents**: Process orders, earn commissions, manage agent wallet
- **Admins**: Full system access, user management, manual transactions

### Key Features
- 🔐 Role-based access control (RBAC)
- 💳 Paystack payment integration
- 💰 Wallet system with top-up functionality
- 📱 Mobile-responsive design
- 🌓 Light/Dark theme support
- 🎨 Apple-inspired liquid UI design
- 📊 Real-time data fetching with SWR
- 🔄 Automatic theme switching
- 📍 Draggable mobile sidebar

---

## 🧪 Development Scripts

```bash
# Frontend development
npm run dev              # Start Vite dev server (port 5173)

# Backend development
npm run api:dev          # Start Cloudflare Worker dev server (port 8788)

# Build
npm run build            # Build frontend for production

# Deploy
npm run deploy           # Deploy Cloudflare Worker

# Type checking
npm run type-check       # Run TypeScript type checking
```

---

## 🐛 Troubleshooting

### Frontend can't connect to API
- Ensure the API is running on port 8788
- Check `VITE_API_URL` in `.env`
- Verify proxy configuration in `vite.config.ts`

### Database errors
- Ensure D1 database is created and ID is correct in `wrangler.toml`
- Run migrations: `npx wrangler d1 execute gigshub-db --remote --file=./schema.sql`

### Wrangler errors
- Login: `npx wrangler login`
- Check Cloudflare account permissions
- Verify `wrangler.toml` configuration

### Build errors
- Clear cache: `rm -rf node_modules .vite dist && npm install`
- Check Node.js version (18+ required)

---

## 📝 License

[Your License Here]

## 👥 Contributors

[Your Team/Contributors]

---

## 🔗 Links

- **Production**: [Your Vercel URL]
- **API**: [Your Cloudflare Worker URL]
- **Documentation**: [Link to docs if any]

---

**Built with ❤️ using React, Vite, and Cloudflare Workers**
