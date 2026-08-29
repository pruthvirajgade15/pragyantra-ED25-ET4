"""
Comprehensive API test suite for ScholarshipHunter AI Backend.
Covers: Auth, Profile, Scholarships, Deadlines, Documents, Chat, Health.
Run with:  pytest backend/tests/test_api.py -v
"""
import os
import sys
import io
import pytest

# Ensure backend directory is on the path for imports
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from database.db import Base, get_db
from main import app

# ---------- TEST DATABASE SETUP ----------

TEST_DB_URL = "sqlite:///./test_scholarship.db"
engine = create_engine(TEST_DB_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()


app.dependency_overrides[get_db] = override_get_db
client = TestClient(app)


@pytest.fixture(scope="session", autouse=True)
def setup_database():
    """Create all tables once before tests, drop after."""
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)
    engine.dispose()
    # Clean up test db file
    try:
        if os.path.exists("test_scholarship.db"):
            os.remove("test_scholarship.db")
    except Exception:
        pass


# ---------- HELPERS ----------

def register_user(name="Test User", email="testuser@example.com", password="securePass123"):
    return client.post("/api/auth/register", json={
        "name": name,
        "email": email,
        "password": password,
        "language": "en"
    })


def login_user(email="testuser@example.com", password="securePass123"):
    return client.post("/api/auth/login", data={
        "username": email,
        "password": password,
    }, headers={"Content-Type": "application/x-www-form-urlencoded"})


def auth_headers(token):
    return {"Authorization": f"Bearer {token}"}


# ---------- AUTH TESTS ----------

class TestAuth:
    def test_health(self):
        res = client.get("/health")
        assert res.status_code == 200
        assert res.json()["status"] == "healthy"

    def test_register_success(self):
        res = register_user()
        assert res.status_code == 200
        data = res.json()
        assert "access_token" in data
        assert data["name"] == "Test User"
        assert data["token_type"] == "bearer"

    def test_register_duplicate_email(self):
        res = register_user()  # same email again
        assert res.status_code == 400
        assert "already registered" in res.json()["detail"].lower()

    def test_register_short_password(self):
        res = register_user(email="short@test.com", password="12345")
        assert res.status_code == 400
        assert "6 characters" in res.json()["detail"]

    def test_register_long_password(self):
        res = register_user(email="long@test.com", password="A" * 73)
        assert res.status_code == 400
        assert "72" in res.json()["detail"] or "too long" in res.json()["detail"].lower()

    def test_login_success(self):
        res = login_user()
        assert res.status_code == 200
        data = res.json()
        assert "access_token" in data
        assert data["name"] == "Test User"

    def test_login_wrong_password(self):
        res = login_user(password="wrongpassword")
        assert res.status_code == 401
        assert "invalid" in res.json()["detail"].lower()

    def test_login_nonexistent_email(self):
        res = login_user(email="nobody@nowhere.com")
        assert res.status_code == 401

    def test_me_authenticated(self):
        login_res = login_user()
        token = login_res.json()["access_token"]
        res = client.get("/api/auth/me", headers=auth_headers(token))
        assert res.status_code == 200
        assert res.json()["email"] == "testuser@example.com"

    def test_me_unauthenticated(self):
        res = client.get("/api/auth/me")
        assert res.status_code in [401, 403]

    def test_me_invalid_token(self):
        res = client.get("/api/auth/me", headers=auth_headers("invalid.token.here"))
        assert res.status_code == 401


# ---------- PROFILE TESTS ----------

class TestProfile:
    @pytest.fixture(autouse=True)
    def _get_token(self):
        res = login_user()
        self.token = res.json()["access_token"]

    def test_get_profile_empty(self):
        res = client.get("/api/profile", headers=auth_headers(self.token))
        # Profile may be None or empty object initially
        assert res.status_code == 200

    def test_save_profile(self):
        payload = {
            "full_name": "Test User",
            "annual_income": 200000.0,
            "percentage": 85.0,
            "category": "General",
            "state": "Maharashtra",
            "field_of_study": "Engineering",
            "gender": "Male",
            "dob": "2003-01-15",
            "religion": "Hindu",
            "disability": False,
            "is_minority": False,
            "current_year": 2,
            "college": "Test College",
            "phone": "9876543210"
        }
        res = client.post("/api/profile", json=payload, headers=auth_headers(self.token))
        assert res.status_code == 200
        assert "profile_id" in res.json()

    def test_get_profile_after_save(self):
        res = client.get("/api/profile", headers=auth_headers(self.token))
        assert res.status_code == 200
        data = res.json()
        assert data["full_name"] == "Test User"
        assert data["state"] == "Maharashtra"

    def test_update_profile(self):
        payload = {
            "full_name": "Test User Updated",
            "annual_income": 300000.0,
            "percentage": 90.0,
            "category": "OBC",
            "state": "Karnataka",
            "field_of_study": "Computer Science",
            "gender": "Male",
            "dob": "2003-01-15",
            "religion": "Hindu",
            "disability": False,
            "is_minority": False,
            "current_year": 3,
            "college": "Updated College",
            "phone": "1234567890"
        }
        res = client.post("/api/profile", json=payload, headers=auth_headers(self.token))
        assert res.status_code == 200

        res2 = client.get("/api/profile", headers=auth_headers(self.token))
        assert res2.json()["full_name"] == "Test User Updated"
        assert res2.json()["category"] == "OBC"

    def test_profile_unauthenticated(self):
        res = client.get("/api/profile")
        assert res.status_code in [401, 403]


