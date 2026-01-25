# Hướng Dẫn Nhanh - Admin Authentication

## ✅ Đã Hoàn Thành

1. ✅ Cài đặt các thư viện bảo mật (bcryptjs, jsonwebtoken, cookie-parser, helmet, express-rate-limit)
2. ✅ Tạo bảng `admin_users` trong database
3. ✅ Xây dựng API xác thực (login, logout, kiểm tra session)
4. ✅ Bảo vệ tất cả admin endpoints với JWT middleware
5. ✅ Cấu hình CORS với credentials support
6. ✅ Thêm toast notifications cho admin và client
7. ✅ Tạo giao diện đăng nhập cho admin
8. ✅ Chuyển website client sang tiếng Anh

## 🚀 Bắt Đầu Sử Dụng

### Bước 1: Cập nhật Database

```bash
mysql -u root -p < schema.sql
```

### Bước 2: Cấu hình Environment

Tạo file `.env` trong thư mục `server/`:

```bash
cd server
cp .env.example .env
```

Chỉnh sửa file `.env`:
- Cập nhật thông tin database (DB_USER, DB_PASSWORD, DB_NAME)
- Đặt JWT_SECRET mạnh (sử dụng lệnh dưới để tạo):

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Bước 3: Tạo Tài Khoản Admin Đầu Tiên

```bash
cd server
node create_first_admin.js
```

Script sẽ hỏi:
- Username (tối thiểu 3 ký tự)
- Email
- Password (tối thiểu 6 ký tự)
- Xác nhận password

### Bước 4: Khởi Động Services

**Terminal 1 - Backend Server:**
```bash
cd server
npm start
```

**Terminal 2 - Admin Panel:**
```bash
cd admin
npm run dev
```

**Terminal 3 - Client Website (tùy chọn):**
```bash
cd client
npm run dev
```

### Bước 5: Đăng Nhập Admin

1. Mở trình duyệt và truy cập: `http://localhost:5174`
2. Nhập username và password đã tạo
3. Click "Đăng nhập"

## 🔐 Tính Năng Bảo Mật

### Backend
- ✅ JWT tokens trong httpOnly cookies (không thể truy cập từ JavaScript)
- ✅ Mã hóa password với bcrypt
- ✅ Rate limiting: Tối đa 5 lần thử đăng nhập trong 15 phút
- ✅ Security headers với Helmet
- ✅ CORS đã được cấu hình an toàn
- ✅ Thông báo lỗi chung để tránh username enumeration

### Frontend
- ✅ Session được lưu tự động
- ✅ Tự động redirect về login khi session hết hạn
- ✅ Toast notifications cho các thao tác
- ✅ Protected routes - chỉ admin đã đăng nhập mới truy cập được

## 📋 API Đã Được Bảo Vệ

Tất cả các endpoint sau đây yêu cầu đăng nhập:

**Quản lý:**
- POST/PUT/DELETE `/api/settings`
- POST `/api/upload`

**Đá quý:**
- POST/PUT/DELETE `/api/gemstones`

**Trang sức:**
- POST/PUT/DELETE `/api/jewelry-items`

**Danh mục:**
- POST/PUT/DELETE `/api/gemstone-categories`
- POST/PUT/DELETE `/api/jewelry-categories`

**Hero Slides:**
- POST/PUT/DELETE `/api/hero-slides`

**Tin tức:**
- POST/PUT/DELETE `/api/posts`

**Bộ sưu tập:**
- POST/PUT/DELETE `/api/collections`

**Lưu ý:** Tất cả GET endpoints vẫn public để website client có thể truy cập.

## 🌍 Website Client

Website client đã được chuyển sang tiếng Anh. Tất cả text được quản lý trong file:
```
client/src/i18n/translations.js
```

Bạn có thể dễ dàng thêm ngôn ngữ khác (ví dụ tiếng Việt) sau này.

## 🎨 Toast Notifications

- ✅ Thông báo thành công khi thao tác CRUD
- ✅ Thông báo lỗi khi có vấn đề
- ✅ Thông báo info khi đăng xuất

## ⚠️ Lưu Ý Quan Trọng

1. **JWT_SECRET**: Phải đặt secret mạnh trong file `.env`. KHÔNG dùng giá trị mặc định trong production!

2. **Session timeout**: Hiện tại là 1 giờ. Bạn có thể thay đổi trong `.env`:
   ```env
   JWT_EXPIRES_IN=8h  # Để 8 giờ
   ```

3. **CORS trong production**: Nhớ cập nhật `ALLOWED_ORIGINS` với domain thật:
   ```env
   ALLOWED_ORIGINS=https://yourdomain.com,https://admin.yourdomain.com
   ```

4. **HTTPS**: Trong production, nhớ bật HTTPS. Cookie `secure` flag sẽ tự động bật khi `NODE_ENV=production`.

## 🔧 Xử Lý Sự Cố

### Không đăng nhập được
- Kiểm tra JWT_SECRET đã được đặt trong `.env`
- Xem console log của server có lỗi gì không
- Kiểm tra username/password có đúng không

### Lỗi "401 Unauthorized"
- Thử logout và login lại
- Clear cookies của browser
- Kiểm tra server đang chạy

### CORS Error
- Đảm bảo `ALLOWED_ORIGINS` trong `.env` chứa cả admin và client URLs
- Kiểm tra port đang dùng có đúng không

## 📚 Tài Liệu Chi Tiết

Xem file `AUTH_SETUP.md` để có hướng dẫn chi tiết hơn về:
- Cấu trúc hệ thống
- API endpoints
- Deployment production
- Troubleshooting nâng cao

## 🎉 Hoàn Thành!

Giờ bạn có thể:
1. ✅ Đăng nhập vào admin panel một cách an toàn
2. ✅ Quản lý nội dung với giao diện có toast notifications
3. ✅ Yên tâm về bảo mật - tất cả admin APIs đã được bảo vệ
4. ✅ Website client hiển thị bằng tiếng Anh

Nếu cần thêm admin users, chạy lại script `create_first_admin.js` với thông tin khác.
