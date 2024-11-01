const express = require("express");
const fs = require("fs").promises;
const path = require("path");
const router = express.Router();
const staticPathRoot = path.join(__dirname, "../public");

// Serve the landing page (login page)
router.get("/", (req, res) => {
	res.sendFile(path.join(staticPathRoot, "landing.html"));
});

// Serve the team selection page
router.get("/configure-import", async (req, res) => {
	try {
		console.log(
			"In configure-import",
			"REQ.SESSION",
			req.session,
			"REQ.QUERY:",
			req.query,
			"REQ.BODY:",
			req.body
		);
		// Retrieve isInboxDefault from the URL parameters
		const isInboxDefault = req.query.isInboxDefault !== "false";
		console.log(
			"PAGES.JS got",
			req.query.isInboxDefault,
			"and interpreted it as",
			req.query.isInboxDefault !== "false",
			"for isInboxDefault"
		);

		// Read the NBA schedule JSON file
		const data = await fs.readFile(
			path.join(__dirname, "../data/nba_schedule.json")
		);
		const teams = JSON.parse(data);

		// Prepare options for the team picker
		const teamOptions = Object.entries(teams)
			.sort((a, b) => (a[1].city > b[1].city ? 1 : -1))
			.map(([teamID, team]) => {
				return `<option value="${teamID}">${team.city} ${team.name}</option>`;
			})
			.join("");

		// Prepare project picker based on isInboxDefault
		const projectPickerHTML = `
			<label id="newProject" class="radio-button ${isInboxDefault ? "disabled" : ""}">
				<input type="radio" name="project" value="newProject" ${
					isInboxDefault ? "disabled" : "checked"
				}>
				<span>
					<strong>Create New Project</strong><br>
					<small>${
						isInboxDefault
							? "Project limit reached. Can't create more Todoist projects."
							: "Import games into a new Todoist project"
					}</small>
				</span>
			</label>
			<label id="inbox" class="radio-button">
				<input type="radio" name="project" value="inbox" ${
					isInboxDefault ? "checked" : ""
				}>
				<span>
					<strong>Inbox</strong><br>
					<small>Import games into your Todoist "Inbox"</small>
				</span>
			</label>
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
				<div id="appFrame">
					<div id="image-container">
						<div id="nba-logo-container">	
							<img src="images/nba-logo.png" alt="Todoist Brand Logo" />
						</div>
						<div id="arrow">→</div>
						<img src="images/todoist-color-logo.png" alt="Todoist Brand Logo" />
					</div>
					<form action="/api/import-games" method="POST">
						<fieldset>
							<legend><span class="step">1</span> Select your NBA team</legend>
							<select id="team-selector" name="team" aria-label="NBA Team">
								<option value="" disabled selected>Choose a team</option> <!-- Ghost text -->
								${teamOptions}
							</select>
						</fieldset>
						<fieldset>
							<legend><span class="step">2</span> Select Todoist project</legend>
							${projectPickerHTML}
						</fieldset>
						<button id="submitButton" class="button" type="submit" disabled>Import schedule</button>
					</form>
				</div>
				<script src="/scripts/handleInput.js"></script>
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
