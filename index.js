import express from "express";
import bodyParser from "body-parser";
import pg from "pg";
import bcrypt from "bcrypt";
import passport from "passport";
import { Strategy } from "passport-local";
import { Strategy as GoogleStrategy } from "passport-google-oauth2";
import session from "express-session";
import env from "dotenv";
import { nanoid } from "nanoid";
import QRCode from "qrcode";

const app = express();
const port = 3000;
const saltRounds = 10; // Bcrypt salt rounds
env.config();

app.use(
  session({
    secret: process.env.SESSION_SECRET || "default_dev_secret",
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false, maxAge: 7 * 24 * 60 * 60 * 1000 },
  })
);

const pool = new pg.Pool({
  user: process.env.USER,
  host: process.env.HOST,
  database: process.env.DATABASE,
  password: process.env.PASSWORD,
  port: process.env.PORT,
});

app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public")); // Serve static files

app.get("/", async (req, res) => {
  // Home page - render with session data

  // Set the isQrCodeCreated to false
  if (req.session.isQrCodeCreated === undefined) {
    req.session.isQrCodeCreated = false;
  }
  // Set the isURLCreated to false
  if (req.session.isURLCreated === undefined) {
    req.session.isURLCreated = false;
  }
  // Set the activeMode to URL by default
  if (req.session.activeMode === undefined) {
    req.session.activeMode = "url";
  }
  res.render("index.ejs", {
    newUrl: req.session.newUrl,
    activeMode: req.session.activeMode,
    qrCodeDataURL: req.session.qrCodeDataURL,
    isQrCodeCreated: req.session.isQrCodeCreated,
    isURLCreated: req.session.isURLCreated,
  });
});

// Route to switch to URL mode
app.get("/switch-to-url", (req, res) => {
  req.session.activeMode = "url";
  req.session.save((err) => {
    if (err) {
      console.log("Session save error:", err);
    }
    res.redirect("/");
  });
});

// Route to switch to QR mode
app.get("/switch-to-qr", (req, res) => {
  req.session.activeMode = "qr";
  req.session.save((err) => {
    if (err) {
      console.log("Session save error:", err);
    }
    res.redirect("/");
  });
});

app.get("/login", (req, res) => {
  res.render("login");
});

app.get("/register", (req, res) => {
  res.render("register");
});

app.post("/create-url", (req, res) => {
  if (req.session.isURLCreated === true) {
    res.redirect("/");
  } else {
    const oldUrl = req.body.originalUrl;
    const newUrl = nanoid(6); // Generate 6-char random ID

    req.session.oldUrl = oldUrl;
    req.session.newUrl = newUrl;
    req.session.activeMode = "url";
    req.session.isURLCreated = true;
    res.redirect("/");
  }
});

app.post("/download-qr-code", async (req, res) => {
  if (req.session.qrCodeDataURL) {
    try {
      //Replace the data type to base 64, and buffer it for the browser to be able to read it
      const dataURL = req.session.qrCodeDataURL;
      const base64 = dataURL.replace(/^data:image\/png;base64,/, "");
      const buffer = Buffer.from(base64, "base64");

      //Set the header for browser request with the type of the image sent, tells it to download, and set the length
      res.setHeader("Content-Type", "image/png");
      res.setHeader("Content-Disposition", "attachment; filename=qr-code.png ");
      res.setHeader("Content-Length", buffer.length);

      res.send(buffer);
    } catch (error) {
      console.log("Error downloading QR code :", error);
      return res.redirect("/");
    }
  } else {
    return res.redirect("/");
  }
});

app.post("/create-qr-code", async (req, res) => {
  if (req.session.isQrCodeCreated === true) {
    res.redirect("/");
  } else {
    try {
      const dataURL = await QRCode.toDataURL(req.body.urlToQR);

      // Store QR code data in session
      req.session.qrCodeDataURL = dataURL;
      req.session.activeMode = "qr";
      req.session.isQrCodeCreated = true;
      res.redirect("/");
    } catch (error) {
      console.log("Error creating QR code :", error);
      res.redirect("/");
    }
  }
});

app.get("/:id", async (req, res) => {
  const shortUrlRequested = req.params.id;
  const newUrl = req.session.newUrl;
  const oldUrl = req.session.oldUrl;

  if (shortUrlRequested === newUrl) {
    res.redirect(oldUrl);
  } else {
    res.status(404).send("Short URL not found");
  }
});

app.listen(port, (req, res) => {
  console.log("Listening on port" + port);
});
