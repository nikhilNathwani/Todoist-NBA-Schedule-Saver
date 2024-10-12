import requests
from bs4 import BeautifulSoup

url= "https://www.cbssports.com/nba/teams/"
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


# ~~~~~~~~ PRE-PROCESSING ~~~~~~~~~~~~~~~~

def getScheduleLinks():
    response = requests.get(url)
    soup= BeautifulSoup(response.content, "html.parser")
    rows = soup.findAll('tr', class_='TableBase-bodyTr')

    links= []
    for i,row in enumerate(rows):
        linkCell= row.findAll("a")[-1]
        link= linkCell["href"]
        link= url+link.split("/nba/teams/")[-1]
        print(f"Link {i+1}: {link}")
        links.append(link)

    return links



# ~~~~~~~~ SCRAPE TEAM SCHEDULES ~~~~~~~~~~~~~~~~

def scrapeAllTeamSchedules(links):
    schedules= {}
    for link in links:
        teamID= link.split(url)[-1].split("/")[0]
        schedule= scrapeTeamSchedule(link)
        schedules[teamID]= schedule
    return schedules

def scrapeTeamSchedule(link):
    games=[]
    response = requests.get(link)
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
           games.append({"opponent":opponent, "date":date, "time":time})
    return games



# ~~~~~~~~ HELPER FUNCTIONS ~~~~~~~~~~~~~~~~

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



# ~~~~~~~~ MAIN THREAD ~~~~~~~~~~~~~~~~~~~~~~~~

if __name__ == "__main__":
    links= getScheduleLinks()
    schedules= scrapeAllTeamSchedules(links)
    for i,team in enumerate(schedules.keys()):
       print("\n\n\n")
       print(i+1, team)
       print("\n")
       print(len(schedules[team]), schedules[team])