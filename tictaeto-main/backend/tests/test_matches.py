"""Backend tests for Tic Tac Toe API.

Covers /api/matches GET/POST/DELETE and the root /api/ endpoint.
"""
import os
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL")
if not BASE_URL:
    # fallback to frontend env file
    env_path = "/app/frontend/.env"
    if os.path.exists(env_path):
        with open(env_path) as f:
            for ln in f:
                if ln.startswith("REACT_APP_BACKEND_URL="):
                    BASE_URL = ln.split("=", 1)[1].strip()
                    break

BASE_URL = (BASE_URL or "").rstrip("/")
API = f"{BASE_URL}/api"


@pytest.fixture(scope="module")
def client():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    return s


@pytest.fixture(scope="module", autouse=True)
def cleanup_matches(client):
    # Clean any leftover state, then yield. Final cleanup after suite.
    try:
        client.delete(f"{API}/matches", timeout=10)
    except Exception:
        pass
    yield
    try:
        client.delete(f"{API}/matches", timeout=10)
    except Exception:
        pass


# ----- root -----
def test_root(client):
    r = client.get(f"{API}/", timeout=10)
    assert r.status_code == 200
    data = r.json()
    assert "message" in data


# ----- matches: list empty -----
def test_list_matches_empty(client):
    r = client.get(f"{API}/matches", timeout=10)
    assert r.status_code == 200
    assert isinstance(r.json(), list)
    assert r.json() == []


# ----- matches: create -----
def test_create_match_pvp_x_wins(client):
    payload = {
        "mode": "pvp",
        "player_x": "TEST_Alice",
        "player_o": "TEST_Bob",
        "winner": "X",
        "moves": 5,
    }
    r = client.post(f"{API}/matches", json=payload, timeout=10)
    assert r.status_code == 200, r.text
    data = r.json()
    assert data["mode"] == "pvp"
    assert data["player_x"] == "TEST_Alice"
    assert data["player_o"] == "TEST_Bob"
    assert data["winner"] == "X"
    assert data["moves"] == 5
    assert isinstance(data["id"], str) and len(data["id"]) > 0
    assert "timestamp" in data


def test_create_match_easy_o_wins(client):
    payload = {
        "mode": "easy",
        "player_x": "TEST_You",
        "player_o": "TEST_CPU",
        "winner": "O",
        "moves": 7,
    }
    r = client.post(f"{API}/matches", json=payload, timeout=10)
    assert r.status_code == 200
    data = r.json()
    assert data["mode"] == "easy"
    assert data["winner"] == "O"


def test_create_match_hard_draw(client):
    payload = {
        "mode": "hard",
        "player_x": "TEST_You",
        "player_o": "TEST_CPUHard",
        "winner": "DRAW",
        "moves": 9,
    }
    r = client.post(f"{API}/matches", json=payload, timeout=10)
    assert r.status_code == 200
    data = r.json()
    assert data["mode"] == "hard"
    assert data["winner"] == "DRAW"
    assert data["moves"] == 9


# ----- validation -----
def test_create_match_invalid_mode(client):
    r = client.post(
        f"{API}/matches",
        json={
            "mode": "tournament",
            "player_x": "A",
            "player_o": "B",
            "winner": "X",
            "moves": 5,
        },
        timeout=10,
    )
    assert r.status_code == 422


def test_create_match_invalid_winner(client):
    r = client.post(
        f"{API}/matches",
        json={
            "mode": "pvp",
            "player_x": "A",
            "player_o": "B",
            "winner": "Z",
            "moves": 5,
        },
        timeout=10,
    )
    assert r.status_code == 422


def test_create_match_missing_fields(client):
    r = client.post(f"{API}/matches", json={"mode": "pvp"}, timeout=10)
    assert r.status_code == 422


# ----- matches: list after inserts -----
def test_list_matches_after_inserts(client):
    r = client.get(f"{API}/matches", timeout=10)
    assert r.status_code == 200
    rows = r.json()
    assert isinstance(rows, list)
    # The 3 successful inserts should be present
    assert len(rows) >= 3
    # Ensure no Mongo _id leaks
    for row in rows:
        assert "_id" not in row
        assert "id" in row
        assert "timestamp" in row
        assert row["winner"] in ("X", "O", "DRAW")
        assert row["mode"] in ("pvp", "easy", "hard")
    # Sorted newest-first by timestamp (desc)
    timestamps = [row["timestamp"] for row in rows]
    assert timestamps == sorted(timestamps, reverse=True)


def test_list_matches_limit(client):
    r = client.get(f"{API}/matches?limit=2", timeout=10)
    assert r.status_code == 200
    rows = r.json()
    assert len(rows) <= 2


# ----- delete -----
def test_delete_clears_all_matches(client):
    r = client.delete(f"{API}/matches", timeout=10)
    assert r.status_code == 200
    data = r.json()
    assert "deleted" in data
    assert isinstance(data["deleted"], int)

    # verify list empty afterwards
    r2 = client.get(f"{API}/matches", timeout=10)
    assert r2.status_code == 200
    assert r2.json() == []
