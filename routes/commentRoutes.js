import express from "express";
import passport from "passport";
import {
  createComment,
  getAllComments,
} from "../controllers/commentController.js";

const router = express.Router();

router.post(
  "/add-comment",
  passport.authenticate("jwt", { session: false }),
  createComment
);

router.get("/get-comment", getAllComments);
// router.post(
//   "/ask-answer",
//   passport.authenticate("jwt", { session: false }),
//   askAnswer
// );

// router.get("/get-question", getQuestions);
// router.post("/get-answer", getAnswer);

export default router;
