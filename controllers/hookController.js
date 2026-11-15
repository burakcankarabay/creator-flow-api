import Hook from "../models/Hook.js";

export const getHooks = async (req, res) => {
  try {
    const hooks = await Hook.find({ userId: req.user._id }).sort({
      createdAt: -1,
    });
    res.status(200).json(hooks);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Hook şablonları getirilemedi", error: error.message });
  }
};

export const createHook = async (req, res) => {
  try {
    const { category, text, impact, language } = req.body;
    const newHook = await Hook.create({
      userId: req.user._id,
      category,
      text,
      impact: impact || "Viral Hook",
      language: language || "tr",
      isCustom: true,
    });
    res.status(201).json(newHook);
  } catch (error) {
    res
      .status(400)
      .json({ message: "Hook şablonu eklenemedi", error: error.message });
  }
};

export const deleteHook = async (req, res) => {
  try {
    const { id } = req.params;
    await Hook.findOneAndDelete({ _id: id, userId: req.user._id });
    res.status(200).json({ message: "Hook şablonu silindi", id });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Hook şablonu silinemedi", error: error.message });
  }
};
