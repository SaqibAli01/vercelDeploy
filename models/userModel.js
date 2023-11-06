import mongoose from "mongoose";

const { Schema } = mongoose;

const userSchema = new Schema({
  firstName: {
    type: String,
    required: [true, "Please enter your first name"],
  },
  lastName: {
    type: String,
    required: [true, "Please enter your last name"],
  },
  password: {
    type: String,
    required: [true, "Please enter a password"],
    // match: [
    //   /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/,
    //   "At least 8 characters long Contains at least one letter & one digit",
    // ],
  },
  email: {
    type: String,
    required: [true, "Please enter your email"],
    unique: true,
    trim: true,
    lowercase: true,
  },

  avatar: {
    type: String,
    required: [true, "Please upload your image"],
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },

  verified: {
    type: Boolean,
    default: false,
  },
  verificationCode: {
    type: String,
    default: null,
  },
  verificationCodeExpiresAt: {
    type: Date,
    default: null,
  },

  resetPasswordToken: String,
  resetPasswordExpire: Date,
});

const User = mongoose.model("User", userSchema);

export default User;
