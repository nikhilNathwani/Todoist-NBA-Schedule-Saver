const express = require("express");
const axios = require("axios");
const router = express.Router();
const fs = require("fs");
const path = require("path");
const {
	getAccessToken,
	saveAccessToken,
	printReqSession,
} = require("../utils/cookieSession");
const { TodoistApi } = require("@doist/todoist-api-typescript");
const projectLimits = {
	FREE: 5,
	PREMIUM: 300,
};

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ //
//                                           //
//           ROUTES                          //
//                                           //
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ //

//Process user's team/project selections and import schedule
router.post("/import-games", async (req, res) => {
	const { team: teamID, project } = req.body; //from form submission
	const api = await initializeTodoistAPI(req);

	try {
		const {
			name: teamName,
			color: teamColor,
			schedule,
		} = await getTeamData(teamID); // Destructure after awaiting

		const projectID = await getProjectID(api, project, teamName, teamColor);

		await importSchedule(api, schedule, projectID, teamName);

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

module.exports = { router, userReachedProjectLimit };

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ //
//                                           //
//       TODOIST CRUD FUNCTIONS              //
//                                           //
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ //

// Initialize API with the user's token
async function initializeTodoistAPI(req) {
	// Initialize Todoist API with the access token
	const accessToken = getAccessToken(req);
	return new TodoistApi(accessToken);
}

//Returns bool. Determines if user has reached project limit
async function userReachedProjectLimit(accessToken) {
	try {
		// Fetch user resources via the Sync API
		const response = await axios.post(
			"https://api.todoist.com/sync/v9/sync",
			{
				sync_token: "*",
				resource_types: ["user", "projects"],
			},
			{
				headers: {
					Authorization: `Bearer ${accessToken}`,
				},
			}
		);
		const { user, projects } = response.data;
		const isPremium = user.is_premium; // Check if the user is premium
		const projectCount = projects.length;

		return isPremium
			? projectCount >= projectLimits.PREMIUM
			: projectCount >= projectLimits.FREE;
	} catch (error) {
		console.error("Error fetching user data:", error);
		throw new Error("Failed to fetch user metadata");
	}
}

async function getProjectID(api, project, name, color) {
	try {
		if (project === "inbox") {
			// Query the Todoist API for the Inbox project ID
			const projects = await api.getProjects();
			const inboxProject = projects.find(
				(project) => project.isInboxProject
			);
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

async function importGame(api, game, projectID, teamName) {
	const taskContent = `${teamName} ${game.isHomeGame ? "vs" : "at"} ${
		game.opponent
	}`;

	try {
		await api.addTask({
			content: taskContent,
			due: { date: game.dateTime },
			project_id: projectID,
		});
	} catch (error) {
		console.error("Error adding task to Todoist:", error);
	}
}

async function importSchedule(api, schedule, projectID, teamName) {
	for (const game of schedule) {
		await importGame(api, game, projectID, teamName);
	}
}

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ //
//                                           //
//       JSON SCHEDULE PARSING               //
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
