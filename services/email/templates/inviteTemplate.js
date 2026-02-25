const { baseEmailHtml } = require("./baseTemplate");

function inviteEmail({ fromName, setting, date, timeFrom, timeTo, placeLabel, appUrl }) {
  const title = "New invite received";
  const preheader = `${fromName} invited you`;

  const contentHtml = `
    <div style="color:#cfe0ff;font-size:14px;line-height:1.6;">
      <b>${fromName}</b> sent you an invite.
    </div>

    <div style="margin:16px 0;padding:14px 16px;background:#0b1222;border:1px solid #243154;border-radius:10px;">
      <div style="color:#ffffff;font-size:14px;"><b>Setting:</b> ${setting || "-"}</div>
      <div style="color:#ffffff;font-size:14px;margin-top:6px;"><b>Date:</b> ${date || "-"}</div>
      <div style="color:#ffffff;font-size:14px;margin-top:6px;"><b>Time:</b> ${timeFrom || "-"} – ${timeTo || "-"}</div>
      <div style="color:#ffffff;font-size:14px;margin-top:6px;"><b>Place:</b> ${placeLabel || "-"}</div>
    </div>

    ${appUrl ? `
      <a href="${appUrl}" style="display:inline-block;background:#2e6bff;color:#fff;text-decoration:none;
                                padding:10px 14px;border-radius:10px;font-weight:bold;">
        Open Forge
      </a>` : ""
    }
  `;

  const text =
`New invite received
From: ${fromName}
Setting: ${setting || "-"}
Date: ${date || "-"}
Time: ${timeFrom || "-"} – ${timeTo || "-"}
Place: ${placeLabel || "-"}` + (appUrl ? `\n\nOpen: ${appUrl}` : "");

  return {
    subject: "You have a new invite",
    html: baseEmailHtml({ title, preheader, contentHtml }),
    text,
  };
}

module.exports = { inviteEmail };