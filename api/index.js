const express = require("express");
const axios = require("axios");
const app = express();

const client_id = process.env.CLIENT_ID;
const client_secret = process.env.CLIENT_SECRET;
const redirect_uri = process.env.REDIRECT_URI || "https://trigram.netlify.app";
const state_secret = process.env.STATE_SECRET;

app.get("/", (req, res) => {
	res.send(`<a href="/api/login">Log in with Todoist</a>`);
});

app.get("/api/login", (req, res) => {
	const auth_url = `https://todoist.com/oauth/authorize?client_id=${client_id}&scope=data:read_write,data:delete&state=${state_secret}`;
	res.redirect(auth_url);
});

app.get("/api/callback", async (req, res) => {
	const { code } = req.query;

	try {
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

		res.send(
			`<h1>Login Successful!</h1><p>Access Token: ${access_token}</p><a href="/api/select-team">Pick your favorite NBA team</a>`
		);
	} catch (error) {
		res.status(500).send("Error during OAuth flow");
	}
});

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
