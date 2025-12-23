# QA-Hub Backend API

Python FastAPI backend for the QA-Hub Test Automation Dashboard.

## Quick Start

### Install Dependencies

```bash
pip install -r requirements.txt
```

### Run the Server

```bash
python main.py
```

Or with uvicorn directly:

```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### API Documentation

- Swagger UI: <http://localhost:8000/api/docs>
- ReDoc: <http://localhost:8000/api/redoc>

## API Endpoints

| Method | Endpoint | Description |
| ------ | -------- | ----------- |
| GET | `/api/health` | Health check |
| GET | `/api/stats` | Get test statistics |
| GET | `/api/tests` | Get test results |
| POST | `/api/tests/run` | Execute tests |
| DELETE | `/api/tests/{id}` | Delete a test |
| DELETE | `/api/tests` | Clear all tests |

## Database

Uses SQLite for persistent storage. Database file: `qa_hub.db`

## Environment

- Python 3.9+
- FastAPI
- SQLite3
