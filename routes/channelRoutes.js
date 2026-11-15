import express from "express";
import {
  getChannels,
  createChannel,
  deleteChannel,
} from "../controllers/channelController.js";

const router = express.Router();

router.route("/").get(getChannels).post(createChannel);

router.route("/:id").delete(deleteChannel);

export default router;
