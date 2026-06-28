# Krrish IT Service - krrish.it

Professional portfolio website for **Kerols Badr** - Software Engineer & Server Admin.

Built with **Qwik**, **MongoDB Atlas**, and **Tailwind CSS**. Deployed on **Netlify**.

## Features

- **Bilingual (AR/EN):** Full Arabic and English support with RTL layout toggle
- **Dark/Light Mode:** Theme toggle with persistent preference
- **Admin Dashboard:** Full CMS to manage projects, blog posts, and messages
- **Protected APIs:** JWT authentication, rate limiting, input sanitization, CORS headers
- **Responsive Design:** Mobile-first approach, works on all devices
- **SEO Optimized:** Meta tags, structured data, fast loading (Qwik Resumability)
- **Contact Form:** Public contact form with email validation and spam protection

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Qwik + Qwik City |
| Styling | Tailwind CSS v4 |
| Database | MongoDB Atlas (Free Tier) |
| Auth | JWT + bcrypt (HTTP-only cookies) |
| Hosting | Netlify (Edge Functions) |
| API Protection | Rate Limiting + CORS + Input Sanitization |

## Getting Started

### 1. Clone & Install

```bash
git clone https://github.com/krrish-dev/krrish-it.git
cd krrish-it
pnpm install
```

### 2. Environment Setup

```bash
cp .env.example .env
```

Edit `.env` with your values:
- `MONGODB_URI`: Your MongoDB Atlas connection string
- `JWT_SECRET`: A strong random secret for JWT signing

### 3. Run Development Server

```bash
pnpm run dev
```

### 4. Create Admin Account

After the app is running, make a POST request to create your admin account (works only once):

```bash
curl -X POST http://localhost:5173/api/auth/setup \
  -H "Content-Type: application/json" \
  -d '{"email": "kerolsbadr@gmail.com", "password": "your-secure-password", "name": "Kerols Badr"}'
```

### 5. Access Admin Dashboard

Navigate to `/admin/login` and sign in with your credentials.

## Deployment (Netlify)

1. Push code to GitHub
2. Connect repo to Netlify
3. Set environment variables in Netlify dashboard:
   - `MONGODB_URI`
   - `JWT_SECRET`
   - `ALLOWED_ORIGIN` (e.g., `https://krrish.it`)
4. Deploy!

## API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/setup` | No | Create first admin (one-time) |
| POST | `/api/auth/login` | No | Login |
| POST | `/api/auth/logout` | Yes | Logout |
| GET | `/api/auth/me` | Yes | Check auth status |
| GET | `/api/projects` | No | Get published projects |
| POST | `/api/projects` | Yes | Create project |
| PUT | `/api/projects` | Yes | Update project |
| DELETE | `/api/projects` | Yes | Delete project |
| GET | `/api/blog` | No | Get published posts |
| POST | `/api/blog` | Yes | Create post |
| PUT | `/api/blog` | Yes | Update post |
| DELETE | `/api/blog` | Yes | Delete post |
| GET | `/api/messages` | Yes | Get all messages |
| POST | `/api/messages` | No | Send contact message |
| DELETE | `/api/messages` | Yes | Delete message |

## Security Features

- **JWT with HTTP-only cookies** (prevents XSS token theft)
- **Rate limiting** (30 requests/minute per IP)
- **Input sanitization** (XSS prevention)
- **CORS headers** (configurable allowed origins)
- **Security headers** (X-Frame-Options, X-Content-Type-Options, etc.)
- **One-time setup** (admin creation endpoint disabled after first use)

## License

Private - Krrish IT Service 2026
