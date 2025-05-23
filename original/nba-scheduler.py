import requests
from datetime import datetime
import pytz
from config import team, auth_key
from bs4 import BeautifulSoup
from todoist_api_python.api import TodoistAPI

teamNames= {
    "Atlanta": "Hawks",
    "Boston": "Celtics",
    "Brooklyn": "Nets",
    "Charlotte": "Hornets",
    "Chicago": "Bulls",
    "Cleveland": "Cavaliers",
    "Dallas": "Mavericks",
    "Denver": "Nuggets",
    "Detroit": "Pistons",
    "Golden State": "Warriors",
    "Houston": "Rockets",
    "Indiana": "Pacers",
    "L.A. Clippers": "Clippers",
    "L.A. Lakers": "Lakers",
    "Memphis": "Grizzlies",
    "Miami": "Heat",
    "Milwaukee": "Bucks",
    "Minnesota": "Timberwolves",
    "New Orleans": "Pelicans",
    "New York": "Knicks",
    "Oklahoma City": "Thunder",
    "Orlando": "Magic",
    "Philadelphia": "76ers",
    "Phoenix": "Suns",
    "Portland": "Trail Blazers",
    "Sacramento": "Kings",
    "San Antonio": "Spurs",
    "Toronto": "Raptors",
    "Utah": "Jazz",
    "Washington": "Wizards"
}
teamNamesCasual = {
    "Atlanta": "hawks",
    "Boston": "celtics",
    "Brooklyn": "nets",
    "Charlotte": "hornets",
    "Chicago": "bulls",
    "Cleveland": "cavs",
    "Dallas": "mavs",
    "Denver": "nuggets",
    "Detroit": "pistons",
    "Golden St.": "warriors",
    "Houston": "rockets",
    "Indiana": "pacers",
    "L.A. Clippers": "clippers",
    "L.A. Lakers": "lakers",
    "Memphis": "grizzlies",
    "Miami": "heat",
    "Milwaukee": "bucks",
    "Minnesota": "t-wolves",
    "New Orleans": "pelicans",
    "New York": "knicks",
    "Oklahoma City": "thunder",
    "Orlando": "magic",
    "Philadelphia": "76ers",
    "Phoenix": "suns",
    "Portland": "blazers",
    "Sacramento": "kings",
    "San Antonio": "spurs",
    "Toronto": "raptors",
    "Utah": "jazz",
    "Washington": "wizards"
}
teamColors = {
    "Atlanta": "red",
    "Boston": "green",
    "Brooklyn": "grey",
    "Charlotte": "mint_green",
    "Chicago": "red",
    "Cleveland": "berry_red",
    "Dallas": "blue",
    "Denver": "light_blue",
    "Detroit": "blue",
    "Golden State": "yellow",
    "Houston": "red",
    "Indiana": "yellow",
    "L.A. Clippers": "red",
    "L.A. Lakers": "violet",
    "Memphis": "light_blue",
    "Miami": "berry_red",
    "Milwaukee": "taupe",
    "Minnesota": "lime_green",
    "New Orleans": "taupe",
    "New York": "orange",
    "Oklahoma City": "blue",
    "Orlando": "blue",
    "Philadelphia": "red",
    "Phoenix": "orange",
    "Portland": "red",
    "Sacramento": "grape",
    "San Antonio": "grey",
    "Toronto": "red",
    "Utah": "grape",
    "Washington": "red"
}


# To-do:
# -Create project with team name

class Game:
  def __init__(self, opponent, date, time):
    self.opponent = opponent
    self.date = date
    self.time = time


# ~~~~~~~~ SCRAPING THE NBA SCHEDULE SITE ~~~~~~~~
def scrapeGames(url):
    games=[]
    response = requests.get(url)
    soup= BeautifulSoup(response.content, "html.parser")
    schedule = soup.find("tbody")
    if not schedule:
        print("No schedule found")
    else:
        rows= schedule.findAll("tr")
        for row in rows:
           opponent= scrapeOpponent(row)
           date= scrapeDate(row)
           time= scrapeTime(row)
           games.append(Game(opponent, date, time))
        #    print(i+1, opponent, date, time)
    return games

def scrapeOpponent(row):
   opponentElement= row.find(class_ = "TeamName").find("a")
   opponent= opponentElement.text
   #my preferred formatting:
   opponent= teamNamesCasual[opponent]
   return opponent

def scrapeDate(row):
   dateElement= row.find(class_ = "CellGameDate")
   return dateElement.text.strip()

def scrapeTime(row): 
   timeElement= row.find(class_ = "CellGame").find("a")
   return timeElement.text.replace(" ","")


# ~~~~~~~~ UPLOADING SCHEDULE TO TODOIST ~~~~~~~~~
api = TodoistAPI(auth_key)

def addTodoistTask(game, projectID):
    taskContent= "Celtics " + game.opponent
    taskDueDatetime= formatDate(game.date, game.time)
    api.add_task(content=taskContent, due_datetime=taskDueDatetime, project_id=projectID)

def uploadScheduleToTodoist(games, projectID):
   for game in games:
      addTodoistTask(game, projectID)

#creates Todoist project and returns project ID
def createTodoistProject(teamCity):
   project = api.add_project(name= teamNames[teamCity]+" new", color= teamColors[teamCity])
   return project.id

def formatDate(date, time):
   # Step 1: Define the original date and time string
   date_str= date + " " + time
   date_format= "%b %d, %Y %I:%M%p" # Format for (e.g.) "October 22, 2024 7:30pm"
   
   # Step 2: Parse the date and time
   naive_date= datetime.strptime(date_str, date_format)
   
   # Step 3: Create an EST timezone (UTC-5 without daylight saving time)
   eastern = pytz.timezone('America/New_York')


   # Step 4: Localize the naive datetime to the Eastern timezone
   localized_date = eastern.localize(naive_date)
   
   # Step 5: Convert to UTC
   utc_date = localized_date.astimezone(pytz.utc)
   
   # Step 6: Format in RFC 3339
   rfc3339_format = utc_date.isoformat()

   print(rfc3339_format)
   return rfc3339_format

# ~~~~~~~~ MAIN THREAD ~~~~~~~~~~~~~~~~~~~~~~~~~~~
if __name__ ==  "__main__": 
   # Site to scrape NBA schedule from:
   nbaScheduleURL= "https://www.cbssports.com/nba/teams/BOS/boston-celtics/schedule/regular/"
   games= scrapeGames(nbaScheduleURL)

   # Todoist project to add my tasks to:
   todoistProjectId= createTodoistProject(team);  
   uploadScheduleToTodoist(games,todoistProjectId) 