const express = require("express");
const router = express.Router();
const axios = require("axios");
const fs = require("fs");
const path = require("path");
const { initializeTodoistAPI, printReqSession } = require("./oauth.js");

function getUpcomingGames(schedule) {
	const upcomingGames = [];
	for (const game of schedule) {
		if (isLaterThanNow(game.dateTime)) {
			upcomingGames.push(game);
		}
	}
	return upcomingGames;
}

async function getTeamData(team) {
	try {
		const filePath = path.join(__dirname, "../data/nba_schedule.json");
		const data = JSON.parse(await fs.promises.readFile(filePath, "utf8"));

		const teamData = data[team];
		if (!teamData) {
			throw new Error(`Schedule not found for team: ${team}`);
		}

		// Filter schedule for games with dateTime later than now
		const upcomingGames = getUpcomingGames(teamData.schedule);

		// Return teamData with the filtered schedule
		return { ...teamData, schedule: upcomingGames };
	} catch (error) {
		console.error("Error reading or parsing nba_schedule.json:", error);
		throw error; // Re-throw to handle it further up if needed
	}
}

function isLaterThanNow(dateTime) {
	const gameDateTime = new Date(dateTime);
	const now = new Date();
	return gameDateTime > now;
}

async function getProjectID(api, project, name, color) {
	try {
		if (project === "inbox") {
			// Query the Todoist API for the Inbox project ID
			const response = await api.getProjects();
			const inboxProject = response.find((p) => p.name === "Inbox");
			if (inboxProject) {
				return inboxProject.id; // Return the ID of the Inbox project
			} else {
				throw new Error("Inbox project not found");
			}
		} else if (project === "newProject") {
			// Check if a color exists for the given team name
			if (!color) {
				throw new Error(`No color defined for team: ${name}`);
			}

			// Create a new Todoist project
			const newProjectResponse = await api.addProject({
				name: name,
				color: color,
			});
			return newProjectResponse.id; // Return the ID of the newly created project
		} else {
			throw new Error(
				`Invalid project type: ${project}. Expected 'inbox' or 'newProject'.`
			);
		}
	} catch (error) {
		console.error("Error in getProjectID:", error);
		throw error; // Re-throw to handle it further up if needed
	}
}

// Handle team selection
router.post("/import-games", async (req, res) => {
	// Extract the team and project from the request body
	const { team, project } = req.body;
	// Print the values to the console for testing
	console.log("Selected Team:", team);
	console.log("Selected Project:", project);
	printReqSession(req);

	const api = await initializeTodoistAPI(req);

	try {
		const teamData = await getTeamData(team); // Await the promise
		const { name, color, schedule } = teamData; // Destructure after awaiting
		console.log("NAME:", name, "COLOR:", color);
		const projectID = await getProjectID(api, project, name, color);

		// Respond to the client (you can customize this)
		res.json({
			success: true,
			message: "Tasks received",
			team,
			name,
			project,
			projectID,
			schedule,
		});
	} catch (error) {
		console.error("Error fetching team data:", error);
		res.status(500).json({ success: false, message: error.message });
	}
});

module.exports = router;
