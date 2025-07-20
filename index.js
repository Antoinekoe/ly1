import express from "express";
import bodyParser from "body-parser";
import pg from "pg";
import bcrypt from "bcrypt";
import session from "express-session";
import passport from "passport";
import { Strategy } from "passport-local";
import { Strategy as GoogleStrategy } from "passport-google-oauth2";
import env from "dotenv";
import { nanoid } from "nanoid";
import QRCode from "qrcode";

const app = express();
const port = 3000;
const saltRounds = 10; // Bcrypt salt rounds
env.config();

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false, maxAge: 7 * 24 * 60 * 60 * 1000 },
  })
);

app.use(passport.initialize());
app.use(passport.session());

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

// Function to get existing temp user OR create new one
async function getOrCreateTempUser(ip) {
  // First, try to find existing user with this IP
  let result = await pool.query("SELECT id FROM temp_users WHERE ip = $1", [
    ip,
  ]);

  if (result.rows.length === 0) {
    // If no user exists, create a new one
    result = await pool.query(
      "INSERT INTO temp_users (ip) VALUES ($1) RETURNING id",
      [ip]
    );
  }
  return result.rows[0].id; // Return the user ID
}

app.get("/favicon.ico", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "favicon.png"));
});

app.get("/", async (req, res) => {
  // Home page - render with session data
  // Set the isQrCodeCreated to false

  try {
    await getOrCreateTempUser(req.ip);
  } catch (error) {
    console.log("Error in getOrCreateTempUser:", error);
  }

  if (req.session.isRegistered === undefined) {
    req.session.isRegistered = false;
  }
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
    isRegistered: req.session.isRegistered,
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
  res.render("login.ejs");
});
// req.session.isRegistered = true;

app.post(
  "/login",
  passport.authenticate("local", {
    successRedirect: "/admin",
    failureRedirect: "/login",
  })
);

app.get("/admin", (req, res) => {
  if (req.isAuthenticated()) {
    res.render("admin.ejs");
  } else {
    res.render("login.ejs");
  }
});

app.get("/signup", (req, res) => {
  res.render("signup.ejs");
});

app.post("/signup", async (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  try {
    const result = await pool.query("SELECT * FROM users WHERE email=$1", [
      email,
    ]);

    if (result.rows.length > 0) {
      res.render("signup.ejs");
    } else {
      bcrypt.hash(password, saltRounds, async (err, hash) => {
        if (err) {
          console.log("Error in Hashing PW : ", err);
        } else {
          try {
            const result = await pool.query(
              "INSERT INTO users (email, password_hash) VALUES ($1, $2) RETURNING *",
              [email, hash]
            );
            const user = result.rows[0].id;
            req.login(user, (err) => {
              res.redirect("/admin");
            });
          } catch (error) {
            console.log("Error in adding the user in DB :", error);
          }
        }
      });
    }
  } catch (error) {
    console.log("Error getting data from DB :", error);
  }
});

app.get(
  "/auth/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
  })
);

app.get(
  "/auth/google/admin",
  passport.authenticate("google", {
    successRedirect: "/admin",
    failureRedirect: "/login",
  })
);

app.post("/create-url", async (req, res) => {
  if (req.session.isURLCreated === true) {
    res.redirect("/");
  } else {
    const oldUrl = req.body.originalUrl;
    const newUrl = nanoid(6); // Generate 6-char random ID

    // If the user type the route, we make sure that he is in temp_users DB
    const tempUserId = await getOrCreateTempUser(req.ip);
    try {
      await pool.query(
        "INSERT INTO temp_links (temp_user_id, short_code, original_url) VALUES ($1, $2, $3)",
        [tempUserId, newUrl, oldUrl]
      );
    } catch (error) {
      console.log("Error inserting temp links in DB :", error);
    }

    req.session.oldUrl = oldUrl;
    req.session.newUrl = newUrl;
    req.session.activeMode = "url";
    req.session.isURLCreated = true;
    res.redirect("/");
  }
});

app.post("/create-qr-code", async (req, res) => {
  if (req.session.isQrCodeCreated === true) {
    res.redirect("/");
  } else {
    try {
      const urlSent = req.body.urlToQR;
      const dataURL = await QRCode.toDataURL(urlSent);
      const tempUserId = await getOrCreateTempUser(req.ip);

      // Insert the QR code datas in DB
      try {
        await pool.query(
          "INSERT INTO temp_qrcode (temp_user_id, qr_url, qr_data_url) VALUES ($1, $2, $3)",
          [tempUserId, urlSent, dataURL]
        );
      } catch (error) {
        console.log("Error in inserting temp qr code in DB :", error);
      }

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

app.get("/:id", async (req, res) => {
  const shortUrlRequested = req.params.id;
  console.log("ID route being called with id :", req.params.id);
  const newUrl = await pool.query(
    "SELECT * FROM temp_links WHERE short_code=$1",
    [shortUrlRequested]
  );
  console.log(newUrl.rows[0]);
  if (shortUrlRequested === newUrl.rows[0].short_code) {
    res.redirect(newUrl.rows[0].original_url);
  } else {
    res.status(404).send("Short URL not found");
  }
});

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

passport.use(
  "google",
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "http://localhost:3000/auth/google/admin",
      userProfileURL: "https://www.googleapis.com/oauth2/v3/userinfo",
    },
    async (accessToken, refreshToken, profile, cb) => {
      const userEmail = profile.emails[0].value;
      const userId = profile.id;
      const result = await pool.query("SELECT * FROM users WHERE email = $1", [
        userEmail,
      ]);
      if (result.rows.length === 0) {
        const newUser = await pool.query(
          "INSERT INTO users (email, password_hash, google_id) VALUES ($1, $2, $3) RETURNING *",
          [userEmail, "google_id", userId]
        );
        return cb(null, newUser.rows[0]);
      } else {
        return cb(null, result.rows[0]);
      }
    }
  )
);

// Session serialization
passport.serializeUser((user, cb) => {
  cb(null, user);
});
passport.deserializeUser((user, cb) => {
  cb(null, user);
});

app.listen(port, (req, res) => {
  console.log("Listening on port" + port);
});
