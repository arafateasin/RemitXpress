const express = require("express");
const passport = require("passport");
const { generateToken } = require("../utils/jwt");
const router = express.Router();

// Google OAuth Routes
router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
  })
);

router.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: "/login?error=oauth_failed",
  }),
  async (req, res) => {
    try {
      // Generate JWT token for the authenticated user
      const token = generateToken(req.user._id);

      // Set token in cookie
      res.cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
      });

      // Redirect to frontend callback with token and user data
      const userData = encodeURIComponent(
        JSON.stringify({
          id: req.user._id,
          email: req.user.email,
          firstName: req.user.firstName,
          lastName: req.user.lastName,
          oauth: req.user.oauth,
        })
      );

      res.redirect(
        `${
          process.env.CLIENT_URL || "http://localhost:3000"
        }/auth/callback?token=${token}&user=${userData}`
      );
    } catch (error) {
      console.error("Google OAuth callback error:", error);
      res.redirect(
        `${
          process.env.CLIENT_URL || "http://localhost:3000"
        }/login?error=auth_failed`
      );
    }
  }
);

// Facebook OAuth Routes
router.get(
  "/facebook",
  passport.authenticate("facebook", {
    scope: ["email"],
  })
);

router.get(
  "/facebook/callback",
  passport.authenticate("facebook", {
    failureRedirect: "/login?error=oauth_failed",
  }),
  async (req, res) => {
    try {
      // Generate JWT token for the authenticated user
      const token = generateToken(req.user._id);

      // Set token in cookie
      res.cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
      });

      // Redirect to frontend callback with token and user data
      const userData = encodeURIComponent(
        JSON.stringify({
          id: req.user._id,
          email: req.user.email,
          firstName: req.user.firstName,
          lastName: req.user.lastName,
          oauth: req.user.oauth,
        })
      );

      res.redirect(
        `${
          process.env.CLIENT_URL || "http://localhost:3000"
        }/auth/callback?token=${token}&user=${userData}`
      );
    } catch (error) {
      console.error("Facebook OAuth callback error:", error);
      res.redirect(
        `${
          process.env.CLIENT_URL || "http://localhost:3000"
        }/login?error=auth_failed`
      );
    }
  }
);

// OAuth logout
router.post("/oauth/logout", (req, res) => {
  req.logout((err) => {
    if (err) {
      return res.status(500).json({ error: "Logout failed" });
    }
    res.clearCookie("token");
    res.json({ message: "Logout successful" });
  });
});

// Get OAuth user info
router.get("/oauth/user", (req, res) => {
  if (!req.user) {
    return res.status(401).json({ error: "Not authenticated" });
  }

  res.json({
    user: {
      id: req.user._id,
      email: req.user.email,
      firstName: req.user.firstName,
      lastName: req.user.lastName,
      isOAuthUser: !!(req.user.oauth.google.id || req.user.oauth.facebook.id),
    },
  });
});

module.exports = router;
