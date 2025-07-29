import path from "path";

// Get favicon path
export function getFaviconPath() {
  return path.join(process.cwd(), "public", "favicon.png");
}

// Initialize session variables with defaults
export function initializeSessionDefaults(session) {
  if (session.isRegistered === undefined) {
    session.isRegistered = false;
  }
  if (session.isQrCodeCreated === undefined) {
    session.isQrCodeCreated = false;
  }
  if (session.isURLCreated === undefined) {
    session.isURLCreated = false;
  }
  if (session.activeMode === undefined) {
    session.activeMode = "url";
  }
  if (session.qrCodesLimitReached === undefined) {
    session.qrCodesLimitReached = false;
  }
  if (session.linksLimitReached === undefined) {
    session.linksLimitReached = false;
  }
}

// Check if user has reached limits
export function checkUserLimits(linksCount, qrCodesCount) {
  return {
    linksLimitReached: linksCount > 9,
    qrCodesLimitReached: qrCodesCount > 9,
  };
}
