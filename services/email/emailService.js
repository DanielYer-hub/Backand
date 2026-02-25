const { getResend } = require("./resendClient");
const { getMailFrom, getAppUrl } = require("./emailConfig");
const { resetCodeEmail } = require("./templates/resetCodeTemplate");
const { inviteEmail } = require("./templates/inviteTemplate");

async function sendEmail({ to, subject, html, text }) {
  const resend = getResend();
  const from = getMailFrom();

  if (!to) throw new Error("sendEmail: 'to' is required");
  if (!subject) throw new Error("sendEmail: 'subject' is required");

  const result = await resend.emails.send({
    from,
    to,
    subject,
    html,
    text,
  });

  return result;
}

async function sendPasswordResetCodeEmail({ to, code, ttlMinutes }) {
  const tpl = resetCodeEmail({ code, ttlMinutes });
  return sendEmail({ to, ...tpl });
}

async function sendInviteNotificationEmail({
  to,
  fromName,
  setting,
  date,
  timeFrom,
  timeTo,
  placeLabel,
}) {
  const appUrl = getAppUrl();
  const tpl = inviteEmail({ fromName, setting, date, timeFrom, timeTo, placeLabel, appUrl });
  return sendEmail({ to, ...tpl });
}

module.exports = {
  sendEmail,
  sendPasswordResetCodeEmail,
  sendInviteNotificationEmail,
};