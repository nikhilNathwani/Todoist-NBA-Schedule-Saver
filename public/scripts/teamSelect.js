const teamSelect = document.getElementById("team-selector");
const teamLogo = document.getElementById("nba-logo-container");
const teamColors = {
	ATL: "#db4035",
	BOS: "#299438",
	BKN: "#b8b8b8",
	CHA: "#6accbc",
	CHI: "#db4035",
	CLE: "#b8256f",
	DAL: "#4073ff",
	DEN: "#96c3eb",
	DET: "#4073ff",
	GS: "#fad000",
	HOU: "#db4035",
	IND: "#fad000",
	LAC: "#db4035",
	LAL: "#af38eb",
	MEM: "#96c3eb",
	MIA: "#b8256f",
	MIL: "#ccac93",
	MIN: "#7ecc49",
	NO: "#ccac93",
	NY: "#ff9933",
	OKC: "#4073ff",
	ORL: "#4073ff",
	PHI: "#db4035",
	PHO: "#ff9933",
	POR: "#db4035",
	SAC: "#884dff",
	SA: "#b8b8b8",
	TOR: "#db4035",
	UTA: "#884dff",
	WAS: "#db4035",
};
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
	newProjectName.innerHTML =
		"called \"<span id='newProjectIcon'>#</span>" +
		teamNames[teamSelect.value] +
		' schedule"';
	const newProjectIcon = document.getElementById("newProjectIcon");
	newProjectIcon.style.color = teamColors[teamSelect.value];

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
