# 🎌 AnimeBill — Anime-Themed E-Bill Generator

> **Bills that make people smile!**  
> Every receipt contains a random anime character sketch — invisible enough to keep it professional, visible enough to surprise and delight! ✨

[![GitHub](https://img.shields.io/badge/GitHub-iprsnmsra-181717?style=flat&logo=github)](https://github.com/iprsnmsra)
[![Version](https://img.shields.io/badge/Version-1.0.0-6c63ff?style=flat)]()
[![License](https://img.shields.io/badge/License-MIT-green?style=flat)]()
[![No Dependencies](https://img.shields.io/badge/Dependencies-Zero-orange?style=flat)]()

---

## ✨ What is AnimeBill?

**AnimeBill** is a free, open-source e-bill generator for:
- 🏪 Retail shops & stores
- 🛒 Shopping malls & kiosks
- 📚 Bookstores & stationery
- 💻 Online sellers
- 🍱 Food stalls & restaurants

Each bill is **unique** — with a randomly selected anime character sketch faintly drawn in the background, a motivational/anime quote, and the anime's title displayed in its authentic font.

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

## 🚀 Quick Start

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

## 📋 How to Use

1. **Enter Shop Details** — Name, address, phone number
2. **Select Currency** — ₹ INR | $ USD | € EUR | £ GBP | ¥ JPY | ₩ KRW
3. **Add Items** — Name, quantity, price
4. **Choose Character** — Pick one or let it randomize!
5. **Click ⚡ Generate Bill**
6. **Print or Save PNG**

---

## 💡 Bill Features

| Feature | Details |
|---------|---------|
| 🎌 **Anime Sketch** | 20 unique characters, rotated, 10% opacity background |
| 💬 **Random Quote** | 35+ motivational/anime quotes with emojis |
| 🖤 **B&W Metallic Theme** | Professional print-ready design |
| 🖨️ **Print Ready** | Optimized @media print styles |
| 📥 **PNG Export** | High-resolution 2.5x scale export |
| 💰 **6 Currencies** | INR, USD, EUR, GBP, JPY, KRW |
| 🔢 **Bill Number** | Random unique `AB-XXXXXX` format |
| ©️ **Copyright** | `© AnimeBill by iprsnmsra` on every bill |
| 🎨 **Anime Fonts** | Each anime title in its authentic Google Font |

---

## 🎨 Anime Title Fonts Used

| Anime | Font |
|-------|------|
| One Piece | Bangers |
| Jujutsu Kaisen | Creepster |
| Pokémon | Press Start 2P |
| Naruto | Righteous |
| Dragon Ball Z | Black Han Sans |
| Attack on Titan | Russo One |
| Fullmetal Alchemist | Special Elite |
| Demon Slayer | Noto Serif JP |

---

## 📁 Project Structure

```
AnimeBill/
├── index.html          ← Main application (open this!)
├── css/
│   └── style.css       ← Metallic dark UI + B&W bill print styles
├── js/
│   ├── app.js          ← Core logic (bill gen, export, form)
│   ├── sketches.js     ← 20 anime character SVG line-art sketches
│   └── quotes.js       ← 35+ motivational & anime quotes
└── README.md           ← You are here!
```

---

## ⚙️ Technical Notes

- **Zero dependencies** — Pure HTML + CSS + Vanilla JS
- **Works offline** — No server needed (uses CDN fallback for fonts/html2canvas)
- **Print-optimized** — `@media print` hides the app UI, shows only the bill
- **SVG-based sketches** — Crisp at any print size, no pixelation
- **Font-safe** — Bill uses standard serif/monospace fonts for perfect printing

---

## 📦 Embed in Your System

AnimeBill can be integrated into any POS or billing system by embedding the bill renderer:

```js
// Include the libraries
// <script src="js/quotes.js"></script>
// <script src="js/sketches.js"></script>
// <script src="js/app.js"></script>

// Then call:
generateBill(); // generates a new bill
printBill();    // triggers print dialog
downloadPNG();  // saves as PNG
```

---

## 🪪 License

```
MIT License
Copyright (c) 2026 iprsnmsra
Permission is hereby granted, free of charge, to any person obtaining a copy
of this software to use, copy, modify, merge, publish, and distribute.
```

---

## 👤 Author

**iprsnmsra** — [@iprsnmsra](https://github.com/iprsnmsra)

> *"Making bills as exciting as a new anime arc!"* 🎌⚓

---

<p align="center">
  <strong>AnimeBill™ v1.0</strong> &nbsp;•&nbsp; Made with ❤️ by iprsnmsra &nbsp;•&nbsp; github.com/iprsnmsra
</p>
