import express from "express";
import {
  getHooks,
  createHook,
  deleteHook,
} from "../controllers/hookController.js";

const router = express.Router();

router.route("/").get(getHooks).post(createHook);

router.route("/:id").delete(deleteHook);

export default router;
