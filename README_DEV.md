# 🚀 Uzum Market Telegram Mini App

Production-ready Telegram Mini App with admin panel, role-based access control, and security-first architecture.

## 📋 Table of Contents

- [Features](#features)
- [Requirements](#requirements)
- [Installation](#installation)
- [Environment Variables](#environment-variables)
- [Local Development](#local-development)
- [Testing](#testing)
- [Production Deployment](#production-deployment)
- [Architecture](#architecture)
- [Security](#security)

---

## ✨ Features

- 🔐 **Secure Authentication**: bcrypt-hashed access codes, JWT sessions
- 👥 **Role-Based Access Control**: owner, admin, editor, viewer
- 📱 **Telegram Mini App**: Native Telegram WebView integration
- 🎨 **Responsive UI**: Works on all screen sizes
- 🌐 **Multi-language**: Russian (RU) and Uzbek (UZ)
- 🤖 **AI Chat**: Groq/OpenAI powered assistant
- 📊 **Admin Panel**: User management, access codes, audit logs
- 🧪 **Mock Mode**: Local development without Telegram
- 🔍 **Full-text Search**: Manual sections with intelligent search
- 📝 **Content Management**: Sections, cards, news, FAQ

---

## 📦 Requirements

- **Node.js**: 18.x or higher
- **npm**: 9.x or higher
- **Supabase**: Account and project
- **Vercel**: For serverless API deployment (optional)

Check your versions:
```bash
node --version  # должно быть >= 18
npm --version   # должно быть >= 9
```

---

## 🔧 Installation

### 1. Clone & Install

```bash
git clone https://github.com/your-repo/vite-react2.0.git
cd vite-react2.0
npm ci  # or npm install
```

### 2. Setup Database

1. Open [Supabase Dashboard](https://app.supabase.com)
2. Go to SQL Editor
3. Copy and execute `/migrations/001_users_and_roles.sql`
4. Update the initial owner user with your Telegram ID

### 3. Get Supabase Keys

1. Go to Settings → API
2. Copy:
   - `Project URL` → `VITE_SUPABASE_URL`
   - `anon public` key → `VITE_SUPABASE_ANON_KEY`
   - `service_role` key → `SUPABASE_SERVICE_KEY` ⚠️ **Keep secret!**

### 4. Generate JWT Secret

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### 5. Configure Environment

```bash
cp .env.example .env
```

Edit `.env` with your actual values (see [Environment Variables](#environment-variables))

---

## 🌍 Environment Variables

Create `.env` file in project root:

```bash
# Frontend (public)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbG...your_anon_key
VITE_TELEGRAM_BOT_TOKEN=1234567890:ABCDEF...  # optional

# AI Configuration
VITE_AI_PROVIDER=groq  # or 'openai'
VITE_GROQ_API_KEY=gsk_...
VITE_OPENAI_API_KEY=sk-proj-...  # if using OpenAI

# Mock Mode (local dev only)
VITE_TG_MOCK=true  # Enable Telegram mock

# Backend (server-side only, NEVER commit!)
SUPABASE_SERVICE_KEY=eyJhbG...your_service_role_key
JWT_SECRET=your_64_char_hex_secret_here

NODE_ENV=development
```

⚠️ **Security Warning**: Never commit `.env` to Git! It's already in `.gitignore`.

---

## 💻 Local Development

### Standard Development Mode

```bash
npm run dev
```

Opens at [http://localhost:5173](http://localhost:5173)

### Telegram Mock Mode

For testing without real Telegram:

1. Set in `.env`:
   ```bash
   VITE_TG_MOCK=true
   ```

2. Run:
   ```bash
   npm run dev
   ```

3. You'll see a floating panel in bottom-right corner to switch between mock users:
   - **Admin User**: Full access
   - **Editor User**: Content editing
   - **Viewer User**: Read-only

### With Vercel API Locally

If you need to test serverless functions:

```bash
npm install -g vercel  # if not installed
npm run vercel:dev
```

This starts:
- Frontend: [http://localhost:3000](http://localhost:3000)
- API: [http://localhost:3000/api/*](http://localhost:3000/api/*)

---

## 🧪 Testing

### Type Checking

```bash
npm run typecheck
```

### Linting

```bash
npm run lint          # Check for issues
npm run lint:fix      # Auto-fix issues
```

### Full Check (CI simulation)

```bash
npm run check
```

Runs: `typecheck` → `lint` → `build`

### Build for Production

```bash
npm run build
```

Output in `dist/` folder

### Preview Production Build

```bash
npm run build
npm run preview
```

Opens at [http://localhost:4173](http://localhost:4173)

---

## 🚀 Production Deployment

### Deploy to Vercel

#### Option 1: Vercel Dashboard

1. Import project to Vercel
2. Add environment variables:
   - Go to Settings → Environment Variables
   - Add all from `.env` (except `VITE_TG_MOCK`)
   - **Important**: Add `SUPABASE_SERVICE_KEY` and `JWT_SECRET` as **secrets**

3. Deploy

#### Option 2: Vercel CLI

```bash
vercel --prod
```

Vercel will:
- Build the project
- Deploy frontend to CDN
- Deploy `/api/*` functions as serverless

### Environment Variables on Vercel

Add these in Vercel Dashboard → Settings → Environment Variables:

**Frontend (available to client):**
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_AI_PROVIDER`
- `VITE_GROQ_API_KEY` (or `VITE_OPENAI_API_KEY`)

**Backend (server-side only, encrypted):**
- `SUPABASE_SERVICE_KEY` ← ⚠️ Mark as **secret**
- `JWT_SECRET` ← ⚠️ Mark as **secret**

### Post-Deployment Checklist

1. ✅ Database migration applied
2. ✅ Environment variables set in Vercel
3. ✅ Created first owner user with your Telegram ID
4. ✅ Generate first access code via Admin Panel
5. ✅ Test login with access code
6. ✅ Verify API endpoints work
7. ✅ Check Telegram WebView integration

---

## 🏗 Architecture

### Frontend Structure

```
src/
├── components/        # React components
│   ├── UsersManagement.tsx
│   └── AccessCodesManagement.tsx
├── lib/              # Utilities
│   ├── api.ts        # API client
│   └── telegram-mock.ts  # Telegram mock
├── types/            # TypeScript types
│   └── global.d.ts
├── App.tsx           # Main app
├── Chat.tsx          # AI chat
└── main.tsx          # Entry point
```

### Backend Structure (Vercel Functions)

```
api/
├── _lib/             # Shared utilities
│   ├── auth.ts       # JWT, bcrypt
│   ├── config.ts     # Configuration
│   ├── middleware.ts # Auth, rate limit
│   ├── schemas.ts    # Zod validation
│   └── supabase.ts   # DB client
├── auth/
│   └── verify-code.ts   # Login endpoint
└── admin/
    ├── users.ts         # User management
    ├── access-codes.ts  # Code management
    └── audit-logs.ts    # Audit logs
```

### API Endpoints

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/api/auth/verify-code` | POST | - | Login with access code |
| `/api/admin/users` | GET | ✓ | List users |
| `/api/admin/users?id={uuid}` | PATCH | ✓ | Update user role |
| `/api/admin/access-codes` | GET | ✓ | List access codes |
| `/api/admin/access-codes` | POST | ✓ | Create access code |
| `/api/admin/access-codes?id={uuid}` | DELETE | ✓ | Deactivate code |
| `/api/admin/audit-logs` | GET | ✓ | Get audit logs |

---

## 🔐 Security

### Implemented Security Measures

1. ✅ **Bcrypt Password Hashing**: Access codes hashed with 10 salt rounds
2. ✅ **JWT Authentication**: Secure session tokens
3. ✅ **Server-Side Authorization**: All role checks on backend
4. ✅ **Rate Limiting**: Prevents brute-force attacks
5. ✅ **RLS in Supabase**: Row Level Security policies
6. ✅ **Zod Validation**: Input validation on server
7. ✅ **DOMPurify Sanitization**: XSS prevention
8. ✅ **Audit Logging**: Track all admin actions
9. ✅ **CORS Protection**: Restricted origins
10. ✅ **Service Key Isolation**: Never exposed to client

### Security Best Practices

- 🔒 Never commit `.env` files
- 🔒 Rotate `JWT_SECRET` regularly
- 🔒 Use strong access codes (auto-generated)
- 🔒 Review audit logs periodically
- 🔒 Enable 2FA for owner accounts (future feature)
- 🔒 Keep dependencies updated: `npm audit`

---

## 🐛 Troubleshooting

### Common Issues

**1. "Unauthorized" error**
- Check if token is in localStorage: `localStorage.getItem('session_token')`
- Token may have expired (7 days), login again

**2. "Forbidden" error**
- Your role doesn't have required permissions
- Check your role: `localStorage.getItem('user_role')`

**3. Build fails**
- Run `npm run typecheck` to see TypeScript errors
- Run `npm run lint` to see linting issues
- Ensure Node.js version >= 18

**4. API not working locally**
- Use `npm run vercel:dev` instead of `npm run dev`
- Check `.env` has `SUPABASE_SERVICE_KEY`

**5. Telegram WebApp not initialized**
- Enable mock mode: `VITE_TG_MOCK=true`
- Or test in real Telegram bot

### Logs

**Browser Console:**
- Look for `[TG]`, `[AUTH]`, `[API]` prefixes

**Vercel Function Logs:**
- Vercel Dashboard → Functions → Logs

**Supabase Logs:**
- Supabase Dashboard → Logs Explorer

---

## 📚 Additional Documentation

- [Security & Roles System](./SECURITY_AND_ROLES.md) - Detailed security guide
- [Database Migration](./migrations/001_users_and_roles.sql) - SQL migration
- [API Documentation](./SECURITY_AND_ROLES.md#api-endpoints) - API reference
- [Design Improvements](./DESIGN_IMPROVEMENTS.md) - Latest UI/UX changes

---

## 🎨 Recent Design Updates

### Improved Button Visibility
- ✅ All buttons now highly visible with purple gradient backgrounds
- ✅ White text on all buttons for maximum contrast
- ✅ Optimized input field sizes (50px height)
- ✅ Admin panel with carousel layout (horizontal scroll)

### Admin Panel Carousel
- 📂 Разделы
- 🗂️ Карточки  
- 📰 Новости
- ❓ FAQ
- 🔑 Коды доступа
- 🚀 Краулинг

Horizontal scrolling carousel just like the main sections!

---

## 📄 License

Private project.

---

## 🤝 Contributing

1. Create feature branch
2. Run `npm run check` before commit
3. Open pull request
4. Code review required

---

**Built with ❤️ using Vite + React + TypeScript + Supabase + Vercel**
