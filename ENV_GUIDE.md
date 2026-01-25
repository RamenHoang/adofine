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
