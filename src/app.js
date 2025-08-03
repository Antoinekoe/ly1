import express from "express";
import bodyParser from "body-parser";
import session from "express-session";
import passport from "passport";

// Import routes
import routes from "./routes/index.js";

// Import middleware
import {
  errorHandler,
  notFoundHandler,
  databaseErrorHandler,
} from "./middleware/errorHandler.js";
import { securityHeaders } from "./middleware/security.js";
import { initializeSession } from "./middleware/auth.js";

// Import passport configuration
import "./config/passport.js";

const app = express();

// Security middleware
app.use(securityHeaders);

// Session configuration
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: true,
    saveUninitialized: true,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      httpOnly: true,
    },
  })
);

// Initialize passport
app.use(passport.initialize());
app.use(passport.session());

// Session initialization middleware
app.use(initializeSession);

// View engine setup
app.set("view engine", "ejs");

// Body parsing middleware
app.use(bodyParser.urlencoded({ extended: true }));

// Static files middleware
app.use(express.static("public"));

// Mount all routes
app.use("/", routes);

// Error handling middleware
app.use(notFoundHandler);
app.use(errorHandler);
app.use(databaseErrorHandler);

export default app;
