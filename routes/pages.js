const express = require("express");
const fs = require("fs").promises;
const path = require("path");
const router = express.Router();
const { isInboxDefault } = require("../public/scripts/todoist");
const staticPathRoot = path.join(__dirname, "../public");

// Serve the landing page (login page)
router.get("/", (req, res) => {
	res.sendFile(path.join(staticPathRoot, "landing.html"));
});

// Serve the team selection page
router.get("/configure-import", async (req, res) => {
	try {
		// Retrieve isInboxDefault from the URL parameters
		const isInboxDefault = req.query.isInboxDefault === "true";
		console.log(
			"PAGES.JS got",
			req.query.isInboxDefault,
			"and interpreted it as",
			req.query.isInboxDefault === "true",
			"for isInboxDefault"
		);

		// Read the NBA schedule JSON file
		const data = await fs.readFile(
			path.join(__dirname, "../public/data/nba_schedule.json")
		);
		const teams = JSON.parse(data);

		// Prepare options for the team picker
		const teamOptions = Object.entries(teams)
			.map(([teamID, team]) => {
				return `<option value="${teamID}">${team.city} ${team.name}</option>`;
			})
			.join("");

		// Prepare project picker based on isInboxDefault
		const projectPickerHTML = `
			<div>
				<h2>Project Picker</h2>
				<label>
					<input type="radio" name="project-option" value="inbox" ${
						isInboxDefault ? "checked" : ""
					}>
					Use Inbox as default project
				</label>
				<label>
					<input type="radio" name="project-option" value="newProject" ${
						isInboxDefault ? "disabled" : "checked"
					}>
					Create New Project
				</label>
			</div>
		`;

		// Construct the complete HTML
		const html = `
			<!DOCTYPE html>
			<html lang="en">
			<head>
				<meta charset="UTF-8" />
				<meta http-equiv="X-UA-Compatible" content="IE=edge" />
				<meta name="viewport" content="width=device-width, initial-scale=1.0" />
				<title>Select Team and Project Settings</title>
				<link rel="stylesheet" href="style.css" />
			</head>
			<body>
				<form action="/confirmation" method="GET">
					<h3>Choose an NBA team to follow:</h3>
					<select id="team-selector">
						${teamOptions}
					</select>
					<h3>Choose where to add tasks:</h3>
					${projectPickerHTML}
					<a href="/auth/login" class="button">Save</a>
				</form>
			</body>
			</html>
		`;

		res.send(html); // Send the dynamically constructed HTML
	} catch (error) {
		console.error("Error reading NBA schedule:", error);
		res.status(500).send("An error occurred");
	}
});

// Serve the confirmation page
router.get("/confirmation", (req, res) => {
	res.sendFile(path.join(staticPathRoot, "confirmation.html"));
});

router.get("*", (req, res) => {
	res.sendFile(path.join(staticPathRoot, "landing.html"));
});

module.exports = router;
