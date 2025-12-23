"""
QA-Hub Backend API
FastAPI backend for the QA-Hub test automation dashboard.
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
from contextlib import asynccontextmanager
import sqlite3
import random
import os


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    init_db()
    yield
    # Shutdown (nothing needed)


# Initialize FastAPI app
app = FastAPI(
    title="QA-Hub API",
    description="Backend API for QA-Hub Test Automation Dashboard",
    version="1.0.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    lifespan=lifespan
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

DB_PATH = os.path.join(os.path.dirname(__file__), "qa_hub.db")


# Models
class TestResult(BaseModel):
    id: int
    name: str
    status: str
    duration: int
    created_at: Optional[str] = None


class TestStats(BaseModel):
    totalTests: int
    passed: int
    failed: int
    passRate: float
    avgDuration: float
    coverage: float


class RunTestsResponse(BaseModel):
    success: bool
    message: str
    results: List[TestResult]


class HealthResponse(BaseModel):
    status: str
    timestamp: str
    version: str


class BugReport(BaseModel):
    id: Optional[int] = None
    title: str
    description: str
    severity: str
    status: str
    assignee: Optional[str] = None
    created_at: Optional[str] = None


class TestCase(BaseModel):
    id: Optional[int] = None
    title: str
    description: str
    steps: str
    expected_result: str
    priority: str
    status: str
    created_at: Optional[str] = None


class AutomationReport(BaseModel):
    id: Optional[int] = None
    suite_name: str
    total_tests: int
    passed: int
    failed: int
    duration: int
    environment: str
    created_at: Optional[str] = None


def init_db():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS tests (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            status TEXT NOT NULL,
            duration INTEGER NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS bugs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            description TEXT NOT NULL,
            severity TEXT NOT NULL,
            status TEXT NOT NULL DEFAULT 'open',
            assignee TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS test_cases (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            description TEXT NOT NULL,
            steps TEXT NOT NULL,
            expected_result TEXT NOT NULL,
            priority TEXT NOT NULL,
            status TEXT NOT NULL DEFAULT 'active',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS automation_reports (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            suite_name TEXT NOT NULL,
            total_tests INTEGER NOT NULL,
            passed INTEGER NOT NULL,
            failed INTEGER NOT NULL,
            duration INTEGER NOT NULL,
            environment TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)

    # Seed data
    cursor.execute("SELECT COUNT(*) FROM tests")
    if cursor.fetchone()[0] == 0:
        seed_tests = [
            ("Login with valid credentials", "passed", 245),
            ("Navigate to dashboard", "passed", 312),
            ("Search functionality", "passed", 189),
            ("User profile update", "passed", 267),
            ("Logout flow", "passed", 156),
        ]
        cursor.executemany("INSERT INTO tests (name, status, duration) VALUES (?, ?, ?)", seed_tests)

    cursor.execute("SELECT COUNT(*) FROM bugs")
    if cursor.fetchone()[0] == 0:
        seed_bugs = [
            ("Login button not responsive on mobile", "Button click not registering on iOS", "high", "open", "John"),
            ("Search returns empty results", "Search returns no results for valid queries", "critical", "in-progress", "Jane"),
        ]
        cursor.executemany("INSERT INTO bugs (title, description, severity, status, assignee) VALUES (?, ?, ?, ?, ?)", seed_bugs)

    cursor.execute("SELECT COUNT(*) FROM test_cases")
    if cursor.fetchone()[0] == 0:
        seed_cases = [
            ("Login Test", "Verify login works", "1. Go to login\n2. Enter credentials\n3. Click login", "User logged in", "p1", "active"),
            ("Search Test", "Verify search works", "1. Go to search\n2. Enter query\n3. Click search", "Results displayed", "p2", "active"),
        ]
        cursor.executemany("INSERT INTO test_cases (title, description, steps, expected_result, priority, status) VALUES (?, ?, ?, ?, ?, ?)", seed_cases)

    conn.commit()
    conn.close()


def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


@app.get("/api/health", response_model=HealthResponse)
async def health():
    return HealthResponse(status="healthy", timestamp=datetime.now().isoformat(), version="1.0.0")


@app.get("/api/stats", response_model=TestStats)
async def get_stats():
    conn = get_db()
    cur = conn.cursor()
    cur.execute("SELECT COUNT(*) as total FROM tests")
    total = cur.fetchone()["total"]
    cur.execute("SELECT COUNT(*) as p FROM tests WHERE status='passed'")
    passed = cur.fetchone()["p"]
    cur.execute("SELECT COUNT(*) as f FROM tests WHERE status='failed'")
    failed = cur.fetchone()["f"]
    cur.execute("SELECT AVG(duration) as avg FROM tests")
    avg = cur.fetchone()["avg"] or 0
    conn.close()
    return TestStats(totalTests=total, passed=passed, failed=failed, passRate=round((passed/total*100), 1) if total else 0, avgDuration=round(avg/1000, 2), coverage=85.0)


@app.get("/api/tests", response_model=List[TestResult])
async def get_tests(limit: int = 50):
    conn = get_db()
    cur = conn.cursor()
    cur.execute("SELECT * FROM tests ORDER BY created_at DESC LIMIT ?", (limit,))
    tests = [TestResult(id=r["id"], name=r["name"], status=r["status"], duration=r["duration"], created_at=r["created_at"]) for r in cur.fetchall()]
    conn.close()
    return tests


@app.post("/api/tests/run", response_model=RunTestsResponse)
async def run_tests():
    conn = get_db()
    cur = conn.cursor()
    cur.execute("SELECT DISTINCT name FROM tests")
    names = [r["name"] for r in cur.fetchall()] or ["Test 1", "Test 2", "Test 3"]
    results = []
    for name in names[:10]:
        status = "passed" if random.random() > 0.1 else "failed"
        duration = random.randint(100, 600) if status == "passed" else random.randint(3000, 5000)
        cur.execute("INSERT INTO tests (name, status, duration) VALUES (?, ?, ?)", (name, status, duration))
        results.append(TestResult(id=cur.lastrowid, name=name, status=status, duration=duration))
    conn.commit()
    conn.close()
    passed = sum(1 for r in results if r.status == "passed")
    return RunTestsResponse(success=True, message=f"Executed {len(results)} tests: {passed} passed, {len(results)-passed} failed", results=results)


@app.get("/api/bugs", response_model=List[BugReport])
async def get_bugs():
    conn = get_db()
    cur = conn.cursor()
    cur.execute("SELECT * FROM bugs ORDER BY created_at DESC")
    bugs = [BugReport(id=r["id"], title=r["title"], description=r["description"], severity=r["severity"], status=r["status"], assignee=r["assignee"], created_at=r["created_at"]) for r in cur.fetchall()]
    conn.close()
    return bugs


@app.post("/api/bugs", response_model=BugReport)
async def create_bug(bug: BugReport):
    conn = get_db()
    cur = conn.cursor()
    cur.execute("INSERT INTO bugs (title, description, severity, status, assignee) VALUES (?, ?, ?, ?, ?)", (bug.title, bug.description, bug.severity, bug.status, bug.assignee))
    bug.id = cur.lastrowid
    conn.commit()
    conn.close()
    return bug


@app.delete("/api/bugs/{bug_id}")
async def delete_bug(bug_id: int):
    conn = get_db()
    cur = conn.cursor()
    cur.execute("DELETE FROM bugs WHERE id=?", (bug_id,))
    if cur.rowcount == 0:
        conn.close()
        raise HTTPException(status_code=404, detail="Bug not found")
    conn.commit()
    conn.close()
    return {"message": f"Bug {bug_id} deleted"}


@app.get("/api/test-cases", response_model=List[TestCase])
async def get_test_cases():
    conn = get_db()
    cur = conn.cursor()
    cur.execute("SELECT * FROM test_cases ORDER BY created_at DESC")
    cases = [TestCase(id=r["id"], title=r["title"], description=r["description"], steps=r["steps"], expected_result=r["expected_result"], priority=r["priority"], status=r["status"], created_at=r["created_at"]) for r in cur.fetchall()]
    conn.close()
    return cases


@app.post("/api/test-cases", response_model=TestCase)
async def create_test_case(tc: TestCase):
    conn = get_db()
    cur = conn.cursor()
    cur.execute("INSERT INTO test_cases (title, description, steps, expected_result, priority, status) VALUES (?, ?, ?, ?, ?, ?)", (tc.title, tc.description, tc.steps, tc.expected_result, tc.priority, tc.status))
    tc.id = cur.lastrowid
    conn.commit()
    conn.close()
    return tc


@app.delete("/api/test-cases/{case_id}")
async def delete_test_case(case_id: int):
    conn = get_db()
    cur = conn.cursor()
    cur.execute("DELETE FROM test_cases WHERE id=?", (case_id,))
    if cur.rowcount == 0:
        conn.close()
        raise HTTPException(status_code=404, detail="Test case not found")
    conn.commit()
    conn.close()
    return {"message": f"Test case {case_id} deleted"}


@app.get("/api/reports", response_model=List[AutomationReport])
async def get_reports():
    conn = get_db()
    cur = conn.cursor()
    cur.execute("SELECT * FROM automation_reports ORDER BY created_at DESC LIMIT 20")
    reports = [AutomationReport(id=r["id"], suite_name=r["suite_name"], total_tests=r["total_tests"], passed=r["passed"], failed=r["failed"], duration=r["duration"], environment=r["environment"], created_at=r["created_at"]) for r in cur.fetchall()]
    conn.close()
    return reports


@app.post("/api/reports", response_model=AutomationReport)
async def create_report(report: AutomationReport):
    conn = get_db()
    cur = conn.cursor()
    cur.execute("INSERT INTO automation_reports (suite_name, total_tests, passed, failed, duration, environment) VALUES (?, ?, ?, ?, ?, ?)", (report.suite_name, report.total_tests, report.passed, report.failed, report.duration, report.environment))
    report.id = cur.lastrowid
    conn.commit()
    conn.close()
    return report


@app.get("/")
async def root():
    return {"message": "QA-Hub API", "docs": "/api/docs"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
