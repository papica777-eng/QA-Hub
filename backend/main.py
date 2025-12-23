"""
QA-Hub Backend API
FastAPI backend for the QA-Hub test automation dashboard.
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
import sqlite3
import random
import os

# Initialize FastAPI app
app = FastAPI(
    title="QA-Hub API",
    description="Backend API for QA-Hub Test Automation Dashboard",
    version="1.0.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc"
)

# CORS middleware for frontend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Database path
DB_PATH = os.path.join(os.path.dirname(__file__), "qa_hub.db")


# Pydantic Models
class TestResult(BaseModel):
    id: int
    name: str
    status: str  # 'passed' or 'failed'
    duration: int  # milliseconds
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
    severity: str  # 'critical', 'high', 'medium', 'low'
    status: str  # 'open', 'in-progress', 'resolved', 'closed'
    assignee: Optional[str] = None
    created_at: Optional[str] = None


class TestCase(BaseModel):
    id: Optional[int] = None
    title: str
    description: str
    steps: str
    expected_result: str
    priority: str  # 'p1', 'p2', 'p3', 'p4'
    status: str  # 'active', 'deprecated'
    created_at: Optional[str] = None


class AutomationReport(BaseModel):
    id: Optional[int] = None
    suite_name: str
    total_tests: int
    passed: int
    failed: int
    duration: int  # milliseconds
    environment: str
    created_at: Optional[str] = None


# Database initialization
def init_db():
    """Initialize SQLite database with required tables."""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    # Create tests table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS tests (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            status TEXT NOT NULL,
            duration INTEGER NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)
    
    # Create stats table for historical data
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS stats (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            total_tests INTEGER,
            passed INTEGER,
            failed INTEGER,
            pass_rate REAL,
            avg_duration REAL,
            coverage REAL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)
    
    # Create bugs table
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

    # Create test_cases table
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

    # Create automation_reports table
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

    # Seed initial test data if empty
    cursor.execute("SELECT COUNT(*) FROM tests")
    if cursor.fetchone()[0] == 0:
        seed_tests = [
            ("Login with valid credentials", "passed", 245),
            ("Navigate to dashboard", "passed", 312),
            ("Search functionality", "passed", 189),
            ("User profile update", "passed", 267),
            ("Logout flow", "passed", 156),
            ("Password reset flow", "passed", 423),
            ("Registration form validation", "passed", 334),
            ("API authentication", "passed", 198),
            ("Session timeout handling", "passed", 512),
            ("Error page display", "passed", 145),
        ]
        cursor.executemany(
            "INSERT INTO tests (name, status, duration) VALUES (?, ?, ?)",
            seed_tests
        )

    # Seed bugs
    cursor.execute("SELECT COUNT(*) FROM bugs")
    if cursor.fetchone()[0] == 0:
        seed_bugs = [
            ("Login button not responsive on mobile", "Button click not registering on iOS devices", "high", "open", "John Doe"),
            ("Search returns empty results", "Search functionality returns no results for valid queries", "critical", "in-progress", "Jane Smith"),
            ("UI misalignment in profile page", "Profile picture overlaps with text content", "medium", "open", None),
        ]
        cursor.executemany(
            "INSERT INTO bugs (title, description, severity, status, assignee) VALUES (?, ?, ?, ?, ?)",
            seed_bugs
        )

    # Seed test cases
    cursor.execute("SELECT COUNT(*) FROM test_cases")
    if cursor.fetchone()[0] == 0:
        seed_cases = [
            ("Login with valid credentials", "Verify user can login with correct credentials", 
             "1. Navigate to login page\n2. Enter valid username\n3. Enter valid password\n4. Click login button",
             "User is successfully logged in and redirected to dashboard", "p1", "active"),
            ("Search functionality", "Verify search returns relevant results",
             "1. Navigate to search page\n2. Enter search query\n3. Click search button",
             "Relevant search results are displayed", "p2", "active"),
        ]
        cursor.executemany(
            "INSERT INTO test_cases (title, description, steps, expected_result, priority, status) VALUES (?, ?, ?, ?, ?, ?)",
            seed_cases
async def get_stats():
    """Get test statistics from the database."""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Get test counts
    cursor.execute("SELECT COUNT(*) as total FROM tests")
    total = cursor.fetchone()["total"]
    
    cursor.execute("SELECT COUNT(*) as passed FROM tests WHERE status = 'passed'")
    passed = cursor.fetchone()["passed"]
    
    cursor.execute("SELECT COUNT(*) as failed FROM tests WHERE status = 'failed'")
    failed = cursor.fetchone()["failed"]
    
    cursor.execute("SELECT AVG(duration) as avg_duration FROM tests")
    avg_duration_ms = cursor.fetchone()["avg_duration"] or 0
    
    conn.close()
    
    pass_rate = round((passed / total * 100), 1) if total > 0 else 0
    avg_duration = round(avg_duration_ms / 1000, 2)  # Convert to seconds
    coverage = 85.0  # Static for now, can be integrated with actual coverage tools
    
    return TestStats(
        totalTests=total,
        passed=passed,
        failed=failed,
        passRate=pass_rate,
        avgDuration=avg_duration,
        coverage=coverage
    )


@app.get("/api/tests", response_model=List[TestResult], tags=["Tests"])
async def get_tests(limit: int = 10):
    """Get list of test results."""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute(
        "SELECT id, name, status, duration, created_at FROM tests ORDER BY created_at DESC LIMIT ?",
        (limit,)
    )
    
    tests = []
    for row in cursor.fetchall():
        tests.append(TestResult(
            id=row["id"],
            name=row["name"],
            status=row["status"],
            duration=row["duration"],
            created_at=row["created_at"]
        ))
    
    conn.close()
    return tests


@app.post("/api/tests/run", response_model=RunTestsResponse, tags=["Tests"])
async def run_tests():
    """Execute tests and return results."""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Get all test names
    cursor.execute("SELECT DISTINCT name FROM tests")
    test_names = [row["name"] for row in cursor.fetchall()]
    
    if not test_names:
        test_names = [
            "Login with valid credentials",
            "Navigate to dashboard",
            "Search functionality",
            "User profile update",
            "Logout flow"
        ]
    
    # Simulate test execution with random results
    results = []
    for i, name in enumerate(test_names[:10]):  # Limit to 10 tests
        # 90% pass rate simulation
        status = "passed" if random.random() > 0.1 else "failed"
        duration = random.randint(100, 600) if status == "passed" else random.randint(3000, 5000)
        
        # Insert new test result
        cursor.execute(
            "INSERT INTO tests (name, status, duration) VALUES (?, ?, ?)",
            (name, status, duration)
        )
        
        results.append(TestResult(
            id=cursor.lastrowid,
            name=name,
            status=status,
            duration=duration
        ))
    
    conn.commit()
    conn.close()
    
    passed = sum(1 for r in results if r.status == "passed")
    
    return RunTestsResponse(
        success=True,
        message=f"Executed {len(results)} tests: {passed} passed, {len(results) - passed} failed",
        results=results
    )


@app.delete("/api/tests/{test_id}", tags=["Tests"])
async def delete_test(test_id: int):
    """Delete a test result by ID."""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute("DELETE FROM tests WHERE id = ?", (test_id,))
    
    if cursor.rowcount == 0:
        conn.close()
        raise HTTPException(status_code=404, detail="Test not found")
    
    conn.commit()
    conn.close()
    
    return {"message": f"Test {test_id} deleted successfully"}


@app.delete("/api/tests", tags=["Tests"])
async def clear_tests():
    """Clear all test results."""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute("DELETE FROM tests")
    deleted = cursor.rowcount
    
    conn.commit()
    conn.close()
    
    return {"message": f"Cleared {deleted} test results"}


# Bug Reports Endpoints
@app.get("/api/bugs", response_model=List[BugReport], tags=["Bugs"])
async def get_bugs():
    """Get all bug reports."""
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT * FROM bugs ORDER BY created_at DESC")
    bugs = []
    for row in cursor.fetchall():
        bugs.append(BugReport(
            id=row["id"],
            title=row["title"],
            description=row["description"],
            severity=row["severity"],
            status=row["status"],
            assignee=row["assignee"],
            created_at=row["created_at"]
        ))

    conn.close()
    return bugs


@app.post("/api/bugs", response_model=BugReport, tags=["Bugs"])
async def create_bug(bug: BugReport):
    """Create a new bug report."""
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute(
        "INSERT INTO bugs (title, description, severity, status, assignee) VALUES (?, ?, ?, ?, ?)",
        (bug.title, bug.description, bug.severity, bug.status, bug.assignee)
    )

    bug_id = cursor.lastrowid
    conn.commit()
    conn.close()

    bug.id = bug_id
    return bug


@app.put("/api/bugs/{bug_id}", response_model=BugReport, tags=["Bugs"])
async def update_bug(bug_id: int, bug: BugReport):
    """Update a bug report."""
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute(
        "UPDATE bugs SET title=?, description=?, severity=?, status=?, assignee=? WHERE id=?",
        (bug.title, bug.description, bug.severity, bug.status, bug.assignee, bug_id)
    )

    if cursor.rowcount == 0:
        conn.close()
        raise HTTPException(status_code=404, detail="Bug not found")

    conn.commit()
    conn.close()

    bug.id = bug_id
    return bug


@app.delete("/api/bugs/{bug_id}", tags=["Bugs"])
async def delete_bug(bug_id: int):
    """Delete a bug report."""
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("DELETE FROM bugs WHERE id = ?", (bug_id,))

    if cursor.rowcount == 0:
        conn.close()
        raise HTTPException(status_code=404, detail="Bug not found")

    conn.commit()
    conn.close()

    return {"message": f"Bug {bug_id} deleted successfully"}


# Test Cases Endpoints
@app.get("/api/test-cases", response_model=List[TestCase], tags=["Test Cases"])
async def get_test_cases():
    """Get all test cases."""
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT * FROM test_cases ORDER BY created_at DESC")
    cases = []
    for row in cursor.fetchall():
        cases.append(TestCase(
            id=row["id"],
            title=row["title"],
            description=row["description"],
            steps=row["steps"],
            expected_result=row["expected_result"],
            priority=row["priority"],
            status=row["status"],
            created_at=row["created_at"]
        ))

    conn.close()
    return cases


@app.post("/api/test-cases", response_model=TestCase, tags=["Test Cases"])
async def create_test_case(test_case: TestCase):
    """Create a new test case."""
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute(
        "INSERT INTO test_cases (title, description, steps, expected_result, priority, status) VALUES (?, ?, ?, ?, ?, ?)",
        (test_case.title, test_case.description, test_case.steps, test_case.expected_result, test_case.priority, test_case.status)
    )

    case_id = cursor.lastrowid
    conn.commit()
    conn.close()

    test_case.id = case_id
    return test_case


@app.delete("/api/test-cases/{case_id}", tags=["Test Cases"])
async def delete_test_case(case_id: int):
    """Delete a test case."""
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("DELETE FROM test_cases WHERE id = ?", (case_id,))

    if cursor.rowcount == 0:
        conn.close()
        raise HTTPException(status_code=404, detail="Test case not found")

    conn.commit()
    conn.close()

    return {"message": f"Test case {case_id} deleted successfully"}


# Automation Reports Endpoints
@app.get("/api/reports", response_model=List[AutomationReport], tags=["Reports"])
async def get_reports():
    """Get all automation reports."""
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT * FROM automation_reports ORDER BY created_at DESC LIMIT 20")
    reports = []
    for row in cursor.fetchall():
        reports.append(AutomationReport(
            id=row["id"],
            suite_name=row["suite_name"],
            total_tests=row["total_tests"],
            passed=row["passed"],
            failed=row["failed"],
            duration=row["duration"],
            environment=row["environment"],
            created_at=row["created_at"]
        ))

    conn.close()
    return reports


@app.post("/api/reports", response_model=AutomationReport, tags=["Reports"])
async def create_report(report: AutomationReport):
    """Create a new automation report."""
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute(
        "INSERT INTO automation_reports (suite_name, total_tests, passed, failed, duration, environment) VALUES (?, ?, ?, ?, ?, ?)",
        (report.suite_name, report.total_tests, report.passed, report.failed, report.duration, report.environment)
    )

    report_id = cursor.lastrowid
    conn.commit()
    conn.close()

    report.id = report_id
    return report
