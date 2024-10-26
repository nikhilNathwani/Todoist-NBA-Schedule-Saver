import os
import requests

# List of NBA team abbreviations
team_abbreviations = [
    "ATL", "BOS", "BKN", "CHA", "CHI", "CLE", "DAL", "DEN", "DET", "GSW",
    "HOU", "IND", "LAC", "LAL", "MEM", "MIA", "MIL", "MIN", "NOP", "NYK",
    "OKC", "ORL", "PHI", "PHX", "POR", "SAC", "SAS", "TOR", "UTA", "WAS"
]

# Base URL and directory to save images
base_url = "https://cdn.celtics.com/logos/teams/latest/svg/"
save_dir = "../public/images/team-logos"

# Create the directory if it doesn't exist
os.makedirs(save_dir, exist_ok=True)

# Download each logo
for team in team_abbreviations:
    logo_url = f"{base_url}{team}.svg"
    response = requests.get(logo_url)
    
    # Check if the request was successful
    if response.status_code == 200:
        file_path = os.path.join(save_dir, f"{team}.svg")
        with open(file_path, "wb") as file:
            file.write(response.content)
        print(f"Downloaded {team}.svg")
    else:
        print(f"Failed to download {team}.svg")

print("Download complete.")
