const express = require("express");
const router = express.Router();

const fs = require("fs").promises;
const path = require("path");

const axios = require("axios");
const { encrypt, decrypt } = require("../utils/encryption");
const { TodoistApi } = require("@doist/todoist-api-typescript");

const FREE_PROJECT_LIMIT = 5;
const PREMIUM_PROJECT_LIMIT = 300;
const { CLIENT_ID, CLIENT_SECRET, REDIRECT_URI, STATE_SECRET } = process.env;

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ //
//                                           //
//           ROUTES                          //
//                                           //
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ //

// Serve the team selection page
router.get("/configure-import", async (req, res) => {
	try {
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
			path.join(__dirname, "../public/data/nba_schedule.json")
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

// Redirect to Todoist for OAuth authorization
router.get("/login", (req, res) => {
	const authUrl = `https://todoist.com/oauth/authorize?client_id=${CLIENT_ID}&scope=data:read,data:delete&state=${STATE_SECRET}&redirect_uri=${REDIRECT_URI}`;
	res.redirect(authUrl);
});

// Handle the OAuth callback from Todoist
router.get("/callback", async (req, res) => {
	const { code, state } = req.query;

	// Verify the state parameter to prevent CSRF attacks
	if (state !== STATE_SECRET) {
		return res.status(403).send("State mismatch! Potential CSRF attack.");
	}

	// Initialize the API with the user's token
	await saveSessionState(req, res, code);

	// Redirect to the team selection page
	const accessToken = getAccessToken(req);
	const redirectUrlParam = await isInboxDefault(accessToken);
	res.redirect(`/api/configure-import?isInboxDefault=${redirectUrlParam}`);
});

//Saves to cookie-session the encrypted accessToken
async function saveSessionState(req, res, code) {
	try {
		const response = await axios.post(
			"https://todoist.com/oauth/access_token",
			{
				client_id: CLIENT_ID,
				client_secret: CLIENT_SECRET,
				code: code,
				redirect_uri: REDIRECT_URI,
			}
		);
		const { access_token } = response.data;
		const encryptedToken = encrypt(access_token);
		req.session.accessTokenEncrypted = encryptedToken;
		req.session.save();
		console.log(
			"Received Access Token:",
			access_token,
			"Encrypted as:",
			encryptedToken,
			"Stored as:",
			req.session.accessTokenEncrypted
		);
		console.log("REQ is:", req);
		console.log("REQ.SESSION is", req.session);
		// Decrypting when retrieving sensitive data
		// const decryptedToken = decrypt(encryptedToken);
	} catch (error) {
		console.error(
			"OAuth error:",
			error.response ? error.response.data : error
		);
		handleOAuthError(error, res);
	}
}

function getAccessToken(req) {
	const encryptedToken = req.session.accessTokenEncrypted;
	if (!encryptedToken) {
		throw new Error("Access token is not set in the session.");
	}
	return decrypt(encryptedToken);
}

// Handle team selection
router.post("/import-games", async (req, res) => {
	// Extract the team and project from the request body
	console.log("REQ is:", req);
	console.log("REQ.BODY is:", req.body);
	console.log("REQ.SESSION is", req.session);
	const { team, project } = req.body;
	const accessToken = getAccessToken(req);
	// Print the values to the console for testing
	console.log("Selected Team:", team);
	console.log("Selected Project:", project);
	console.log("Access Token:", accessToken); // Logging the access token for debugging

	// Respond to the client (you can customize this)
	res.json({ success: true, message: "Tasks received", team, project });
});

module.exports = router;

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ //
//                                           //
//        TODOIST CRUD FUNCTIONS             //
//                                           //
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ //

// Function to add a task to Todoist
async function addTodoistTask(game, projectID) {
	const taskContent = `Celtics ${game.opponent}`;
	const taskDueDatetime = formatDate(game.date, game.time);

	try {
		await api.addTask({
			content: taskContent,
			due: { date: taskDueDatetime },
			project_id: projectID,
		});
	} catch (error) {
		console.error("Error adding task to Todoist:", error);
	}
}

// Function to upload the schedule to Todoist
async function uploadScheduleToTodoist(games, projectID) {
	for (const game of games) {
		await addTodoistTask(game, projectID);
	}
}

// Function to create a Todoist project and return the project ID
async function createTodoistProject(teamCity) {
	try {
		const project = await api.addProject({
			name: `${teamNames[teamCity]} new`,
			color: teamColors[teamCity],
		});
		return project.id;
	} catch (error) {
		console.error("Error creating Todoist project:", error);
	}
}

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ //
//                                           //
//            OAUTH FUNCTIONS                //
//                                           //
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ //

// Initialize API with the user's token
// async function initializeAPI(accessToken) {
// 	api = new TodoistApi(accessToken); //Todosit REST API
// 	await isInboxDefault(accessToken);
// }

async function isInboxDefault(accessToken) {
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

		console.log(
			"TODOIST.JS returning",
			isPremium
				? projectCount >= PREMIUM_PROJECT_LIMIT
				: projectCount >= FREE_PROJECT_LIMIT,
			"for isInboxDefault"
		);
		return isPremium
			? projectCount >= PREMIUM_PROJECT_LIMIT
			: projectCount >= FREE_PROJECT_LIMIT;
	} catch (error) {
		console.error("Error fetching user data:", error);
		throw new Error("Failed to fetch user metadata");
	}
}

// Handle OAuth token exchange errors
const handleOAuthError = (error, res) => {
	if (error.response) {
		const { error: errorMessage } = error.response.data;
		if (errorMessage === "bad_authorization_code") {
			return res.status(400).send("Bad authorization code.");
		} else if (errorMessage === "incorrect_application_credentials") {
			return res.status(400).send("Incorrect client credentials.");
		}
	}
	return res.status(500).send("Internal server error during OAuth flow.");
};
