import sys
import os

# Add the project root to the python path
sys.path.append(os.getcwd())

from src.database import init_db, get_db
from sqlalchemy import text

def check_connection():
    print("Attempting to initialize database...")
    try:
        init_db()
        print("Database initialized successfully.")
    except Exception as e:
        print(f"Failed to initialize database: {e}")
        return

    print("Attempting to get a session...")
    try:
        db_gen = get_db()
        db = next(db_gen)
        print("Session created successfully.")
        
        print("Executing a simple query...")
        try:
            result = db.execute(text("SELECT 1"))
            print(f"Query result: {result.scalar()}")
        except Exception as e:
             print(f"Query failed: {e}")
        finally:
            db.close()

    except Exception as e:
        print(f"Failed to get session: {e}")

if __name__ == "__main__":
    check_connection()
