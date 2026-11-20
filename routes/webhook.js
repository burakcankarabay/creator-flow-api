const express = require("express");
const crypto = require("crypto");
const User = require("../models/User"); // User modelinin yolu farklıysa güncelle

const router = express.Router();

// Paddle imza doğrulama yardımcı fonksiyonu
function verifyPaddleSignature(signatureHeader, rawBody, secret) {
  if (!signatureHeader || !secret) return false;

  const parts = signatureHeader.split(";");
  const tsPart = parts.find((p) => p.startsWith("ts="));
  const h1Part = parts.find((p) => p.startsWith("h1="));

  if (!tsPart || !h1Part) return false;

  const ts = tsPart.split("=")[1];
  const h1 = h1Part.split("=")[1];

  const signedPayload = `${ts}:${rawBody}`;
  const expectedSignature = crypto
    .createHmac("sha256", secret)
    .update(signedPayload)
    .digest("hex");

  const expectedBuffer = Buffer.from(expectedSignature, "utf8");
  const receivedBuffer = Buffer.from(h1, "utf8");

  if (expectedBuffer.length !== receivedBuffer.length) return false;
  return crypto.timingSafeEqual(expectedBuffer, receivedBuffer);
}

// POST /api/webhook/paddle
router.post(
  "/paddle",
  express.raw({ type: "application/json" }),
  async (req, res) => {
    try {
      const signature = req.headers["paddle-signature"];
      const rawBody = req.body.toString("utf8");
      const secret = process.env.PADDLE_WEBHOOK_SECRET;

      // 1. İmzayı doğrula
      if (!verifyPaddleSignature(signature, rawBody, secret)) {
        console.error("Paddle webhook imza doğrulaması başarısız!");
        return res.status(401).json({ message: "Invalid signature" });
      }

      const event = JSON.parse(rawBody);
      const { event_type, data } = event;

      // Frontend checkout sırasında customData içine koyacağımız userId
      const userId = data?.custom_data?.userId;

      if (!userId) {
        console.warn(
          "Webhook geldi ancak custom_data.userId bulunamadı:",
          event_type,
        );
        return res.status(200).json({ received: true });
      }

      // 2. Ödeme tamamlandı veya abonelik aktifleşti -> PRO yap
      if (
        event_type === "transaction.completed" ||
        event_type === "subscription.created" ||
        (event_type === "subscription.updated" && data.status === "active")
      ) {
        await User.findByIdAndUpdate(userId, {
          plan: "pro",
        });
        console.log(`Kullanıcı PRO plana yükseltildi: ${userId}`);
      }

      // 3. Abonelik iptal edildi veya süresi doldu -> FREE yap
      if (
        event_type === "subscription.canceled" ||
        (event_type === "subscription.updated" &&
          ["canceled", "past_due", "paused"].includes(data.status))
      ) {
        await User.findByIdAndUpdate(userId, {
          plan: "free",
        });
        console.log(`Kullanıcı FREE plana düşürüldü: ${userId}`);
      }

      res.status(200).json({ received: true });
    } catch (err) {
      console.error("Paddle Webhook Hatası:", err);
      res.status(500).json({ message: "Webhook processing failed" });
    }
  },
);

module.exports = router;
