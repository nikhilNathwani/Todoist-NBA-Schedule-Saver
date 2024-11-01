const express = require("express");
const router = express.Router();
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

	// Store encrypted access token in session cookie for later api usage
	await saveAccessToken(req, res, code);
	printReqSession(req);

	// Redirect to the team selection page
	const accessToken = getAccessToken(req);
	const redirectUrlParam = await userReachedProjectLimit(accessToken);
	res.redirect(`/configure-import?isInboxDefault=${redirectUrlParam}`);
});

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
async function initializeTodoistAPI(req) {
	// Check if accessToken exists in the session
	if (!req.session.accessTokenEncrypted) {
		throw new Error("Access token is not set in the session.");
	}
	// Initialize Todoist API with the access token
	const api = new TodoistApi(req.session.accessToken);
	return api;
}

//Saves encrypted accessToken to cookie-session
async function saveAccessToken(req, res, code) {
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
	} catch (error) {
		console.error(
			"OAuth error:",
			error.response ? error.response.data : error
		);
		handleOAuthError(error, res);
	}
}

//Decrypts accessToken from cookie-session
function getAccessToken(req) {
	const encryptedToken = req.session.accessTokenEncrypted;
	if (!encryptedToken) {
		throw new Error("Access token is not set in the session.");
	}
	return decrypt(encryptedToken);
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

function printReqSession(req) {
	console.log(
		"ACCESS TOKEN:",
		req.session.accessTokenEncrypted,
		"REQ.SESSION:",
		req.session
	);
}

module.exports = { router, initializeTodoistAPI, printReqSession };
