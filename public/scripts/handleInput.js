const { enableSubmitButton, updateTeamSpecificUI } = require("./formView.js");
const form = document.querySelector("form");
const teamSelect = form.elements["team"];
const projectSelect = form.elements["project"];

teamSelect.addEventListener("change", function () {
	enableSubmitButton();
	updateTeamSpecificUI(teamSelect.value);
});

form.addEventListener("submit", function (event) {
	event.preventDefault(); // Prevent the form from submitting in the traditional way
	startImport(teamSelect.value, projectSelect.value);
});

function startImport(team, project) {
	fetch("/api/import-games", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify({ team, project }), // Send team and project values in the request body
	})
		.then((response) => {
			if (response.ok) {
				console.log("Import started successfully.");
				showImportStatusUI(importStatus.LOADING);
				pollStatus();
			} else {
				return response.json().then((data) => {
					console.error(
						"Error starting import in THEN-ELSE:",
						data.message
					);
					showImportStatusUI(importStatus.ERROR, data.message);
					// alert(`Failed to start import: ${data.message}`);
				});
			}
		})
		.catch((error) => {
			console.error("Error starting import in CATCH:", error);
			showImportStatusUI(importStatus.ERROR, error);
		});
}

// Function to check import status every 3 seconds
function pollStatus() {
	const intervalId = setInterval(() => {
		fetch("/api/import-status")
			.then((response) => {
				if (!response.ok)
					throw new Error("Failed to fetch import status.");
				return response.json();
			})
			.then((data) => {
				if (data.inProgress) {
					// document.getElementById("status-message").textContent =
					// 	"Status: Import in progress...";
				} else {
					// document.getElementById("status-message").textContent =
					// 	"Status: Import complete!";
					showImportStatusUI(importStatus.SUCCESS);
					clearInterval(intervalId); // Stop polling once import is complete
				}
			})
			.catch((error) => {
				console.error("Error checking status:", error);
				showImportStatusUI(importStatus.ERROR, error);
				clearInterval(intervalId); // Stop polling on error
			});
	}, 3000); // Poll every 3 seconds
}

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ //
//                                           //
//           HELPER FUNCTIONS                //
//                                           //
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ //
const importStatus = {
	LOADING: 0,
	SUCCESS: 1,
	ERROR: 2,
};
function getStatusMessage(status) {
	switch (status) {
		case importStatus.LOADING:
			return "Importing schedule...";
		case importStatus.SUCCESS:
			return "Import complete!";
		case importStatus.ERROR:
			return "An error occurred";
		default:
			return "An error occurred";
	}
}

function getStatusSubtitle(status, errorMessage = null) {
	switch (status) {
		case importStatus.LOADING:
			return "Please keep this window open";
		case importStatus.SUCCESS:
			return "Schedule added to Todoist";
		case importStatus.ERROR:
			return `${errorMessage}`;
		default:
			return "Unknown error";
	}
}

function growLogoBanner() {
	const logoBanner = document.querySelector(".logo-banner");
	logoBanner.classList.add("logo-banner-large");
}

function showLoadingStatus(status, errorMessage) {
	const statusTitle = document.querySelector("h1");
	statusTitle.textContent = getStatusMessage(status);

	const subtitle = document.querySelector("h3");
	subtitle.textContent = getStatusSubtitle(status, errorMessage);

	const statusContainer = document.querySelector(".app-status");
	statusContainer.classList.add("fade-in");
}

function showImportStatusUI(status, errorMessage = null) {
	const appFrame = document.querySelector(".app-frame");
	appFrame.classList.add("loading");
	appFrame.addEventListener("transitionend", () => {
		growLogoBanner();
		showLoadingStatus(status, errorMessage);
	});
}
