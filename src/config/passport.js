import passport from "passport";
import { Strategy } from "passport-local";
import { Strategy as GoogleStrategy } from "passport-google-oauth2";
import bcrypt from "bcrypt";
import pool from "./database.js";

// Local authentication strategy
passport.use(
  "local",
  new Strategy(
    { usernameField: "email", passwordField: "password" },
    async function verify(email, password, cb) {
      try {
        const result = await pool.query(
          "SELECT * FROM users WHERE email=$1 AND google_id IS NULL",
          [email]
        );
        if (result.rows.length > 0) {
          const user = result.rows[0];
          const storedHashedPassword = user.password_hash;
          bcrypt.compare(password, storedHashedPassword, (err, valid) => {
            if (err) {
              console.error("Error comparing passwords:", err);
              return cb(err);
            } else {
              if (valid) {
                return cb(null, user);
              } else {
                return cb(null, false);
              }
            }
          });
        } else {
          return cb(null, false);
        }
      } catch (err) {
        console.log(err);
        return cb(err);
      }
    }
  )
);

// Google OAuth authentication strategy
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  passport.use(
    "google",
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL:
          process.env.GOOGLE_CALLBACK_URL ||
          "http://localhost:3000/auth/google/admin",
        userProfileURL: "https://www.googleapis.com/oauth2/v3/userinfo",
      },
      async (accessToken, refreshToken, profile, cb) => {
        try {
          const userEmail = profile.emails[0].value;
          const userId = profile.id;
          const result = await pool.query(
            "SELECT * FROM users WHERE email = $1",
            [userEmail]
          );
          if (result.rows.length === 0) {
            // Create new user for Google OAuth
            const newUser = await pool.query(
              "INSERT INTO users (email, password_hash, google_id) VALUES ($1, $2, $3) RETURNING *",
              [userEmail, "google_id", userId]
            );
            return cb(null, newUser.rows[0]);
          } else {
            return cb(null, result.rows[0]);
          }
        } catch (error) {
          console.error("Google OAuth error:", error);
          return cb(error);
        }
      }
    )
  );
}

// Session serialization
passport.serializeUser((user, cb) => {
  cb(null, user);
});

passport.deserializeUser((user, cb) => {
  cb(null, user);
});
