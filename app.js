const express = require('express');
const app = express();
const path = require('path');
const router = require('./routes/user');
require('dotenv').config();

const db = require("./config/db");
const staticRouter = require('./routes/staticRouter');
const cookieParser = require("cookie-parser");
const session = require('express-session');

db();

// Middleware to parse JSON and URL-encoded data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Apply cookie-parser middleware before routes
app.use(cookieParser());
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
  }));
// Set view engine to EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, 'public')));

// Routing middleware
app.use("/api/v1", router);
app.use("/", staticRouter);

// Start the server
const PORT = process.env.PORT || 5000
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
