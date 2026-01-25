const db = require('./db');
require('dotenv').config({ path: './.env' });

const check = async () => {
    try {
        const [rows] = await db.query('SELECT * FROM app_settings');
        console.log('Current DB Settings:', rows);

        const envCloudName = process.env.CLOUDINARY_CLOUD_NAME;
        const envApiKey = process.env.CLOUDINARY_API_KEY;
        const envApiSecret = process.env.CLOUDINARY_API_SECRET;

        console.log('Env Vars Present:', {
            CLOUD_NAME: !!envCloudName,
            API_KEY: !!envApiKey,
            API_SECRET: !!envApiSecret
        });

        if (rows.length === 0 && envCloudName && envApiKey && envApiSecret) {
            console.log('Seeding DB from Env...');
            await db.query('INSERT INTO app_settings (setting_key, setting_value) VALUES (?, ?)', ['CLOUD_NAME', envCloudName]);
            await db.query('INSERT INTO app_settings (setting_key, setting_value) VALUES (?, ?)', ['API_KEY', envApiKey]);
            await db.query('INSERT INTO app_settings (setting_key, setting_value) VALUES (?, ?)', ['API_SECRET', envApiSecret]);
            console.log('Seeded successfully.');
        }

        process.exit(0);
    } catch (err) {
        console.error('Error:', err.message);
        process.exit(1);
    }
};

check();
