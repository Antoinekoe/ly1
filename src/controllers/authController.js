import User from "../models/user.js";

class AuthController {
  // User registration
  static async register(req, res) {
    try {
      const { email, password } = req.body;

      // Check if user already exists
      const existingUser = await User.findByEmail(email);
      if (existingUser) {
        req.session.signupError = "Utilisateur déjà existant";
        return res.redirect("/signup");
      }

      // Create new user
      const newUser = await User.create(email, password);

      // Log them in automatically
      req.login(newUser, (err) => {
        if (err) {
          req.session.signupError = "Erreur lors de la connexion";
          return res.redirect("/signup");
        }

        // Reset session limits
        req.session.qrCodesLimitReached = false;
        req.session.linksLimitReached = false;
        req.session.isRegistered = true;

        res.redirect("/admin");
      });
    } catch (error) {
      console.error("Registration error:", error);
      req.session.signupError = "Erreur lors de l'inscription";
      res.redirect("/signup");
    }
  }

  // User login
  static async login(req, res, next) {
    passport.authenticate("local", (err, user, info) => {
      if (err) {
        req.session.loginError = "Une erreur s'est produite";
        return res.redirect("/login");
      }

      if (!user) {
        req.session.loginError = "Email ou mot de passe incorrect";
        return res.redirect("/login");
      }

      req.logIn(user, (err) => {
        if (err) {
          req.session.loginError = "Erreur lors de la connexion";
          return res.redirect("/login");
        }

        // Reset session limits
        req.session.qrCodesLimitReached = false;
        req.session.linksLimitReached = false;
        req.session.isRegistered = true;
        req.session.loginError = null;

        res.redirect("/admin");
      });
    })(req, res, next);
  }

  // Google OAuth callback
  static async handleGoogleAuth(req, res, next) {
    passport.authenticate("google", (err, user, info) => {
      if (err) {
        return next(err);
      }

      if (!user) {
        return res.redirect("/login");
      }

      req.logIn(user, (err) => {
        if (err) {
          return next(err);
        }

        req.session.isRegistered = true;
        res.redirect("/admin");
      });
    })(req, res, next);
  }

  // User logout
  static logout(req, res) {
    req.logout(function (err) {
      if (err) {
        return next(err);
      }
      res.redirect("/");
    });
  }

  // Render login page
  static renderLogin(req, res) {
    res.render("login.ejs", {
      loginError: req.session.loginError,
    });
  }

  // Render signup page
  static renderSignup(req, res) {
    res.render("signup.ejs", {
      signupError: req.session.signupError,
    });
  }
}

export default AuthController;
