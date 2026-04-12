

import os
from sqlalchemy import create_engine, Column, Integer, String, Float, DateTime, Boolean, Text, ForeignKey
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship
from datetime import datetime
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./scholarship.db")

if DATABASE_URL.startswith("postgresql://"):
    DATABASE_URL = DATABASE_URL.replace("postgresql://", "postgresql+psycopg2://", 1)

if "sqlite" in DATABASE_URL:
    engine = create_engine(
        DATABASE_URL,
        connect_args={"check_same_thread": False},
    )
else:
    engine = create_engine(
        DATABASE_URL,
        pool_pre_ping=True,
        pool_recycle=300,
        pool_size=5,
        max_overflow=10,
        echo=False,
    )

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

class User(Base):
    __tablename__ = "users"
    id               = Column(Integer, primary_key=True, index=True)
    name             = Column(String(100))
    email            = Column(String(120), unique=True, index=True)
    hashed_password  = Column(String(200))
    language         = Column(String(10), default="en")
    created_at       = Column(DateTime, default=datetime.utcnow)

    profile            = relationship("StudentProfile", back_populates="user", uselist=False)
    saved_scholarships = relationship("SavedScholarship", back_populates="user")
    essay_drafts       = relationship("EssayDraft", back_populates="user")

class StudentProfile(Base):
    __tablename__ = "student_profiles"
    id             = Column(Integer, primary_key=True)
    user_id        = Column(Integer, ForeignKey("users.id"), unique=True)
    full_name      = Column(String(100))
    annual_income  = Column(Float)
    percentage     = Column(Float)
    category       = Column(String(50))
    state          = Column(String(60))
    field_of_study = Column(String(100))
    gender         = Column(String(20))
    dob            = Column(String(20))
    religion       = Column(String(50))
    disability     = Column(Boolean, default=False)
    is_minority    = Column(Boolean, default=False)
    current_year   = Column(Integer)
    college        = Column(String(200))
    phone          = Column(String(15))

    user = relationship("User", back_populates="profile")

class Scholarship(Base):
    __tablename__ = "scholarships"
    id                  = Column(Integer, primary_key=True, index=True)
    name                = Column(String(300), index=True)
    provider            = Column(String(200))
    amount              = Column(String(100))
    deadline            = Column(DateTime, nullable=True)
    eligibility         = Column(Text)
    category            = Column(String(100))
    state               = Column(String(100))
    field               = Column(String(200))
    income_limit        = Column(Float, nullable=True)
    min_percentage      = Column(Float, nullable=True)
    official_link       = Column(String(500))
    description         = Column(Text)
    source              = Column(String(100))
    is_active           = Column(Boolean, default=True)
    scraped_at          = Column(DateTime, default=datetime.utcnow)
    gender              = Column(String(20), default="All")
    disability_required = Column(Boolean, default=False)

class SavedScholarship(Base):
    __tablename__ = "saved_scholarships"
    id             = Column(Integer, primary_key=True)
    user_id        = Column(Integer, ForeignKey("users.id"))
    scholarship_id = Column(Integer, ForeignKey("scholarships.id"))
    match_score    = Column(Float)
    status         = Column(String(50), default="saved")
    saved_at       = Column(DateTime, default=datetime.utcnow)
    notes          = Column(Text, nullable=True)

    user        = relationship("User", back_populates="saved_scholarships")
    scholarship = relationship("Scholarship")

class EssayDraft(Base):
    __tablename__ = "essay_drafts"
    id             = Column(Integer, primary_key=True)
    user_id        = Column(Integer, ForeignKey("users.id"))
    scholarship_id = Column(Integer, ForeignKey("scholarships.id"), nullable=True)
    title          = Column(String(300))
    content        = Column(Text)
    language       = Column(String(10))
    word_count     = Column(Integer)
    created_at     = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="essay_drafts")

