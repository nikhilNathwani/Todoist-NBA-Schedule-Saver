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
			<div id="projectPicker">
				<div class="radio-button">
					<input type="radio" name="projectOption" value="inbox" id="inbox" ${
						isInboxDefault ? "checked" : ""
					}>
					<label for="inbox">
						<strong>Inbox</strong><br>
						<small>Use the default Inbox for your tasks</small>
					</label>
				</div>
				
				<div class="radio-button">
					<input type="radio" name="projectOption" value="newProject" id="newProject" ${
						isInboxDefault ? "disabled" : "checked"
					}>
					<label for="newProject">
						<strong>Create New Project</strong><br>
						<small>Start a fresh project for your NBA schedule tasks</small>
					</label>
				</div>
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
				<form action="/api/add-task" method="POST">
					<h3>Choose an NBA team to follow:</h3>
					<select id="team-selector">
						${teamOptions}
					</select>
					<h3>Choose where to track games:</h3>
					${projectPickerHTML}
					<button type="submit">Submit</button>
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
