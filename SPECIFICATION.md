# ADO Fine Jewelry - Technical Specification

## 📋 Table of Contents
- [Overview](#overview)
- [Technology Stack](#technology-stack)
- [Architecture](#architecture)
- [Database Schema](#database-schema)
- [Backend API](#backend-api)
- [Frontend Structure](#frontend-structure)
- [Features](#features)
- [Theme & Design](#theme--design)
- [Deployment](#deployment)

---

## 🎯 Overview

**ADO Fine Jewelry** là hệ thống website thương mại điện tử cao cấp chuyên về đá quý và trang sức. Hệ thống bao gồm:
- **Frontend**: Website hiển thị sản phẩm với thiết kế premium, dark theme
- **Admin Panel**: Quản lý toàn bộ nội dung (sản phẩm, bộ sưu tập, tin tức, cấu hình)
- **Backend API**: RESTful API xử lý dữ liệu và logic nghiệp vụ

---

## 🛠 Technology Stack

### Frontend
- **Framework**: React 19.2.0
- **Routing**: React Router DOM 7.11.0
- **Build Tool**: Vite 7.2.4
- **UI Library**: Material-UI (MUI) 7.3.7
- **Rich Text Editor**: CKEditor 5
- **Styling**: CSS Modules + Inline Styles

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MySQL 2
- **File Upload**: Cloudinary
- **Environment**: dotenv

### Database
- **Type**: MySQL/MariaDB
- **ORM**: Native mysql2 driver (no ORM)

---

## 🏗 Architecture

```
adofine/
├── client/                 # Frontend React App
│   ├── src/
│   │   ├── components/    # React Components
│   │   ├── App.jsx        # Main App & Routing
│   │   └── index.css      # Global Styles
│   ├── dist/              # Build Output
│   └── package.json
│
├── server/                # Backend API
│   ├── index.js          # Express Server
│   ├── db.js             # Database Connection
│   └── .env              # Environment Variables
│
├── migrate_*.js          # Database Migration Scripts
└── schema.sql            # Database Schema
```

---

## 🗄 Database Schema

### Core Tables

#### 1. **gemstones** (Đá Quý)
```sql
- id (PK)
- title
- gemstone_category_id (FK)
- image (thumbnail)
- price
- description (Rich Text)
- weight, dimensions, color, clarity, cut, origin (Technical Specs)
- created_at
```

#### 2. **jewelry_items** (Trang Sức)
```sql
- id (PK)
- title
- jewelry_category_id (FK)
- image (thumbnail)
- price
- description (Rich Text)
- created_at
```

#### 3. **gemstone_images** (Gallery Đá Quý)
```sql
- id (PK)
- gemstone_id (FK)
- image_url
- public_id (Cloudinary)
- sort_order
```

#### 4. **jewelry_images** (Gallery Trang Sức)
```sql
- id (PK)
- jewelry_id (FK)
- image_url
- public_id (Cloudinary)
- sort_order
```

#### 5. **jewelry_gemstone_composition** (Thành phần Đá trong Trang Sức)
```sql
- id (PK)
- jewelry_id (FK)
- gemstone_category_id (FK)
```

#### 6. **gemstone_categories** (Danh mục Đá Quý)
```sql
- id (PK)
- name
- description
```

#### 7. **jewelry_categories** (Danh mục Trang Sức)
```sql
- id (PK)
- name
- description
```

### Content Tables

#### 8. **hero_slides** (Banner Trang Chủ)
```sql
- id (PK)
- image_url
- title
- subtitle
- link
- sort_order
- is_active
- created_at
```

#### 9. **posts** (Tin Tức/Blog)
```sql
- id (PK)
- title
- slug
- excerpt
- content (Rich Text)
- image_url
- author
- created_at
```

#### 10. **collections** (Bộ Sưu Tập)
```sql
- id (PK)
- title
- description
- image (main image)
- is_visible
- sort_order
- created_at
```

#### 11. **collection_items** (Sản phẩm trong Bộ Sưu Tập)
```sql
- id (PK)
- collection_id (FK)
- gemstone_id (FK, nullable)
- jewelry_id (FK, nullable)
```

### Configuration Tables

#### 12. **app_settings** (Cấu hình Hệ thống)
```sql
- id (PK)
- setting_key (UNIQUE)
- setting_value
- updated_at
```

**Settings Keys:**
- `CLOUD_NAME`, `API_KEY`, `API_SECRET`, `UPLOAD_PRESET` (Cloudinary)
- `LOGO_IMAGE`, `LOGO_TEXT_PREFIX`, `LOGO_TEXT_SUFFIX`, `LOGO_SUBTITLE` (Logo)
- `GEMSTONE_SECTION_TITLE`, `GEMSTONE_SECTION_DESC`, `GEMSTONE_SECTION_BG` (Section Config)

---

## 🔌 Backend API

### Base URL
```
http://localhost:3000/api
```

### Endpoints

#### Products (Gemstones)
```
GET    /gemstones           # List all gemstones
GET    /gemstones/:id       # Get gemstone detail (with gallery)
POST   /gemstones           # Create gemstone
PUT    /gemstones/:id       # Update gemstone
DELETE /gemstones/:id       # Delete gemstone
```

#### Products (Jewelry)
```
GET    /jewelry-items       # List all jewelry
GET    /jewelry-items/:id   # Get jewelry detail (with gallery & composition)
POST   /jewelry-items       # Create jewelry
PUT    /jewelry-items/:id   # Update jewelry
DELETE /jewelry-items/:id   # Delete jewelry
```

#### Categories
```
GET    /gemstone-categories
POST   /gemstone-categories
PUT    /gemstone-categories/:id
DELETE /gemstone-categories/:id

GET    /jewelry-categories
POST   /jewelry-categories
PUT    /jewelry-categories/:id
DELETE /jewelry-categories/:id
```

#### Hero Slides
```
GET    /hero-slides
POST   /hero-slides
PUT    /hero-slides/:id
DELETE /hero-slides/:id
```

#### Blog/News
```
GET    /posts               # List all posts
GET    /posts/:id           # Get post detail
POST   /posts               # Create post
PUT    /posts/:id           # Update post
DELETE /posts/:id           # Delete post
```

#### Collections
```
GET    /collections         # List all collections
GET    /collections/:id     # Get collection with items
POST   /collections         # Create collection
PUT    /collections/:id     # Update collection
DELETE /collections/:id     # Delete collection
```

#### Settings
```
GET    /settings            # Get all settings
POST   /settings            # Update settings (bulk)
```

#### File Upload
```
POST   /upload              # Upload image to Cloudinary
```

**Request:**
```
Content-Type: multipart/form-data
Body: { file: <binary> }
```

**Response:**
```json
{
  "url": "https://res.cloudinary.com/...",
  "public_id": "..."
}
```

---

## 🎨 Frontend Structure

### Pages

#### Public Pages
1. **Home** (`/`)
   - Hero Carousel
   - About Section
   - Collections Section (Zig-zag layout)
   - Blog Section (Latest 3 posts)
   - Product Sections (Ruby, Sapphire, Diamond, Pearl)
   - Portfolio Grid
   - Frames Section

2. **News List** (`/news`)
   - Grid of all blog posts
   - Click to detail

3. **News Detail** (`/news/:id`)
   - Full article with rich text content

4. **Collection Detail** (`/collections/:id`)
   - Hero with collection image & description
   - Separated sections for Gemstones & Jewelry

5. **Product Detail - Gemstone** (`/portfolio/:id`)
   - Image gallery
   - Technical specifications (Weight, Color, Cut, Clarity, Origin)
   - Rich text description
   - Price & CTA

6. **Product Detail - Jewelry** (`/jewelry/:id`)
   - Image gallery
   - Gemstone composition
   - Rich text description
   - Price & CTA

#### Admin Panel (`/admin`)
- Dashboard (Statistics)
- Gemstones Management
- Jewelry Management
- Gemstone Categories
- Jewelry Categories
- Hero Slides Management
- Blog Management
- Collections Management
- Settings (Logo, Cloudinary, Section Config)

### Components

#### Layout Components
- `Navbar` - Navigation bar with logo & menu
- `Footer` - Footer with contact info
- `Hero` - Hero carousel with slides

#### Content Components
- `About` - About section
- `BlogSection` - Latest 3 blog posts on home
- `CollectionsSection` - Collections zig-zag layout
- `Section` - Generic content section
- `Portfolio` - Product grid
- `Frames` - Frames section

#### Detail Components
- `BlogDetail` - Blog post detail
- `BlogList` - Blog list page
- `CollectionDetail` - Collection detail page
- `PortfolioDetail` - Product detail (gemstone/jewelry)

#### Admin Components
- `Admin` - Main admin panel with all management features

#### Utility Components
- `SingleImageUpload` - Single image upload with Cloudinary
- `ImageUpload` - Multi-image gallery upload with sorting

---

## ✨ Features

### 1. Product Management
- **Dual Product Types**: Gemstones & Jewelry
- **Rich Text Editor**: CKEditor with image upload
- **Image Gallery**: Multiple images with drag-to-reorder
- **Technical Specs**: Specialized fields for gemstones
- **Composition**: Jewelry can contain multiple gemstone types

### 2. Collections System
- **Flexible Grouping**: Mix gemstones & jewelry in one collection
- **Visibility Toggle**: Show/hide collections on frontend
- **Separated Display**: Frontend shows gemstones & jewelry in separate sections
- **Main Image**: Hero image for collection

### 3. Blog/News System
- **Rich Content**: Full CKEditor support
- **Featured Image**: Thumbnail for list view
- **Excerpt**: Short description for cards
- **Auto Slug**: Generated from title

### 4. Hero Carousel
- **Dynamic Slides**: Manage multiple hero slides
- **Sorting**: Custom order
- **Active Toggle**: Enable/disable slides
- **Link Support**: Optional CTA link

### 5. Customization
- **Logo Config**: Upload logo image or use text-based logo
- **Section Config**: Customize gemstone section (title, desc, background)
- **Cloudinary Integration**: Centralized image management

### 6. Image Management
- **Cloudinary Upload**: Direct upload from admin
- **Gallery Sorting**: Move left/right controls
- **Thumbnail + Gallery**: Main image + multiple gallery images
- **Auto Cleanup**: Delete old images when updating

---

## 🎨 Theme & Design

### Color Palette
```css
--primary-color: #d31e44    /* Red accent */
--bg-color: #000000         /* Black background */
--text-color: #ffffff       /* White text */
--text-muted: #888888       /* Gray muted text */
--card-bg: #111111          /* Dark card background */
--border-color: #333333     /* Dark border */
```

### Typography
- **Font Family**: Helvetica Neue, Helvetica, Arial, sans-serif
- **Headings**: Uppercase, letter-spacing: 2px, font-weight: 300
- **Body**: 1rem, line-height: 1.6

### Design Principles

#### 1. **Dark Luxury Theme**
- Black background (#000, #0a0a0a, #111)
- White text with high contrast
- Red accent color for CTAs and highlights
- Subtle borders (#333)

#### 2. **Premium Aesthetics**
- Large hero images with overlay
- Smooth transitions (0.3s - 0.6s)
- Hover effects (scale, translateY)
- Glassmorphism effects (backdrop-filter: blur)

#### 3. **Layout Patterns**
- **Zig-Zag**: Collections alternate image left/right
- **Grid**: Products in responsive grid (auto-fill, minmax)
- **Card-based**: Blog posts, products in cards
- **Full-width Hero**: 100vh hero sections

#### 4. **Responsive Design**
- Mobile-first approach
- Breakpoint: 768px (tablet/mobile)
- Flexible grids: `repeat(auto-fill, minmax(280px, 1fr))`
- Stack on mobile: `flex-direction: column`

#### 5. **Micro-interactions**
- Image zoom on hover (scale: 1.1)
- Card lift on hover (translateY: -5px)
- Border color change on hover
- Smooth color transitions

### Component Styles

#### Cards
```css
background: #111
border: 1px solid #333
transition: transform 0.3s
hover: transform: translateY(-5px), border-color: #d31e44
```

#### Buttons
```css
Primary: background: #d31e44, color: white
Outline: border: 1px solid white, background: transparent
Hover: background: white, color: black (for outline)
```

#### Images
```css
object-fit: cover
transition: transform 0.5s
hover: scale(1.1)
```

---

## 🚀 Deployment

### Environment Variables

#### Backend (.env)
```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=red_art_db
DB_PORT=3306
PORT=3000
```

#### Frontend (.env)
```env
VITE_API_URL=http://localhost:3000
```

**Note**: For production, update `VITE_API_URL` to your production API URL (e.g., `https://api.adofine.com`)

### Build Commands

#### Frontend
```bash
cd client
npm install
npm run build    # Output: client/dist/
npm run dev      # Development: http://localhost:5173
```

#### Backend
```bash
cd server
npm install
node index.js    # Production
nodemon index.js # Development
```

### Database Setup
```bash
# 1. Create database
mysql -u root -p
CREATE DATABASE red_art_db;

# 2. Run schema
mysql -u root -p red_art_db < schema.sql

# 3. Run migrations
node migrate_blogs.js
node migrate_collections.js
```

### Production Deployment

#### Option 1: Traditional Hosting
1. **Frontend**: Deploy `client/dist/` to static hosting (Netlify, Vercel, S3)
2. **Backend**: Deploy to VPS (DigitalOcean, AWS EC2)
3. **Database**: MySQL on same VPS or managed service (AWS RDS)

#### Option 2: Docker
```dockerfile
# Frontend
FROM node:18 AS build
WORKDIR /app
COPY client/package*.json ./
RUN npm install
COPY client/ ./
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html

# Backend
FROM node:18
WORKDIR /app
COPY server/package*.json ./
RUN npm install
COPY server/ ./
CMD ["node", "index.js"]
```

---

## 📝 Notes

### Known Limitations
1. No user authentication system
2. Admin panel not password-protected
3. No shopping cart functionality
4. No payment integration
5. No email notifications
6. No search functionality

### Future Enhancements
1. Add user authentication (JWT)
2. Implement shopping cart & checkout
3. Integrate payment gateway (Stripe, PayPal)
4. Add search & filters
5. Implement wishlist
6. Add product reviews
7. Multi-language support
8. SEO optimization (meta tags, sitemap)
9. Analytics integration (Google Analytics)
10. Performance optimization (lazy loading, code splitting)

---

## 📞 Support

For technical support or questions:
- **Project**: ADO Fine Jewelry
- **Version**: 1.0.0
- **Last Updated**: January 24, 2026

---

**Built with ❤️ for luxury jewelry e-commerce**
