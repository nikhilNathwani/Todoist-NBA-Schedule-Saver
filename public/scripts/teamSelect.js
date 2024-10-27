const teamSelect = document.getElementById("team-selector");
const teamLogo = document.getElementById("nba-logo-container");
const teamNames = {
	ATL: "Hawks",
	BOS: "Celtics",
	BKN: "Nets",
	CHA: "Hornets",
	CHI: "Bulls",
	CLE: "Cavaliers",
	DAL: "Mavericks",
	DEN: "Nuggets",
	DET: "Pistons",
	GS: "Warrios",
	HOU: "Rockets",
	IND: "Pacers",
	LAC: "Clippers",
	LAL: "Lakers",
	MEM: "Grizzlies",
	MIA: "Heat",
	MIL: "Bucks",
	MIN: "Timberwolves",
	NO: "Pelicans",
	NY: "Knicks",
	OKC: "Thunder",
	ORL: "Magic",
	PHI: "Sixers",
	PHO: "Suns",
	POR: "Trailblazers",
	SAC: "Kings",
	SA: "Spurs",
	TOR: "Raptors",
	UTA: "Jazz",
	WAS: "Wizards",
};
const newProjectSubtitle = document
	.getElementById("newProject")
	.querySelector("small");

// Example team logos
// const teamLogos = {
// 	lakers: "lakers-logo.png",
// 	celtics: "celtics-logo.png",
// 	// Add more teams and their logo URLs here
// };

// Read the NBA schedule JSON file
// const data = await fs.readFile(
// 	path.join(__dirname, "../public/data/nba_schedule.json")
// );
// const teams = JSON.parse(data);

// Get the full URL of the current page
const urlParams = new URLSearchParams(window.location.search);

// Retrieve the value of 'isInboxDefault' parameter
const isInboxDefault = urlParams.get("isInboxDefault");

teamSelect.addEventListener("change", function () {
	// if (teamLogo.id == "nba-logo-container") {
	// 	teamLogo.id = "team-logo-container";
	// }
	const selectedTeam = teamSelect.value;
	newProjectSubtitle.textContent = `Import games into a project called "# ${
		teamNames[teamSelect.value]
	} schedule"`;

	const teamLogoImg = teamLogo.querySelector("img");
	teamLogoImg.classList.add("fade");

	// Wait for the fade to finish, then update the logo and fade back in
	// setTimeout(() => {
	// 	teamLogoImg.src = "images/team-logos/" + selectedTeam + ".svg";
	// 	teamLogoImg.alt = `${selectedTeam} Logo`;
	// 	teamLogoImg.classList.remove("fade"); // Remove fade-out to trigger fade-in
	// }, 1000);

	// Wait for the fade-out transition to end before changing the image
	teamLogoImg.addEventListener("transitionend", function handleTransition() {
		// Change the logo source
		teamLogoImg.src = "images/team-logos/" + selectedTeam + ".svg";
		teamLogoImg.alt = `${selectedTeam} Logo`;

		// Remove fade class to fade in
		teamLogoImg.classList.remove("fade");

		// Remove the event listener to prevent it from firing multiple times
		teamLogoImg.removeEventListener("transitionend", handleTransition);
	});
});
