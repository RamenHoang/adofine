# Environment Configuration Guide

## Cấu trúc Environment Files

### Client
- `.env.development` - Cấu hình cho môi trường development
- `.env.production` - Cấu hình cho môi trường production
- `.env.example` - Mẫu cấu hình (cho git tracking)

### Admin
- `.env.development` - Cấu hình cho môi trường development
- `.env.production` - Cấu hình cho môi trường production
- `.env.example` - Mẫu cấu hình (cho git tracking)

## Cách sử dụng

### Development Mode
```bash
# Client
cd client
npm run dev

# Admin
cd admin
npm run dev
```

### Production Build
```bash
# Client
cd client
npm run build

# Admin
cd admin
npm run build
```

### Development Build (for testing)
```bash
# Client
cd client
npm run build:dev

# Admin
cd admin
npm run build:dev
```

## Environment Variables

### Client Environment Variables
- `VITE_API_URL` - URL của backend API (default: http://localhost:3000)
- `VITE_APP_NAME` - Tên ứng dụng (default: Adofine)
- `VITE_APP_ENV` - Môi trường (development/production)
- `VITE_DEBUG` - Chế độ debug (true/false)

### Admin Environment Variables
- `VITE_API_URL` - URL của backend API (default: http://localhost:5000)
- `VITE_APP_NAME` - Tên ứng dụng admin (default: Adofine Admin)
- `VITE_APP_ENV` - Môi trường (development/production)
- `VITE_DEBUG` - Chế độ debug (true/false)

### Server Environment Variables
- `PORT` - Port của server (default: 5000)
- `DB_HOST` - MySQL host (default: localhost)
- `DB_USER` - MySQL username
- `DB_PASSWORD` - MySQL password
- `DB_NAME` - MySQL database name (default: red_art_db)
- `JWT_SECRET` - Secret key cho JWT token
- `CLOUDINARY_CLOUD_NAME` - Cloudinary cloud name
- `CLOUDINARY_API_KEY` - Cloudinary API key
- `CLOUDINARY_API_SECRET` - Cloudinary API secret
- `SMTP_HOST` - (Optional) SMTP server host - Có thể cấu hình trong Admin Panel
- `SMTP_PORT` - (Optional) SMTP server port - Có thể cấu hình trong Admin Panel
- `SMTP_USER` - (Optional) Email address for sending emails - Có thể cấu hình trong Admin Panel
- `SMTP_PASS` - (Optional) Email password or app-specific password - Có thể cấu hình trong Admin Panel
- `CONTACT_EMAIL` - (Optional) Email address to receive contact requests - Có thể cấu hình trong Admin Panel

**Note on Email Configuration:**
- Email settings can be configured in **Admin Panel > Cấu hình (Settings) > Cấu hình Email (SMTP)**
- Settings are stored in database (`app_settings` table)
- For Gmail, enable "2-Step Verification" and create an "App Password"
- Use the App Password as `SMTP_PASS` (not your regular Gmail password)
- Or use other SMTP services like SendGrid, AWS SES, etc.
- Environment variables are used as fallback if database settings are empty

## Sử dụng trong code

```javascript
import { API_URL, APP_NAME, APP_ENV, IS_DEBUG } from './config';

// Sử dụng
console.log('API URL:', API_URL);
console.log('App Name:', APP_NAME);
console.log('Environment:', APP_ENV);
if (IS_DEBUG) {
  console.log('Debug mode enabled');
}
```

## Lưu ý quan trọng

1. **KHÔNG commit file .env** - Thêm vào .gitignore:
   ```
   # Environment files
   .env.development
   .env.production
   .env.local
   ```

2. **CHỈ commit file .env.example** - File này là mẫu cho các developers khác

3. **Vite requires prefix VITE_** - Tất cả environment variables phải bắt đầu bằng `VITE_` để Vite expose chúng cho client

4. **Update production URLs** - Nhớ cập nhật `VITE_API_URL` trong `.env.production` thành URL production thực tế

## Setup cho developer mới

1. Copy file .env.example thành .env.development:
   ```bash
   cd client
   cp .env.example .env.development
   
   cd ../admin
   cp .env.example .env.development
   ```

2. Cập nhật giá trị trong .env.development nếu cần

3. Chạy development server:
   ```bash
   npm run dev
   ```