class DeadlineAlert(Base):
    __tablename__ = "deadline_alerts"
    id             = Column(Integer, primary_key=True)
    user_id        = Column(Integer, ForeignKey("users.id"))
    scholarship_id = Column(Integer, ForeignKey("scholarships.id"))
    alert_7_days   = Column(Boolean, default=False)
    alert_3_days   = Column(Boolean, default=False)
    alert_1_day    = Column(Boolean, default=False)
    email_sent     = Column(Boolean, default=False)

class Document(Base):
    __tablename__ = "documents"
    id             = Column(Integer, primary_key=True)
    user_id        = Column(Integer, ForeignKey("users.id"))
    doc_type       = Column(String(50))
    file_path      = Column(String(500))
    parsed_data    = Column(Text, nullable=True)
    uploaded_at    = Column(DateTime, default=datetime.utcnow)

    user = relationship("User")

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def init_db():
    print("🔄 Connecting to database...")
    try:
        with engine.connect() as conn:
            print("✅ Database connected!")
    except Exception as e:
        print(f"❌ Database connection failed: {e}")
        print("💡 Check your DATABASE_URL in .env file")
        raise

    Base.metadata.create_all(bind=engine)
    print("✅ Tables created!")

    seed_scholarships()
    print("✅ Database initialized")

