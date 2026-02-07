const db = require('./server/db');

const runMigration = async () => {
    try {
        console.log('Creating navbar_items table...');
        const navbarTableQuery = `
            CREATE TABLE IF NOT EXISTS navbar_items (
                id INT AUTO_INCREMENT PRIMARY KEY,
                label VARCHAR(255) NOT NULL,
                type ENUM('fixed', 'custom', 'separator') DEFAULT 'custom',
                identifier VARCHAR(50),
                url VARCHAR(500),
                parent_id INT DEFAULT NULL,
                sort_order INT DEFAULT 0,
                is_visible BOOLEAN DEFAULT TRUE,
                icon VARCHAR(100),
                open_in_new_tab BOOLEAN DEFAULT FALSE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (parent_id) REFERENCES navbar_items(id) ON DELETE CASCADE
            )
        `;
        await db.query(navbarTableQuery);
        console.log('✓ navbar_items table created.');

        console.log('Creating uploaded_fonts table...');
        const fontsTableQuery = `
            CREATE TABLE IF NOT EXISTS uploaded_fonts (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                font_family VARCHAR(255) NOT NULL,
                file_url VARCHAR(500) NOT NULL,
                file_format VARCHAR(20),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `;
        await db.query(fontsTableQuery);
        console.log('✓ uploaded_fonts table created.');

        console.log('Seeding initial navbar items...');
        const seedQuery = `
            INSERT IGNORE INTO navbar_items (id, label, type, identifier, sort_order, is_visible) VALUES
            (1, 'HOME', 'fixed', 'home', 10, TRUE),
            (2, 'PAGES', 'fixed', 'pages', 20, TRUE),
            (3, 'COLLECTIONS', 'fixed', 'collections', 30, TRUE),
            (4, 'NEWS', 'fixed', 'news', 40, TRUE),
            (5, 'GEMSTONES', 'fixed', 'gemstones', 15, TRUE),
            (6, 'JEWELRIES', 'fixed', 'jewelries', 25, TRUE)
        `;
        await db.query(seedQuery);
        console.log('✓ Initial navbar items seeded.');

        console.log('Adding font settings...');
        const settingsQuery = `
            INSERT IGNORE INTO app_settings (setting_key, setting_value) VALUES
            ('NAVBAR_FONT', 'PT Sans Narrow'),
            ('NAVBAR_FONT_SOURCE', 'system'),
            ('NAVBAR_GOOGLE_FONT_URL', '')
        `;
        await db.query(settingsQuery);
        console.log('✓ Font settings added.');

        console.log('\n✅ Migration completed successfully!\n');
        process.exit(0);
    } catch (error) {
        console.error('❌ Migration failed:', error);
        process.exit(1);
    }
};

runMigration();
