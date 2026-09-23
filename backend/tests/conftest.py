import os
import sys

# Ensure backend directory is in sys.path
backend_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

# Route tests to an isolated test SQLite DB
test_db_file = os.path.join(backend_dir, "test_hackjudge.db")
test_db_path = test_db_file.replace("\\", "/")
os.environ["DATABASE_URL"] = f"sqlite+aiosqlite:///{test_db_path}"

def clean_test_sqlite():
    if os.path.exists(test_db_file):
        try:
            os.remove(test_db_file)
        except Exception:
            pass

def pytest_sessionstart(session):
    clean_test_sqlite()
    from sqlalchemy import create_engine
    from app.database import Base
    # Import all models to register them on Base.metadata
    from app.models.user import User
    from app.models.hackathon import Hackathon
    from app.models.rubric import Rubric, RubricCategory
    from app.models.team import Team, TeamMember
    from app.models.submission import Submission
    from app.models.evaluation import Evaluation
    from app.models.claim import Claim
    from app.models.blockchain_record import BlockchainRecord
    from app.models.audit_log import AuditLog

    sync_engine = create_engine(f"sqlite:///{test_db_path}")
    Base.metadata.create_all(bind=sync_engine)
    sync_engine.dispose()

def pytest_sessionfinish(session, exitstatus):
    clean_test_sqlite()
