import rateLimit from "express-rate-limit";

// Rate limiting for URL creation (10 requests per 15 minutes)
export const createUrlLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 30, // limit each IP to 30 requests per windowMs
  handler: (req, res) => {
    req.session.limitError = "Trop de créations d'URL, essayez plus tard.";
    res.redirect("/admin");
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

// Rate limiting for login attempts (5 attempts per 15 minutes)
export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs
  handler: (req, res) => {
    req.session.loginError = "Trop d'essais de connexion, essayez plus tard.";
    res.redirect("/login");
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiting for signup attempts (3 attempts per 15 minutes)
export const signupLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 3, // limit each IP to 3 requests per windowMs
  handler: (req, res) => {
    req.session.loginError =
      "Trop d'essais de création de compte, essayez plus tard.";
    res.redirect("/signup");
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiting for general requests (100 requests per 15 minutes)
export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  handler: (req, res) => {
    req.session.loginError = "Trop de requêtes, essayez plus tard. ";
    res.redirect("/");
  },
  standardHeaders: true,
  legacyHeaders: false,
});
