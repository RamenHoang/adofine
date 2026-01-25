const db = require('./server/db');

const runMigration = async () => {
    try {
        console.log('Running migration...');
        const queries = [
            "ALTER TABLE gemstones ADD COLUMN weight VARCHAR(50);",
            "ALTER TABLE gemstones ADD COLUMN dimensions VARCHAR(50);",
            "ALTER TABLE gemstones ADD COLUMN color VARCHAR(50);",
            "ALTER TABLE gemstones ADD COLUMN clarity VARCHAR(50);",
            "ALTER TABLE gemstones ADD COLUMN cut VARCHAR(50);",
            "ALTER TABLE gemstones ADD COLUMN origin VARCHAR(100);"
        ];

        for (const query of queries) {
            try {
                await db.query(query);
                console.log('Executed:', query);
            } catch (err) {
                // Ignore "Duplicate column name" error (code 1060)
                if (err.code === 'ER_DUP_FIELDNAME') {
                    console.log('Column already exists, skipping.');
                } else {
                    console.error('Error executing:', query, err.message);
                }
            }
        }
        console.log('Migration complete.');
        process.exit(0);
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
};

runMigration();
