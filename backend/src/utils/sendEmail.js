import nodemailer from "nodemailer";

// One transporter, created once when this module is first imported,
// reused for every email instead of opening a new SMTP connection
// per request.
let transporter = null;

// options: { to, subject, html }
const sendEmail = async (options) => {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: Number(process.env.SMTP_PORT) === 465, // 465 = SSL, 587 = STARTTLS
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  await transporter.sendMail({
    from: process.env.SMTP_FROM,
    to: options.to,
    subject: options.subject,
    html: options.html,
  });
};

export default sendEmail;
