const express = require("express");
const axios = require("axios");
const router = express.Router();
const todoist = require('../public/scripts/todoist');
const { CLIENT_ID, CLIENT_SECRET, REDIRECT_URI, STATE_SECRET } = process.env;


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

	try {
		// Exchange the authorization code for an access token
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

		// Initialize the API with the user's token
		await todoist.initializeAPI(req, token);

		// Redirect to the team selection page with the access token
		res.redirect(`/select-team?canCreateProjects=${canCreateProjects}&isPremium=${isPremium}&projectCount=${projectCount}`);
	} catch (error) {
		handleOAuthError(error, res);
	}
});

// Helper function to handle OAuth token exchange errors
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

module.exports = router;
