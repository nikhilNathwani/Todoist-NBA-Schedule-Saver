const form = document.querySelector("form");
const teamSelect = form.elements["team"];
const projectSelect = form.elements["project"];

teamSelect.addEventListener("change", function () {
	enableSubmitButton();
	const selectedTeam = teamSelect.value;
	updateTeamLogo(selectedTeam);
	updateNewProjectSubtitle(selectedTeam);
});

form.addEventListener("submit", function (event) {
	// No preventDefault() call here
	const selectedTeam = teamSelect.value; // Get selected team option
	const selectedProject = projectSelect.value; // Get selected project option

	// You can still log the selected values for testing
	console.log("Selected Team:", selectedTeam);
	console.log("Selected Project:", selectedProject);

	// The form will be submitted to the action URL specified in the HTML
});

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ //
//                                           //
//           HELPER FUNCTIONS                //
//                                           //
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ //
const submitButton = document.getElementById("submitButton");
const teamLogo = document
	.getElementById("nba-logo-container")
	.querySelector("img");
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
	GS: "Warriors",
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

function enableSubmitButton() {
	submitButton.disabled = false;
}

function updateTeamLogo(selectedTeam) {
	teamLogo.src = "images/team-logos/" + selectedTeam + ".svg";
	teamLogo.alt = `${selectedTeam} Logo`;
}

function updateNewProjectSubtitle(selectedTeam) {
	if (!isInboxDefault()) {
		newProjectSubtitle.textContent = `Import games into a new Todoist project called "${teamNames[selectedTeam]} schedule"`;
	}
}
function isInboxDefault() {
	const urlParams = new URLSearchParams(window.location.search);
	return urlParams.get("isInboxDefault") !== "false";
}
