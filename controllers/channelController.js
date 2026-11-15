import Channel from "../models/Channel.js";
import Video from "../models/Video.js";

export const getChannels = async (req, res) => {
  try {
    const channels = await Channel.find({ userId: req.user._id }).sort({
      createdAt: 1,
    });
    res.status(200).json(channels);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Kanallar getirilemedi", error: error.message });
  }
};

export const createChannel = async (req, res) => {
  try {
    // Free plan için maksimum 2 kanal kontrolü
    if (req.user.plan !== "pro") {
      const currentChannelCount = await Channel.countDocuments({
        userId: req.user._id,
      });
      if (currentChannelCount >= 2) {
        return res.status(403).json({
          message:
            "Free planda en fazla 2 kanal ekleyebilirsiniz. Sınırsız kanal için Pro plana geçin.",
        });
      }
    }

    const { name, niche, color } = req.body;
    const newChannel = await Channel.create({
      userId: req.user._id,
      name,
      niche,
      color,
    });
    res.status(201).json(newChannel);
  } catch (error) {
    res
      .status(400)
      .json({ message: "Kanal oluşturulamadı", error: error.message });
  }
};

export const deleteChannel = async (req, res) => {
  try {
    const { id } = req.params;
    await Channel.findOneAndDelete({ _id: id, userId: req.user._id });
    await Video.deleteMany({ channelId: id, userId: req.user._id });
    res.status(200).json({ message: "Kanal ve bağlı videolar silindi", id });
  } catch (error) {
    res.status(500).json({ message: "Kanal silinemedi", error: error.message });
  }
};
