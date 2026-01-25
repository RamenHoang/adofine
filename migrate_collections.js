const db = require('./server/db');

const runMigration = async () => {
    try {
        console.log('Creating collections tables...');

        // Collections Table
        await db.query(`
            CREATE TABLE IF NOT EXISTS collections (
                id INT AUTO_INCREMENT PRIMARY KEY,
                title VARCHAR(255) NOT NULL,
                description TEXT,
                image VARCHAR(255),
                is_visible BOOLEAN DEFAULT TRUE,
                sort_order INT DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Collection Items Table (Many-to-Many)
        await db.query(`
            CREATE TABLE IF NOT EXISTS collection_items (
                id INT AUTO_INCREMENT PRIMARY KEY,
                collection_id INT NOT NULL,
                gemstone_id INT,
                jewelry_id INT,
                FOREIGN KEY (collection_id) REFERENCES collections(id) ON DELETE CASCADE,
                FOREIGN KEY (gemstone_id) REFERENCES gemstones(id) ON DELETE CASCADE,
                FOREIGN KEY (jewelry_id) REFERENCES jewelry_items(id) ON DELETE CASCADE
            )
        `);

        console.log('Collections tables created.');
        process.exit(0);
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
};

runMigration();
