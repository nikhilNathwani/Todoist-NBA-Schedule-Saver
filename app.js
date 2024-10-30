const express = require("express");
const session = require("express-session");
const path = require("path");
const pagesRoutes = require("./routes/pages");
const todoistRoutes = require("./routes/todoist");
const { SESSION_SECRET } = process.env;

// Configurations
const staticPathRoot = path.join(__dirname, "public");
const app = express();

// Serve static files
app.use(express.static(staticPathRoot));

// Middleware to parse request bodies (for POST requests)
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configure session middleware
app.use(
	session({
		secret: SESSION_SECRET,
		resave: false,
		saveUninitialized: false,
		cookie: {
			httpOnly: true,
			secure: process.env.NODE_ENV === "production", // Enable in production
		},
	})
);

// Use the todoist and pages routes
app.use("/api", todoistRoutes);
app.use("/", pagesRoutes);

module.exports = app;
