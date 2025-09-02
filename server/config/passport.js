const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const FacebookStrategy = require("passport-facebook").Strategy;
const User = require("../models/User");
const { generateToken } = require("../utils/jwt");

// Serialize user for session
passport.serializeUser((user, done) => {
  done(null, user._id);
});

// Deserialize user from session
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

// Google OAuth Strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "/api/auth/google/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Check if user already exists with this Google ID
        let existingUser = await User.findOne({
          $or: [
            { "oauth.google.id": profile.id },
            { email: profile.emails[0].value },
          ],
        });

        if (existingUser) {
          // Update Google OAuth info if not already set
          if (!existingUser.oauth.google.id) {
            existingUser.oauth.google = {
              id: profile.id,
              email: profile.emails[0].value,
            };
            await existingUser.save();
          }
          return done(null, existingUser);
        }

        // Create new user
        const newUser = new User({
          email: profile.emails[0].value,
          firstName: profile.name.givenName,
          lastName: profile.name.familyName,
          emailVerified: true, // Google emails are pre-verified
          oauth: {
            google: {
              id: profile.id,
              email: profile.emails[0].value,
            },
          },
          // Generate a random phone placeholder (to be updated later)
          phone: `+1${Math.floor(Math.random() * 9000000000) + 1000000000}`,
          // No password needed for OAuth users
          password: Math.random().toString(36).slice(-8),
        });

        await newUser.save();
        done(null, newUser);
      } catch (error) {
        done(error, null);
      }
    }
  )
);

// Facebook OAuth Strategy
passport.use(
  new FacebookStrategy(
    {
      clientID: process.env.FACEBOOK_APP_ID,
      clientSecret: process.env.FACEBOOK_APP_SECRET,
      callbackURL: "/api/auth/facebook/callback",
      profileFields: ["id", "emails", "name"],
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Check if user already exists with this Facebook ID
        let existingUser = await User.findOne({
          $or: [
            { "oauth.facebook.id": profile.id },
            { email: profile.emails[0].value },
          ],
        });

        if (existingUser) {
          // Update Facebook OAuth info if not already set
          if (!existingUser.oauth.facebook.id) {
            existingUser.oauth.facebook = {
              id: profile.id,
              email: profile.emails[0].value,
            };
            await existingUser.save();
          }
          return done(null, existingUser);
        }

        // Create new user
        const newUser = new User({
          email: profile.emails[0].value,
          firstName: profile.name.givenName,
          lastName: profile.name.familyName,
          emailVerified: true, // Facebook emails are pre-verified
          oauth: {
            facebook: {
              id: profile.id,
              email: profile.emails[0].value,
            },
          },
          // Generate a random phone placeholder (to be updated later)
          phone: `+1${Math.floor(Math.random() * 9000000000) + 1000000000}`,
          // No password needed for OAuth users
          password: Math.random().toString(36).slice(-8),
        });

        await newUser.save();
        done(null, newUser);
      } catch (error) {
        done(error, null);
      }
    }
  )
);

module.exports = passport;
