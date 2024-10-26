const teamSelect = document.getElementById("team-selector");
const teamLogo = document.getElementById("nba-logo-container");

// Example team logos
// const teamLogos = {
// 	lakers: "lakers-logo.png",
// 	celtics: "celtics-logo.png",
// 	// Add more teams and their logo URLs here
// };

teamSelect.addEventListener("change", function () {
	// if (teamLogo.id == "nba-logo-container") {
	// 	teamLogo.id = "team-logo-container";
	// }
	const selectedTeam = teamSelect.value;
	const teamLogoImg = teamLogo.querySelector("img");
	teamLogoImg.classList.add("fade-out");

	// Wait for the fade-out to finish, then update the logo and fade back in
	setTimeout(() => {
		teamLogoImg.src = "images/team-logos/" + selectedTeam + ".svg";
		teamLogoImg.alt = `${selectedTeam} Logo`;
		teamLogoImg.classList.remove("fade-out"); // Remove fade-out to trigger fade-in
	}, 1000);
});
