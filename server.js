const express = require('express');
const mongoose = require('mongoose');
const swaggerUi = require('swagger-ui-express');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const bookRoutes = require('./routes/books');
const movieRoutes = require('./routes/movies');
const swaggerDocument = require('./swagger.json');
const passport = require('passport');
const GitHubStrategy = require('passport-github2').Strategy;
const session = require('express-session');

// Load environment variables from .env file
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// MongoDB connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
  .then(() => console.log('MongoDB connected...'))
  .catch(err => console.error('MongoDB connection error:', err));

// Configure session middleware
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false
}));

// Passport.js initialization
app.use(passport.initialize());
app.use(passport.session());

// Define GitHub authentication strategy
passport.use(new GitHubStrategy({
    clientID: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
    callbackURL: process.env.CALLBACK_URL
  },
  (accessToken, refreshToken, profile, done) => {
    // Authentication callback logic
    // Here you can save the profile information to your database if needed
    return done(null, profile);
  }
));

// Serialize user into the session
passport.serializeUser((user, done) => {
  done(null, user);
});

// Deserialize user from the session
passport.deserializeUser((obj, done) => {
  done(null, obj);
});

// Swagger setup
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Routes
app.use('/api/books', bookRoutes);
app.use('/api/movies', movieRoutes); // New movie routes

// GitHub OAuth routes
app.get('/auth/github',
  passport.authenticate('github'));

app.get('/github/callback',
  passport.authenticate('github', { failureRedirect: '/' }),
  (req, res) => {
    // Successful authentication, redirect to dashboard or perform other actions
    res.redirect('/dashboard');
  });

// Example protected route
app.get('/dashboard', (req, res) => {
  if (req.isAuthenticated()) {
    // Access user information from req.user
    const username = req.user.username; // Assuming 'username' is part of the user profile
    
    res.send(`Welcome to the dashboard, ${username}!`);
  } else {
    res.redirect('/');
  }
});

// Logout route
app.get('/logout', (req, res) => {
  req.logout(); // Passport.js method to clear the login session
  res.redirect('/'); // Redirect to home page or login page
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
