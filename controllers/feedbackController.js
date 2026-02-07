const nodemailer = require("nodemailer");

const ALLOWED_TYPES = new Set(["problem", "suggestion"]);

function clean(str = "") {
  return String(str).trim();
}

const sendFeedback = async (req, res) => {
  try {
    const type = clean(req.body?.type).toLowerCase();
    const description = clean(req.body?.description);

 
    const title = clean(req.body?.title);

    if (!ALLOWED_TYPES.has(type)) {
      return res.status(400).json({ message: "Invalid feedback type" });
    }
    if (!description || description.length < 10) {
      return res.status(400).json({ message: "Description is too short" });
    }
    if (description.length > 3000) {
      return res.status(400).json({ message: "Description is too long" });
    }

    // кто отправил (если есть auth middleware — лучше брать из req.user)
    const fromEmail = clean(req.body?.fromEmail); // можно не передавать вообще
    const fromName = clean(req.body?.fromName);

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port,
      secure: port === 465,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const subjectPrefix = type === "problem" ? "BUG" : "SUGGESTION";
    const subject = `[Forge Your Path] ${subjectPrefix}${title ? `: ${title}` : ""}`;

    const text =
`Type: ${type}
Title: ${title || "-"}
From: ${fromName || "-"} <${fromEmail || "-"}>
Time: ${new Date().toISOString()}

Message:
${description}
`;

    await transporter.sendMail({
      from: process.env.SMTP_FROM,          // например "Forge Feedback <no-reply@...>"
      to: process.env.FEEDBACK_TO_EMAIL,    // твой рабочий email
      replyTo: fromEmail || undefined,      // удобно: отвечать сразу пользователю
      subject,
      text,
    });

    return res.json({ message: "Feedback sent" });
  } catch (err) {
  console.error("sendFeedback error:", err?.message || err);
  if (err?.response) console.error("smtp response:", err.response);
  return res.status(500).json({ message: err?.message || "Failed to send feedback" });
  }
};

module.exports = { sendFeedback };
