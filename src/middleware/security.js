import helmet from "helmet";

// Security headers middleware
export function securityHeaders(req, res, next) {
  // Basic security headers
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("X-XSS-Protection", "1; mode=block");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");

  next();
}

// CSRF protection (if you add CSRF tokens later)
export function csrfProtection(req, res, next) {
  // This is a placeholder for CSRF protection
  // You can add CSRF token validation here later
  next();
}

// Content Security Policy
export function contentSecurityPolicy(req, res, next) {
  res.setHeader(
    "Content-Security-Policy",
    "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:;"
  );
  next();
}
