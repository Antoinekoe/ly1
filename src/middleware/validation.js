import {
  isValidUrl,
  isValidEmail,
  sanitizeInput,
} from "../utils/validation.js";

// Validate URL format in requests
export function validateUrl(req, res, next) {
  const url = req.body.value || req.body.urlToQR || req.body.originalUrl;

  if (url && !isValidUrl(url)) {
    req.session.error = "Invalid URL format";
    return res.redirect("/admin");
  }

  req.session.error = null;
  next();
}

// Validate email format
export function validateEmail(req, res, next) {
  const email = req.body.email;
  if (email && !isValidEmail(email)) {
    req.session.signupError = "Invalid email format";
    return res.redirect("/signup");
  }
  next();
}

// Sanitize user input to prevent XSS
export function sanitizeInputer(req, res, next) {
  if (req.body.email) {
    req.body.email = sanitizeInput(req.body.email);
  }
  if (req.body.value) {
    req.body.value = sanitizeInput(req.body.value);
  }
  if (req.body.originalUrl) {
    req.body.originalUrl = sanitizeInput(req.body.originalUrl);
  }
  if (req.body.urlToQR) {
    req.body.urlToQR = sanitizeInput(req.body.urlToQR);
  }
  next();
}