def seed_scholarships():
    
    db = SessionLocal()
    try:
        if db.query(Scholarship).count() > 0:
            print("ℹ️  Scholarships already seeded, skipping...")
            db.close()
            return

        scholarships = [
            Scholarship(
                name="NSP Post-Matric Scholarship for SC Students",
                provider="National Scholarship Portal",
                amount="₹3,500 - ₹20,000/year",
                deadline=datetime(2026, 10, 31),
                eligibility="SC category, income < 2.5 LPA, post-matric",
                category="SC", state="All India", field="All",
                income_limit=250000, min_percentage=50.0,
                official_link="https://scholarships.gov.in",
                description="Central govt scholarship for SC students pursuing post-matric courses.",
                source="NSP"
            ),
            Scholarship(
                name="NSP Pre-Matric Scholarship for OBC Students",
                provider="National Scholarship Portal",
                amount="₹1,000 - ₹5,000/year",
                deadline=datetime(2026, 10, 31),
                eligibility="OBC category, income < 1 LPA, class 9-10",
                category="OBC", state="All India", field="All",
                income_limit=100000, min_percentage=0.0,
                official_link="https://scholarships.gov.in",
                description="Central govt scholarship for OBC students in class 9 and 10.",
                source="NSP"
            ),
            Scholarship(
                name="AICTE Pragati Scholarship for Girls",
                provider="AICTE",
                amount="₹50,000/year",
                deadline=datetime(2026, 11, 30),
                eligibility="Girls in technical education (AICTE approved), income < 8 LPA",
                category="All", state="All India", field="Engineering",
                income_limit=800000, min_percentage=60.0,
                official_link="https://www.aicte-india.org/bureaus/pgms/pragati",
                description="AICTE scholarship exclusively for girl students in technical education.",
                source="AICTE", gender="Female"
            ),
            Scholarship(
                name="AICTE Saksham Scholarship for Specially Abled",
                provider="AICTE",
                amount="₹50,000/year",
                deadline=datetime(2026, 11, 30),
                eligibility="Specially abled students in AICTE approved institutions",
                category="All", state="All India", field="Engineering",
                income_limit=800000, min_percentage=60.0,
                official_link="https://www.aicte-india.org/bureaus/pgms/saksham",
                description="For differently-abled students in technical education.",
                source="AICTE", disability_required=True
            ),
            Scholarship(
                name="Buddy4Study Dr. Ambedkar Post-Matric Scholarship",
                provider="Buddy4Study",
                amount="Up to ₹20,000/year",
                deadline=datetime(2026, 12, 31),
                eligibility="SC/ST students, income < 2 LPA, post-matric",
                category="SC", state="All India", field="All",
                income_limit=200000, min_percentage=50.0,
                official_link="https://www.buddy4study.com",
                description="Supporting SC/ST students to continue higher education.",
                source="Buddy4Study"
            ),
            Scholarship(
                name="Vidyasaarathi NTPC Scholarship",
                provider="NTPC / Vidyasaarathi",
                amount="₹35,000/year",
                deadline=datetime(2026, 9, 30),
                eligibility="Engineering students, income < 3 LPA, 60%+ marks",
                category="All", state="All India", field="Engineering",
                income_limit=300000, min_percentage=60.0,
                official_link="https://www.vidyasaarathi.co.in",
                description="NTPC-sponsored scholarship for engineering students.",
                source="Vidyasaarathi"
            ),
            Scholarship(
                name="Maharashtra State Merit Scholarship",
                provider="Govt of Maharashtra",
                amount="₹15,000/year",
                deadline=datetime(2026, 9, 15),
                eligibility="Maharashtra domicile, 75%+ in HSC, income < 4 LPA",
                category="All", state="Maharashtra", field="All",
                income_limit=400000, min_percentage=75.0,
                official_link="https://mahadbt.maharashtra.gov.in",
                description="State merit scholarship for Maharashtra students.",
                source="MahaDBT"
            ),
            Scholarship(
                name="EBC Scholarship Maharashtra",
                provider="Govt of Maharashtra",
                amount="₹5,000 - ₹25,000/year",
                deadline=datetime(2026, 10, 15),
                eligibility="Maharashtra, EBC/EWS category, income < 1 LPA",
                category="EWS", state="Maharashtra", field="All",
                income_limit=100000, min_percentage=0.0,
                official_link="https://mahadbt.maharashtra.gov.in",
                description="For economically backward students in Maharashtra.",
                source="MahaDBT"
            ),
            Scholarship(
                name="Inspire Scholarship (DST)",
                provider="Dept of Science & Technology",
                amount="₹80,000/year",
                deadline=datetime(2026, 8, 31),
                eligibility="Top 1% in 12th board, pursuing B.Sc/B.S/Int M.Sc",
                category="All", state="All India", field="Science",
                income_limit=None, min_percentage=90.0,
                official_link="https://online-inspire.gov.in",
                description="For meritorious students in natural and basic sciences.",
                source="DST"
            ),
            Scholarship(
                name="PM Scholarship Scheme for Central Armed Police Forces",
                provider="Ministry of Home Affairs",
                amount="₹2,500 - ₹3,000/month",
                deadline=datetime(2026, 10, 31),
                eligibility="Wards of CAPF/RPF personnel, 60%+ in 12th",
                category="All", state="All India", field="Professional Courses",
                income_limit=None, min_percentage=60.0,
                official_link="https://ksb.gov.in",
                description="For children of CAPF, RPF, Assam Rifles personnel.",
                source="KSB"
            ),
            Scholarship(
                name="Kishore Vaigyanik Protsahan Yojana (KVPY)",
                provider="IISc Bangalore",
                amount="₹80,000/year (SX)",
                deadline=datetime(2026, 9, 1),
                eligibility="Students in Class 11-12 or 1st year BSc/BS, top performers in science",
                category="All", state="All India", field="Science",
                income_limit=None, min_percentage=75.0,
                official_link="https://kvpy.iisc.ac.in",
                description="Fellowship for students interested in research careers.",
                source="IISc"
            ),
            Scholarship(
                name="Ishan Uday Special Scholarship for NE States",
                provider="UGC",
                amount="₹5,400 - ₹7,800/month",
                deadline=datetime(2026, 10, 31),
                eligibility="Domicile of NE states, pursuing higher education outside home state",
                category="All", state="Northeast", field="All",
                income_limit=450000, min_percentage=60.0,
                official_link="https://scholarships.gov.in",
                description="For students from North-East India studying in other states.",
                source="NSP"
            ),
            Scholarship(
                name="Central Sector Scheme of Scholarships for College Students",
                provider="Ministry of Education",
                amount="₹12,000/year",
                deadline=datetime(2026, 10, 31),
                eligibility="Top 80th percentile in 12th, income < 4.5 LPA",
                category="All", state="All India", field="All",
                income_limit=450000, min_percentage=80.0,
                official_link="https://scholarships.gov.in",
                description="Merit-based central sector scholarship for college students.",
                source="NSP"
            ),
            Scholarship(
                name="Maulana Azad National Fellowship (MANF)",
                provider="UGC",
                amount="₹31,000/month (JRF)",
                deadline=datetime(2026, 3, 31),
                eligibility="Minority community, pursuing M.Phil/PhD",
                category="Minority", state="All India", field="Research",
                income_limit=None, min_percentage=55.0,
                official_link="https://manf.ugc.ac.in",
                description="Fellowship for minority community students doing research.",
                source="UGC"
            ),
            Scholarship(
                name="Begum Hazrat Mahal National Scholarship",
                provider="Maulana Azad Education Foundation",
                amount="₹5,000 - ₹12,000/year",
                deadline=datetime(2026, 9, 30),
                eligibility="Muslim/Christian/Sikh/Buddhist/Parsi/Jain girls, income < 2 LPA, 50%+",
                category="Minority", state="All India", field="All",
                income_limit=200000, min_percentage=50.0,
                official_link="https://maef.nic.in",
                description="For minority community girl students.",
                source="MAEF", gender="Female"
            ),
            Scholarship(
                name="Swami Vivekananda Merit Cum Means Scholarship (West Bengal)",
                provider="Govt of West Bengal",
                amount="₹60,000/year",
                deadline=datetime(2026, 10, 15),
                eligibility="WB domicile, income < 2.5 LPA, 75%+ in last board exam",
                category="All", state="West Bengal", field="All",
                income_limit=250000, min_percentage=75.0,
                official_link="https://svmcm.wbhed.gov.in",
                description="One of India's richest state scholarships.",
                source="WB Govt"
            ),
            Scholarship(
                name="Dhirubhai Ambani Scholarship (Reliance Foundation)",
                provider="Reliance Foundation",
                amount="₹2,00,000/year",
                deadline=datetime(2026, 7, 31),
                eligibility="12th passed, pursuing UG in STEM or Commerce, income < 6 LPA",
                category="All", state="All India", field="STEM/Commerce",
                income_limit=600000, min_percentage=60.0,
                official_link="https://www.reliancefoundation.org/scholarships",
                description="One of India's most prestigious private scholarships.",
                source="Reliance"
            ),
            Scholarship(
                name="N R Narayana Murthy Scholarship (Infosys Foundation)",
                provider="Infosys Foundation",
                amount="₹1,00,000/year",
                deadline=datetime(2026, 8, 15),
                eligibility="Meritorious students in need, 65%+, pursuing Engineering/CS",
                category="All", state="All India", field="Engineering",
                income_limit=300000, min_percentage=65.0,
                official_link="https://www.infosys.org",
                description="Merit-cum-means scholarship by Infosys Foundation.",
                source="Infosys"
            ),
            Scholarship(
                name="Sitaram Jindal Foundation Scholarship",
                provider="Sitaram Jindal Foundation",
                amount="₹500 - ₹2,000/month",
                deadline=datetime(2026, 9, 30),
                eligibility="All categories, meritorious & needy, studying in PUC/College",
                category="All", state="All India", field="All",
                income_limit=250000, min_percentage=60.0,
                official_link="https://sjf.co.in",
                description="Wide-reaching scholarship supporting students across India.",
                source="SJF"
            ),
            Scholarship(
                name="LIC Golden Jubilee Scholarship",
                provider="LIC of India",
                amount="₹20,000/year",
                deadline=datetime(2026, 8, 31),
                eligibility="Students from low-income families, 60%+ in 12th, income < 2 LPA",
                category="All", state="All India", field="All",
                income_limit=200000, min_percentage=60.0,
                official_link="https://licgolden.com",
                description="LIC scholarship for meritorious students from economically weak sections.",
                source="LIC"
            ),
        ]

        for s in scholarships:
            db.add(s)
        db.commit()
        print(f"✅ Seeded {len(scholarships)} scholarships")

    except Exception as e:
        print(f"❌ Seeding failed: {e}")
        db.rollback()
    finally:
        db.close()
