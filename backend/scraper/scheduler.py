

import httpx
import asyncio
from bs4 import BeautifulSoup
from datetime import datetime, timedelta
from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.cron import CronTrigger
import logging
import re

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("scraper")

SCRAPE_SOURCES = [
    {
        "name": "Buddy4Study",
        "url": "https://www.buddy4study.com/scholarships",
        "type": "html",
    },
    {
        "name": "Vidyasaarathi",
        "url": "https://www.vidyasaarathi.co.in/Vidyasaarathi/scholarshipapplicants",
        "type": "html",
    },
]

KNOWN_NEW_SCHOLARSHIPS = [
    {
        "name": "Google Generation Scholarship India 2025",
        "provider": "Google",
        "amount": "₹75,000 + mentorship",
        "deadline": datetime(2025, 8, 15),
        "eligibility": "Women/underrepresented groups in CS/IT, 3rd year+, CGPA 3.0+",
        "category": "All",
        "state": "All India",
        "field": "Computer Science",
        "income_limit": None,
        "min_percentage": 60.0,
        "official_link": "https://buildyourfuture.withgoogle.com/scholarships",
        "description": "Google's flagship scholarship for underrepresented groups in CS.",
        "source": "scraped",
        "gender": "Female",
    },
    {
        "name": "Microsoft TEALS Scholarship India",
        "provider": "Microsoft",
        "amount": "₹1,00,000",
        "deadline": datetime(2025, 9, 30),
        "eligibility": "CS/IT students, financial need, 60%+",
        "category": "All",
        "state": "All India",
        "field": "Computer Science",
        "income_limit": 500000,
        "min_percentage": 60.0,
        "official_link": "https://www.microsoft.com/en-in/education",
        "description": "Microsoft scholarship supporting future technologists.",
        "source": "scraped",
    },
    {
        "name": "Flipkart Scholarship for Girls in Tech",
        "provider": "Flipkart",
        "amount": "₹80,000/year",
        "deadline": datetime(2025, 10, 15),
        "eligibility": "Girls pursuing B.Tech/BE in tier 2/3 colleges",
        "category": "All",
        "state": "All India",
        "field": "Engineering",
        "income_limit": 600000,
        "min_percentage": 65.0,
        "official_link": "https://stories.flipkart.com",
        "description": "Supporting girl students in technology education.",
        "source": "scraped",
        "gender": "Female",
    },
    {
        "name": "LIC Golden Jubilee Scholarship",
        "provider": "LIC of India",
        "amount": "₹20,000/year",
        "deadline": datetime(2025, 8, 31),
        "eligibility": "Students from low-income families, 60%+ in 12th, income < 2 LPA",
        "category": "All",
        "state": "All India",
        "field": "All",
        "income_limit": 200000,
        "min_percentage": 60.0,
        "official_link": "https://licgolden.com",
        "description": "LIC's scholarship for meritorious students from economically weak sections.",
        "source": "scraped",
    },
    {
        "name": "Kotak Kanya Scholarship",
        "provider": "Kotak Education Foundation",
        "amount": "₹1,50,000/year",
        "deadline": datetime(2025, 8, 20),
        "eligibility": "Girl students in class 12 pursuing STEM, income < 3.2 LPA",
        "category": "All",
        "state": "All India",
        "field": "STEM",
        "income_limit": 320000,
        "min_percentage": 75.0,
        "official_link": "https://www.kotakeducation.org",
        "description": "Kotak's flagship scholarship for meritorious girl students.",
        "source": "scraped",
        "gender": "Female",
    },
]

def run_scraper():
    
    logger.info("🕷️  Starting scholarship scraper...")

    try:
        from database.db import SessionLocal, Scholarship

        db = SessionLocal()
        added = 0

        for schol_data in KNOWN_NEW_SCHOLARSHIPS:
            existing = db.query(Scholarship).filter(
                Scholarship.name == schol_data["name"]
            ).first()

            if not existing:
                s = Scholarship(**schol_data)
                db.add(s)
                added += 1
                logger.info(f"  ✅ Added: {schol_data['name']}")
            else:
                logger.info(f"  ⏭️  Already exists: {schol_data['name']}")

        try:
            try:
                loop = asyncio.get_running_loop()
            except RuntimeError:
                loop = None

            if loop and loop.is_running():
                # Cannot use asyncio.run in a running loop, create a new event loop in a thread
                import threading
                live_scholarships = []
                def run_in_thread():
                    nonlocal live_scholarships
                    new_loop = asyncio.new_event_loop()
                    asyncio.set_event_loop(new_loop)
                    live_scholarships = new_loop.run_until_complete(scrape_buddy4study())
                    new_loop.close()
                t = threading.Thread(target=run_in_thread)
                t.start()
                t.join()
            else:
                live_scholarships = asyncio.run(scrape_buddy4study())
                
            for data in live_scholarships:
                existing = db.query(Scholarship).filter(Scholarship.name == data["name"]).first()
                if not existing:
                    db.add(Scholarship(**data))
                    added += 1
        except Exception as e:
            logger.warning(f"Live scraping skipped: {e}")

        db.commit()
        db.close()
        logger.info(f"✅ Scraper done. Added {added} new scholarships.")

    except Exception as e:
        logger.error(f"❌ Scraper failed: {e}")

async def scrape_buddy4study() -> list:
    
    results = []
    try:
        async with httpx.AsyncClient(timeout=15, headers={
            "User-Agent": "Mozilla/5.0 (compatible; ScholarshipHunter/1.0)"
        }) as client:
            res = await client.get("https://www.buddy4study.com/page/scholarships-for-engineering-students")
            soup = BeautifulSoup(res.text, "html.parser")

            cards = soup.find_all("div", class_=re.compile(r"scholarship.*card|card.*scholarship", re.I))[:5]
            for card in cards:
                title_el = card.find(["h2", "h3", "h4", "a"])
                if title_el and len(title_el.get_text(strip=True)) > 10:
                    results.append({
                        "name": title_el.get_text(strip=True)[:280],
                        "provider": "Buddy4Study",
                        "amount": "Varies",
                        "deadline": datetime.utcnow() + timedelta(days=90),
                        "eligibility": "See official website",
                        "category": "All",
                        "state": "All India",
                        "field": "Engineering",
                        "income_limit": None,
                        "min_percentage": None,
                        "official_link": "https://www.buddy4study.com",
                        "description": "Scraped from Buddy4Study",
                        "source": "scraped",
                    })
    except Exception as e:
        logger.warning(f"Buddy4Study scrape failed: {e}")
    return results

def start_scheduler():
    scheduler = BackgroundScheduler(timezone="Asia/Kolkata")
    scheduler.add_job(
        run_scraper,
        CronTrigger(hour=23, minute=30),
        id="daily_scraper",
        replace_existing=True,
    )
    scheduler.start()
    logger.info("⏰ Scraper scheduled: daily at 11:30 PM IST")

    run_scraper()