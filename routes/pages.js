const express = require("express");
const fs = require("fs").promises;
const path = require("path");
const router = express.Router();
const { printReqSession } = require("../utils/cookieSession.js");
const staticPathRoot = path.join(__dirname, "../public");

// Serve the landing page (login page)
router.get("/", (req, res) => {
	res.sendFile(path.join(staticPathRoot, "landing.html"));
});

// Serve the team selection page
router.get("/configure-import", async (req, res) => {
	try {
		printReqSession(req);

		// Make team picker HTML
		const teams = await getTeams();
		const teamPickerHTML = makeTeamPickerHTML(teams);

		// Make project picker HTML
		const isInboxDefault = req.query.isInboxDefault !== "false"; // Get isInboxDefault for project picker (from the URL parameters)
		const projectPickerHTML = makeProjectPickerHTML(isInboxDefault);

		// Construct the complete HTML
		const html = `
			${makeHTMLIntro("Select Team and Project Settings")}
			<div class="app-frame">
				${makeLogoBanner()}
				<form>
					${teamPickerHTML}
					${projectPickerHTML}
					<button id="submitButton" class="button" type="submit" disabled>Import schedule</button>
				</form>
				<div id="status-message"></div>
			</div>
			<script src="/scripts/handleInput.js"></script>
			${htmlOutro}`;
		printReqSession(req);
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

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ //
//                                           //
//         HTML ELEMENTS                     //
//                                           //
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ //

function makeHTMLIntro(pageTitle) {
	return `
		<!DOCTYPE html>
			<html lang="en">
			<head>
				<meta charset="UTF-8" />
				<meta http-equiv="X-UA-Compatible" content="IE=edge" />
				<meta name="viewport" content="width=device-width, initial-scale=1.0" />
				<title>${pageTitle}</title>
				<link rel="stylesheet" href="style.css" />
			</head>
			<body>
	`;
}
const htmlOutro = `				
		</body>
	</html>
`;

function makeLogoBanner(teamID = null) {
	return `
		<div class="logo-banner">
			<div class="logo-container" id="nba-logo-container">	
				<img src="images/${!teamID ? "nba-logo" : teamID}.png" 
				alt="${!teamID ? "NBA" : "Selected Team"} Logo" />
			</div>
			<div id="arrow">→</div>
			<div class="logo-container">
				<img
					src="images/todoist-color-logo.png"
					alt="Todoist Brand Logo"
				/>
			</div>
		</div>
	`;
}

// Get teams for team picker (from the NBA schedule JSON file)
async function getTeams() {
	const data = await fs.readFile(
		path.join(__dirname, "../data/nba_schedule.json")
	);
	return JSON.parse(data);
}

function makeTeamPickerHTML(teams) {
	const intro = `
		<fieldset id="teamPicker">
			<legend>
				<span class="step">1:</span> Select your NBA team
			</legend>
			<select id="team-selector" name="team" aria-label="NBA Team">
				<option value="" disabled selected>Choose a team</option> <!-- Ghost text -->`;
	const outro = `
			</select>
		</fieldset>`;

	const teamOptions = Object.entries(teams)
		.sort((a, b) => (a[1].city > b[1].city ? 1 : -1))
		.map(([teamID, team]) => {
			return `<option value="${teamID}">${team.city} ${team.name}</option>`;
		})
		.join("");

	return intro + teamOptions + outro;
}

function makeProjectPickerHTML(isInboxDefault) {
	const intro = `
		<fieldset id="projectPicker">
			<legend>
				<span class="step">2:</span> Select Todoist project
			</legend>`;
	const outro = `</fieldset>`;

	const newProjectOption = `
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
		</label>`;

	const inboxOption = `
		<label id="inbox" class="radio-button">
			<input type="radio" name="project" value="inbox" ${
				isInboxDefault ? "checked" : ""
			}>
			<span>
				<strong>Inbox</strong><br>
				<small>Import games into your Todoist "Inbox"</small>
			</span>
		</label>`;

	return intro + newProjectOption + inboxOption + outro;
}
