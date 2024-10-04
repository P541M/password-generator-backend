const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
require("dotenv").config(); // Add this line to load .env variables

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Helper function to escape HTML special characters
function escapeHtml(str) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// Password Generator
app.post("/generate-password", (req, res) => {
  const { length, useNumbers, useUppercase, useLowercase, useSymbols } =
    req.body;

  let characters = "";
  if (useLowercase) characters += "abcdefghijklmnopqrstuvwxyz";
  if (useUppercase) characters += "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  if (useNumbers) characters += "0123456789";
  if (useSymbols) characters += "!@#$%^&*()_+[]{}|;:,.<>?";

  if (characters === "") {
    return res
      .status(400)
      .json({ error: "At least one character set must be selected." });
  }

  let password = "";
  for (let i = 0; i < length; i++) {
    password += characters.charAt(crypto.randomInt(0, characters.length));
  }

  res.json({ password });
});

// Email Password
app.post("/send-email", async (req, res) => {
  const { email, password, passwordName } = req.body;

  // Log the received data
  console.log("Email data received:", email, password, passwordName);

  // Check if any required fields are missing
  if (!email || !password || !passwordName) {
    console.error("Missing required fields:", {
      email,
      password,
      passwordName,
    });
    return res
      .status(400)
      .json({ success: false, error: "Missing required fields" });
  }

  let transporter = nodemailer.createTransport({
    service: "Gmail",
    auth: {
      user: process.env.GMAIL_USER, // Get from .env
      pass: process.env.GMAIL_PASS, // Get from .env
    },
  });

  // Escape the password before including it in the email
  const escapedPassword = escapeHtml(password);

  let mailOptions = {
    from: process.env.GMAIL_USER, // Sender's email address
    to: email, // Recipient email from request
    subject: `Your Generated Password: ${passwordName}`, // Email subject
    html: `
      <p>Thank you for using our <strong>Password Generator</strong>!</p>
      <p>Here is your generated password:</p>
      <p><strong>Password Name:</strong> <em>${passwordName}</em></p>
      <p><strong>Password:</strong> <em>${escapedPassword}</em></p>
      <p><em>This is an automated email sent from <strong>Password Generator</strong>. Please do not reply to this email.</em></p>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("Email sent successfully!");
    res.json({ success: true });
  } catch (error) {
    console.error("Error sending email:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Start Server
app.listen(3000, () => {
  console.log("Server running on port 3000");
});
