const express = require("express");
const path = require("path");
const router = express.Router();
const staticPathRoot = path.join(__dirname, "../public");

// Serve the landing page (login page)
router.get("/", (req, res) => {
	res.sendFile(path.join(staticPathRoot, "views", "landing.html"));
});

// Serve the team selection page
router.get("/select-team", (req, res) => {
	const accessToken = req.query.access_token;
	res.sendFile(path.join(staticPathRoot, "views", "select-team.html"));
});

// Serve the confirmation page
router.get("/confirmation", (req, res) => {
	res.sendFile(path.join(staticPathRoot, "views", "confirmation.html"));
});

router.get("*", (req, res) => {
	res.sendFile(path.join(staticPathRoot, "index.html"));
});

module.exports = router;
