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
	event.preventDefault(); // Prevent the form from submitting in the traditional way

	const selectedTeam = teamSelect.value; // Get selected team option
	const selectedProject = projectSelect.value; // Get selected project option

	// You can still log the selected values for testing
	console.log("Selected Team:", selectedTeam);
	console.log("Selected Project:", selectedProject);

	startImport(selectedTeam, selectedProject);
});

function startImport(team, project) {
	fetch("/api/import-games", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify({ team, project }), // Send team and project values in the request body
	})
		.then((response) => response.json())
		.then((data) => {
			document.getElementById("status-message").textContent =
				"Status: Import started";
			pollStatus(); // Start polling the status
		})
		.catch((error) => console.error("Error starting import:", error));
}

// Function to check import status every 5 seconds
function pollStatus() {
	const intervalId = setInterval(() => {
		fetch("/import-status")
			.then((response) => response.json())
			.then((data) => {
				if (data.inProgress) {
					document.getElementById("status-message").textContent =
						"Status: Import in progress...";
				} else {
					document.getElementById("status-message").textContent =
						"Status: Import complete!";
					clearInterval(intervalId); // Stop polling once import is complete
				}
			})
			.catch((error) => {
				console.error("Error checking status:", error);
				clearInterval(intervalId); // Stop polling on error
			});
	}, 5000); // Poll every 5 seconds
}

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
