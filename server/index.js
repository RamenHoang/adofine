const express = require('express');
const cors = require('cors');
const db = require('./db');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const fs = require('fs');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const { body, validationResult } = require('express-validator');
const { sendContactRequestEmail } = require('./email');

const app = express();
const port = process.env.PORT || 3000;

// Security middleware
app.use(helmet());

// CORS with credentials
const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:5174', 'http://localhost:5173'];
app.use(cors({
    origin: allowedOrigins,
    credentials: true
}));

app.use(express.json());
app.use(cookieParser());

// Rate limiter for login attempts
const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // 5 attempts
    message: 'Too many login attempts, please try again later',
    standardHeaders: true,
    legacyHeaders: false,
});

// Authentication middleware
const authenticateToken = (req, res, next) => {
    const token = req.cookies.token;

    if (!token) {
        return res.status(401).json({ error: 'Access denied. No token provided.' });
    }

    try {
        const verified = jwt.verify(token, process.env.JWT_SECRET);
        req.user = verified;
        next();
    } catch (err) {
        return res.status(401).json({ error: 'Invalid or expired token' });
    }
};

// Configure Multer
const upload = multer({ dest: 'uploads/' });

app.get('/', (req, res) => {
    res.send('Red ART API is running');
});

// --- AUTHENTICATION ENDPOINTS ---
// Login
app.post('/api/auth/login', loginLimiter, [
    body('username').trim().notEmpty().withMessage('Username is required'),
    body('password').notEmpty().withMessage('Password is required')
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ error: 'Invalid credentials' });
    }

    try {
        const { username, password } = req.body;

        // Find user
        const [users] = await db.query(
            'SELECT * FROM admin_users WHERE username = ? AND is_active = TRUE',
            [username.trim()]
        );

        if (users.length === 0) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const user = users[0];

        // Verify password
        const validPassword = await bcrypt.compare(password, user.password_hash);
        if (!validPassword) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Update last login
        await db.query('UPDATE admin_users SET last_login = NOW() WHERE id = ?', [user.id]);

        // Generate JWT
        const token = jwt.sign(
            { id: user.id, username: user.username, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN || '1h' }
        );

        // Set httpOnly cookie
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 3600000 // 1 hour
        });

        res.json({
            message: 'Login successful',
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                role: user.role
            }
        });
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Get current user (verify session)
app.get('/api/auth/me', authenticateToken, async (req, res) => {
    try {
        const [users] = await db.query(
            'SELECT id, username, email, role, is_active, last_login, created_at FROM admin_users WHERE id = ?',
            [req.user.id]
        );

        if (users.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json({ user: users[0] });
    } catch (err) {
        console.error('Get user error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Logout
app.post('/api/auth/logout', (req, res) => {
    res.clearCookie('token');
    res.json({ message: 'Logged out successfully' });
});

// Change password
app.post('/api/auth/change-password', authenticateToken, async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({ error: 'Current password and new password are required' });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({ error: 'New password must be at least 6 characters long' });
        }

        // Get current user
        const [users] = await db.query(
            'SELECT * FROM admin_users WHERE id = ?',
            [req.user.id]
        );

        if (users.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        const user = users[0];

        // Verify current password
        const validPassword = await bcrypt.compare(currentPassword, user.password_hash);
        if (!validPassword) {
            return res.status(401).json({ error: 'Current password is incorrect' });
        }

        // Hash new password
        const saltRounds = 10;
        const newPasswordHash = await bcrypt.hash(newPassword, saltRounds);

        // Update password
        await db.query(
            'UPDATE admin_users SET password_hash = ? WHERE id = ?',
            [newPasswordHash, req.user.id]
        );

        res.json({ message: 'Password changed successfully' });
    } catch (err) {
        console.error('Change password error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// --- SETTINGS API (Cloudinary Config) ---
app.get('/api/settings', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM app_settings WHERE is_private = 0');
        const settings = {};
        rows.forEach(row => settings[row.setting_key] = row.setting_value);
        res.json(settings);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Database error' });
    }
});

app.post('/api/settings', authenticateToken, async (req, res) => {
    try {
        const settings = req.body; // { CLOUD_NAME: '...', API_KEY: '...', ... }
        for (const [key, value] of Object.entries(settings)) {
            if (value) {
                await db.query('INSERT INTO app_settings (setting_key, setting_value) VALUES (?, ?) ON DUPLICATE KEY UPDATE setting_value=?', [key, value, value]);
            }
        }
        res.json({ message: 'Settings saved' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Database error' });
    }
});

// --- CLOUDINARY UPLOAD ---
app.post('/api/upload', authenticateToken, upload.single('file'), async (req, res) => {
    try {
        // 1. Fetch credentials from DB
        const [rows] = await db.query('SELECT * FROM app_settings');
        const config = {};
        rows.forEach(r => config[r.setting_key] = r.setting_value);

        if (!config.CLOUD_NAME || !config.API_KEY || !config.API_SECRET) {
            return res.status(400).json({ error: 'Cloudinary configuration missing in Database Settings' });
        }

        // 2. Configure Cloudinary
        cloudinary.config({
            cloud_name: config.CLOUD_NAME,
            api_key: config.API_KEY,
            api_secret: config.API_SECRET
        });

        // 3. Upload
        const uploadOptions = {};
        if (config.UPLOAD_PRESET) {
            uploadOptions.upload_preset = config.UPLOAD_PRESET;
        }

        const result = await cloudinary.uploader.upload(req.file.path, uploadOptions);

        // 4. Cleanup local file
        fs.unlinkSync(req.file.path);

        // 5. Return URL
        res.json({ url: result.secure_url, public_id: result.public_id });

    } catch (err) {
        console.error('Upload error:', err);
        if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
        res.status(500).json({ error: 'Upload failed: ' + err.message });
    }
});

// --- HELPER FUNCTIONS ---
const saveGemstoneImages = async (gemstoneId, images) => {
    // images: [{ url: '...', public_id: '...', sort_order: 0 }, ...]
    await db.query('DELETE FROM gemstone_images WHERE gemstone_id = ?', [gemstoneId]);
    if (images && images.length > 0) {
        for (let i = 0; i < images.length; i++) {
            const img = images[i];
            await db.query(
                'INSERT INTO gemstone_images (gemstone_id, image_url, public_id, sort_order) VALUES (?, ?, ?, ?)',
                [gemstoneId, img.url, img.public_id, i]
            );
        }
    }
};

const saveJewelryImages = async (jewelryId, images) => {
    await db.query('DELETE FROM jewelry_images WHERE jewelry_id = ?', [jewelryId]);
    if (images && images.length > 0) {
        for (let i = 0; i < images.length; i++) {
            const img = images[i];
            await db.query(
                'INSERT INTO jewelry_images (jewelry_id, image_url, public_id, sort_order) VALUES (?, ?, ?, ?)',
                [jewelryId, img.url, img.public_id, i]
            );
        }
    }
};

// --- GEMSTONES CRUD ---
app.get('/api/gemstones', async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT g.*, c.name as category_name 
            FROM gemstones g 
            LEFT JOIN gemstone_categories c ON g.gemstone_category_id = c.id
        `);
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Database error' });
    }
});

app.get('/api/gemstones/:id', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM gemstones WHERE id = ?', [req.params.id]);
        if (rows.length === 0) return res.status(404).json({ error: 'Not found' });

        const gemstone = rows[0];
        // Fetch images
        const [images] = await db.query('SELECT * FROM gemstone_images WHERE gemstone_id = ? ORDER BY sort_order ASC', [gemstone.id]);
        gemstone.gallery = images.map(img => ({ url: img.image_url, public_id: img.public_id }));

        res.json(gemstone);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Database error' });
    }
});

app.post('/api/gemstones', authenticateToken, async (req, res) => {
    try {
        const { title, gemstone_category_id, image, price, description, gallery,
            weight, dimensions, color, clarity, cut, origin } = req.body;

        const [result] = await db.query(
            'INSERT INTO gemstones (title, gemstone_category_id, image, price, description, weight, dimensions, color, clarity, cut, origin) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [title, gemstone_category_id, image, price, description, weight, dimensions, color, clarity, cut, origin]
        );
        const newId = result.insertId;

        await saveGemstoneImages(newId, gallery);

        res.status(201).json({ id: newId, ...req.body });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Database error' });
    }
});

app.put('/api/gemstones/:id', authenticateToken, async (req, res) => {
    try {
        const { title, gemstone_category_id, image, price, description, gallery,
            weight, dimensions, color, clarity, cut, origin } = req.body;

        const [result] = await db.query(
            'UPDATE gemstones SET title=?, gemstone_category_id=?, image=?, price=?, description=?, weight=?, dimensions=?, color=?, clarity=?, cut=?, origin=? WHERE id=?',
            [title, gemstone_category_id, image, price, description, weight, dimensions, color, clarity, cut, origin, req.params.id]
        );
        if (result.affectedRows === 0) return res.status(404).json({ error: 'Not found' });

        await saveGemstoneImages(req.params.id, gallery);

        res.json({ id: req.params.id, ...req.body });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Database error' });
    }
});

app.delete('/api/gemstones/:id', authenticateToken, async (req, res) => {
    try {
        const [result] = await db.query('DELETE FROM gemstones WHERE id = ?', [req.params.id]);
        if (result.affectedRows === 0) return res.status(404).json({ error: 'Not found' });
        res.json({ message: 'Deleted successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Database error' });
    }
});


// --- JEWELRY CRUD ---
app.get('/api/jewelry-items', async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT j.*, c.name as category_name 
            FROM jewelry_items j 
            LEFT JOIN jewelry_categories c ON j.jewelry_category_id = c.id
        `);

        for (let item of rows) {
            const [compRows] = await db.query(`
                SELECT gc.id, gc.name 
                FROM jewelry_gemstone_composition jgc
                JOIN gemstone_categories gc ON jgc.gemstone_category_id = gc.id
                WHERE jgc.jewelry_id = ?
            `, [item.id]);
            item.composition = compRows;
        }

        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Database error' });
    }
});

app.get('/api/jewelry-items/:id', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM jewelry_items WHERE id=?', [req.params.id]);
        if (rows.length === 0) return res.status(404).json({ error: 'Not found' });
        const item = rows[0];

        const [compRows] = await db.query(`
            SELECT gc.id, gc.name 
            FROM jewelry_gemstone_composition jgc
            JOIN gemstone_categories gc ON jgc.gemstone_category_id = gc.id
            WHERE jgc.jewelry_id = ?
        `, [item.id]);
        item.composition = compRows;

        const [images] = await db.query('SELECT * FROM jewelry_images WHERE jewelry_id = ? ORDER BY sort_order ASC', [item.id]);
        item.gallery = images.map(img => ({ url: img.image_url, public_id: img.public_id }));

        res.json(item);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Database error' });
    }
});

app.post('/api/jewelry-items', authenticateToken, async (req, res) => {
    try {
        const { title, jewelry_category_id, image, price, description, gemstone_category_ids, gallery } = req.body;

        const [result] = await db.query(
            'INSERT INTO jewelry_items (title, jewelry_category_id, image, price, description) VALUES (?, ?, ?, ?, ?)',
            [title, jewelry_category_id, image, price, description]
        );
        const newId = result.insertId;

        if (gemstone_category_ids && Array.isArray(gemstone_category_ids)) {
            for (let gemCatId of gemstone_category_ids) {
                await db.query('INSERT INTO jewelry_gemstone_composition (jewelry_id, gemstone_category_id) VALUES (?, ?)', [newId, gemCatId]);
            }
        }

        await saveJewelryImages(newId, gallery);

        res.status(201).json({ id: newId, message: 'Created successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Database error' });
    }
});

app.put('/api/jewelry-items/:id', authenticateToken, async (req, res) => {
    try {
        const { title, jewelry_category_id, image, price, description, gemstone_category_ids, gallery } = req.body;

        await db.query(
            'UPDATE jewelry_items SET title=?, jewelry_category_id=?, image=?, price=?, description=? WHERE id=?',
            [title, jewelry_category_id, image, price, description, req.params.id]
        );

        await db.query('DELETE FROM jewelry_gemstone_composition WHERE jewelry_id = ?', [req.params.id]);
        if (gemstone_category_ids && Array.isArray(gemstone_category_ids)) {
            for (let gemCatId of gemstone_category_ids) {
                await db.query('INSERT INTO jewelry_gemstone_composition (jewelry_id, gemstone_category_id) VALUES (?, ?)', [req.params.id, gemCatId]);
            }
        }

        await saveJewelryImages(req.params.id, gallery);

        res.json({ message: 'Updated successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Database error' });
    }
});

app.delete('/api/jewelry-items/:id', authenticateToken, async (req, res) => {
    try {
        const [result] = await db.query('DELETE FROM jewelry_items WHERE id = ?', [req.params.id]);
        if (result.affectedRows === 0) return res.status(404).json({ error: 'Not found' });
        res.json({ message: 'Deleted successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Database error' });
    }
});

// --- LEGACY/CATEGORY ROUTES ---
app.get('/api/jewelry', async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT j.*, c.name as category_name 
            FROM jewelry_items j 
            LEFT JOIN jewelry_categories c ON j.jewelry_category_id = c.id
        `);
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Database error' });
    }
});

app.get('/api/gemstone-categories', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM gemstone_categories');
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Database error' });
    }
});

app.post('/api/gemstone-categories', authenticateToken, async (req, res) => {
    try {
        const { name, description } = req.body;
        const [result] = await db.query('INSERT INTO gemstone_categories (name, description) VALUES (?, ?)', [name, description]);
        res.status(201).json({ id: result.insertId, name, description });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Database error' });
    }
});

app.put('/api/gemstone-categories/:id', authenticateToken, async (req, res) => {
    try {
        const { name, description } = req.body;
        const [result] = await db.query('UPDATE gemstone_categories SET name=?, description=? WHERE id=?', [name, description, req.params.id]);
        if (result.affectedRows === 0) return res.status(404).json({ error: 'Not found' });
        res.json({ id: req.params.id, name, description });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Database error' });
    }
});

app.delete('/api/gemstone-categories/:id', authenticateToken, async (req, res) => {
    try {
        const [result] = await db.query('DELETE FROM gemstone_categories WHERE id = ?', [req.params.id]);
        if (result.affectedRows === 0) return res.status(404).json({ error: 'Not found' });
        res.json({ message: 'Deleted successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Database error' });
    }
});

app.get('/api/jewelry-categories', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM jewelry_categories');
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Database error' });
    }
});

app.post('/api/jewelry-categories', authenticateToken, async (req, res) => {
    try {
        const { name, description } = req.body;
        const [result] = await db.query('INSERT INTO jewelry_categories (name, description) VALUES (?, ?)', [name, description]);
        res.status(201).json({ id: result.insertId, name, description });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Database error' });
    }
});

app.put('/api/jewelry-categories/:id', authenticateToken, async (req, res) => {
    try {
        const { name, description } = req.body;
        const [result] = await db.query('UPDATE jewelry_categories SET name=?, description=? WHERE id=?', [name, description, req.params.id]);
        if (result.affectedRows === 0) return res.status(404).json({ error: 'Not found' });
        res.json({ id: req.params.id, name, description });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Database error' });
    }
});

app.delete('/api/jewelry-categories/:id', authenticateToken, async (req, res) => {
    try {
        const [result] = await db.query('DELETE FROM jewelry_categories WHERE id = ?', [req.params.id]);
        if (result.affectedRows === 0) return res.status(404).json({ error: 'Not found' });
        res.json({ message: 'Deleted successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Database error' });
    }
});

// --- HERO SLIDES CRUD ---
app.get('/api/hero-slides', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM hero_slides ORDER BY sort_order ASC');
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Database error' });
    }
});

app.post('/api/hero-slides', authenticateToken, async (req, res) => {
    try {
        const { image_url, title, subtitle, link, sort_order } = req.body;
        const [result] = await db.query(
            'INSERT INTO hero_slides (image_url, title, subtitle, link, sort_order) VALUES (?, ?, ?, ?, ?)',
            [image_url, title, subtitle, link, sort_order || 0]
        );
        res.status(201).json({ id: result.insertId, ...req.body });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Database error' });
    }
});

app.put('/api/hero-slides/:id', authenticateToken, async (req, res) => {
    try {
        const { image_url, title, subtitle, link, sort_order, is_active } = req.body;
        const [result] = await db.query(
            'UPDATE hero_slides SET image_url=?, title=?, subtitle=?, link=?, sort_order=?, is_active=? WHERE id=?',
            [image_url, title, subtitle, link, sort_order, is_active, req.params.id]
        );
        if (result.affectedRows === 0) return res.status(404).json({ error: 'Not found' });
        res.json({ id: req.params.id, ...req.body });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Database error' });
    }
});

app.delete('/api/hero-slides/:id', authenticateToken, async (req, res) => {
    try {
        const [result] = await db.query('DELETE FROM hero_slides WHERE id = ?', [req.params.id]);
        if (result.affectedRows === 0) return res.status(404).json({ error: 'Not found' });
        res.json({ message: 'Deleted successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Database error' });
    }
});

// --- BLOG CRUD ---
app.get('/api/posts', async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 10;
        const offset = parseInt(req.query.offset) || 0;
        
        // Get total count
        const [countResult] = await db.query('SELECT COUNT(*) as total FROM posts');
        const total = countResult[0].total;
        
        // Get posts with pagination
        const [rows] = await db.query(
            'SELECT * FROM posts ORDER BY created_at DESC LIMIT ? OFFSET ?',
            [limit, offset]
        );
        
        res.json({
            posts: rows,
            total,
            limit,
            offset,
            hasMore: offset + rows.length < total
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Database error' });
    }
});

app.get('/api/posts/:id', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM posts WHERE id = ?', [req.params.id]);
        if (rows.length === 0) return res.status(404).json({ error: 'Not found' });
        res.json(rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Database error' });
    }
});

app.post('/api/posts', authenticateToken, async (req, res) => {
    try {
        const { title, excerpt, content, image_url, author } = req.body;
        // Simple slug generation
        const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Date.now();

        const [result] = await db.query(
            'INSERT INTO posts (title, slug, excerpt, content, image_url, author) VALUES (?, ?, ?, ?, ?, ?)',
            [title, slug, excerpt, content, image_url, author]
        );
        res.status(201).json({ id: result.insertId, slug, ...req.body });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Database error' });
    }
});

app.put('/api/posts/:id', authenticateToken, async (req, res) => {
    try {
        const { title, excerpt, content, image_url, author } = req.body;
        const [result] = await db.query(
            'UPDATE posts SET title=?, excerpt=?, content=?, image_url=?, author=? WHERE id=?',
            [title, excerpt, content, image_url, author, req.params.id]
        );
        if (result.affectedRows === 0) return res.status(404).json({ error: 'Not found' });
        res.json({ id: req.params.id, ...req.body });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Database error' });
    }
});

app.delete('/api/posts/:id', authenticateToken, async (req, res) => {
    try {
        const [result] = await db.query('DELETE FROM posts WHERE id = ?', [req.params.id]);
        if (result.affectedRows === 0) return res.status(404).json({ error: 'Not found' });
        res.json({ message: 'Deleted successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Database error' });
    }
});

// --- COLLECTIONS CRUD ---
app.get('/api/collections', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM collections ORDER BY sort_order ASC, created_at DESC');
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Database error' });
    }
});

app.get('/api/collections/:id', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM collections WHERE id = ?', [req.params.id]);
        if (rows.length === 0) return res.status(404).json({ error: 'Not found' });
        const collection = rows[0];

        // Fetch Items (Gemstones & Jewelry) with category info
        const [items] = await db.query(`
            SELECT ci.*, 
                   g.title as gem_title, g.image as gem_image, g.price as gem_price, g.gemstone_category_id,
                   gc.name as gem_category_name,
                   j.title as jew_title, j.image as jew_image, j.price as jew_price, j.jewelry_category_id,
                   jc.name as jew_category_name
            FROM collection_items ci
            LEFT JOIN gemstones g ON ci.gemstone_id = g.id
            LEFT JOIN gemstone_categories gc ON g.gemstone_category_id = gc.id
            LEFT JOIN jewelry_items j ON ci.jewelry_id = j.id
            LEFT JOIN jewelry_categories jc ON j.jewelry_category_id = jc.id
            WHERE ci.collection_id = ?
        `, [collection.id]);

        // Normalize items structure
        collection.items = items.map(item => ({
            id: item.gemstone_id || item.jewelry_id,
            type: item.gemstone_id ? 'gemstone' : 'jewelry',
            title: item.gem_title || item.jew_title,
            image: item.gem_image || item.jew_image,
            price: item.gem_price || item.jew_price,
            category_name: item.gem_category_name || item.jew_category_name
        }));

        // Extract unique categories for filters
        const gemstoneCategories = [...new Set(
            collection.items
                .filter(item => item.type === 'gemstone' && item.category_name)
                .map(item => item.category_name)
        )];
        
        const jewelryCategories = [...new Set(
            collection.items
                .filter(item => item.type === 'jewelry' && item.category_name)
                .map(item => item.category_name)
        )];

        collection.gemstone_categories = gemstoneCategories;
        collection.jewelry_categories = jewelryCategories;

        res.json(collection);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Database error' });
    }
});

app.post('/api/collections', authenticateToken, async (req, res) => {
    try {
        const { title, description, image, is_visible, items } = req.body;
        // items: [{ type: 'gemstone'|'jewelry', id: 1 }, ...]

        const [result] = await db.query(
            'INSERT INTO collections (title, description, image, is_visible) VALUES (?, ?, ?, ?)',
            [title, description, image, is_visible]
        );
        const newId = result.insertId;

        if (items && Array.isArray(items)) {
            for (let item of items) {
                try {
                    if (item.type === 'gemstone') {
                        await db.query('INSERT INTO collection_items (collection_id, gemstone_id) VALUES (?, ?)', [newId, item.id]);
                    } else if (item.type === 'jewelry') {
                        await db.query('INSERT INTO collection_items (collection_id, jewelry_id) VALUES (?, ?)', [newId, item.id]);
                    }
                } catch (insertErr) {
                    console.warn(`Skipping invalid item in collection ${newId}:`, item, insertErr.code);
                }
            }
        }

        res.status(201).json({ id: newId, message: 'Created successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Database error' });
    }
});

app.put('/api/collections/:id', authenticateToken, async (req, res) => {
    try {
        const { title, description, image, is_visible, items } = req.body;

        await db.query(
            'UPDATE collections SET title=?, description=?, image=?, is_visible=? WHERE id=?',
            [title, description, image, is_visible, req.params.id]
        );

        // Update items: delete all and re-insert (simplest strategy)
        await db.query('DELETE FROM collection_items WHERE collection_id = ?', [req.params.id]);

        if (items && Array.isArray(items)) {
            for (let item of items) {
                try {
                    if (item.type === 'gemstone') {
                        await db.query('INSERT INTO collection_items (collection_id, gemstone_id) VALUES (?, ?)', [req.params.id, item.id]);
                    } else if (item.type === 'jewelry') {
                        await db.query('INSERT INTO collection_items (collection_id, jewelry_id) VALUES (?, ?)', [req.params.id, item.id]);
                    }
                } catch (insertErr) {
                    console.warn(`Skipping invalid item in collection ${req.params.id}:`, item, insertErr.code);
                }
            }
        }

        res.json({ message: 'Updated successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Database error' });
    }
});

app.delete('/api/collections/:id', authenticateToken, async (req, res) => {
    try {
        const [result] = await db.query('DELETE FROM collections WHERE id = ?', [req.params.id]);
        if (result.affectedRows === 0) return res.status(404).json({ error: 'Not found' });
        res.json({ message: 'Deleted successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Database error' });
    }
});


// --- PAGES CRUD ---
app.get('/api/pages/public', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT id, title, slug, is_visible FROM pages WHERE is_visible = TRUE ORDER BY title ASC');
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Database error' });
    }
});

app.get('/api/pages/slug/:slug', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM pages WHERE slug = ?', [req.params.slug]);
        if (rows.length === 0) return res.status(404).json({ error: 'Not found' });
        res.json(rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Database error' });
    }
});

app.get('/api/pages', authenticateToken, async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM pages ORDER BY created_at DESC');
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Database error' });
    }
});

app.get('/api/pages/:id', authenticateToken, async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM pages WHERE id = ?', [req.params.id]);
        if (rows.length === 0) return res.status(404).json({ error: 'Not found' });
        res.json(rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Database error' });
    }
});

app.post('/api/pages', authenticateToken, async (req, res) => {
    try {
        const { title, slug, content, is_visible } = req.body;
        let validSlug = slug;
        if (!validSlug) {
            validSlug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Date.now();
        }

        const [result] = await db.query(
            'INSERT INTO pages (title, slug, content, is_visible) VALUES (?, ?, ?, ?)',
            [title, validSlug, content, is_visible]
        );
        res.status(201).json({ id: result.insertId, slug: validSlug, ...req.body });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Database error' });
    }
});

app.put('/api/pages/:id', authenticateToken, async (req, res) => {
    try {
        const { title, slug, content, is_visible } = req.body;
        const [result] = await db.query(
            'UPDATE pages SET title=?, slug=?, content=?, is_visible=? WHERE id=?',
            [title, slug, content, is_visible, req.params.id]
        );
        if (result.affectedRows === 0) return res.status(404).json({ error: 'Not found' });
        res.json({ id: req.params.id, ...req.body });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Database error' });
    }
});

app.delete('/api/pages/:id', authenticateToken, async (req, res) => {
    try {
        const [result] = await db.query('DELETE FROM pages WHERE id = ?', [req.params.id]);
        if (result.affectedRows === 0) return res.status(404).json({ error: 'Not found' });
        res.json({ message: 'Deleted successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Database error' });
    }
});

// Helper function to safely parse JSON fields (handles both string and object)
const parseJsonField = (field) => {
    if (!field) return [];
    if (typeof field === 'string') {
        try {
            return JSON.parse(field);
        } catch (e) {
            console.error('Error parsing JSON field:', e);
            return [];
        }
    }
    // Already an object (MySQL 8.0+ returns JSON as objects)
    return field;
};

// Rate limiter for contact requests
const contactLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 5, // 5 requests per hour per IP
    message: 'Too many contact requests, please try again later',
    standardHeaders: true,
    legacyHeaders: false,
});

// POST /api/contact-requests - Submit contact request (public)
app.post('/api/contact-requests', contactLimiter, [
    body('phone').trim().notEmpty().withMessage('Phone is required'),
    body('email').trim().isEmail().withMessage('Valid email is required'),
    body('subject').trim().notEmpty().withMessage('Subject is required'),
    body('message').trim().notEmpty().withMessage('Message is required'),
    body('salutation').optional().trim(),
    body('selected_gemstones').optional().isArray(),
    body('selected_jewelry').optional().isArray(),
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const {
        salutation,
        phone,
        email,
        subject,
        message,
        selected_gemstones,
        selected_jewelry
    } = req.body;

    try {
        // Insert into database
        const [result] = await db.query(
            `INSERT INTO contact_requests 
            (salutation, phone, email, subject, message, selected_gemstones, selected_jewelry, status) 
            VALUES (?, ?, ?, ?, ?, ?, ?, 'new')`,
            [
                salutation || null,
                phone,
                email,
                subject,
                message,
                JSON.stringify(selected_gemstones || []),
                JSON.stringify(selected_jewelry || [])
            ]
        );

        const contactId = result.insertId;

        // Fetch the created contact with timestamp
        const [contacts] = await db.query(
            'SELECT * FROM contact_requests WHERE id = ?',
            [contactId]
        );
        const contactData = contacts[0];

        // Parse JSON fields back
        contactData.selected_gemstones = parseJsonField(contactData.selected_gemstones);
        contactData.selected_jewelry = parseJsonField(contactData.selected_jewelry);

        // Send email to admin (don't block the response if email fails)
        sendContactRequestEmail(contactData).catch(error => {
            console.error('Failed to send email notification:', error);
        });

        res.status(201).json({
            message: 'Contact request submitted successfully',
            id: contactId
        });
    } catch (error) {
        console.error('Error creating contact request:', error);
        res.status(500).json({ error: 'Failed to submit contact request' });
    }
});

// GET /api/contact-requests - Get all contact requests (admin only)
app.get('/api/contact-requests', authenticateToken, async (req, res) => {
    try {
        const [rows] = await db.query(
            'SELECT * FROM contact_requests ORDER BY created_at DESC'
        );
        
        // Parse JSON fields
        const contacts = rows.map(contact => ({
            ...contact,
            selected_gemstones: parseJsonField(contact.selected_gemstones),
            selected_jewelry: parseJsonField(contact.selected_jewelry)
        }));

        res.json(contacts);
    } catch (error) {
        console.error('Error fetching contact requests:', error);
        res.status(500).json({ error: 'Failed to fetch contact requests' });
    }
});

// GET /api/contact-requests/:id - Get single contact request (admin only)
app.get('/api/contact-requests/:id', authenticateToken, async (req, res) => {
    try {
        const [rows] = await db.query(
            'SELECT * FROM contact_requests WHERE id = ?',
            [req.params.id]
        );

        if (rows.length === 0) {
            return res.status(404).json({ error: 'Contact request not found' });
        }

        const contact = rows[0];
        contact.selected_gemstones = parseJsonField(contact.selected_gemstones);
        contact.selected_jewelry = parseJsonField(contact.selected_jewelry);

        res.json(contact);
    } catch (error) {
        console.error('Error fetching contact request:', error);
        res.status(500).json({ error: 'Failed to fetch contact request' });
    }
});

// PUT /api/contact-requests/:id - Update contact request status/notes (admin only)
app.put('/api/contact-requests/:id', authenticateToken, [
    body('status').optional().isIn(['new', 'contacted', 'completed']),
    body('admin_notes').optional().trim(),
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { status, admin_notes } = req.body;
    const updateFields = [];
    const values = [];

    if (status) {
        updateFields.push('status = ?');
        values.push(status);
    }
    if (admin_notes !== undefined) {
        updateFields.push('admin_notes = ?');
        values.push(admin_notes);
    }

    if (updateFields.length === 0) {
        return res.status(400).json({ error: 'No fields to update' });
    }

    values.push(req.params.id);

    try {
        await db.query(
            `UPDATE contact_requests SET ${updateFields.join(', ')} WHERE id = ?`,
            values
        );

        res.json({ message: 'Contact request updated successfully' });
    } catch (error) {
        console.error('Error updating contact request:', error);
        res.status(500).json({ error: 'Failed to update contact request' });
    }
});

// DELETE /api/contact-requests/:id - Delete contact request (admin only)
app.delete('/api/contact-requests/:id', authenticateToken, async (req, res) => {
    try {
        await db.query('DELETE FROM contact_requests WHERE id = ?', [req.params.id]);
        res.json({ message: 'Contact request deleted successfully' });
    } catch (error) {
        console.error('Error deleting contact request:', error);
        res.status(500).json({ error: 'Failed to delete contact request' });
    }
});

// ============================================
// NAVBAR ITEMS API
// ============================================

// GET /api/navbar-items (Public - returns visible items with nested structure)
app.get('/api/navbar-items', async (req, res) => {
    try {
        const [rows] = await db.query(
            'SELECT * FROM navbar_items WHERE is_visible = TRUE ORDER BY sort_order ASC'
        );
        
        // Build nested structure (parent-children)
        const items = rows.filter(item => !item.parent_id);
        const children = rows.filter(item => item.parent_id);
        
        items.forEach(item => {
            item.children = children.filter(child => child.parent_id === item.id);
        });
        
        res.json(items);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Database error' });
    }
});

// GET /api/navbar-items/all (Admin - returns all items)
app.get('/api/navbar-items/all', authenticateToken, async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM navbar_items ORDER BY sort_order ASC');
        
        // Build nested structure
        const items = rows.filter(item => !item.parent_id);
        const children = rows.filter(item => item.parent_id);
        
        items.forEach(item => {
            item.children = children.filter(child => child.parent_id === item.id);
        });
        
        res.json(items);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Database error' });
    }
});

// POST /api/navbar-items (Admin - create new item)
app.post('/api/navbar-items', authenticateToken, async (req, res) => {
    try {
        const { label, type, identifier, url, parent_id, sort_order, is_visible, icon, open_in_new_tab } = req.body;
        
        const [result] = await db.query(
            `INSERT INTO navbar_items 
            (label, type, identifier, url, parent_id, sort_order, is_visible, icon, open_in_new_tab) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [label, type || 'custom', identifier, url, parent_id || null, sort_order || 0, is_visible !== false, icon, open_in_new_tab || false]
        );
        
        res.status(201).json({ id: result.insertId, ...req.body });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Database error' });
    }
});

