const express = require("express");
const path = require("path");
const pagesRoutes = require("./routes/pages");
const oauthRoutes = require("./routes/oauth");
const addTaskRoutes = require("./routes/addTask");

// Configurations
const staticPathRoot = path.join(__dirname, "public");
const app = express();

// Serve static files
app.use(express.static(staticPathRoot));

// Middleware to parse request bodies (for POST requests)
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Use the oauth and pages routes
app.use("/auth", oauthRoutes);
app.use("/api", addTaskRoutes);
app.use("/", pagesRoutes);

module.exports = app;
