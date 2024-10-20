const express = require("express");
const axios = require("axios");
const app = express();

const client_id = process.env.CLIENT_ID;
const client_secret = process.env.CLIENT_SECRET;
const redirect_uri =
	process.env.REDIRECT_URI ||
	"https://nba-todoist-import.vercel.app/api/callback";
const state_secret = process.env.STATE_SECRET;

app.get("/", (req, res) => {
	res.sendFile(__dirname + "/public/index.html");
});

// Step 1: Redirect to Todoist for OAuth authorization
app.get("/api/login", (req, res) => {
	const auth_url = `https://todoist.com/oauth/authorize?client_id=${client_id}&scope=data:read,data:delete&state=${state_secret}&redirect_uri=${redirect_uri}`;
	res.redirect(auth_url);
});

// Step 2: Handle the redirection from Todoist
app.get("/api/callback", async (req, res) => {
	console.log("Callback received with:", req.query); // Log query parameters

	const { code, state } = req.query;

	// Check if the state matches to prevent CSRF attacks
	if (state !== state_secret) {
		return res.status(403).send("State mismatch! Potential CSRF attack.");
	}

	try {
		// Step 3: Exchange the authorization code for an access token
		const response = await axios.post(
			"https://todoist.com/oauth/access_token",
			{
				client_id: client_id,
				client_secret: client_secret,
				code: code,
				redirect_uri: redirect_uri,
			}
		);

		const access_token = response.data.access_token;

		// You can now use the access_token to interact with the Todoist API
		res.send(
			`<h1>Login Successful!</h1><p>Access Token: ${access_token}</p><a href="/api/select-team">Pick your favorite NBA team</a>`
		);
	} catch (error) {
		// Handle potential errors from Todoist's token exchange
		if (
			error.response &&
			error.response.data.error === "bad_authorization_code"
		) {
			res.status(400).send("Bad authorization code.");
		} else if (
			error.response &&
			error.response.data.error === "incorrect_application_credentials"
		) {
			res.status(400).send("Incorrect client credentials.");
		} else {
			res.status(500).send("Internal server error during OAuth flow.");
		}
	}
});

// After login, allow the user to select their favorite team
app.get("/api/select-team", (req, res) => {
	res.send(`<h1>Select your favorite NBA team</h1>
            <form action="/api/save-team" method="POST">
              <select name="team">
                <option value="celtics">Celtics</option>
                <option value="lakers">Lakers</option>
                <!-- Add more teams -->
              </select>
              <button type="submit">Save</button>
            </form>`);
});

module.exports = app;
