# Adofine Project

## Stack
- **Frontend:** React + Vite (`client/`)
- **Backend:** Express + MySQL (`server/index.js`)
- **Images:** Cloudinary
- **Admin:** Separate app (`admin/`)

## Key File Paths
- `client/src/components/Gemstones.jsx` — Gemstone section on home page
- `client/src/components/Jewelries.jsx` — Jewelry section on home page
- `client/src/components/PortfolioGrid.jsx` — Shared grid component used by both sections and detail pages
- `client/src/components/GemstoneDetail.jsx` — Gemstone detail page (shows related jewelry)
- `server/index.js` — All API routes
- `client/src/i18n/translations.js` — i18n strings (English)

## Data Model
- `gemstone_categories` — gemstone category (RUBY, SAPPHIRE, etc.)
- `gemstones` — individual gemstone items, FK `gemstone_category_id`
- `jewelry_categories` — jewelry category (NHẪN, VÒNG, etc.)
- `jewelry_items` — individual jewelry items, FK `jewelry_category_id`
- `jewelry_gemstone_composition` — join table: `jewelry_id ↔ gemstone_category_id`

## API Endpoints (key ones)
- `GET /api/gemstones` — all gemstones with category_name
- `GET /api/gemstones/:id` — single gemstone
- `GET /api/gemstones/by-jewelry-category/:categoryId` — gemstones used in jewelry of given category
- `GET /api/gemstone-categories` — all gemstone categories
- `GET /api/jewelry` — all jewelry items
- `GET /api/jewelry/:id` — single jewelry item
- `GET /api/jewelry/by-gemstone-category/:categoryId` — jewelry containing given gemstone category
- `GET /api/jewelry-categories` — all jewelry categories
- `GET /api/settings` — site configuration (section titles, bg images, grid columns)

## Dev Commands
- Client: `cd client && npm run dev`
- Server: `cd server && node index.js`
