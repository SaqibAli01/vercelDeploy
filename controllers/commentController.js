import Answers from "../models/AnsModel.js";
import Comment from "../models/commentModel.js";
import Question from "../models/questionModel.js";
import User from "../models/userModel.js";

// Create a new comment
const createComment = async (req, res) => {
  try {
    const { text, userId, questionId, answerId } = req.body;
    const findUser = await User.findOne({ _id: userId });
    const findQuestion = await Question.findOne({ _id: questionId });
    const findAnswer = await Answers.findOne({ _id: answerId });

    if (!findUser || !findAnswer || !findQuestion) {
      return res
        .status(401)
        .json({ success: false, message: "Missing required fields" });
    }

    const findAnswers = await Answers.findOne({ _id: findAnswer._id });
    findAnswers.viewCountAnswer += 1;
    await findAnswers.save();

    const comment = new Comment({
      text: text,
      userId: findUser._id,
      questionId: findQuestion._id,
      answerId: findAnswer._id,
    });

    await comment.save();

    return res.status(201).json({
      success: true,
      data: comment,
      message: "Successfully added a comment",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, error: error.message });
  }
};

const getAllComments = async (req, res) => {
  try {
    const comments = await Comment.find().populate(
      "userId",
      "firstName lastName avatar"
    );
    res.status(200).json({
      success: true,
      data: comments,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

export { createComment, getAllComments };

// Get comments for a specific answer
// exports.getCommentsForAnswer = async (req, res) => {
//   try {
//     const { answerId } = req.params;

//     if (!answerId) {
//       return res.status(400).json({ success: false, message: 'Missing answerId parameter' });
//     }

//     const comments = await Comment.find({ answerId }).populate('user', 'firstName lastName avatar');

//     return res.status(200).json({ success: true, data: comments });
//   } catch (error) {
//     console.error(error);
//     return res.status(500).json({ success: false, error: error.message });
//   }
// };

// Update a comment
// exports.updateComment = async (req, res) => {
//   try {
//     const { commentId } = req.params;
//     const { text } = req.body;

//     if (!commentId || !text) {
//       return res.status(400).json({ success: false, message: 'Missing commentId or text field' });
//     }

//     const comment = await Comment.findByIdAndUpdate(commentId, { text }, { new: true });

//     if (!comment) {
//       return res.status(404).json({ success: false, message: 'Comment not found' });
//     }

//     return res.status(200).json({ success: true, data: comment });
//   } catch (error) {
//     console.error(error);
//     return res.status(500).json({ success: false, error: error.message });
//   }
// };

// Delete a comment
// exports.deleteComment = async (req, res) => {
//   try {
//     const { commentId } = req.params;

//     if (!commentId) {
//       return res.status(400).json({ success: false, message: 'Missing commentId parameter' });
//     }

//     const comment = await Comment.findByIdAndDelete(commentId);

//     if (!comment) {
//       return res.status(404).json({ success: false, message: 'Comment not found' });
//     }

//     return res.status(200).json({ success: true, message: 'Comment deleted successfully' });
//   } catch (error) {
//     console.error(error);
//     return res.status(500).json({ success: false, error: error.message });
//   }
// };
