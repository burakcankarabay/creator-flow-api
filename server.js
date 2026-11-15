import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/authRoutes.js";
import channelRoutes from "./routes/channelRoutes.js";
import videoRoutes from "./routes/videoRoutes.js";
import hookRoutes from "./routes/hookRoutes.js";
import { protect } from "./middleware/authMiddleware.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Açık Rotalar (Giriş & Kayıt)
app.use("/api/auth", authRoutes);

// Korumalı Rotalar (JWT Token Zorunlu)
app.use("/api/channels", protect, channelRoutes);
app.use("/api/videos", protect, videoRoutes);
app.use("/api/hooks", protect, hookRoutes);

// Sağlık Kontrolü
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "SparkGrid API çalışıyor" });
});

// MongoDB Bağlantısı ve Sunucu Başlatma
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB bağlantısı başarılı");
    app.listen(PORT, () => {
      console.log(`🚀 Server http://localhost:${PORT} adresinde çalışıyor`);
    });
  })
  .catch((err) => {
    console.error("❌ MongoDB bağlantı hatası:", err.message);
  });
