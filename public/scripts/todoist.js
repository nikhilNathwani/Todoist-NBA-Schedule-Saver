// todoist.js
const { TodoistApi } = require('@doist/todoist-api-typescript');
const FREE_PROJECT_LIMIT = 5;
const PREMIUM_PROJECT_LIMIT = 300;

let api; // Declare a variable to hold the API instance

// Initialize API with the user's token
async function initializeAPI(req, token) {
    api = new TodoistApi(token); //Todosit REST API
    await saveUserMetadata(req, accessToken)
}

async function saveUserMetadata(req, accessToken) {
    try {
        // Fetch user resources via the Sync API
        const response = await axios.post('https://api.todoist.com/sync/v9/sync', {
            sync_token: '*',
            resource_types: ['user', 'projects']
        }, {
            headers: {
                Authorization: `Bearer ${accessToken}`
            }
        });

        const { user, projects } = response.data; 
        const isPremium = user.is_premium; // Check if the user is premium
        const projectCount = projects.length; 

        // Store these values in the session
        req.session.isPremium = isPremium;
        req.session.projectCount = projectCount;
        req.session.canCreateProjects = isPremium ? projectCount < PREMIUM_PROJECT_LIMIT : projectCount < FREE_PROJECT_LIMIT;
    } catch (error) {
        console.error('Error fetching user data:', error);
        throw new Error('Failed to fetch user metadata');
    }
}

// Function to add a task to Todoist
async function addTodoistTask(game, projectID) {
    const taskContent = `Celtics ${game.opponent}`;
    const taskDueDatetime = formatDate(game.date, game.time);

    try {
        await api.addTask({
            content: taskContent,
            due: { date: taskDueDatetime },
            project_id: projectID,
        });
    } catch (error) {
        console.error('Error adding task to Todoist:', error);
    }
}

// Function to upload the schedule to Todoist
async function uploadScheduleToTodoist(games, projectID) {
    for (const game of games) {
        await addTodoistTask(game, projectID);
    }
}

// Function to create a Todoist project and return the project ID
async function createTodoistProject(teamCity) {
    try {
        const project = await api.addProject({
            name: `${teamNames[teamCity]} new`,
            color: teamColors[teamCity],
        });
        return project.id;
    } catch (error) {
        console.error('Error creating Todoist project:', error);
    }
}

module.exports = { initializeAPI, uploadScheduleToTodoist, createTodoistProject };
