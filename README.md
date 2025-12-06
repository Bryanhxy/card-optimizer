# Card Optimizer SG 💳

A mobile-first web app to maximize credit card rewards for Singapore users.

## Features

- ✅ Card Selection (persists via localStorage)
- ✅ MCC Search - type to find merchant categories
- ✅ Channel Selection - Online / Contactless / Chip
- ✅ Auto-Calculate - results update automatically
- ✅ No Bonus Warning - alerts when no cards earn bonus
- ✅ KrisFlyer Valuation - 1.1-2.0 cents/mile range

## Quick Start

```bash
npm install
npm start
```

## Deployment

```bash
npm run build
```

Deploy `build` folder to Netlify/Vercel/GitHub Pages.

## Updating Data

Cards: `src/data/cards/{card_id}.json`
Categories: `src/data/mcc_categories.json`
Card list: `src/data/cards_index.json`

## Adding a New Card

1. Create `src/data/cards/{card_id}.json`
2. Add card_id to `cards_index.json`
3. Import in `App.js` and add to `ALL_CARDS`

---
Data as of Jan 2025 • Not financial advice
