const { baseEmailHtml } = require("./baseTemplate");

function resetCodeEmail({ code, ttlMinutes }) {
  const title = "Password reset code";
  const preheader = `Your code: ${code}`;

  const contentHtml = `
    <div style="color:#cfe0ff;font-size:14px;line-height:1.6;">
      Use this code to reset your password:
    </div>

    <div style="margin:16px 0;padding:14px 16px;background:#0b1222;border:1px solid #243154;border-radius:10px;
                font-size:26px;letter-spacing:6px;color:#ffffff;font-weight:bold;text-align:center;">
      ${code}
    </div>

    <div style="color:#cfe0ff;font-size:13px;line-height:1.6;">
      This code expires in <b>${ttlMinutes}</b> minutes.
    </div>
  `;

  const text = `Your password reset code is: ${code}\n\nThis code expires in ${ttlMinutes} minutes.`;

  return {
    subject: "Your password reset code",
    html: baseEmailHtml({ title, preheader, contentHtml }),
    text,
  };
}

module.exports = { resetCodeEmail };