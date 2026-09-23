import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app

@pytest.mark.asyncio
async def test_health_endpoint():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        response = await ac.get("/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"
        assert "HackX" in data["service"]

@pytest.mark.asyncio
async def test_auth_register_and_login_organizer():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        # Register organizer
        reg_payload = {
            "email": "lead.organizer@hackx.io",
            "password": "SecurePassword123!",
            "full_name": "Dr. Sarah Mitchell",
            "role": "ORGANIZER",
            "organization": "National Tech Council"
        }
        reg_res = await ac.post("/api/auth/register", json=reg_payload)
        assert reg_res.status_code == 200
        reg_data = reg_res.json()
        assert "access_token" in reg_data
        assert reg_data["user"]["role"] == "ORGANIZER"
        assert reg_data["user"]["email"] == "lead.organizer@hackx.io"

        # Login
        login_res = await ac.post("/api/auth/login", json={
            "email": "lead.organizer@hackx.io",
            "password": "SecurePassword123!"
        })
        assert login_res.status_code == 200
        token = login_res.json()["access_token"]

        # Verify /api/auth/me
        me_res = await ac.get("/api/auth/me", headers={"Authorization": f"Bearer {token}"})
        assert me_res.status_code == 200
        assert me_res.json()["full_name"] == "Dr. Sarah Mitchell"

@pytest.mark.asyncio
async def test_auth_register_and_login_judge():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        reg_payload = {
            "email": "principal.judge@hackx.io",
            "password": "JudgeSecretKey456!",
            "full_name": "Elena Rostova",
            "role": "JUDGE",
            "organization": "AI Systems Institute"
        }
        reg_res = await ac.post("/api/auth/register", json=reg_payload)
        assert reg_res.status_code == 200
        assert reg_res.json()["user"]["role"] == "JUDGE"

        login_res = await ac.post("/api/auth/login", json={
            "email": "principal.judge@hackx.io",
            "password": "JudgeSecretKey456!"
        })
        assert login_res.status_code == 200
        assert "access_token" in login_res.json()

@pytest.mark.asyncio
async def test_auth_register_and_login_participant():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        reg_payload = {
            "email": "dev.participant@hackx.io",
            "password": "HackerPassword789!",
            "full_name": "Alex Mercer",
            "role": "PARTICIPANT",
            "organization": "Open Innovation Labs"
        }
        reg_res = await ac.post("/api/auth/register", json=reg_payload)
        assert reg_res.status_code == 200
        assert reg_res.json()["user"]["role"] == "PARTICIPANT"

        login_res = await ac.post("/api/auth/login", json={
            "email": "dev.participant@hackx.io",
            "password": "HackerPassword789!"
        })
        assert login_res.status_code == 200

@pytest.mark.asyncio
async def test_duplicate_registration_rejected():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        reg_payload = {
            "email": "lead.organizer@hackx.io",
            "password": "AnotherPassword123!",
            "full_name": "Duplicate User",
            "role": "ORGANIZER"
        }
        res = await ac.post("/api/auth/register", json=reg_payload)
        assert res.status_code == 400
        assert "already exists" in res.json()["detail"]

@pytest.mark.asyncio
async def test_invalid_login_rejected():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        res = await ac.post("/api/auth/login", json={
            "email": "lead.organizer@hackx.io",
            "password": "WrongPassword!"
        })
        assert res.status_code == 401
        assert "Invalid email or password" in res.json()["detail"]

@pytest.mark.asyncio
async def test_integrity_overview_clean_state():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        res = await ac.get("/api/integrity")
        assert res.status_code == 200
        data = res.json()
        assert data["total_evaluations"] == 0
        assert data["verified_count"] == 0
        assert data["tampered_count"] == 0
        assert data["system_status"] == "ALL_VERIFIED"
        assert data["evaluations"] == []

@pytest.mark.asyncio
async def test_organizer_can_create_hackathon():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        # Login organizer
        login_res = await ac.post("/api/auth/login", json={
            "email": "lead.organizer@hackx.io",
            "password": "SecurePassword123!"
        })
        token = login_res.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        # Create hackathon
        create_res = await ac.post("/api/hackathons", json={
            "title": "National AI Hackathon 2026",
            "tagline": "Building Trustworthy Autonomous Agents",
            "description": "Premiere competitive engineering hackathon.",
            "status": "ACTIVE"
        }, headers=headers)
        assert create_res.status_code == 200
        hackathon = create_res.json()
        assert hackathon["title"] == "National AI Hackathon 2026"
        assert hackathon["status"] == "ACTIVE"

        # List hackathons
        list_res = await ac.get("/api/hackathons")
        assert list_res.status_code == 200
        hackathons = list_res.json()
        assert len(hackathons) >= 1
        assert any(h["id"] == hackathon["id"] for h in hackathons)

@pytest.mark.asyncio
async def test_participant_forbidden_from_creating_hackathon():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        login_res = await ac.post("/api/auth/login", json={
            "email": "dev.participant@hackx.io",
            "password": "HackerPassword789!"
        })
        token = login_res.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        create_res = await ac.post("/api/hackathons", json={
            "title": "Unauthorized Hackathon",
            "tagline": "Should fail",
            "status": "ACTIVE"
        }, headers=headers)
        assert create_res.status_code == 403
