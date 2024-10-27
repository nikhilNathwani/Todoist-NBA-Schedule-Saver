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

const urlParams = new URLSearchParams(window.location.search);
const isInboxDefault = urlParams.get("isInboxDefault") !== "false";

teamSelect.addEventListener("change", function () {
	const selectedTeam = teamSelect.value;

	const teamLogoImg = teamLogo.querySelector("img");
	teamLogoImg.src = "images/team-logos/" + selectedTeam + ".svg";
	teamLogoImg.alt = `${selectedTeam} Logo`;

	if (!isInboxDefault) {
		newProjectSubtitle.textContent = `Import games into a new Todoist project called "# ${teamNames[selectedTeam]} schedule"`;
	}
});
