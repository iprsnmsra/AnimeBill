# 🎌 AnimeBill — Anime-Themed E-Bill Generator

> **Bills that make people smile!!**  
> Every receipt contains a random anime character sketch — invisible enough to keep it professional, visible enough to surprise and delight! 

[![GitHub](https://img.shields.io/badge/GitHub-iprsnmsra-181717?style=flat&logo=github)](https://github.com/iprsnmsra)
[![Version](https://img.shields.io/badge/Version-2.0.0-6c63ff?style=flat)]()
[![License](https://img.shields.io/badge/License-MIT-green?style=flat)]()
[![CI](https://github.com/iprsnmsra/AnimeBill/actions/workflows/ci.yml/badge.svg)](https://github.com/iprsnmsra/AnimeBill/actions)
[![Supabase](https://img.shields.io/badge/Database-Supabase-3ECF8E?style=flat&logo=supabase)]()

---

## What is AnimeBill?

**AnimeBill** is a free, open-source e-bill generator for:
- 🏪 Retail shops & stores
- 🛒 Shopping malls & kiosks
- 📚 Bookstores & stationery
- 💻 Online sellers
- 🍱 Food stalls & restaurants

Each bill is **unique** — with a randomly selected anime character sketch faintly drawn in the background, a motivational/anime quote, and the anime's title displayed in its authentic font.

---

## 🆕 What's New in v2.0

### 🗄️ Supabase Database
- Real authentication (email/password) with Supabase Auth
- User profiles saved in the cloud — your shop details follow you across devices
- Every generated bill is automatically saved to PostgreSQL
- Row Level Security — your data is private to you
- Falls back to localStorage if Supabase isn't configured (works offline!)

### ⚙️ CI/CD Pipeline
- GitHub Actions runs on every push & PR
- Lints JavaScript with ESLint
- Validates project structure & SQL migrations
- Security check for exposed credentials
- Vercel auto-deploys from GitHub pushes

### 📜 Bill History Dashboard ("Scroll of Bills")
- Browse all your past generated bills
- Stats dashboard: total bills, total revenue, avg bill value, favorite character
- Search & filter by bill number, shop name, character
- Sort by date, amount
- View full bill details in a modal
- Delete old bills
- Export all bills as CSV

---

## 🎌 Featured Anime Characters (20 Total)

| Anime | Characters |
|-------|-----------|
| **One Piece** | Luffy, Zoro, Nami, Ace, Sanji |
| **Jujutsu Kaisen** | Gojo Satoru, Itadori Yuji, Sukuna, Nobara, Megumi |
| **Pokémon** | Ash Ketchum, Pikachu |
| **Naruto** | Naruto Uzumaki, Sasuke Uchiha |
| **Dragon Ball Z** | Goku, Vegeta |
| **Attack on Titan** | Levi Ackerman, Eren Yeager |
| **Fullmetal Alchemist** | Edward Elric |
| **Demon Slayer** | Tanjiro Kamado |

---

## // Quick Start

### Option 1 — Open Directly (Recommended)
```bash
# Just open the file in any browser!
start D:\AnimeBill\index.html
```

### Option 2 — Local Server
```bash
cd D:\AnimeBill

# Using Python (if installed)
python -m http.server 8080

# Using Node.js (if installed)
npx serve .

# Then open: http://localhost:8080
```

---

## 🗄️ Supabase Setup (Optional — for Cloud Features)

1. Go to [supabase.com](https://supabase.com) → Create a free project
2. Go to **SQL Editor** → Paste contents of `supabase/migrations/001_initial_schema.sql` → Run
3. Go to **Project Settings → API** → Copy your **Project URL** and **anon public key**
4. Copy `js/config.example.js` → `js/config.js` and fill in your values:
   ```js
   var SUPABASE_URL      = 'https://YOUR_PROJECT_ID.supabase.co';
   var SUPABASE_ANON_KEY = 'YOUR_ANON_PUBLIC_KEY_HERE';
   ```
5. Open AnimeBill → Sign up → Your bills are now saved to the cloud! ☁️

> **Note:** AnimeBill works perfectly without Supabase too — it falls back to localStorage.

---

## 📋 How to Use

1. **Enter Shop Details** — Name, address, phone number
2. **Select Currency** — ₹ INR | $ USD | € EUR | £ GBP | ¥ JPY | ₩ KRW
3. **Add Items** — Name, quantity, price
4. **Choose Character** — Pick one or let it randomize!
5. **Click Generate Bill**
6. **Print or Save PNG**
7. **View History** — Click 📜 History to see all past bills

---

## Bill Features

| Feature | Details |
|---------|---------|
| 🎌 **Anime Sketch** | 20 unique characters, rotated, 10% opacity background |
| 💬 **Random Quote** | 35+ motivational/anime quotes with emojis |
| 🖤 **B&W Metallic Theme** | Professional print-ready design |
| 🖨️ **Print Ready** | Optimized @media print styles |
| 📥 **PNG Export** | High-resolution 2.5x scale export |
| 💰 **6 Currencies** | INR, USD, EUR, GBP, JPY, KRW |
| 🔢 **Bill Number** | Random unique `AB-XXXXXX` format |
| ☁️ **Cloud Sync** | Bills auto-save to Supabase when logged in |
| 📜 **Bill History** | Dashboard with stats, search, export |
| 🔒 **Auth System** | Supabase Auth with localStorage fallback |

---

## 📁 Project Structure

```
AnimeBill/
├── .github/
│   └── workflows/
│       └── ci.yml              ← CI pipeline (lint, validate, security)
├── supabase/
│   └── migrations/
│       └── 001_initial_schema.sql  ← Database schema (run in Supabase SQL Editor)
├── index.html                  ← Main bill generator
├── history.html                ← Bill History Dashboard
├── css/
│   ├── style.css               ← Metallic dark UI + bill print styles
│   ├── intro.css               ← Manga loading intro animation
│   └── dashboard.css           ← Dashboard styles
├── js/
│   ├── config.example.js       ← Supabase config template
│   ├── config.js               ← Your Supabase keys (gitignored)
│   ├── supabase-client.js      ← Database client wrapper
│   ├── app.js                  ← Core bill generation logic
│   ├── auth.js                 ← Auth (Supabase + localStorage)
│   ├── dashboard.js            ← History page logic
│   ├── sketches.js             ← 20 anime character SVG/PNG sketches
│   ├── quotes.js               ← 35+ anime quotes
│   └── intro.js                ← Manga loading animation
├── assets/
│   └── sketches/               ← Character sketch images
├── package.json                ← Dependencies + scripts
├── vercel.json                 ← Vercel deployment config
├── .eslintrc.json              ← ESLint configuration
└── .gitignore                  ← Ignores config.js, node_modules, dist
```

---

## ⚙️ Technical Notes

- **Zero runtime dependencies** — Pure HTML + CSS + Vanilla JS
- **Supabase SDK** loaded from CDN (~45KB gzipped)
- **Works offline** — Falls back to localStorage if no Supabase
- **Print-optimized** — `@media print` hides the app UI, shows only the bill
- **SVG-based sketches** — Crisp at any print size, no pixelation
- **Row Level Security** — Each user's data is isolated in PostgreSQL
- **CI/CD** — GitHub Actions validates code quality on every push

---

## 🗄️ Database Schema

```
┌─────────────┐     ┌──────────────┐     ┌──────────────┐
│   profiles   │     │    bills      │     │  bill_items   │
├─────────────┤     ├──────────────┤     ├──────────────┤
│ id (FK auth) │←──→│ user_id (FK)  │     │ bill_id (FK)  │
│ name         │     │ bill_no       │←──→│ name          │
│ shop_name    │     │ shop_name     │     │ qty           │
│ address      │     │ grand_total   │     │ price         │
│ phone        │     │ character_name│     │ gst_rate      │
│ gstin        │     │ anime_name    │     │ line_total    │
│ total_bills  │     │ created_at    │     │ sort_order    │
└─────────────┘     └──────────────┘     └──────────────┘
```

---

## License

```
MIT License
Copyright (c) 2026 iprsnmsra
Permission is hereby granted, free of charge, to any person obtaining a copy
of this software to use, copy, modify, merge, publish, and distribute.
```

---

## Author

**iprsnmsra** — [@iprsnmsra](https://github.com/iprsnmsra)

> *"Making bills as exciting as a new anime arc!"* 🎌

---

<p align="center">
  <strong>AnimeBill™ v2.0</strong> &nbsp;•&nbsp; Made with ❤️ by iprsnmsra &nbsp;•&nbsp; github.com/iprsnmsra
</p>
