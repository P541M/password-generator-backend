const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
require("dotenv").config(); // Add this line to load .env variables

const app = express();
app.use(cors());
app.use(bodyParser.json());

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

  console.log("Email data received:", email, password, passwordName);

  let transporter = nodemailer.createTransport({
    service: "Gmail",
    auth: {
      user: process.env.GMAIL_USER, // Get from .env
      pass: process.env.GMAIL_PASS, // Get from .env
    },
  });

  let mailOptions = {
    from: process.env.GMAIL_USER, // Sender's email address
    to: email, // Recipient email from request
    subject: `Your Generated Password: ${passwordName}`, // Email subject
    text: `Password Name: ${passwordName}\nPassword: ${password}`, // Email body
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
