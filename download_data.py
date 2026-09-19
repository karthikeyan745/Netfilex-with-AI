import urllib.request
import os

url = "https://raw.githubusercontent.com/rfordatascience/tidytuesday/main/data/2021/2021-04-20/netflix_titles.csv"
output_path = "netflix_titles.csv"

print(f"Downloading from {url}...")
try:
    urllib.request.urlretrieve(url, output_path)
    print(f"Download complete! Saved to {os.path.abspath(output_path)}")
except Exception as e:
    print(f"Error downloading dataset: {e}")
