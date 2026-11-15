import Video from "../models/Video.js";

export const getVideos = async (req, res) => {
  try {
    const { channelId } = req.query;
    const filter = { userId: req.user._id };
    if (channelId && channelId !== "all") {
      filter.channelId = channelId;
    }
    const videos = await Video.find(filter).sort({ createdAt: -1 });
    res.status(200).json(videos);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Videolar getirilemedi", error: error.message });
  }
};

export const createVideo = async (req, res) => {
  try {
    const newVideo = await Video.create({
      ...req.body,
      userId: req.user._id,
    });
    res.status(201).json(newVideo);
  } catch (error) {
    res.status(400).json({ message: "Video eklenemedi", error: error.message });
  }
};

export const updateVideo = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedVideo = await Video.findOneAndUpdate(
      { _id: id, userId: req.user._id },
      req.body,
      { new: true, runValidators: true },
    );

    if (!updatedVideo) {
      return res.status(404).json({ message: "Video bulunamadı" });
    }

    res.status(200).json(updatedVideo);
  } catch (error) {
    res
      .status(400)
      .json({ message: "Video güncellenemedi", error: error.message });
  }
};

export const togglePlatformStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { platform } = req.body;

    const video = await Video.findOne({ _id: id, userId: req.user._id });
    if (!video) {
      return res.status(404).json({ message: "Video bulunamadı" });
    }

    const currentStatus = video.platforms[platform]?.published || false;
    video.platforms[platform].published = !currentStatus;

    await video.save();
    res.status(200).json(video);
  } catch (error) {
    res
      .status(400)
      .json({
        message: "Platform durumu değiştirilemedi",
        error: error.message,
      });
  }
};

export const deleteVideo = async (req, res) => {
  try {
    const { id } = req.params;
    await Video.findOneAndDelete({ _id: id, userId: req.user._id });
    res.status(200).json({ message: "Video silindi", id });
  } catch (error) {
    res.status(500).json({ message: "Video silinemedi", error: error.message });
  }
};
