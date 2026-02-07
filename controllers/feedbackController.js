const { sendEmail } = require("../services/mailService");

const ALLOWED_TYPES = new Set(["problem", "suggestion"]);

function clean(str = "") {
  return String(str).trim();
}

const sendFeedback = async (req, res) => {
  try {
    const type = clean(req.body?.type).toLowerCase();
    const title = clean(req.body?.title);
    const description = clean(req.body?.description);

    if (!ALLOWED_TYPES.has(type)) {
      return res.status(400).json({ message: "Invalid feedback type" });
    }
    if (!description || description.length < 10) {
      return res.status(400).json({ message: "Description is too short" });
    }
    if (description.length > 3000) {
      return res.status(400).json({ message: "Description is too long" });
    }

  
    const fromEmail = clean(req.body?.fromEmail);
    const fromName = clean(req.body?.fromName);

    const to = process.env.FEEDBACK_TO_EMAIL;
    if (!to) {
      return res.status(500).json({ message: "FEEDBACK_TO_EMAIL is not configured" });
    }

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

    await sendEmail({
      to,
      subject,
      text,
      replyTo: fromEmail || undefined,
    });

    return res.json({ message: "Feedback sent" });
  } catch (err) {
    console.error("sendFeedback error:", err);
    return res.status(500).json({ message: "Failed to send feedback" });
  }
};

module.exports = { sendFeedback };
