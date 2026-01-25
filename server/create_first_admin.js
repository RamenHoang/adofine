const bcrypt = require('bcryptjs');
const readline = require('readline');
const db = require('./db');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

function question(query) {
    return new Promise(resolve => rl.question(query, resolve));
}

async function createFirstAdmin() {
    console.log('\n=== Create First Admin User ===\n');

    try {
        const username = await question('Enter username: ');
        if (!username || username.trim().length < 3) {
            console.error('❌ Username must be at least 3 characters');
            rl.close();
            process.exit(1);
        }

        const email = await question('Enter email: ');
        if (!email || !email.includes('@')) {
            console.error('❌ Invalid email address');
            rl.close();
            process.exit(1);
        }

        const password = await question('Enter password (min 6 characters): ');
        if (!password || password.length < 6) {
            console.error('❌ Password must be at least 6 characters');
            rl.close();
            process.exit(1);
        }

        const confirmPassword = await question('Confirm password: ');
        if (password !== confirmPassword) {
            console.error('❌ Passwords do not match');
            rl.close();
            process.exit(1);
        }

        // Check if user already exists
        const [existingUsers] = await db.query(
            'SELECT id FROM admin_users WHERE username = ? OR email = ?',
            [username.trim(), email.trim()]
        );

        if (existingUsers.length > 0) {
            console.error('❌ User with this username or email already exists');
            rl.close();
            process.exit(1);
        }

        // Hash password
        console.log('\n🔐 Hashing password...');
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert admin user
        await db.query(
            'INSERT INTO admin_users (username, email, password_hash, role, is_active) VALUES (?, ?, ?, ?, ?)',
            [username.trim(), email.trim(), hashedPassword, 'admin', true]
        );

        console.log('\n✅ Admin user created successfully!');
        console.log(`Username: ${username.trim()}`);
        console.log(`Email: ${email.trim()}`);
        console.log('\nYou can now login to the admin panel.\n');

        rl.close();
        process.exit(0);
    } catch (error) {
        console.error('\n❌ Error creating admin user:', error.message);
        console.error('Error details:', error);
        console.error('\n💡 Tip: Make sure you have run "mysql -u root -p < schema.sql" to create the admin_users table');
        rl.close();
        process.exit(1);
    }
}

createFirstAdmin();
