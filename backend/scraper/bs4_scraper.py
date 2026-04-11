import requests
from bs4 import BeautifulSoup
from datetime import datetime, timedelta

def scrape_mahadbt():
    """Simulates scraping MahaDBT (Maharashtra State Portal) using BeautifulSoup"""
    # In a real scenario we'd hit the url: https://mahadbt.maharashtra.gov.in/
    # For hackathon demonstration, we'll parse a simulated HTML or mock requests 
    # to show BeautifulSoup working in principle.
    
    # Simulating finding a new scholarship on a state portal
    html_content = '''
    <div class="scholarship-list">
        <div class="scheme-card">
            <h3 class="scheme-title">Chhatrapati Shahu Maharaj Merit Scholarship</h3>
            <span class="provider">Govt of Maharashtra</span>
            <div class="details">
                <span class="amount">₹10,000/year</span>
                <span class="eligibility">Maratha category, Income < 8LPA, 75%+</span>
                <span class="deadline">2026-06-30</span>
            </div>
        </div>
    </div>
    '''
    
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
