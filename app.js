import express from "express";
import cors from "cors";
import path from "path";
import user from "./routes/userRoutes.js";
import passport from "passport";
import { isAuthenticatedUser } from "./middleware/auth.js";
import User from "./models/userModel.js";
import Question from "./routes/questionRoutes.js";
import Comment from "./routes/commentRoutes.js";

const app = express();
app.use(cors());
app.use(express.json());

// Routes
app.use(user);
app.use(Question);
app.use(Comment);

// Initialize Passport
app.use(passport.initialize());

// Configure Passport middleware
isAuthenticatedUser(passport);

//multer //image frontend
app.use("/uploads", express.static("uploads"));

//frontend connect
app.use(express.static(path.join(path.resolve(), "static")));

passport.serializeUser(function (user, done) {
  done(null, user._id);
});

passport.deserializeUser(function (id, done) {
  User.findById(id, function (err, user) {
    done(err, user);
  });
});

//frontend connect
app.use(express.static(path.join(path.resolve(), "build")));

app.get("/*", (req, res) => {
  res.status(200).sendFile(path.join(path.resolve(), "build/index.html"));
});

export default app;
