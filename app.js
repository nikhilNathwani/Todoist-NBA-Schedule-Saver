const express = require("express");
const path = require("path");
const pagesRoutes = require("./routes/pages");
const todoistRoutes = require("./routes/todoist");

// Configurations
const staticPathRoot = path.join(__dirname, "public");
const app = express();

// Serve static files
app.use(express.static(staticPathRoot));

// Middleware to parse request bodies (for POST requests)
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Use the todoist and pages routes
app.use("/api", todoistRoutes);
app.use("/", pagesRoutes);

module.exports = app;
