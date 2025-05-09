const express = require("express");
const router = express.Router();
const { getTeams } = require("../utils/parseSchedule");

router.get("/", async (req, res) => {
	try {
		const teamNames = await getTeams();
		res.json(teamNames);
	} catch (err) {
		console.error("Error retrieving team names:", err);
		res.status(500).json({ error: "Failed to retrieve team names." });
	}
});

module.exports = router;
