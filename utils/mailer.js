// const nodemailer = require("nodemailer");

// function hasSmtpEnv() {
//   return (
//     process.env.SMTP_HOST &&
//     process.env.SMTP_PORT &&
//     process.env.SMTP_USER &&
//     process.env.SMTP_PASS &&
//     process.env.SMTP_FROM
//   );
// }

// function createTransport() {
//   const port = Number(process.env.SMTP_PORT) || 587;

//   return nodemailer.createTransport({
//     host: process.env.SMTP_HOST,
//     port,
//     secure: port === 465,
//     auth: {
//       user: process.env.SMTP_USER,
//       pass: process.env.SMTP_PASS,
//     },
//   });
// }

// async function sendPasswordResetCodeEmail({ to, code }) {
 
//   if (!hasSmtpEnv()) {
//     console.log(`[DEV] Password reset code for ${to}: ${code}`);
//     return;
//   }

//   const transport = createTransport();
//   const from = process.env.SMTP_FROM;

//   await transport.sendMail({
//     from,
//     to,
//     subject: "Your password reset code",
//     text: `Your password reset code is: ${code}\n\nThis code expires in 10 minutes.`,
//   });
// }

// module.exports = { sendPasswordResetCodeEmail };

