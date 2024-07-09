const express = require('express');
const mongoose = require('mongoose');
const swaggerUi = require('swagger-ui-express');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const swaggerDocument = require('./swagger-output.json');
const passport = require('passport');
const GitHubStrategy = require('passport-github2').Strategy;
const session = require('express-session');
const cors = require('cors');

// Load environment variables from .env file
dotenv.config();

const routes = require('./routes/routes'); // Import central routes file

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-with, Content-Type, Accept, Z-Key'
  );
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  next();
});

// Use Swagger-UI-express for your app documentation endpoint
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

const mongoURI = process.env.MONGO_URI;

if (!mongoURI) {
  console.error("Error: MONGO_URI environment variable is not defined.");
  process.exit(1);
}

// MongoDB connection
mongoose.connect(mongoURI)
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

// Routes
app.use('/api', routes); // Use the central routes file

// GitHub OAuth routes
app.get('/auth/github',
  passport.authenticate('github'));

app.get('/github/callback',
  passport.authenticate('github', { failureRedirect: '/' }),
  (req, res) => {
    // Successful authentication
    res.redirect('/dashboard');
  });

// Example protected route
app.get('/dashboard', (req, res) => {
  if (req.isAuthenticated()) {
    // Access user information from req.user
    const username = req.user.username;

    res.send(`Welcome to the dashboard, ${username}!`);
  } else {
    res.redirect('/');
  }
});

// Logout route
app.get('/logout', (req, res) => {
  req.logout();
  res.redirect('/');
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
