const nodemailer = require("nodemailer");
const escapeHtml = (str) =>
  str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { email, password, passwordName } = req.body;

  if (!email || !password || !passwordName) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const transporter = nodemailer.createTransport({
    service: "Gmail",
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_PASS,
    },
  });

  const escapedPassword = escapeHtml(password);

  const mailOptions = {
    from: process.env.GMAIL_USER,
    to: email,
    subject: `Your Generated Password: ${passwordName}`,
    html: `
      <p>Thank you for using our <strong>Password Generator</strong>!</p>
      <p>Here is your generated password:</p>
      <p><strong>Password Name:</strong> <em>${passwordName}</em></p>
      <p><strong>Password:</strong> <em>${escapedPassword}</em></p>
      <p><em>This is an automated email. Please do not reply.</em></p>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
