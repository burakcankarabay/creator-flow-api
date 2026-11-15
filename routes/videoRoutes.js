import express from "express";
import {
  getVideos,
  createVideo,
  updateVideo,
  togglePlatformStatus,
  deleteVideo,
} from "../controllers/videoController.js";

const router = express.Router();

router.route("/").get(getVideos).post(createVideo);

router.route("/:id").patch(updateVideo).delete(deleteVideo);

router.patch("/:id/toggle-platform", togglePlatformStatus);

export default router;
