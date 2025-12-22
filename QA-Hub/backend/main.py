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
    
    conn.commit()
    conn.close()


def get_db_connection():
    """Get database connection."""
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


# API Routes
@app.on_event("startup")
async def startup_event():
    """Initialize database on startup."""
    init_db()


@app.get("/api/health", response_model=HealthResponse, tags=["Health"])
async def health_check():
    """Check API health status."""
    return HealthResponse(
        status="healthy",
        timestamp=datetime.now().isoformat(),
        version="1.0.0"
    )


@app.get("/api/stats", response_model=TestStats, tags=["Statistics"])
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


# Root redirect to docs
@app.get("/")
async def root():
    """Redirect to API documentation."""
    return {"message": "QA-Hub API", "docs": "/api/docs"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
