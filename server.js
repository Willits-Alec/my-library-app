const express = require('express');
const mongoose = require('mongoose');
const swaggerUi = require('swagger-ui-express');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const passport = require('passport');
const GitHubStrategy = require('passport-github2').Strategy;
const session = require('express-session');
const swaggerDocument = require('./swagger-output.json'); // Use generated Swagger document

// Load environment variables from .env file
dotenv.config();

const bookRoutes = require('./routes/books');
const movieRoutes = require('./routes/movies');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// MongoDB connection
mongoose.connect(process.env.MONGO_URI)
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

// Serialize 
passport.serializeUser((user, done) => {
  done(null, user);
});

// Deserialize 
passport.deserializeUser((obj, done) => {
  done(null, obj);
});

// Swagger setup
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Routes
app.use('/api/books', bookRoutes);
app.use('/api/movies', movieRoutes);

// Home route
app.get('/', (req, res) => {
  res.send(`
    <h1>Welcome to My Library App</h1>
    <p><a href="https://my-library-app-hrg3.onrender.com/auth/github">Log in with GitHub</a></p>
  `);
});

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
    
    res.send(`
      <h1>Welcome to the dashboard, ${username}!</h1>
      <p><a href="https://my-library-app-hrg3.onrender.com/logout">Logout of GitHub</a></p>
      `);
  } else {
    res.redirect('/');
  }
});

// Logout route
app.get('/logout', (req, res, next) => {
  req.logout((err) => {
    if (err) { return next(err); }
    res.redirect('/');
  });
});


// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
