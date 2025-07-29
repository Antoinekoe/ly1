// Check if user is authenticated
export function requireAuth(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }

  console.log("User not authenticated, redirecting to login");
  res.redirect("/login");
}

// Check if user is NOT authenticated (for login/signup pages)
export function requireGuest(req, res, next) {
  if (!req.isAuthenticated()) {
    return next();
  }

  // If already logged in, redirect to admin
  res.redirect("/admin");
}

// Initialize session defaults
export function initializeSession(req, res, next) {
  if (req.session.isRegistered === undefined) {
    req.session.isRegistered = false;
  }
  if (req.session.isQrCodeCreated === undefined) {
    req.session.isQrCodeCreated = false;
  }
  if (req.session.isURLCreated === undefined) {
    req.session.isURLCreated = false;
  }
  if (req.session.activeMode === undefined) {
    req.session.activeMode = "url";
  }
  if (req.session.qrCodesLimitReached === undefined) {
    req.session.qrCodesLimitReached = false;
  }
  if (req.session.linksLimitReached === undefined) {
    req.session.linksLimitReached = false;
  }

  next();
}
