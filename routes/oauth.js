const express = require("express");
const router = express.Router();
const axios = require("axios");
const { encrypt, decrypt } = require("../utils/encryption");
const { userReachedProjectLimit } = require("./importGames");
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
	const authUrl = `https://todoist.com/oauth/authorize?client_id=${CLIENT_ID}&scope=data:read_write&state=${STATE_SECRET}&redirect_uri=${REDIRECT_URI}`;
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

	// Redirect to the team selection page
	const accessToken = getAccessToken(req);
	const redirectUrlParam = await userReachedProjectLimit(accessToken);
	res.redirect(`/configure-import?isInboxDefault=${redirectUrlParam}`);
});

module.exports = { router, initializeTodoistAPI, printReqSession };

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ //
//                                           //
//            OAUTH FUNCTIONS                //
//                                           //
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ //

// Initialize API with the user's token
async function initializeTodoistAPI(req) {
	// Initialize Todoist API with the access token
	const accessToken = getAccessToken(req);
	return new TodoistApi(accessToken);
}

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ //
//                                           //
//         COOKIE-SESSION I/O                //
//                                           //
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ //

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

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ //
//                                           //
//          HELPER FUNCTIONS                 //
//                                           //
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ //

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
