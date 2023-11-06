import User from "../models/userModel.js";
import bcrypt from "bcryptjs";
import generateVerificationCode from "../utils/VerificationCode.js";
import { sendVerificationCode } from "../utils/sendEmailSignUp.js";
import { generateResetToken, sendToken } from "../utils/jwtToken.js";

import sendEmail from "../utils/sendEmail.js";

import { config } from "dotenv";
config();

// ___________________________ Register Code ________________________

export const registerUser = async (req, res, next) => {
  try {
    const { firstName, lastName, password, email, avatar } = req.body;
    // console.log("req.body:", req.body);

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res
        .status(400)
        .json({ success: false, error: "User already exists" });
    }

    if (!req.file) {
      return res.status(400).json({ message: "Please upload your image" });
    }

    // Hash the user's password
    const encPassword = await bcrypt.hash(password, 12);

    // Generate a verification code for email
    const verificationCode = generateVerificationCode();
    const verificationCodeExpiresAt = new Date(Date.now() + 120000); // 2 minutes

    // Create a new user
    const user = new User({
      firstName,
      lastName,
      email,
      password: encPassword,
      avatar: req.file.path,
      verified: false,
      verificationCode,
      verificationCodeExpiresAt,
    });

    // Save the user to the database
    await user.save();

    // Send the verification code via email
    await sendVerificationCode(email, verificationCode);

    res.status(201).json({
      success: true,
      message: "Signup Successful!",
      email: email,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: error.message });
  }
};
// ___________________________ send Code ________________________