// PUT /api/navbar-items/:id (Admin - update item)
app.put('/api/navbar-items/:id', authenticateToken, async (req, res) => {
    try {
        const { label, url, parent_id, sort_order, is_visible, icon, open_in_new_tab } = req.body;
        
        const [result] = await db.query(
            `UPDATE navbar_items 
            SET label=?, url=?, parent_id=?, sort_order=?, is_visible=?, icon=?, open_in_new_tab=? 
            WHERE id=?`,
            [label, url, parent_id || null, sort_order, is_visible, icon, open_in_new_tab, req.params.id]
        );
        
        if (result.affectedRows === 0) return res.status(404).json({ error: 'Not found' });
        res.json({ id: req.params.id, ...req.body });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Database error' });
    }
});

// DELETE /api/navbar-items/:id (Admin - delete only custom items)
app.delete('/api/navbar-items/:id', authenticateToken, async (req, res) => {
    try {
        // Check if item is 'fixed' type
        const [item] = await db.query('SELECT type FROM navbar_items WHERE id = ?', [req.params.id]);
        if (item.length === 0) return res.status(404).json({ error: 'Not found' });
        if (item[0].type === 'fixed') {
            return res.status(403).json({ error: 'Cannot delete fixed navigation items' });
        }
        
        const [result] = await db.query('DELETE FROM navbar_items WHERE id = ?', [req.params.id]);
        res.json({ message: 'Deleted successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Database error' });
    }
});

