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
	const selectedTeam = teamSelect.value;

	const teamLogoImg = teamLogo.querySelector("img");
	teamLogoImg.src = "images/team-logos/" + selectedTeam + ".svg";
	teamLogoImg.alt = `${selectedTeam} Logo`;

	newProjectSubtitle.textContent = `Import games into a new Todoist project "# ${teamNames[selectedTeam]} schedule"`;
});
