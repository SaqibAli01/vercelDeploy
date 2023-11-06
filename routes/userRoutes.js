import express from "express";
import passport from "passport";
import { upload } from "../middleware/multer.js"; // upload img
import {
  forgotPassword,
  getUser,
  logoutUser,
  registerUser,
  resendVerificationCode,
  resetPassword,
  updatePassword,
  updateProfile,
  updateUserName,
  userLogin,
  verifyCode,
} from "../controllers/userController.js";

const router = express.Router();

router.post("/api/v1/registerUser", upload.single("avatar"), registerUser);
router.post("/api/v1/verify", verifyCode);
router.post("/api/v1/resend-verification", resendVerificationCode);
router.post("/api/v1/user-login", userLogin);
router.post("/api/v1/forgot-Password", forgotPassword);
router.post("/reset-password/:token", resetPassword);

router.get(
  "/protected-route",
  passport.authenticate("jwt", { session: false }),
  getUser
);

router.put(
  "/update-Password",
  passport.authenticate("jwt", { session: false }),
  updatePassword
);

router.put(
  "/updateUserName",
  passport.authenticate("jwt", { session: false }),
  updateUserName
);

router.put(
  "/updateProfile",
  upload.single("avatar"),
  passport.authenticate("jwt", { session: false }),
  updateProfile
);

router.get(
  "/logout",
  passport.authenticate("jwt", { session: false }),
  logoutUser
);

export default router;