// POST /api/navbar-items/reorder (Admin - batch update sort_order)
app.post('/api/navbar-items/reorder', authenticateToken, async (req, res) => {
    try {
        const { items } = req.body; // Array of { id, sort_order }
        
        for (const item of items) {
            await db.query('UPDATE navbar_items SET sort_order = ? WHERE id = ?', [item.sort_order, item.id]);
        }
        
        res.json({ message: 'Reordered successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Database error' });
    }
});

// ============================================
// FONTS API
// ============================================

// GET /api/fonts (Public - returns all uploaded fonts)
app.get('/api/fonts', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM uploaded_fonts ORDER BY created_at DESC');
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Database error' });
    }
});

// POST /api/fonts/upload (Admin - upload font file)
app.post('/api/fonts/upload', authenticateToken, upload.single('font'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No font file provided' });
        }

        const { name, font_family } = req.body;
        const file_format = path.extname(req.file.originalname).substring(1); // Remove the dot
        
        // Upload to Cloudinary
        const result = await cloudinary.uploader.upload(req.file.path, {
            folder: 'fonts',
            resource_type: 'raw', // For non-image files
            public_id: `${font_family.replace(/\s+/g, '_')}_${Date.now()}`
        });

        // Clean up temp file
        fs.unlinkSync(req.file.path);

        // Save to database
        const [dbResult] = await db.query(
            'INSERT INTO uploaded_fonts (name, font_family, file_url, file_format) VALUES (?, ?, ?, ?)',
            [name, font_family, result.secure_url, file_format]
        );

        res.status(201).json({
            id: dbResult.insertId,
            name,
            font_family,
            file_url: result.secure_url,
            file_format
        });
    } catch (err) {
        console.error(err);
        // Clean up temp file on error
        if (req.file?.path) {
            try { fs.unlinkSync(req.file.path); } catch (e) {}
        }
        res.status(500).json({ error: 'Upload failed' });
    }
});

// DELETE /api/fonts/:id (Admin - delete font)
app.delete('/api/fonts/:id', authenticateToken, async (req, res) => {
    try {
        const [result] = await db.query('DELETE FROM uploaded_fonts WHERE id = ?', [req.params.id]);
        if (result.affectedRows === 0) return res.status(404).json({ error: 'Not found' });
        res.json({ message: 'Font deleted successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Database error' });
    }
});

app.get('/test-db', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT 1 + 1 AS solution');
        res.json({ message: 'Database connected', result: rows[0].solution });
    } catch (error) {
        res.status(500).json({ error: error.message, code: error.code, stack: error.stack });
    }
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
    console.log('DB Config:', {
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        port: process.env.DB_PORT,
        database: process.env.DB_NAME
    });
});
