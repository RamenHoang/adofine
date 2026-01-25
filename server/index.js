const express = require('express');
const cors = require('cors');
const db = require('./db');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const fs = require('fs');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Configure Multer
const upload = multer({ dest: 'uploads/' });

app.get('/', (req, res) => {
    res.send('Red ART API is running');
});

// --- SETTINGS API (Cloudinary Config) ---
app.get('/api/settings', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM app_settings');
        const settings = {};
        rows.forEach(row => settings[row.setting_key] = row.setting_value);
        res.json(settings);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Database error' });
    }
});

app.post('/api/settings', async (req, res) => {
    try {
        const settings = req.body; // { CLOUD_NAME: '...', API_KEY: '...', ... }
        for (const [key, value] of Object.entries(settings)) {
            await db.query('INSERT INTO app_settings (setting_key, setting_value) VALUES (?, ?) ON DUPLICATE KEY UPDATE setting_value=?', [key, value, value]);
        }
        res.json({ message: 'Settings saved' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Database error' });
    }
});

// --- CLOUDINARY UPLOAD ---
app.post('/api/upload', upload.single('file'), async (req, res) => {
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

app.post('/api/gemstones', async (req, res) => {
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

app.put('/api/gemstones/:id', async (req, res) => {
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

app.delete('/api/gemstones/:id', async (req, res) => {
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

app.post('/api/jewelry-items', async (req, res) => {
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

app.put('/api/jewelry-items/:id', async (req, res) => {
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

app.delete('/api/jewelry-items/:id', async (req, res) => {
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

app.post('/api/gemstone-categories', async (req, res) => {
    try {
        const { name, description } = req.body;
        const [result] = await db.query('INSERT INTO gemstone_categories (name, description) VALUES (?, ?)', [name, description]);
        res.status(201).json({ id: result.insertId, name, description });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Database error' });
    }
});

app.put('/api/gemstone-categories/:id', async (req, res) => {
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

app.delete('/api/gemstone-categories/:id', async (req, res) => {
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

app.post('/api/jewelry-categories', async (req, res) => {
    try {
        const { name, description } = req.body;
        const [result] = await db.query('INSERT INTO jewelry_categories (name, description) VALUES (?, ?)', [name, description]);
        res.status(201).json({ id: result.insertId, name, description });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Database error' });
    }
});

app.put('/api/jewelry-categories/:id', async (req, res) => {
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

app.delete('/api/jewelry-categories/:id', async (req, res) => {
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

app.post('/api/hero-slides', async (req, res) => {
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

app.put('/api/hero-slides/:id', async (req, res) => {
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

app.delete('/api/hero-slides/:id', async (req, res) => {
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
        const [rows] = await db.query('SELECT * FROM posts ORDER BY created_at DESC');
        res.json(rows);
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

app.post('/api/posts', async (req, res) => {
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

app.put('/api/posts/:id', async (req, res) => {
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

app.delete('/api/posts/:id', async (req, res) => {
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

        // Fetch Items (Gemstones & Jewelry)
        const [items] = await db.query(`
            SELECT ci.*, 
                   g.title as gem_title, g.image as gem_image, g.price as gem_price,
                   j.title as jew_title, j.image as jew_image, j.price as jew_price
            FROM collection_items ci
            LEFT JOIN gemstones g ON ci.gemstone_id = g.id
            LEFT JOIN jewelry_items j ON ci.jewelry_id = j.id
            WHERE ci.collection_id = ?
        `, [collection.id]);

        // Normalize items structure
        collection.items = items.map(item => ({
            id: item.gemstone_id || item.jewelry_id, // Use product_id as id for frontend
            type: item.gemstone_id ? 'gemstone' : 'jewelry',
            title: item.gem_title || item.jew_title,
            image: item.gem_image || item.jew_image,
            price: item.gem_price || item.jew_price
        }));

        res.json(collection);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Database error' });
    }
});

app.post('/api/collections', async (req, res) => {
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

app.put('/api/collections/:id', async (req, res) => {
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

app.delete('/api/collections/:id', async (req, res) => {
    try {
        const [result] = await db.query('DELETE FROM collections WHERE id = ?', [req.params.id]);
        if (result.affectedRows === 0) return res.status(404).json({ error: 'Not found' });
        res.json({ message: 'Deleted successfully' });
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
