const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const crypto = require("crypto");
const nodemailer = require("nodemailer");

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
  if (useSymbols) characters += "!@#$%^&*()_+[]{}|;:,.<>?"; // Only using symbols

  // Ensure there's at least one character set selected
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
  let transporter = nodemailer.createTransport({
    service: "Gmail",
    auth: {
      user: "your-email@gmail.com",
      pass: "your-password",
    },
  });

  let mailOptions = {
    from: "your-email@gmail.com",
    to: email,
    subject: `Your Generated Password: ${passwordName}`,
    text: `Your password: ${password}`,
  };

  try {
    await transporter.sendMail(mailOptions);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error });
  }
});

// Start Server
app.listen(3000, () => {
  console.log("Server running on port 3000");
});
