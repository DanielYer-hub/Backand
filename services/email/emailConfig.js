function getMailFrom() {
  const email = process.env.MAIL_FROM || "Forge Your Path <onboarding@resend.dev>";
  return email;
}

function getAppUrl() {
  return process.env.APP_PUBLIC_URL || "http://localhost:5173";
}

module.exports = { getMailFrom, getAppUrl };