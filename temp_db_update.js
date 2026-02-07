const db = require('./server/db');

const updateNavbar = async () => {
    try {
        console.log('Inserting new fixed navbar items...');
        const seedQuery = `
            INSERT IGNORE INTO navbar_items (label, type, identifier, sort_order, is_visible) VALUES
            ('GEMSTONES', 'fixed', 'gemstones', 15, TRUE),
            ('JEWELRIES', 'fixed', 'jewelries', 25, TRUE)
        `;
        await db.query(seedQuery);
        console.log('✓ New fixed navbar items inserted.');
        process.exit(0);
    } catch (error) {
        console.error('❌ Update failed:', error);
        process.exit(1);
    }
};

updateNavbar();
