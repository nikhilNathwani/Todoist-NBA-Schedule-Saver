const express = require("express");
const path = require("path");
const oauthRoutes = require("./routes/oauth");
const pagesRoutes = require("./routes/pages");

// Configurations
const staticPathRoot = path.join(__dirname, "public");
const app = express();

// Serve static files
app.use(express.static(staticPathRoot));

// Middleware to parse request bodies (for POST requests)
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Use the oauth and pages routes
app.use("/api", oauthRoutes);
app.use("/", pagesRoutes);

module.exports = app;
