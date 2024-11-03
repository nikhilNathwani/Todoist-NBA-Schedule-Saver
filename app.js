const express = require("express");
const cookieSession = require("cookie-session");
const path = require("path");
const pagesRoutes = require("./routes/pages");
const { router: importGamesRoutes } = require("./routes/importGames");
const oauthRoutes = require("./routes/oauth");

// Configurations
const staticPathRoot = path.join(__dirname, "public");
const app = express();

// Cookie session configuration
app.use(
	cookieSession({
		name: "session",
		secret: process.env.COOKIE_SECRET,
		maxAge: 24 * 60 * 60 * 1000, // 24 hours
		httpOnly: true, // Prevents client-side JS from accessing the cookie
		// secure: true, // Only HTTPS not HTTP
		secure: false,
		// sameSite: "Strict", // Mitigates CSRF attacks
		sameSite: "Lax",
	})
);

// Serve static files
app.use(express.static(staticPathRoot));

// Middleware to parse request bodies (for POST requests)
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Use the todoist and pages routes
app.use("/api/auth", oauthRoutes);
app.use("/api", importGamesRoutes);
app.use("/", pagesRoutes);

module.exports = app;
