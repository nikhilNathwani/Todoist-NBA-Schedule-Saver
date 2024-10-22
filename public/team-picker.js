// Function to fetch the NBA schedule and populate the dropdown
async function populateTeamDropdown() {
    try {
        // Fetch the nba-schedule.json file
        const response = await fetch('../data/nba-schedule.json');
        console.log("Response", response);
        const scheduleData = await response.json();

        // Get the team select dropdown element
        const teamSelect = document.getElementById('team-select');

        // Iterate over the teams in the JSON data
        for (const teamID in scheduleData) {
            const teamInfo = scheduleData[teamID];

            // Create an option element
            const option = document.createElement('option');
            option.value = teamID; // Team ID as the value
            option.textContent = `${teamInfo.teamCity} ${teamInfo.teamName}`; // City and Team Name as display text

            // Append the option to the select element
            teamSelect.appendChild(option);
        }
    } catch (error) {
        console.error('Error fetching NBA schedule:', error);
    }
}

// Populate the dropdown when the page loads
window.onload = populateTeamDropdown;