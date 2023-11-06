import jwt from "jsonwebtoken";

import { config } from "dotenv";
config();

const sendToken = (user, statusCode, res) => {
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET_KEY, {
    expiresIn: process.env.JWT_EXPIRE,
  });

  // console.log(`Bearer ${token}`);
  res.setHeader("Authorization", `Bearer ${token}`);
  res.status(statusCode).json({
    success: true,
    token,
    user,
  });
};

// export default sendToken;

// forgot password
const generateResetToken = (email) => {
  // console.log("🚀 ~ file: jwtToken.js:4 ~ generateToken ~ email:", email);
  const token = jwt.sign({ email }, process.env.JWT_SECRET_KEY, {
    expiresIn: "1h",
  });
  // console.log("token", token);
  return token;
};

export { sendToken, generateResetToken };
