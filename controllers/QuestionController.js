import Answers from "../models/AnsModel.js";
import Question from "../models/questionModel.js";
import User from "../models/userModel.js";

const askQuestion = async (req, res) => {
  try {
    const { text, id } = req.body;
    // console.log("req.body id:", id);
    // console.log("user", id);
    const findUser = await User.findOne({ _id: id });

    // console.log("-- users --:", findUser);

    if (!findUser) {
      return res
        .status(404)
        .json({ success: false, message: "User not Login " });
    }

    const question = new Question({
      text,
      user: findUser?._id,
    });

    await question.save();

    res.status(201).json({
      success: true,
      message: "Question asked successfully!",
      question,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

const getQuestions = async (req, res) => {
  try {
    const questions = await Question.find().populate({
      path: "user",
      select: "_id firstName lastName avatar",
    });

    res.status(200).json({
      success: true,
      data: questions,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// const askAnswer = async (req, res) => {
//   try {
//     const { text, userId, questionId, QuestionAuthor } = req.body;

//     const findUser = await User.findOne({ _id: userId });
//     const findQuestion = await Question.findOne({ _id: questionId });

//     // console.log("-- questionId --:", findQuestion);

//     if (!findUser) {
//       return res
//         .status(404)
//         .json({ success: false, message: "User not Login " });
//     }

//     if (!findQuestion) {
//       return res
//         .status(404)
//         .json({ success: false, message: "Question Not find " });
//     }

//     const answer = new Answers({
//       text,
//       user: findUser?._id,
//       questionId: findQuestion?._id,
//       QuestionAuthor: findQuestion?.user?._id,
//     });
//     // console.log("answer", answer);
//     await answer.save();

//     res.status(201).json({
//       success: true,
//       message: "Answer asked successfully!",
//       answer,
//     });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({
//       success: false,
//       error: error.message,
//     });
//   }
// };

const askAnswer = async (req, res) => {
  try {
    const { text, userId, questionId, QuestionAuthor } = req.body;

    const findUser = await User.findOne({ _id: userId });
    const findQuestion = await Question.findOne({ _id: questionId });

    if (!findUser) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    if (!findQuestion) {
      return res
        .status(404)
        .json({ success: false, message: "Question not found" });
    }

    const answerCount = await Answers.countDocuments({
      questionId: findQuestion?._id,
    });

    // Increment the view count for the new answer
    const view = (findQuestion.viewCount += 1);

    findQuestion.viewCount += 1;
    await findQuestion.save();

    console.log("🚀 view:", view);

    const answer = new Answers({
      text,
      user: findUser?._id,
      answerCount: answerCount,
      questionId: findQuestion?._id,
      QuestionAuthor: findQuestion?.user?._id,
    });

    await answer.save();

    await Question.findByIdAndUpdate(findQuestion._id, {
      answerCount: answerCount,
    });

    // res.status(201).json({
    //   success: true,
    //   message: "Answer asked successfully!",
    //   answer,
    //   answerCount,
    //   viewCount: findQuestion.viewCount,
    // });

    res.status(201).json({
      success: true,
      message: "Answer asked successfully!",
      answer,
      answerCount,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

const correctAnswer = async (req, res) => {
  try {
    const _id = req.body;
    console.log("🚀 ~ correctAnswer ~ id:", _id);

    const findAuth = await Answers.findOne({ QuestionAuthor: _id });
    console.log(" ~ findAuth:", findAuth);

    if (!findAuth) {
      return res
        .status(404)
        .json({ success: false, message: "Answer Not found ......... " });
    }

    await Answers.findByIdAndUpdate(findAuth._id, { verifiedAnswers: true });
    // await Answers.findByIdAndUpdate({ verified: true });

    res.status(200).json({
      success: true,
      message: "Answers Verify successfully",
      data: findAuth,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: error.message });
  }
};

const getAnswer = async (req, res, next) => {
  try {
    const { questionId } = req.body;
    const findQuestion = await Question.findOne({ _id: questionId });
    findQuestion.viewCount += 1;
    await findQuestion.save();
    const answers = await Answers.find({ questionId }).populate({
      path: "user",
      select: "_id firstName lastName avatar",
      options: { strictPopulate: false },
    });

    res.status(200).json({
      success: true,
      data: answers,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

export { askQuestion, getQuestions, askAnswer, getAnswer, correctAnswer };
