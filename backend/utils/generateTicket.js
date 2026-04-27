const PDFDocument = require('pdfkit');

const generateTicket = (registration, event, user) => {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      size: [600, 300],
      margin: 0,
    });

    const buffers = [];
    doc.on('data', (chunk) => buffers.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(buffers)));
    doc.on('error', reject);

    // Background
    doc.rect(0, 0, 600, 300).fill('#0f172a');

    // Left accent bar
    doc.rect(0, 0, 8, 300).fill('#3b6ef5');

    // Top strip
    doc.rect(8, 0, 592, 4).fill('#8b5cf6');

    // College name
    doc.fillColor('#94a3b8').fontSize(9).font('Helvetica')
      .text('EDUEVENT — COLLEGE EVENT MANAGEMENT', 30, 22, { characterSpacing: 1 });

    // Event title
    doc.fillColor('#ffffff').fontSize(22).font('Helvetica-Bold')
      .text(event.title, 30, 45, { width: 360 });

    // Divider
    doc.moveTo(30, 95).lineTo(570, 95).strokeColor('#1e293b').lineWidth(1).stroke();

    // Event details
    const details = [
      { label: 'DATE', value: new Date(event.date).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) },
      { label: 'TIME', value: event.time },
      { label: 'VENUE', value: event.venue },
      { label: 'CATEGORY', value: event.category || 'General' },
    ];

    let x = 30;
    details.forEach((d, i) => {
      if (i === 2) x = 30;
      const y = i < 2 ? 110 : 165;
      const colX = i % 2 === 0 ? 30 : 220;
      doc.fillColor('#64748b').fontSize(8).font('Helvetica-Bold')
        .text(d.label, colX, y, { characterSpacing: 1 });
      doc.fillColor('#e2e8f0').fontSize(11).font('Helvetica')
        .text(d.value, colX, y + 14, { width: 180 });
    });

    // Divider
    doc.moveTo(30, 220).lineTo(570, 220).strokeColor('#1e293b').lineWidth(1).stroke();

    // Student info
    doc.fillColor('#64748b').fontSize(8).font('Helvetica-Bold')
      .text('REGISTERED STUDENT', 30, 232, { characterSpacing: 1 });
    doc.fillColor('#ffffff').fontSize(12).font('Helvetica-Bold')
      .text(user.name, 30, 246);
    doc.fillColor('#64748b').fontSize(9).font('Helvetica')
      .text(user.email, 30, 262);
    if (user.rollNo) {
      doc.text(`Roll No: ${user.rollNo}`, 30, 275);
    }

    // Registration ID
    doc.fillColor('#64748b').fontSize(8).font('Helvetica-Bold')
      .text('REGISTRATION ID', 400, 232, { characterSpacing: 1 });
    doc.fillColor('#3b6ef5').fontSize(11).font('Helvetica-Bold')
      .text(`#${registration._id.toString().slice(-8).toUpperCase()}`, 400, 246);

    // Status badge
    doc.roundedRect(400, 262, 100, 22, 4).fill('#10b981');
    doc.fillColor('#ffffff').fontSize(9).font('Helvetica-Bold')
      .text('CONFIRMED', 420, 268);

    // Bottom accent
    doc.rect(0, 296, 600, 4).fill('#3b6ef5');

    doc.end();
  });
};

module.exports = generateTicket;