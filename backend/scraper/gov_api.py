import requests
from datetime import datetime

def fetch_nsp_scholarships():
    """Simulates fetching from National Scholarship Portal (NSP) API"""
    # Real Gov APIs require tokens/whitelisting. We mock the JSON structure.
    
    mock_api_response = {
        "status": "success",
        "data": [
            {
                "schemeId": "NSP_0042",
                "schemeName": "Post Matric Merit Scholarship for Minorities 2026",
                "nodalMinistry": "Ministry of Minority Affairs",
                "awardAmount": "₹15,000",
                "deadlineDate": "2026-11-30",
                "eligibilityCrit": {
                    "religion": ["Muslim", "Sikh", "Christian", "Buddhist", "Jain", "Parsi"],
                    "minPercentage": 50,
                    "maxIncome": 250000
                },
                "applyLink": "https://scholarships.gov.in/"
            }
        ]
    }
    
    scholarships = []
    
    for item in mock_api_response["data"]:
        scholarships.append({
            "name": item["schemeName"],
            "provider": item["nodalMinistry"],
            "amount": item["awardAmount"],
            "category": "Minority",
            "state": "All India",
            "field": "All",
            "eligibility": "Minority students with 50%+ and income < 2.5 LPA",
            "deadline": datetime.strptime(item["deadlineDate"], "%Y-%m-%d"),
            "income_limit": float(item["eligibilityCrit"]["maxIncome"]),
            "min_percentage": float(item["eligibilityCrit"]["minPercentage"]),
            "official_link": item["applyLink"],
            "description": "Scraped via Gov API Integration.",
            "source": "NSP API"
        })
        
    return scholarships
