# Admin Authentication Setup Guide

## Overview
This project now includes a complete JWT-based authentication system with httpOnly cookies for admin panel security. All admin API endpoints are protected and the client has been internationalized to English.

## 🔐 Security Features Implemented

### Backend Security
- **JWT Authentication** with httpOnly cookies (1-hour expiration)
- **bcrypt** password hashing
- **Rate Limiting** on login endpoint (5 attempts per 15 minutes)
- **Helmet** security headers
- **CORS** configuration with credentials support
- **Input Validation** with express-validator
- **Generic error messages** to prevent username enumeration

### Frontend Security
- Session persistence with automatic token verification
- Silent session expiration redirect
- Credentials included in all authenticated requests
- Protected routes (admin panel only accessible when authenticated)

## 📋 Setup Instructions

### 1. Database Setup

First, apply the updated schema:

```bash
mysql -u root -p < schema.sql
```

This creates the `admin_users` table and all other necessary tables.

### 2. Environment Configuration

Create a `.env` file in the `server/` directory (use `.env.example` as template):

```bash
cd server
cp .env.example .env
```

Edit `.env` and configure:

```env
# Database
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=red_art_db

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=1h

# CORS
ALLOWED_ORIGINS=http://localhost:5174,http://localhost:5173

# Server
PORT=3000
NODE_ENV=development
```

**⚠️ IMPORTANT**: Generate a strong JWT_SECRET in production:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 3. Create First Admin User

Run the interactive script to create your first admin account:

```bash
cd server
node create_first_admin.js
```

You will be prompted for:
- Username (min 3 characters)
- Email address
- Password (min 6 characters)
- Password confirmation

### 4. Start the Services

**Terminal 1 - Backend:**
```bash
cd server
npm install  # If not already done
npm start
```

**Terminal 2 - Admin Panel:**
```bash
cd admin
npm install  # If not already done
npm run dev
```

**Terminal 3 - Client (Optional):**
```bash
cd client
npm install  # If not already done
npm run dev
```

### 5. Access Admin Panel

Navigate to `http://localhost:5174` and login with your credentials.

## 🔒 Protected Endpoints

All these endpoints now require authentication:

### Settings & Upload
- `POST /api/settings` - Update system settings
- `POST /api/upload` - Upload images to Cloudinary

### Gemstones
- `POST /api/gemstones` - Create gemstone
- `PUT /api/gemstones/:id` - Update gemstone
- `DELETE /api/gemstones/:id` - Delete gemstone

### Jewelry
- `POST /api/jewelry-items` - Create jewelry
- `PUT /api/jewelry-items/:id` - Update jewelry
- `DELETE /api/jewelry-items/:id` - Delete jewelry

### Categories
- `POST /api/gemstone-categories` - Create category
- `PUT /api/gemstone-categories/:id` - Update category
- `DELETE /api/gemstone-categories/:id` - Delete category
- `POST /api/jewelry-categories` - Create category
- `PUT /api/jewelry-categories/:id` - Update category
- `DELETE /api/jewelry-categories/:id` - Delete category

### Hero Slides
- `POST /api/hero-slides` - Create slide
- `PUT /api/hero-slides/:id` - Update slide
- `DELETE /api/hero-slides/:id` - Delete slide

### Posts/Blogs
- `POST /api/posts` - Create post
- `PUT /api/posts/:id` - Update post
- `DELETE /api/posts/:id` - Delete post

### Collections
- `POST /api/collections` - Create collection
- `PUT /api/collections/:id` - Update collection
- `DELETE /api/collections/:id` - Delete collection

**Note**: All GET endpoints remain public for the client website.

## 🔑 Authentication API Endpoints

### Login
```
POST /api/auth/login
Content-Type: application/json

{
  "username": "admin",
  "password": "your_password"
}

Response: Sets httpOnly cookie and returns user data
```

### Check Session
```
GET /api/auth/me
Cookie: token=<jwt_token>

Response: User data if authenticated
```

### Logout
```
POST /api/auth/logout

Response: Clears authentication cookie
```

## 🌍 Client Internationalization

The client website has been converted to English using `react-i18next`. All text is now managed through translation keys in `client/src/i18n/translations.js`.

To add more languages in the future:
1. Create new translation file (e.g., `vi.js` for Vietnamese)
2. Import in `client/src/i18n/config.js`
3. Add language switcher component

## 🎨 Toast Notifications

Both admin and client now use `react-toastify` for user feedback:

**Admin:**
- Success messages for CRUD operations
- Error messages for failed operations
- Info messages for logout

**Client:**
- Can be used for contact forms, error handling, etc.

## 🔧 Troubleshooting

### "401 Unauthorized" on Admin Panel
- Check if JWT_SECRET is set in `.env`
- Verify the cookie is being sent (check browser DevTools → Network → Cookies)
- Try logging out and logging in again

### CORS Errors
- Ensure `ALLOWED_ORIGINS` in `.env` includes both admin and client URLs
- Check that `credentials: 'include'` is set in all fetch calls

### Session Expires Too Quickly
- Increase `JWT_EXPIRES_IN` in `.env` (e.g., `8h` for 8 hours)
- Remember to update `maxAge` in cookie options in `server/index.js`

### Cannot Create Admin User
- Check database connection in `.env`
- Ensure `admin_users` table exists (run schema.sql)
- Verify username/email doesn't already exist

## 🚀 Production Deployment

Before deploying to production:

1. **Generate Strong JWT Secret:**
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

2. **Update Environment Variables:**
   ```env
   NODE_ENV=production
   JWT_SECRET=<your-generated-secret>
   ALLOWED_ORIGINS=https://yourdomain.com,https://admin.yourdomain.com
   ```

3. **Enable HTTPS:**
   - The `secure` flag on cookies automatically activates in production
   - Ensure your server has SSL/TLS certificates

4. **Update CORS Origins:**
   - Replace localhost URLs with production domains

5. **Rate Limiting:**
   - Consider stricter rate limits for production
   - Add rate limiting to other sensitive endpoints

6. **Database Security:**
   - Use strong DB passwords
   - Restrict DB access to localhost/specific IPs
   - Enable SSL for database connections

## 📝 Additional Notes

### Password Requirements
- Minimum 6 characters (can be increased in `create_first_admin.js`)
- No complexity requirements by default (add as needed)

### Session Management
- Sessions expire after 1 hour of inactivity
- User is silently redirected to login page on expiration
- No automatic token refresh (add refresh tokens if needed)

### Adding More Admins
To create additional admin users, run the `create_first_admin.js` script again with different credentials.

## 🆘 Support

If you encounter issues:
1. Check server logs for error messages
2. Verify all environment variables are set correctly
3. Ensure database is running and accessible
4. Check browser console for client-side errors

## 📜 License

This authentication system is part of the Adofine project.
