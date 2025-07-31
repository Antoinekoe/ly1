import Link from "../models/link.js";
import User from "../models/user.js";

class UrlController {
  // Create short URL for registered user
  static async createShortUrl(req, res) {
    try {
      const userId = req.session.passport.user.id;
      const originalUrl = req.body.value;

      // Check if user has reached limit
      const userLinks = await Link.getActiveLinksByUserId(userId);
      if (userLinks.length >= 10) {
        req.session.linksLimitReached = true;
        return res.redirect("/admin");
      }

      // Create the short URL
      const newLink = await Link.create(userId, originalUrl);
      res.redirect("/admin");
    } catch (error) {
      console.error("Error creating short URL:", error);
      req.session.error = "Erreur lors de la création du lien";
      res.redirect("/admin");
    }
  }

  // Create temporary short URL for anonymous user
  static async createTempUrl(req, res) {
    try {
      const originalUrl = req.body.originalUrl;

      // Get or create temporary user
      const tempUserId = await User.getOrCreateTempUser(req.ip);

      // Create temporary short URL
      const newLink = await Link.createTemp(tempUserId, originalUrl);

      // Store in session for display
      req.session.oldUrl = originalUrl;
      req.session.newUrl = newLink.short_code;
      req.session.activeMode = "url";
      req.session.isURLCreated = true;

      res.redirect("/");
    } catch (error) {
      console.error("Error creating temp URL:", error);
      res.redirect("/");
    }
  }

  // Redirect short URL to original URL
  static async redirectToOriginal(req, res) {
    try {
      const shortCode = req.params.id;

      // Find the link (check both temp and regular)
      const link = await Link.findByShortCode(shortCode);

      if (!link) {
        return res.status(404).send("Short URL not found");
      }

      // Increment click count
      if (link.link_type === "temp") {
        await Link.incrementTempClicks(shortCode);
      } else {
        await Link.incrementClicks(shortCode);
      }

      // Redirect to original URL
      res.redirect(link.original_url);
    } catch (error) {
      console.error("Error redirecting URL:", error);
      res.status(500).send("Error processing redirect");
    }
  }

  // Get dashboard data for user
  static async getDashboardData(userId) {
    try {
      const links = await Link.getActiveLinksByUserId(userId);
      const totalClicks = await Link.getTotalClicksByUserId(userId);

      return {
        links,
        numberOfLinks: links.length,
        numberOfClicks: totalClicks,
        linksLimitReached: links.length > 9,
      };
    } catch (error) {
      console.error("Error getting dashboard data:", error);
      return {
        links: [],
        numberOfLinks: 0,
        numberOfClicks: 0,
        linksLimitReached: false,
      };
    }
  }

  // Delete a URL (soft delete)
  static async deleteUrl(req, res) {
    try {
      const linkId = req.body.link_id;

      const success = await Link.softDelete(linkId);

      res.redirect("/admin");
    } catch (error) {
      console.error("Error deleting URL:", error);
      res.redirect("/admin");
    }
  }

  // Switch to URL mode
  static switchToUrlMode(req, res) {
    req.session.activeMode = "url";
    req.session.save((err) => {
      res.redirect("/");
    });
  }

  // Switch to QR mode
  static switchToQrMode(req, res) {
    req.session.activeMode = "qr";
    req.session.save((err) => {
      res.redirect("/");
    });
  }

  // Render home page with session data
  static renderHome(req, res) {
    // Initialize session defaults
    if (req.session.limitError === undefined) {
      req.session.limitError = false;
    }
    if (req.session.isRegistered === undefined) {
      req.session.isRegistered === false;
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

    res.render("index.ejs", {
      newUrl: req.session.newUrl,
      activeMode: req.session.activeMode,
      qrCodeDataURL: req.session.qrCodeDataURL,
      isQrCodeCreated: req.session.isQrCodeCreated,
      isURLCreated: req.session.isURLCreated,
      isRegistered: req.session.isRegistered,
    });
  }
}

export default UrlController;
