// Validate URL format
export function isValidUrl(string) {
  try {
    new URL(string);
    return true;
  } catch (_) {
    return false;
  }
}

// Validate email format
export function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Sanitize user input to prevent XSS
export function sanitizeInput(input) {
  if (typeof input !== "string") return input;
  return input.trim().replace(/[<>]/g, "").substring(0, 1000);
}
