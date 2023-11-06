import express from "express";
import passport from "passport";
import {
  askAnswer,
  askQuestion,
  correctAnswer,
  getAnswer,
  getQuestions,
} from "../controllers/QuestionController.js";

const router = express.Router();

router.post(
  "/ask-question",
  passport.authenticate("jwt", { session: false }),
  askQuestion
);

router.post(
  "/ask-answer",
  passport.authenticate("jwt", { session: false }),
  askAnswer
);

router.get("/get-question", getQuestions);
router.post("/get-answer", getAnswer);

router.post(
  "/verify-ans",
  passport.authenticate("jwt", { session: false }),
  correctAnswer
);

export default router;
