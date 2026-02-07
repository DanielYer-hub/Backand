const { Resend } = require("resend");

function hasResendEnv() {
  return !!process.env.RESEND_API_KEY;
}

function getResend() {
  return new Resend(process.env.RESEND_API_KEY);
}

function getFrom() {
  // временно можно onboarding@resend.dev
  return process.env.MAIL_FROM || "Forge Your Path <onboarding@resend.dev>";
}

async function sendEmail({ to, subject, text, replyTo }) {
  if (!hasResendEnv()) {
    console.log("[DEV] Resend is not configured. Email payload:", { to, subject, text, replyTo });
    return;
  }

  const resend = getResend();

  await resend.emails.send({
    from: getFrom(),
    to: Array.isArray(to) ? to : [to],
    subject,
    text,
    ...(replyTo ? { reply_to: replyTo } : {}),
  });
}

module.exports = { sendEmail };
