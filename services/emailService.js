const nodemailer = require('nodemailer');

const sendBookingConfirmation = async (user, booking) => {
    let transporter;
    let usingEthereal = false;

    // If SMTP not configured (or still using placeholder), create an Ethereal test account
    if (!process.env.EMAIL_HOST || process.env.EMAIL_HOST.includes('example') || !process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        try {
            const testAccount = await nodemailer.createTestAccount();
            transporter = nodemailer.createTransport({
                host: testAccount.smtp.host,
                port: testAccount.smtp.port,
                secure: testAccount.smtp.secure,
                auth: { user: testAccount.user, pass: testAccount.pass },
            });
            usingEthereal = true;
            console.log('Email: using Ethereal test account for dev (no real SMTP configured)');
        } catch (err) {
            console.error('Failed to create Ethereal test account:', err);
            return;
        }
    } else {
        transporter = nodemailer.createTransport({
            host: process.env.EMAIL_HOST,
            port: Number(process.env.EMAIL_PORT) || 587,
            secure: Number(process.env.EMAIL_PORT) === 465, // true for 465, false for other ports
            auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
            tls: { rejectUnauthorized: false },
        });
    }

    const tripInfo = booking.tripDetails || {};
    const emailHtml = `
        <h1>Xác nhận đặt xe Jid-mie thành công!</h1>
        <p>Chào ${user.name || user.email},</p>
        <p>Chuyến đi của bạn đã được xác nhận. Dưới đây là thông tin chi tiết:</p>
        <ul>
            <li><strong>Mã đặt vé:</strong> ${booking._id}</li>
            <li><strong>Loại hình:</strong> ${booking.bookingType || 'N/A'}</li>
            <li><strong>Điểm đón:</strong> ${tripInfo.pickup || tripInfo.address || 'N/A'}</li>
            ${tripInfo.destination ? `<li><strong>Điểm đến:</strong> ${tripInfo.destination}</li>` : ''}
            <li><strong>Ngày:</strong> ${tripInfo.date || 'N/A'}</li>
            <li><strong>Giờ:</strong> ${tripInfo.time || 'N/A'}</li>
            <li><strong>Tổng tiền:</strong> ${(booking.price || 0).toLocaleString('vi-VN')} VNĐ</li>
            <li><strong>Trạng thái:</strong> <span style="color: green;">Đã thanh toán</span></li>
        </ul>
        <p>Cảm ơn bạn đã sử dụng dịch vụ của Jid-mie!</p>
    `;

    const mailOptions = {
        from: process.env.EMAIL_FROM || 'no-reply@jidmie.test',
        to: user.email,
        subject: `[Jid-mie] Xác nhận đặt xe thành công - Mã #${booking._id}`,
        html: emailHtml,
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log('Confirmation email sent to:', user.email);
        if (usingEthereal) {
            const preview = nodemailer.getTestMessageUrl(info);
            console.log('Ethereal preview URL:', preview);
        }
    } catch (error) {
        console.error('Error sending email:', error);
    }
};

module.exports = { sendBookingConfirmation };