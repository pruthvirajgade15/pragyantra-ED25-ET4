import requests
from bs4 import BeautifulSoup
from datetime import datetime, timedelta

def scrape_mahadbt():

    html_content = 
    
    soup = BeautifulSoup(html_content, 'html.parser')
    scholarships = []
    
    for card in soup.find_all('div', class_='scheme-card'):
        title = card.find('h3', class_='scheme-title').text
        provider = card.find('span', class_='provider').text
        amount = card.find('span', class_='amount').text
        eligibility = card.find('span', class_='eligibility').text
        deadline_str = card.find('span', class_='deadline').text
        
        scholarships.append({
            "name": title,
            "provider": provider,
            "amount": amount,
            "category": "All",
            "state": "Maharashtra",
            "field": "All",
            "eligibility": eligibility,
            "deadline": datetime.strptime(deadline_str, "%Y-%m-%d"),
            "income_limit": 800000.0,
            "min_percentage": 75.0,
            "official_link": "https://mahadbt.maharashtra.gov.in/",
            "description": "Scraped from State Portal via BeautifulSoup.",
            "source": "Scraper"
        })
        
    return scholarships