export const verifyCode = async (req, res) => {
  try {
    // console.log("req.body", req.body);
    const { email, verificationCode } = req.body;

    const user = await User.findOne({ email });
    // console.log("email", email);
    // console.log("user.email", user?.email);
    // const user = await User.findOne({ verificationCode });
    // console.log("verificationCode", verificationCode);
    // console.log("user.verificationCode", user?.verificationCode);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if the verification code has expired
    if (user.verificationCodeExpiresAt < new Date()) {
      return res.status(400).json({ message: "Verification code has expired" });
    }

    if (user.verificationCode === verificationCode) {
      // Update the user's record to mark it as verified
      await User.findByIdAndUpdate(user._id, { verified: true });
      user.verificationCode = undefined;
      user.verificationCodeExpiresAt = undefined;
      await user.save();

      return res
        .status(200)
        .json({ success: true, message: "Verification successful" });
    } else {
      return res.status(400).json({ message: "Invalid verification code" });
    }
  } catch (error) {
    console.error("Error in verifyCode:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

// ___________________________ Resend Code ________________________

export const resendVerificationCode = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    // console.log("🚀 ~ Resend user:", user);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.verified) {
      return res.status(400).json({ message: "User is already verified" });
    }

    // Check if the verification code has expired
    if (
      user.verificationCodeExpiresAt &&
      user.verificationCodeExpiresAt < new Date()
    ) {
      // Generate a new verification code
      const verificationCode = generateVerificationCode();
      // console.log("New verificationCode", verificationCode);

      // Update the user's verification code and expiration time in the database
      user.verificationCode = verificationCode;
      user.verificationCodeExpiresAt = new Date(Date.now() + 120000); // 60,000 milliseconds = 1 minute (adjust as needed)
      await user.save();

      // Send the new verification code to the user's email
      await sendVerificationCode(email, verificationCode);

      return res.status(200).json({
        success: true,
        message: "Verification code resent successfully",
      });
    } else {
      return res
        .status(400)
        .json({ success: false, message: "Verification code is still valid" });
    }
  } catch (error) {
    console.error("Error in resendVerificationCode:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// ___________________________Login________________________

export const userLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    // console.log("🚀 email, password:", email, password);

    const user = await User.findOne({ email });
    // console.log("🚀 ~ file: userController.js:161 ~ userLogin ~ user:", user);

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid email or password" });
    }

    if (!user.verified) {
      return res.status(401).json({
        success: false,
        message: "Account not verified. Please verify your email first.",
      });
    }

    // const token = generateToken(user);
    sendToken(user, 200, res);

    // res
    //   .status(200)
    //   .json({ message: "User Signed in Successfully", token, user });
  } catch (error) {
    console.error("Error in signIn User:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
// ___________________________Forgot Password________________________

// forgotPassword.js
export const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    // console.log("email", email);
    const user = await User.findOne({ email });

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    const resetToken = generateResetToken();
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpire = Date.now() + 3600000;
    // console.log("resetToken", resetToken);

    await user.save();

    const resetPasswordLink = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
    // const resetPasswordLink = `${process.env.FRONTEND_URL}/password/reset/${resetToken}`;
    const emailTemplate = `
      <html lang="en">
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <title>Password Reset</title>
        </head>
        <body>
          <h1>Stack Overflow</h1>
          <h3>Password Reset</h3>
          Click the link below to reset your password:
          <br><br>
          <a href="${resetPasswordLink}" target="_blank" style="display: inline-block; background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
            Reset Password
          </a>
          <br><br>
          If you have not requested this email, please ignore it.
        </body>
      </html>
    `;

    await sendEmail({
      email: user.email,
      subject: "Password Reset",
      message: emailTemplate,
    });

    res.status(200).json({
      success: true,
      message: `Email sent to ${user.email} successfully`,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// ___________________________Reset Password________________________
export const resetPassword = async (req, res, next) => {
  try {
    // const { token } = req.params;
    // console.log(" ~ token:", req.body);
    const { token, password, confirmPassword } = req.body;
    // console.log("token", token);
    const user = await User.findOne({
      resetPasswordToken: token,
    });
    // console.log("resetPassword ~ user:", user);

    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid or expired reset token" });
    }

    const encPassword = await bcrypt.hash(password, 12);

    // Update the user's password and clear the reset token fields
    user.password = encPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    // Respond with a success message
    res
      .status(200)
      .json({ success: true, message: "Password reset successful" });
  } catch (error) {
    console.error("Error in resetPassword:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to reset password" });
  }
};

//----------------------------- Get User -----------------------------------
const getUser = async (req, res, next) => {
  try {
    res.send(req?.user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: error.message });
  }
};

//-----------------------------Authenticate User --------------------------------
export { getUser };

//----------------------------- Update Password --------------------------------
export const updatePassword = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    // console.log("user update", user);
    // console.log("req.body", req.body);
    // console.log("req.body.oldPassword", req.body.oldPassword);
    // console.log("user.password", user.password);

    const isPasswordMatched = await bcrypt.compare(
      req.body.oldPassword,
      user.password
    );
    // const isPasswordMatched = await bcrypt.compare(
    //     req.body.oldPassword.toString(),
    //     user.password.toString()
    // );

    // console.log("isPasswordMatched", isPasswordMatched);

    if (!isPasswordMatched) {
      return res.status(404).json({ message: "Old password is incorrect" });
    }

    if (req.body.newPassword !== req.body.confirmPassword) {
      return res.status(400).json({ message: "Password do not match" });
    }

    // Password bcrypt
    const encPassword = await bcrypt.hash(req.body.newPassword, 12);
    // user.password = req.body.newPassword;
    user.password = encPassword;
    await user.save();

    res
      .status(200)
      .json({ success: true, message: "Password updated successfully" });
  } catch (error) {
    console.error("Error in updatePassword:", error);
    res.status(500).json({ message: "Failed to update password" });
  }
};

//------------------------------ Update User Info----------------------------------
export const updateUserName = async (req, res) => {
  try {
    const { firstName, lastName } = req.body;

    // Find the user by ID
    const userId = req.user.id;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Update the user's firstName, lastName, dob, and gender
    user.firstName = firstName;
    user.lastName = lastName;

    // Save the updated user to the database
    await user.save();

    res.status(200).json({ message: "User Name updated successfully" });
  } catch (error) {
    console.error("Error in update user info:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// ___________________________Update Profile________________________
export const updateProfile = async (req, res) => {
  try {
    console.log("req.body", req.body);

    const userId = req.user.id;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    console.log("req.file", req.file);
    // console.log("req.file.path", req.file.path);
    if (!req.file) {
      return res.status(400).json({ message: "Please upload your image" });
    }

    user.avatar = req.file.path;

    // Save the updated user to the database
    await user.save();

    res
      .status(200)
      .json({ message: "Profile updated successfully", avatar: user?.avatar });
  } catch (error) {
    console.error("Error in updateProfile:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

//-------------------------- Logout --------------------

export const logoutUser = async (req, res, next) => {
  try {
    res.setHeader("Authorization", "");

    res.status(200).json({ success: true, message: "Logout successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: error.message });
  }
};
