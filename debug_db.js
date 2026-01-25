const db = require('./server/db');

const checkDB = async () => {
    try {
        const [gems] = await db.query('SELECT id, title FROM gemstones');
        const [jews] = await db.query('SELECT id, title FROM jewelry_items');

        console.log('--- GEMSTONES ---');
        console.table(gems);

        console.log('--- JEWELRY ---');
        console.table(jews);

        process.exit(0);
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

checkDB();