# ---------- SCHOLARSHIPS TESTS ----------

class TestScholarships:
    @pytest.fixture(autouse=True)
    def _get_token(self):
        res = login_user()
        self.token = res.json()["access_token"]

    def test_list_scholarships_public(self):
        res = client.get("/api/scholarships")
        assert res.status_code == 200
        assert isinstance(res.json(), list)

    def test_list_scholarships_with_search(self):
        res = client.get("/api/scholarships", params={"search": "NSP"})
        assert res.status_code == 200

    def test_list_scholarships_with_category_filter(self):
        res = client.get("/api/scholarships", params={"category": "SC"})
        assert res.status_code == 200

    def test_list_scholarships_with_state_filter(self):
        res = client.get("/api/scholarships", params={"state": "Maharashtra"})
        assert res.status_code == 200

    def test_list_scholarships_with_field_filter(self):
        res = client.get("/api/scholarships", params={"field": "Engineering"})
        assert res.status_code == 200

    def test_list_scholarships_with_limit(self):
        res = client.get("/api/scholarships", params={"limit": 5})
        assert res.status_code == 200
        assert len(res.json()) <= 5

    def test_get_scholarship_not_found(self):
        res = client.get("/api/scholarships/99999")
        assert res.status_code == 404

    def test_save_scholarship(self):
        # Get first scholarship id
        listing = client.get("/api/scholarships")
        if listing.json():
            schol_id = listing.json()[0]["id"]
            res = client.post("/api/scholarships/save",
                              json={"scholarship_id": schol_id, "match_score": 85.0},
                              headers=auth_headers(self.token))
            assert res.status_code == 200
            assert "saved" in res.json()["message"].lower() or "already" in res.json()["message"].lower()

    def test_save_scholarship_duplicate(self):
        listing = client.get("/api/scholarships")
        if listing.json():
            schol_id = listing.json()[0]["id"]
            # Save again - should return "Already saved"
            res = client.post("/api/scholarships/save",
                              json={"scholarship_id": schol_id, "match_score": 85.0},
                              headers=auth_headers(self.token))
            assert res.status_code == 200
            assert "already" in res.json()["message"].lower()

    def test_get_saved_scholarships(self):
        res = client.get("/api/scholarships/saved", headers=auth_headers(self.token))
        assert res.status_code == 200
        assert isinstance(res.json(), list)

    def test_matched_scholarships(self):
        res = client.get("/api/scholarships/matched", headers=auth_headers(self.token))
        # May fail with 400 if profile not complete, or 200 with results
        assert res.status_code in [200, 400]


# ---------- DEADLINES TESTS ----------

class TestDeadlines:
    @pytest.fixture(autouse=True)
    def _get_token(self):
        res = login_user()
        self.token = res.json()["access_token"]

    def test_upcoming_deadlines(self):
        res = client.get("/api/deadlines/upcoming", headers=auth_headers(self.token))
        assert res.status_code == 200
        assert isinstance(res.json(), list)

    def test_deadline_summary(self):
        res = client.get("/api/deadlines/summary")
        assert res.status_code == 200
        data = res.json()
        assert "total_scholarships" in data
        assert "expiring_in_7_days" in data
        assert "expiring_in_30_days" in data

    def test_upcoming_deadline_fields(self):
        res = client.get("/api/deadlines/upcoming", headers=auth_headers(self.token))
        if res.json():
            item = res.json()[0]
            assert "name" in item
            assert "days_left" in item
            assert "urgency" in item
            assert item["days_left"] >= 0  # BUG-07: should not be negative


