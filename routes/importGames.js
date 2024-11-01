const express = require("express");
const router = express.Router();
const axios = require("axios");
const fs = require("fs");
const path = require("path");

const { encrypt, decrypt } = require("../utils/encryption");
const { initializeTodoistAPI } = require("./oauth.js");
const { TodoistApi } = require("@doist/todoist-api-typescript");

const teamColors = {
	Hawks: "red",
	Celtics: "green",
	Nets: "grey",
	Hornets: "mint_green",
	Bulls: "red",
	Cavaliers: "berry_red",
	Mavericks: "blue",
	Nuggets: "light_blue",
	Pistons: "blue",
	Warriors: "yellow",
	Rockets: "red",
	Pacers: "yellow",
	Clippers: "red",
	Lakers: "violet",
	Grizzlies: "light_blue",
	Heat: "berry_red",
	Bucks: "taupe",
	Timberwolves: "lime_green",
	Pelicans: "taupe",
	Knicks: "orange",
	Thunder: "blue",
	Magic: "blue",
	Sixers: "red",
	Suns: "orange",
	Trailblazers: "red",
	Kings: "grape",
	Spurs: "grey",
	Raptors: "red",
	Jazz: "grape",
	Wizards: "red",
};

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

async function getProjectID(api, project, name) {
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
			const color = teamColors[name];
			if (!color) {
				throw new Error(`No color defined for team: ${name}`);
			}

			// Create a new Todoist project
			const newProjectResponse = await api.addProject(name, color);
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
	console.log("REQ.SESSION from import-games:", req.session);

	const api = await initializeTodoistAPI(req);

	try {
		const teamData = await getTeamData(team); // Await the promise
		const { name, schedule } = teamData; // Destructure after awaiting
		const projectID = await getProjectID(api, project, name);

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
