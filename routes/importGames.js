const express = require("express");
const router = express.Router();
const axios = require("axios");
const fs = require("fs");
const path = require("path");

const { encrypt, decrypt } = require("../utils/encryption");
const { initializeTodoistAPI } = require("/oauth.js");
const { TodoistApi } = require("@doist/todoist-api-typescript");

async function getTeamData(team) {
	try {
		const filePath = path.join(__dirname, "../data/nba_schedule.json");
		const data = JSON.parse(await fs.promises.readFile(filePath, "utf8"));

		const teamSchedule = data[team];
		if (!teamSchedule) {
			throw new Error(`Schedule not found for team: ${team}`);
		}
		return teamSchedule;
	} catch (error) {
		console.error("Error reading or parsing nba_schedule.json:", error);
		throw error; // Re-throw to handle it further up if needed
	}
}

// Usage example
// Assuming `team` is available in your route handler:
const team = "Lakers"; // Replace with dynamic team input as needed
getScheduleForTeam(team)
	.then((schedule) => console.log("Team Schedule:", schedule))
	.catch((error) => console.error("Failed to retrieve schedule:", error));

// Handle team selection
router.post("/import-games", async (req, res) => {
	// Extract the team and project from the request body
	const { team, project } = req.body;
	// Print the values to the console for testing
	console.log("Selected Team:", team);
	console.log("Selected Project:", project);

	const api = initializeTodoistAPI(req);

	const { name, schedule } = getTeamData(team);

	// Fetch team's upcoming games from json

	// Respond to the client (you can customize this)
	res.json({
		success: true,
		message: "Tasks received",
		team,
		name,
		project,
		schedule,
	});
});

module.exports = router;
