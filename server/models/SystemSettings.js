import mongoose from "mongoose";

const SystemSettingsSchema = new mongoose.Schema(
  {
    chatbotEnabled: { type: Boolean, default: true },
    heatmapEnabled: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.model("SystemSettings", SystemSettingsSchema);
