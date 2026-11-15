import mongoose from "mongoose";

const channelSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, "Kanal adı zorunludur"],
      trim: true,
    },
    niche: {
      type: String,
      default: "Kısa Video Kanalı",
      trim: true,
    },
    color: {
      type: String,
      default: "#6366F1",
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

export default mongoose.model("Channel", channelSchema);
