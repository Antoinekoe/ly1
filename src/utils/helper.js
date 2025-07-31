import path from "path";

// Get favicon path
export function getFaviconPath() {
  return path.join(process.cwd(), "public", "favicon.png");
}

// Check if user has reached limits
export function checkUserLimits(linksCount, qrCodesCount) {
  return {
    linksLimitReached: linksCount > 9,
    qrCodesLimitReached: qrCodesCount > 9,
  };
}
