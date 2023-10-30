from bs4 import BeautifulSoup
import requests
import pandas as pd
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry
import xml.etree.ElementTree as ET
from requests.exceptions import RequestException

# Read the robots.txt file
with open('robots.txt', 'r') as file:
    robotstxt = file.read()

# Define the can_scrape function
def can_scrape(path, robotstxt):
    rules = robotstxt.split("\n")
    for rule in rules:
        if rule.startswith("Allow: "):
            allowed_path = rule.split(": ")[1].strip()
            if allowed_path in path:
                return True
    return False

session = requests.Session()
retries = Retry(total=10, backoff_factor=1, status_forcelist=[502, 503, 504])
adapter = HTTPAdapter(max_retries=retries)
session.mount('http://', adapter)
session.mount('https://', adapter)

# Define sitemap URLs
sitemap_urls = [
     "https://www.tripadvisor.com/sitemap/2/en_US/sitemap_en_US_index.xml",
    "https://www.tripadvisor.com/sitemap/2/en_US/sitemap_en_US_location_photo_direct_link_index.xml",
    "https://www.tripadvisor.com/sitemap/2/en_US/sitemap_en_US_show_user_reviews_index.xml",
    "https://www.tripadvisor.com/sitemap/vr/en_US/sitemap_en_US_rentals_index.xml",
    "https://www.tripadvisor.com/sitemap/vr/en_US/sitemap_en_US_vacation_rental_review_index.xml",
    "https://www.tripadvisor.com/sitemap/vr/en_US/sitemap_en_US_vacation_rentals_index.xml",
    "https://www.tripadvisor.com/sitemap/vr/en_US/sitemap_en_US_vacation_rentals_near_index.xml",
    "https://www.tripadvisor.com/sitemap/att/en_US/sitemap_en_US_attractions_index.xml",
    "https://www.tripadvisor.com/sitemap/att/en_US/sitemap_en_US_attraction_review_index.xml",
    "https://www.tripadvisor.com/sitemap/att/en_US/sitemap_en_US_attraction_product_review_index.xml",
    "https://www.tripadvisor.com/sitemap/att/en_US/sitemap_en_US_attractions_near_index.xml",
    "https://www.tripadvisor.com/sitemap/att/en_US/sitemap_en_US_attraction_tours_and_tickets_index.xml"
]

headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
}

urls_to_scrape = [ "https://www.tripadvisor.com/sitemap/2/en_US/sitemap_en_US_index.xml",
    "https://www.tripadvisor.com/sitemap/2/en_US/sitemap_en_US_location_photo_direct_link_index.xml",
    "https://www.tripadvisor.com/sitemap/2/en_US/sitemap_en_US_show_user_reviews_index.xml",
    "https://www.tripadvisor.com/sitemap/vr/en_US/sitemap_en_US_rentals_index.xml",
    "https://www.tripadvisor.com/sitemap/vr/en_US/sitemap_en_US_vacation_rental_review_index.xml",
    "https://www.tripadvisor.com/sitemap/vr/en_US/sitemap_en_US_vacation_rentals_index.xml",
    "https://www.tripadvisor.com/sitemap/vr/en_US/sitemap_en_US_vacation_rentals_near_index.xml",
    "https://www.tripadvisor.com/sitemap/att/en_US/sitemap_en_US_attractions_index.xml",
    "https://www.tripadvisor.com/sitemap/att/en_US/sitemap_en_US_attraction_review_index.xml",
    "https://www.tripadvisor.com/sitemap/att/en_US/sitemap_en_US_attraction_product_review_index.xml",
    "https://www.tripadvisor.com/sitemap/att/en_US/sitemap_en_US_attractions_near_index.xml",
    "https://www.tripadvisor.com/sitemap/att/en_US/sitemap_en_US_attraction_tours_and_tickets_index.xml"]

# Fetch URLs from the sitemaps
for sitemap_url in sitemap_urls:
    response = session.get(sitemap_url, timeout=60)
    response.raise_for_status()  
    
    # Parse the XML sitemap content
    root = ET.fromstring(response.content)

    # Extract URLs from the sitemap
    urls_from_sitemap = [url_elem.text for url_elem in root.findall(".//loc")]
    urls_to_scrape.extend(urls_from_sitemap)

for url in urls_to_scrape:
    # Use the function to determine if a URL can be scraped
    url_path = url.split("https://www.tripadvisor.com")[1]  # Extract path from the URL
    if not can_scrape(url_path, robotstxt):
        print(f"Skipping {url_path} as per robots.txt rules")
        continue  # Skip to the next URL

    # ... logic here ...
    try:
        response = session.get(url, timeout=60)
        response.raise_for_status()

        soup = BeautifulSoup(response.content, 'html.parser')
        # Extract relevant data (Update the selectors as per the actual structure)
        attractions = soup.find_all('div', class_='attraction_name')
        data = []

        for attraction in attractions:
            name = attraction.find('a').text
            rating = attraction.find('span', class_='rating').text
            data.append((name, rating))

        # Convert data list to DataFrame
        df = pd.DataFrame(data, columns=['Attraction', 'Rating'])

        # Save DataFrame to CSV
        df.to_csv('data.csv', index=False, mode='a')  # mode='a' will append data for multiple URLs

    except requests.Timeout:
        print(f"Request timed out for URL: {url}")
    except requests.ConnectionError:
        print(f"Connection error for URL: {url}")
    except RequestException as e:
        print(f"An error occurred: {e}")
