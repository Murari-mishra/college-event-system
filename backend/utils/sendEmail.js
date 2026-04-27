const transporter = require('../config/emailConfig');
const generateTicket = require('./generateTicket');

const sendRegistrationEmail = async (user, event, registration) => {
  try {
    const ticketBuffer = await generateTicket(registration, event, user);

    const eventDate = new Date(event.date).toLocaleDateString('en-IN', {
      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
    });

    const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: Arial, sans-serif; background: #f1f5f9; margin: 0; padding: 20px; }
        .container { max-width: 560px; margin: 0 auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08); }
        .header { background: linear-gradient(135deg, #3b6ef5, #8b5cf6); padding: 36px 32px; text-align: center; }
        .header h1 { color: white; margin: 0; font-size: 26px; }
        .header p { color: #c7d2fe; margin: 6px 0 0; font-size: 14px; }
        .body { padding: 32px; }
        .greeting { font-size: 16px; color: #1e293b; margin-bottom: 16px; }
        .event-card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; margin: 20px 0; }
        .event-title { font-size: 20px; font-weight: bold; color: #0f172a; margin: 0 0 12px; }
        .detail-row { display: flex; align-items: center; gap: 8px; margin: 8px 0; color: #475569; font-size: 14px; }
        .badge { display: inline-block; background: #10b981; color: white; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: bold; margin: 12px 0; }
        .reg-id { background: #eef5ff; border-radius: 8px; padding: 12px 16px; margin: 16px 0; font-family: monospace; color: #3b6ef5; font-size: 14px; text-align: center; }
        .ticket-note { font-size: 13px; color: #64748b; margin: 16px 0; }
        .footer { background: #f8fafc; padding: 20px 32px; text-align: center; color: #94a3b8; font-size: 12px; border-top: 1px solid #e2e8f0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🎟️ Registration Confirmed!</h1>
          <p>EduEvent — College Event Management</p>
        </div>
        <div class="body">
          <p class="greeting">Hi <strong>${user.name}</strong>,</p>
          <p style="color:#475569;font-size:14px;">You have successfully registered for the following event. Your ticket is attached to this email.</p>

          <div class="event-card">
            <p class="event-title">${event.title}</p>
            <div class="detail-row">📅 <span>${eventDate} at ${event.time}</span></div>
            <div class="detail-row">📍 <span>${event.venue}</span></div>
            <div class="detail-row">🏷️ <span>${event.category || 'General'}</span></div>
            <span class="badge">✓ CONFIRMED</span>
          </div>

          <div class="reg-id">
            Registration ID: #${registration._id.toString().slice(-8).toUpperCase()}
          </div>

          <p class="ticket-note">📎 Your event ticket is attached as a PDF. Please bring it (printed or on your phone) to the event for check-in.</p>

          <p style="color:#475569;font-size:14px;">See you at the event! 🎉</p>
        </div>
        <div class="footer">
          <p>EduEvent College Portal &nbsp;|&nbsp; This is an automated email, please do not reply.</p>
        </div>
      </div>
    </body>
    </html>
    `;

    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: user.email,
      subject: `✅ Registration Confirmed — ${event.title}`,
      html,
      attachments: [
        {
          filename: `ticket-${event.title.replace(/\s+/g, '-').toLowerCase()}.pdf`,
          content: ticketBuffer,
          contentType: 'application/pdf',
        },
      ],
    });

    console.log(`📧 Confirmation email sent to ${user.email}`);
  } catch (error) {
    console.error('Email send error:', error.message);
    // Don't throw — email failure should not break registration
  }
};

module.exports = { sendRegistrationEmail };