const GitHubStrategy = require('passport-github2').Strategy;

passport.use(new GitHubStrategy({
    clientID: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
    callbackURL: process.env.CALLBACK_URL
  },
  (accessToken, refreshToken, profile, done) => {
    // Verify callback function
    return done(null, profile);
  }
));
