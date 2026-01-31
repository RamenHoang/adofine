const nodemailer = require('nodemailer');
const db = require('./db');

// Get email settings from database
const getEmailSettings = async () => {
  try {
    const [rows] = await db.query(
      `SELECT setting_key, setting_value FROM app_settings 
       WHERE setting_key IN ('SMTP_HOST', 'SMTP_PORT', 'SMTP_USER', 'SMTP_PASS', 'CONTACT_EMAIL')`
    );
    
    const settings = {};
    rows.forEach(row => {
      settings[row.setting_key] = row.setting_value;
    });
    
    return settings;
  } catch (error) {
    console.error('Error fetching email settings:', error);
    // Fallback to environment variables
    return {
      SMTP_HOST: process.env.SMTP_HOST || 'smtp.gmail.com',
      SMTP_PORT: process.env.SMTP_PORT || '587',
      SMTP_USER: process.env.SMTP_USER,
      SMTP_PASS: process.env.SMTP_PASS,
      CONTACT_EMAIL: process.env.CONTACT_EMAIL
    };
  }
};

// Create reusable transporter
const createTransporter = async () => {
  const settings = await getEmailSettings();
  
  if (!settings.SMTP_USER || !settings.SMTP_PASS) {
    throw new Error('Email settings not configured. Please configure SMTP settings in admin panel.');
  }
  
  return nodemailer.createTransport({
    host: settings.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(settings.SMTP_PORT || '587'),
    secure: false, // true for 465, false for other ports
    auth: {
      user: settings.SMTP_USER,
      pass: settings.SMTP_PASS,
    },
  });
};

// Send contact request email to admin
const sendContactRequestEmail = async (contactData) => {
  const settings = await getEmailSettings();
  const transporter = await createTransporter();

  const {
    id,
    salutation,
    phone,
    email,
    subject,
    message,
    selected_gemstones,
    selected_jewelry,
    created_at,
  } = contactData;

  // Format gemstones list
  let gemstonesHtml = '';
  if (selected_gemstones && selected_gemstones.length > 0) {
    gemstonesHtml = `
      <h3>Đá quý tham khảo:</h3>
      <ul>
        ${selected_gemstones.map(g => `<li>${g.title} - ${g.price || 'N/A'}</li>`).join('')}
      </ul>
    `;
  }

  // Format jewelry list
  let jewelryHtml = '';
  if (selected_jewelry && selected_jewelry.length > 0) {
    jewelryHtml = `
      <h3>Trang sức tham khảo:</h3>
      <ul>
        ${selected_jewelry.map(j => `<li>${j.title} - ${j.price || 'N/A'}</li>`).join('')}
      </ul>
    `;
  }

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; text-align: center; }
        .content { background: #f9f9f9; padding: 20px; margin-top: 20px; }
        .info-row { margin-bottom: 15px; }
        .label { font-weight: bold; color: #555; }
        .value { color: #333; }
        ul { padding-left: 20px; }
        li { margin-bottom: 5px; }
        .footer { text-align: center; margin-top: 20px; color: #777; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🎨 Yêu cầu thiết kế trang sức mới</h1>
        </div>
        <div class="content">
          <p>Bạn có một yêu cầu liên hệ mới từ khách hàng muốn thiết kế trang sức:</p>
          
          <div class="info-row">
            <span class="label">Mã yêu cầu:</span> <span class="value">#${id}</span>
          </div>
          
          <div class="info-row">
            <span class="label">Danh xưng:</span> <span class="value">${salutation || 'N/A'}</span>
          </div>
          
          <div class="info-row">
            <span class="label">Số điện thoại:</span> <span class="value">${phone}</span>
          </div>
          
          <div class="info-row">
            <span class="label">Email:</span> <span class="value">${email}</span>
          </div>
          
          <div class="info-row">
            <span class="label">Tiêu đề:</span> <span class="value">${subject}</span>
          </div>
          
          <div class="info-row">
            <span class="label">Nội dung liên hệ:</span>
            <div class="value" style="margin-top: 10px; padding: 10px; background: white; border-left: 3px solid #667eea;">
              ${message.replace(/\n/g, '<br>')}
            </div>
          </div>
          
          ${gemstonesHtml}
          ${jewelryHtml}
          
          <div class="info-row" style="margin-top: 20px;">
            <span class="label">Thời gian gửi:</span> <span class="value">${new Date(created_at).toLocaleString('vi-VN')}</span>
          </div>
        </div>
        <div class="footer">
          <p>Email này được gửi tự động từ hệ thống quản lý liên hệ</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const mailOptions = {
    from: `"Adofine Contact System" <${settings.SMTP_USER}>`,
    to: settings.CONTACT_EMAIL || settings.SMTP_USER,
    subject: `🎨 Yêu cầu thiết kế mới #${id} - ${subject}`,
    html: htmlContent,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
};

module.exports = {
  sendContactRequestEmail,
};
