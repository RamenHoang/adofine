// Test email settings and send a test email
const db = require('./server/db');
const { sendContactRequestEmail } = require('./server/email');

async function testEmailSettings() {
    console.log('🔍 Checking email settings in database...\n');
    
    try {
        const [rows] = await db.query(
            `SELECT setting_key, setting_value FROM app_settings 
             WHERE setting_key IN ('SMTP_HOST', 'SMTP_PORT', 'SMTP_USER', 'SMTP_PASS', 'CONTACT_EMAIL')`
        );
        
        console.log('📋 Email Settings:');
        console.log('─'.repeat(50));
        
        const settings = {};
        rows.forEach(row => {
            settings[row.setting_key] = row.setting_value;
            const displayValue = row.setting_key === 'SMTP_PASS' 
                ? (row.setting_value ? '****' + row.setting_value.slice(-4) : '(empty)')
                : (row.setting_value || '(empty)');
            console.log(`${row.setting_key}: ${displayValue}`);
        });
        
        console.log('\n');
        
        // Check if settings are configured
        if (!settings.SMTP_USER || !settings.SMTP_PASS) {
            console.log('❌ Email not configured!');
            console.log('\n📝 To configure:');
            console.log('1. Login to Admin Panel');
            console.log('2. Go to "Cấu hình (Settings)"');
            console.log('3. Scroll to "Cấu hình Email (SMTP)"');
            console.log('4. Fill in:');
            console.log('   - SMTP Host: smtp.gmail.com');
            console.log('   - SMTP Port: 587');
            console.log('   - Email gửi: your-email@gmail.com');
            console.log('   - Mật khẩu: App Password (not regular password)');
            console.log('   - Email nhận: admin@yourdomain.com');
            console.log('5. Click "Lưu Cấu hình"\n');
            process.exit(0);
        }
        
        console.log('✅ Email settings found!\n');
        
        // Test sending email with sample contact data
        const testContactData = {
            id: 999,
            salutation: 'Mr.',
            phone: '0123456789',
            email: 'customer@example.com',
            subject: 'Test Email from Contact System',
            message: 'This is a test message to verify email configuration.',
            selected_gemstones: [
                { id: 1, title: 'Ruby Test', price: '10.000.000 ₫' }
            ],
            selected_jewelry: [
                { id: 1, title: 'Ring Test', price: '5.000.000 ₫' }
            ],
            created_at: new Date()
        };
        
        console.log('📧 Sending test email...');
        
        await sendContactRequestEmail(testContactData);
        
        console.log('\n✅ Test email sent successfully!');
        console.log(`📬 Check inbox: ${settings.CONTACT_EMAIL || settings.SMTP_USER}`);
        console.log('   (also check Spam folder)\n');
        
    } catch (error) {
        console.error('\n❌ Error:', error.message);
        console.error('\nFull error:');
        console.error(error);
        console.log('\n💡 Common issues:');
        console.log('1. Gmail: Use App Password, not regular password');
        console.log('2. Check SMTP Host and Port are correct');
        console.log('3. Email might be in Spam folder');
        console.log('4. Some email providers block relay without verification\n');
    } finally {
        process.exit(0);
    }
}

testEmailSettings();
