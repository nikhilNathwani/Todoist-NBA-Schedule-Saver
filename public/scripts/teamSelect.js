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
