import jwt from "jsonwebtoken";
import User from "../models/User.js";
import Channel from "../models/Channel.js";
import Video from "../models/Video.js";

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "30d" });
};

// Yeni kullanıcı için başlangıç verilerini hazırla veya mevcut sahipsiz verileri aktar
async function setupUserInitialWorkspace(userId) {
  const orphanChannels = await Channel.find({ userId: { $exists: false } });

  if (orphanChannels.length > 0) {
    // Önceki aşamalarda oluşturulan verileri bu ilk kullanıcıya devret
    await Channel.updateMany(
      { userId: { $exists: false } },
      { $set: { userId } },
    );
    await Video.updateMany(
      { userId: { $exists: false } },
      { $set: { userId } },
    );
    return;
  }

  // Sıfırdan kayıt olan yeni kullanıcı için örnek kanallar ve videolar
  const ch1 = await Channel.create({
    userId,
    name: "Curious Echo",
    niche: "Bilim, Tarih & Gizem",
    color: "#6366F1",
  });

  const ch2 = await Channel.create({
    userId,
    name: "Whimsified",
    niche: "Kısa Komedi & Skeç",
    color: "#EC4899",
  });

  await Video.insertMany([
    {
      userId,
      channelId: ch1._id.toString(),
      title: "Dyatlov Geçidi Gizemi",
      category: "Karanlık Tarih",
      hookText:
        "1959'da 9 deneyimli dağcı çadırlarını içeriden yırtarak dondurucu soğuğa neden çıplak ayakla kaçtı?",
      scriptNotes:
        "Sahne 1: Karlı Ural dağları karanlık atmosfer (9:16 dikey).\nSahne 2: İçeriden kesilmiş çadır detayı.",
      status: "published",
      platforms: {
        youtube: { published: true, views: 340 },
        instagram: { published: true, views: 1843 },
        tiktok: { published: true, views: 920 },
      },
    },
    {
      userId,
      channelId: ch2._id.toString(),
      title: "Yazılımcının Gece 02:00 Bug Çözme Halüsinasyonu",
      category: "Komedi",
      hookText:
        "Tek bir noktalı virgül yüzünden 4 saat kaybettiğinde aynadaki yansıman:",
      scriptNotes:
        "Hızlı zoom-in efekti, klavye sesleri ve abartılı yüz ifadesi.",
      status: "idea",
      platforms: {
        youtube: { published: false, views: 0 },
        instagram: { published: false, views: 0 },
        tiktok: { published: false, views: 0 },
      },
    },
  ]);
}

export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res
        .status(400)
        .json({ message: "Bu e-posta adresi zaten kullanımda" });
    }

    const user = await User.create({ name, email, password });
    await setupUserInitialWorkspace(user._id);

    const token = signToken(user._id);
    res.status(201).json({ token, user });
  } catch (error) {
    res
      .status(400)
      .json({ message: "Kayıt işlemi başarısız", error: error.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Lütfen e-posta ve şifrenizi girin" });
    }

    const user = await User.findOne({ email }).select("+password");
    if (!user || !(await user.comparePassword(password, user.password))) {
      return res.status(401).json({ message: "E-posta veya şifre hatalı" });
    }

    const token = signToken(user._id);
    user.password = undefined;

    res.status(200).json({ token, user });
  } catch (error) {
    res.status(400).json({ message: "Giriş yapılamadı", error: error.message });
  }
};

export const getMe = async (req, res) => {
  res.status(200).json({ user: req.user });
};
export const updatePlan = async (req, res) => {
  try {
    const { plan } = req.body; // 'free' | 'pro'
    if (!["free", "pro"].includes(plan)) {
      return res.status(400).json({ message: "Geçersiz plan türü" });
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { plan },
      { new: true },
    );

    res.status(200).json({ user: updatedUser });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Plan güncellenemedi", error: error.message });
  }
};
export const updateProfile = async (req, res) => {
  try {
    const { name, currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id).select("+password");

    if (!user) {
      return res.status(404).json({ message: "Kullanıcı bulunamadı" });
    }

    if (name && name.trim()) {
      user.name = name.trim();
    }

    // Kullanıcı yeni şifre girdiyse önce mevcut şifresini doğrula
    if (newPassword) {
      if (!currentPassword) {
        return res
          .status(400)
          .json({
            message: "Şifre değiştirmek için mevcut şifrenizi girmelisiniz",
          });
      }

      const isMatch = await user.comparePassword(
        currentPassword,
        user.password,
      );
      if (!isMatch) {
        return res.status(401).json({ message: "Mevcut şifreniz hatalı" });
      }

      if (newPassword.length < 6) {
        return res
          .status(400)
          .json({ message: "Yeni şifre en az 6 karakter olmalıdır" });
      }

      user.password = newPassword;
    }

    await user.save();
    user.password = undefined;

    res.status(200).json({ user });
  } catch (error) {
    res
      .status(400)
      .json({ message: "Profil güncellenemedi", error: error.message });
  }
};
