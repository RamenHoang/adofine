# Contact Us Feature - Setup Guide

## 📋 Tổng quan

Tính năng liên hệ cho phép khách hàng:
- Gửi yêu cầu thiết kế trang sức riêng
- Chọn đá quý và trang sức tham khảo
- Nhận email xác nhận tự động
- Admin nhận email thông báo ngay lập tức

## 🚀 Cài đặt

### 1. Cập nhật Database Schema

```bash
# Chạy schema.sql để tạo bảng contact_requests
mysql -u root -p red_art_db < schema.sql
```

Hoặc chỉ chạy câu lệnh tạo bảng:

```sql
CREATE TABLE IF NOT EXISTS contact_requests (
    id INT AUTO_INCREMENT PRIMARY KEY,
    salutation VARCHAR(50),
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(255) NOT NULL,
    subject VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    selected_gemstones JSON,
    selected_jewelry JSON,
    status ENUM('new', 'contacted', 'completed') DEFAULT 'new',
    admin_notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Thêm cấu hình email vào app_settings
INSERT IGNORE INTO app_settings (setting_key, setting_value) VALUES
('SMTP_HOST', 'smtp.gmail.com'),
('SMTP_PORT', '587'),
('SMTP_USER', ''),
('SMTP_PASS', ''),
('CONTACT_EMAIL', '');
```

### 2. Cấu hình Email trong Admin Panel

1. Đăng nhập vào Admin Panel
2. Vào **Cấu hình (Settings)**
3. Tìm section **"Cấu hình Email (SMTP)"**
4. Điền thông tin:

#### Dùng Gmail:

```
SMTP Host: smtp.gmail.com
SMTP Port: 587
Email gửi: your-email@gmail.com
Mật khẩu Email: xxxx-xxxx-xxxx-xxxx (App Password)
Email nhận liên hệ: admin@yourdomain.com
```

**Tạo App Password cho Gmail:**
1. Vào https://myaccount.google.com/security
2. Bật "2-Step Verification"
3. Tìm "App passwords"
4. Tạo password mới cho "Mail"
5. Copy password 16 ký tự và dán vào SMTP_PASS

#### Dùng SendGrid:

```
SMTP Host: smtp.sendgrid.net
SMTP Port: 587
Email gửi: apikey
Mật khẩu Email: <your-sendgrid-api-key>
Email nhận liên hệ: admin@yourdomain.com
```

#### Dùng AWS SES:

```
SMTP Host: email-smtp.<region>.amazonaws.com
SMTP Port: 587
Email gửi: your-verified-email@yourdomain.com
Mật khẩu Email: <your-ses-smtp-password>
Email nhận liên hệ: admin@yourdomain.com
```

5. Nhấn **"Lưu Cấu hình"**

### 3. Test Tính năng

1. Vào trang client: `http://localhost:5174/contact`
2. Điền form và submit
3. Kiểm tra:
   - ✅ Thông báo thành công trên trang
   - ✅ Email nhận được trong inbox admin
   - ✅ Record xuất hiện trong Admin Panel > "Liên hệ thiết kế"

## 📱 Sử dụng

### Khách hàng (Client)

1. Truy cập trang `/contact`
2. Điền thông tin:
   - Danh xưng (tùy chọn)
   - Số điện thoại (bắt buộc)
   - Email (bắt buộc)
   - Tiêu đề (bắt buộc)
   - Nội dung (bắt buộc)
3. Chọn đá quý tham khảo (tùy chọn)
4. Chọn trang sức tham khảo (tùy chọn)
5. Nhấn "Submit Request"

### Admin Panel

1. Vào **"Liên hệ thiết kế"** trong menu
2. Xem danh sách yêu cầu với:
   - Badge trạng thái (Mới/Đã liên hệ/Hoàn thành)
   - Thông tin khách hàng
   - Ngày gửi
3. Click icon **Edit** để xem chi tiết:
   - Thông tin đầy đủ
   - Đá quý và trang sức đã chọn
   - Cập nhật trạng thái
   - Thêm ghi chú nội bộ
4. Click icon **Delete** để xóa

## 🎨 Tùy chỉnh Email Template

File: `server/email.js`

Email template sử dụng HTML với styling inline. Bạn có thể tùy chỉnh:
- Header màu gradient
- Layout thông tin
- Danh sách đá quý/trang sức
- Footer

```javascript
const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        /* Customize styles here */
      </style>
    </head>
    <body>
      <!-- Email content -->
    </body>
    </html>
`;
```

## 🔒 Bảo mật

- ✅ Rate limiting: 5 requests/hour per IP
- ✅ Email validation
- ✅ Required field validation
- ✅ Admin authentication required for management
- ✅ SQL injection protection (parameterized queries)
- ✅ XSS protection (React escaping)

## 🐛 Troubleshooting

### Email không gửi được:

1. **Kiểm tra console server:**
   ```
   Error sending email: ...
   ```

2. **Kiểm tra cấu hình SMTP:**
   - Đúng host và port?
   - Email và password đúng?
   - Gmail: Đã tạo App Password?

3. **Test SMTP connection:**
   ```javascript
   // Thêm vào server/email.js để test
   const testConnection = async () => {
     const transporter = await createTransporter();
     await transporter.verify();
     console.log('SMTP connection successful!');
   };
   ```

### Database error:

1. **Kiểm tra bảng đã tạo:**
   ```sql
   SHOW TABLES LIKE 'contact_requests';
   DESCRIBE contact_requests;
   ```

2. **Kiểm tra settings:**
   ```sql
   SELECT * FROM app_settings WHERE setting_key LIKE 'SMTP%';
   ```

### Admin panel không hiện tab:

1. Refresh lại trang admin
2. Clear cache browser
3. Kiểm tra console có lỗi không

## 📊 Database Schema

```sql
-- Bảng contact_requests
id                  INT (Primary Key)
salutation          VARCHAR(50)        - Danh xưng (Mr., Mrs., etc.)
phone               VARCHAR(20)        - Số điện thoại *
email               VARCHAR(255)       - Email *
subject             VARCHAR(255)       - Tiêu đề *
message             TEXT               - Nội dung *
selected_gemstones  JSON               - [{id, title, price}, ...]
selected_jewelry    JSON               - [{id, title, price}, ...]
status              ENUM               - 'new', 'contacted', 'completed'
admin_notes         TEXT               - Ghi chú của admin
created_at          TIMESTAMP          - Ngày tạo
updated_at          TIMESTAMP          - Ngày cập nhật

-- app_settings (email config)
SMTP_HOST           TEXT               - SMTP server
SMTP_PORT           TEXT               - SMTP port
SMTP_USER           TEXT               - Email gửi
SMTP_PASS           TEXT               - Password
CONTACT_EMAIL       TEXT               - Email nhận
```

## 🎯 API Endpoints

### Public:
- `POST /api/contact-requests` - Submit contact (rate-limited)

### Admin (authenticated):
- `GET /api/contact-requests` - List all
- `GET /api/contact-requests/:id` - Get single
- `PUT /api/contact-requests/:id` - Update status/notes
- `DELETE /api/contact-requests/:id` - Delete

## 📝 Notes

- Email settings lưu trong database, không cần restart server khi thay đổi
- Fallback về environment variables nếu database settings trống
- Email gửi async, không block response cho user
- JSON fields cho gemstones/jewelry selections
- Auto-timestamp cho created_at và updated_at
