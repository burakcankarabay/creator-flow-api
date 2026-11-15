import mongoose from "mongoose";

const platformStatsSchema = new mongoose.Schema(
  {
    published: { type: Boolean, default: false },
    views: { type: Number, default: 0, min: 0 },
  },
  { _id: false },
);

const videoSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    channelId: {
      type: String,
      required: [true, "Kanal ID zorunludur"],
      index: true,
    },
    title: {
      type: String,
      required: [true, "Video başlığı zorunludur"],
      trim: true,
    },
    category: {
      type: String,
      default: "Genel",
      trim: true,
    },
    hookText: {
      type: String,
      default: "",
      trim: true,
    },
    scriptNotes: {
      type: String,
      default: "",
    },
    status: {
      type: String,
      enum: ["idea", "scripting", "editing", "published"],
      default: "idea",
    },
    scheduledDate: {
      type: String,
      default: "",
    },
    platforms: {
      youtube: { type: platformStatsSchema, default: () => ({}) },
      instagram: { type: platformStatsSchema, default: () => ({}) },
      tiktok: { type: platformStatsSchema, default: () => ({}) },
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (doc, ret) => {
        ret.id = ret._id.toString();
        delete ret._id;
        delete ret.__v;
      },
    },
  },
);

export default mongoose.model("Video", videoSchema);
