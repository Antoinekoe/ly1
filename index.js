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

const app = express();
const port = 3000;
const saltRounds = 10; // Bcrypt salt rounds
env.config();

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
  // Check if there are entry in DB
  try {
    const result = await pool.query("SELECT * FROM links");
    if (result.rows.length > 0) {
      const newUrl = result.rows[0].new_url;
      console.log(newUrl);
      res.render("index.ejs", { entryInDB: true, newUrl: newUrl });
    } else {
      res.render("index.ejs", { entryInDB: false });
    }
  } catch (error) {}
});

app.get("/login", (req, res) => {
  res.render("login");
});

app.get("/register", (req, res) => {
  res.render("register");
});

app.get("/register", (req, res) => {
  res.render("register");
});

app.get("/:id", async (req, res) => {
  const idRequested = req.params.id;
  const result = await pool.query("SELECT * FROM links WHERE new_url=$1", [
    idRequested,
  ]);
  const oldUrl = result.rows[0].old_url;
  res.redirect(oldUrl);
});

app.post("/create-url", async (req, res) => {
  const oldUrl = req.body.originalUrl;
  const newUrl = nanoid(6);
  try {
    const result = await pool.query(
      "INSERT INTO links (old_url, new_url) VALUES ($1, $2)",
      [oldUrl, newUrl]
    );
    res.redirect("/");
  } catch (error) {
    console.log("Error inserting data in DB :", error);
  }
});

app.post("/create-qr-code", (req, res) => {});

app.listen(port, (req, res) => {
  console.log("Listening on port" + port);
});
