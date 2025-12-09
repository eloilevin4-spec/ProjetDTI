import express from "express";
import nodemailer from "nodemailer";
import cors from "cors";
import dotenv from "dotenv";
import multer from "multer";
import path from "path";

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());


const storage = multer.memoryStorage();
const upload = multer({ storage });


const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST,
  port: Number(process.env.MAIL_PORT),
  secure: false, 
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});

// Endpoint d’envoi d’email avec pièce jointe
app.post("/send-email", upload.single("file"), async (req, res) => {
  try {
    const { to, subject, message } = req.body;
    const file = req.file;

    if (!to || !subject || !message) {
      return res.status(400).json({ success: false, error: "Données manquantes" });
    }

    const mailOptions = {
      from: "noreply@bfm.mg" ,
      to,
      subject,
      text: message,
    };

    if (file) {
      mailOptions.attachments = [
        {
          filename: file.originalname,
          content: file.buffer,
        },
      ];
    }

    await transporter.sendMail(mailOptions);

    res.json({ success: true, msg: "Email envoyé !" });
  } catch (e) {
    console.error(e);
    res.status(500).json({ success: false, error: e.toString() });
  }
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Backend running on port ${PORT}`));
