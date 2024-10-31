const express = require("express");
const cookieSession = require("cookie-session");
const path = require("path");
const pagesRoutes = require("./routes/pages");
const todoistRoutes = require("./routes/todoist");

// Configurations
const staticPathRoot = path.join(__dirname, "public");
const app = express();

// Cookie session configuration
console.log("SECURE flag set to:", process.env.NODE_ENV === "production");
app.use(
	cookieSession({
		name: "session",
		secret: process.env.COOKIE_SECRET,
		maxAge: 24 * 60 * 60 * 1000, // 24 hours
		httpOnly: true, // Prevents client-side JS from accessing the cookie
		secure: process.env.NODE_ENV === "production", // Use secure cookies in production
		sameSite: "Strict", // Mitigates CSRF attacks
	})
);

// Serve static files
app.use(express.static(staticPathRoot));

// Middleware to parse request bodies (for POST requests)
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Use the todoist and pages routes
app.use("/api", todoistRoutes);
app.use("/", pagesRoutes);

module.exports = app;
