
import os
import sys

# Add root to python path to import settings
sys.path.append(os.getcwd())

from sqlalchemy import create_engine, text
from src.settings import SUPABASE_TABLE_NAME

# Use the encoded URL directly
DATABASE_URL = "postgresql://postgres:Shidhu%40160399@db.aytgydlqxowenvcpboji.supabase.co:5432/postgres"

def check_db():
    print(f"Connecting to {DATABASE_URL.split('@')[-1]}...")
    engine = create_engine(DATABASE_URL)
    
    with engine.connect() as conn:
        print("Connected.")
        
        # Check if table exists
        result = conn.execute(text(f"SELECT to_regclass('public.{SUPABASE_TABLE_NAME}')"))
        table_exists = result.scalar()
        print(f"Table '{SUPABASE_TABLE_NAME}' exists: {table_exists}")
        
        if table_exists:
            # Count rows
            result = conn.execute(text(f"SELECT COUNT(*) FROM {SUPABASE_TABLE_NAME}"))
            count = result.scalar()
            print(f"Row count: {count}")
            
            if count > 0:
                # Show sample
                result = conn.execute(text(f"SELECT * FROM {SUPABASE_TABLE_NAME} LIMIT 1"))
                row = result.fetchone()
                print(f"Sample row: {row}")
        else:
            print("Table does not exist! This explains why save works (SQLAlchemy creates it?) but read fails?")

if __name__ == "__main__":
    check_db()
