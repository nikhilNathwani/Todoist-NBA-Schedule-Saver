const express = require("express");
const fs = require('fs').promises;
const path = require("path");
const router = express.Router();
const staticPathRoot = path.join(__dirname, "../public");

// Serve the landing page (login page)
router.get("/", (req, res) => {
	res.sendFile(path.join(staticPathRoot, "landing.html"));
});

// Serve the team selection page
router.get("/select-team", async (req, res) => {
	try {
		// Read the NBA schedule JSON file
		const data = await fs.readFile(path.join(__dirname, '../public/data/nba_schedule.json'));
		const teams = JSON.parse(data);

		// Prepare options for the team picker
		const teamOptions = Object.entries(teams).map(([teamID, team]) => {
			return `<option value="${teamID}">${team.city} ${team.name}</option>`;
		}).join('');
		
		// Prepare project picker based on session variables
		const isPremium = req.session.isPremium || false;
		const projectCount = req.session.projectCount || 0;
		const canCreateProjects = req.session.canCreateProjects || false;

		const projectPickerHTML = `
			<div>
				<h2>Project Picker</h2>
				<label>
					<input type="radio" name="project-option" value="newProject" ${canCreateProjects ? '' : 'disabled'}>
					${canCreateProjects ? 'Create New Project' : 'Upgrade to create new projects'}
				</label>
				<label>
					<input type="radio" name="project-option" value="inbox">
					Use Existing Project
				</label>
			</div>
		`;

		// Construct the complete HTML
		const html = `
			<!DOCTYPE html>
			<html lang="en">
			<head>
				<meta charset="UTF-8">
				<title>Select Team</title>
			</head>
			<body>
				<h1>Select Your NBA Team</h1>
				<select id="team-selector">
					${teamOptions}
				</select>
				${projectPickerHTML}
			</body>
			</html>
		`;

		res.send(html); // Send the dynamically constructed HTML
	} catch (error) {
		console.error('Error reading NBA schedule:', error);
		res.status(500).send('An error occurred');
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
