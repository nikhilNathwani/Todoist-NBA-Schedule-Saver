const express = require("express");
const router = express.Router();
const axios = require("axios");
const fs = require("fs");
const path = require("path");
const { initializeTodoistAPI, printReqSession } = require("./oauth.js");

// Handle team selection
router.post("/import-games", async (req, res) => {
	const { teamID, project } = req.body; //from form submission
	const api = await initializeTodoistAPI(req);

	try {
		const { teamName, teamColor, schedule } = await getTeamData(teamID); // Destructure after awaiting
		const projectID = await getProjectID(api, project, teamName, teamColor);

		// Respond to the client
		res.json({
			success: true,
			message: "Tasks received",
			teamID,
			teamName,
			teamColor,
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

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ //
//                                           //
//          TODOIST API CALLS                //
//                                           //
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ //
async function getProjectID(api, project, name, color) {
	try {
		if (project === "inbox") {
			// Query the Todoist API for the Inbox project ID
			const response = await api.getProjects();
			const inboxProject = response.find((p) => p.is_inbox_project);
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

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ //
//                                           //
//        JSON SCHEDULE PARSING              //
//                                           //
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ //
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

function getUpcomingGames(schedule) {
	const upcomingGames = [];
	for (const game of schedule) {
		if (isLaterThanNow(game.dateTime)) {
			upcomingGames.push(game);
		}
	}
	return upcomingGames;
}

function isLaterThanNow(dateTime) {
	const gameDateTime = new Date(dateTime);
	const now = new Date();
	return gameDateTime > now;
}
