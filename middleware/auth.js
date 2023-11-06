import passport from "passport";
import { config } from "dotenv";
config();

import { Strategy as JwtStrategy, ExtractJwt } from "passport-jwt";
import User from "../models/userModel.js";

const AUTH_HEADER = "authorization";
// console.log("🚀  ~ AUTH_HEADER:", AUTH_HEADER);
// Configure JWT strategy
const jwtOptions = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.JWT_SECRET_KEY,
  //   secretOrKey: "jllgshllWEUJHGHYJkjsfjds90",
};

export const isAuthenticatedUser = (passport) => {
  passport.use(
    new JwtStrategy(jwtOptions, async (payload, done) => {
      if (payload && payload.id) {
        try {
          const user = await User.findById(payload.id);

          if (!user) {
            return done(null, false);
          }
          done(null, user);
        } catch (error) {
          done(error, false);
        }
      } else {
        done(null, false);
      }
    })
  );
};
