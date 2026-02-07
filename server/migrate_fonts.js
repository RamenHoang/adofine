
const db = require('./db');

const createTable = async () => {
    try {
        console.log('Creating uploaded_fonts table...');
        await db.query('DROP TABLE IF EXISTS uploaded_fonts');
        await db.query(`
            CREATE TABLE uploaded_fonts (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                url VARCHAR(500) NOT NULL,
                public_id VARCHAR(255),
                format VARCHAR(50),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('Table uploaded_fonts created successfully.');
        process.exit(0);
    } catch (err) {
        console.error('Error creating table:', err);
        process.exit(1);
    }
};

createTable();
