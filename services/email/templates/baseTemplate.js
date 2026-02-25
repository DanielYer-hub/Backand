function escapeHtml(s) {
  return String(s || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function baseEmailHtml({ title, preheader, contentHtml }) {
  const safeTitle = escapeHtml(title);
  const safePreheader = escapeHtml(preheader || "");

  return `
  <!doctype html>
  <html>
    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <title>${safeTitle}</title>
    </head>
    <body style="margin:0;padding:0;background:#0b0f19;font-family:Arial,Helvetica,sans-serif;">
      <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;">
        ${safePreheader}
      </div>

      <table width="100%" cellpadding="0" cellspacing="0" style="background:#0b0f19;padding:24px 0;">
        <tr>
          <td align="center">
            <table width="600" cellpadding="0" cellspacing="0" style="background:#121a2a;border-radius:12px;overflow:hidden;">
              <tr>
                <td style="padding:20px 24px;background:#0f1626;border-bottom:1px solid #1f2a44;">
                  <div style="color:#fff;font-size:18px;font-weight:bold;">Forge Your Path</div>
                  <div style="color:#9fb0d0;font-size:12px;margin-top:4px;">Tabletop community scheduling</div>
                </td>
              </tr>

              <tr>
                <td style="padding:24px;color:#e9eefc;">
                  <h1 style="margin:0 0 12px 0;font-size:20px;color:#ffffff;">${safeTitle}</h1>
                  ${contentHtml}
                  <div style="margin-top:24px;color:#9fb0d0;font-size:12px;line-height:1.5;">
                    If you didn’t request this, you can ignore this email.
                  </div>
                </td>
              </tr>

              <tr>
                <td style="padding:16px 24px;background:#0f1626;border-top:1px solid #1f2a44;color:#9fb0d0;font-size:12px;">
                  © ${new Date().getFullYear()} Forge Your Path
                </td>
              </tr>
            </table>

            <div style="width:600px;max-width:100%;padding:12px 0;color:#6f7ea3;font-size:11px;">
              This message was sent automatically. Please do not reply.
            </div>
          </td>
        </tr>
      </table>
    </body>
  </html>
  `;
}

module.exports = { baseEmailHtml };