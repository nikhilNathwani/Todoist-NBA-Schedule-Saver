const express = require("express");
const axios = require("axios");
const router = express.Router();
const todoist = require('../public/scripts/todoist');


// Handle team selection
router.get('/add-tasks', async (req, res) => {
	
    // const selectedTeam = req.query.team; // Get the selected team from the request
    // const projectID = await todoist.createTodoistProject(selectedTeam); // Create project
    // const games = getGamesForTeam(selectedTeam); // Your logic to get the games for the selected team

    // await todoist.uploadScheduleToTodoist(games, projectID); // Add tasks to Todoist

    res.redirect('/confirmation'); // Redirect or send response
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
