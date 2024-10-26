const teamSelect = document.getElementById("team-selector");
const teamLogo = document.getElementById("nba-logo-container");

// Example team logos
// const teamLogos = {
// 	lakers: "lakers-logo.png",
// 	celtics: "celtics-logo.png",
// 	// Add more teams and their logo URLs here
// };

const teamLogos = {
	ATL: "images/ATL.png",
};

teamSelect.addEventListener("change", function () {
	if (teamLogo.id == "nba-logo-container") {
		teamLogo.id = "team-logo-container";
	}
	const selectedTeam = "ATL";
	// const selectedTeam = teamSelect.value;
	const teamLogoImg = teamLogo.querySelector("img");
	teamLogoImg.src = teamLogos[selectedTeam]; // Update logo
	teamLogoImg.alt = `${selectedTeam} Logo`; // Update alt text for accessibility
});
