const crypto = require("crypto");

export default function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

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
}
