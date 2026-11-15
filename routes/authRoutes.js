import express from "express";
import {
  register,
  login,
  getMe,
  updatePlan,
  updateProfile,
} from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/me", protect, getMe);
router.patch("/plan", protect, updatePlan);
router.patch("/profile", protect, updateProfile);

export default router;
