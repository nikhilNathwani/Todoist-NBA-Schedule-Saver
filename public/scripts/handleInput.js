const form = document.querySelector("form");
const teamSelect = form.elements["team"];
const projectSelect = form.elements["project"];

teamSelect.addEventListener("change", function () {
	enableSubmitButton();
	updateTeamSpecificUI(teamSelect.value);
});

form.addEventListener("submit", function (event) {
	event.preventDefault(); // Prevent the form from submitting in the traditional way
	fadeOutForm();
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
					console.log("Import in progress...");
					// document.getElementById("status-message").textContent =
					// 	"Status: Import in progress...";
				} else {
					// document.getElementById("status-message").textContent =
					// 	"Status: Import complete!";
					console.log("Import complete!");
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
			return "Importing schedule";
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

function getStatusArrow(status) {
	switch (status) {
		case importStatus.LOADING:
			return `<i class="fa-solid fa-arrow-rotate-right spinner"></i>`;
		case importStatus.SUCCESS:
			return `<i class="fa-solid fa-check"></i>`;
		case importStatus.ERROR:
			return `<i class="fa-solid fa-triangle-exclamation"></i>`;
		default:
			return `<i class="fa-solid fa-arrow-right"></i>`;
	}
}

function showImportStatusUI(status, errorMessage = null) {
	const arrow = document.getElementById("arrow");
	arrow.innerHTML = getStatusArrow(status);

	console.log("in showStatus:", status);
	const statusTitle = document.querySelector("h1");
	console.log("setting app-status title to:", getStatusMessage(status));
	statusTitle.textContent = getStatusMessage(status);

	const subtitle = document.querySelector("h3");
	console.log(
		"setting app-status subtitle to:",
		getStatusSubtitle(status, errorMessage)
	);
	subtitle.textContent = getStatusSubtitle(status, errorMessage);

	const statusContainer = document.querySelector(".app-status");
	statusContainer.classList.add("fade-in");

	if (status == importStatus.SUCCESS || status == importStatus.ERROR) {
		const nextSteps = makeNextStepsList(status);
		const appContent = document.querySelector(".app-content");
		appContent.appendChild(nextSteps);
		setTimeout(() => {
			nextSteps.classList.add("fade-in");
		}, 1000);
	}
}

function makeNextStepsList(status) {
	const list = document.createElement("ul");
	list.classList.add("next-steps-list");
	// list.classList.add("fade-in");

	if (status == importStatus.SUCCESS) {
		const listItems = [
			{
				icon: `<i class="fa-solid fa-up-right-from-square"></i>`,
				linkName: "Open Todoist",
				desc: "to view schedule",
				link: "todoist://",
			},
			{
				icon: `<i class="fa-solid fa-arrow-left"></i>`,
				linkName: "Import another",
				desc: "schedule",
				link: "https://nba-todoist-import.vercel.app/",
			},
			{
				icon: `<i class="fa-regular fa-envelope"></i>`,
				linkName: "Contact me",
				desc: "",
				link: "mailto:nnathwani36@gmail.com?subject=Regarding%20NBA%20Todoist%20Import",
			},
		];
		for (const listItem of listItems) {
			list.appendChild(
				makeListItem(
					listItem.icon,
					listItem.linkName,
					listItem.desc,
					listItem.link
				)
			);
		}
		return list;
	}

	if (status == importStatus.ERROR) {
		const listItems = [
			{
				icon: `<i class="fa-solid fa-arrow-left"></i>`,
				linkName: "Try again",
				desc: "",
				link: "https://nba-todoist-import.vercel.app/",
			},
			{
				icon: `<i class="fa-regular fa-envelope"></i>`,
				linkName: "Report an issue",
				desc: "",
				link: "mailto:nnathwani36@gmail.com?subject=Issue%20with%20NBA%20Todoist%20Import",
			},
		];
		for (const listItem of listItems) {
			list.appendChild(
				makeListItem(listItem.linkName, listItem.desc, listItem.link)
			);
		}
		return list;
	}
}
function makeListItem(icon, linkName, desc, link) {
	const listItem = document.createElement("li");
	listItem.innerHTML = `
		<a
			class="project project-game"
			href="${link}"
			${icon == `<i class="fa-solid fa-arrow-left"></i>` ? `` : `target="_blank"`}
		>${icon} ${linkName}</a> ${desc}`;
	return listItem;
}
