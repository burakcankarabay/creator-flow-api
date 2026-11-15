import mongoose from "mongoose";

const hookSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    category: {
      type: String,
      required: [true, "Kategori zorunludur"],
      trim: true,
    },
    text: {
      type: String,
      required: [true, "Hook metni zorunludur"],
      trim: true,
    },
    impact: {
      type: String,
      default: "Özel Şablon",
      trim: true,
    },
    language: {
      type: String,
      default: "tr",
    },
    isCustom: {
      type: Boolean,
      default: true,
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

export default mongoose.model("Hook", hookSchema);