# ---------- DOCUMENTS TESTS ----------

class TestDocuments:
    @pytest.fixture(autouse=True)
    def _get_token(self):
        res = login_user()
        self.token = res.json()["access_token"]

    def test_list_documents_empty(self):
        res = client.get("/api/documents", headers=auth_headers(self.token))
        assert res.status_code == 200
        assert isinstance(res.json(), list)

    def test_upload_invalid_extension(self):
        file_content = b"some content"
        res = client.post("/api/documents/upload",
                          data={"doc_type": "Income Certificate"},
                          files={"file": ("test.txt", io.BytesIO(file_content), "text/plain")},
                          headers=auth_headers(self.token))
        assert res.status_code == 400
        assert "JPG" in res.json()["detail"] or "allowed" in res.json()["detail"].lower()

    def test_upload_valid_image(self):
        # Create a minimal valid JPEG (just the header bytes for test purposes)
        # FastAPI doesn't validate image contents, only extension
        fake_jpg = b'\xff\xd8\xff\xe0' + b'\x00' * 100
        res = client.post("/api/documents/upload",
                          data={"doc_type": "10th Marksheet"},
                          files={"file": ("test_doc.jpg", io.BytesIO(fake_jpg), "image/jpeg")},
                          headers=auth_headers(self.token))
        assert res.status_code == 200
        data = res.json()
        assert "id" in data
        assert data["doc_type"] == "10th Marksheet"

    def test_delete_document(self):
        # Upload then delete
        fake_jpg = b'\xff\xd8\xff\xe0' + b'\x00' * 50
        upload = client.post("/api/documents/upload",
                             data={"doc_type": "Caste Certificate"},
                             files={"file": ("del_test.jpg", io.BytesIO(fake_jpg), "image/jpeg")},
                             headers=auth_headers(self.token))
        if upload.status_code == 200:
            doc_id = upload.json()["id"]
            res = client.delete(f"/api/documents/{doc_id}", headers=auth_headers(self.token))
            assert res.status_code == 200
            assert "deleted" in res.json()["message"].lower()

    def test_auto_fill(self):
        res = client.post("/api/documents/auto-fill", headers=auth_headers(self.token))
        assert res.status_code == 200
        assert "auto_fill_data" in res.json()

    def test_documents_unauthenticated(self):
        res = client.get("/api/documents")
        assert res.status_code in [401, 403]


# ---------- RECOMMENDATIONS TESTS ----------

class TestRecommendations:
    @pytest.fixture(autouse=True)
    def _get_token(self):
        res = login_user()
        self.token = res.json()["access_token"]

    def test_prioritize_requires_profile(self):
        # Register a brand new user without a profile
        reg = register_user(name="No Profile", email="noprofile@test.com", password="test123456")
        token = reg.json()["access_token"]
        res = client.get("/api/recommendations/prioritize", headers=auth_headers(token))
        assert res.status_code == 400
        assert "profile" in res.json()["detail"].lower()


# ---------- CHAT TESTS ----------

class TestChat:
    @pytest.fixture(autouse=True)
    def _get_token(self):
        res = login_user()
        self.token = res.json()["access_token"]

    def test_chat_without_api_key(self):
        """Without GEMINI_API_KEY set, chat should return 500 or graceful error."""
        res = client.post("/api/chat/ask",
                          json={"message": "Hello", "history": []},
                          headers=auth_headers(self.token))
        # Either 500 (no API key) or 200 with fallback message
        assert res.status_code in [200, 500]

    def test_chat_unauthenticated(self):
        res = client.post("/api/chat/ask", json={"message": "Hello", "history": []})
        assert res.status_code in [401, 403]


# ---------- ESSAY TESTS ----------

class TestEssay:
    @pytest.fixture(autouse=True)
    def _get_token(self):
        res = login_user()
        self.token = res.json()["access_token"]

    def test_get_drafts(self):
        res = client.get("/api/essays/drafts", headers=auth_headers(self.token))
        assert res.status_code == 200
        assert isinstance(res.json(), list)

    def test_get_nonexistent_draft(self):
        res = client.get("/api/essays/drafts/99999", headers=auth_headers(self.token))
        assert res.status_code == 404

    def test_delete_nonexistent_draft(self):
        res = client.delete("/api/essays/drafts/99999", headers=auth_headers(self.token))
        assert res.status_code == 200  # endpoint returns 200 even if not found

    def test_essays_unauthenticated(self):
        res = client.get("/api/essays/drafts")
        assert res.status_code in [401, 403]
