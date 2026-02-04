import sys
import os
import logging
import uuid
from datetime import datetime

# Add the project root to the python path
sys.path.append(os.getcwd())

# Import AFTER path adjustment
from src.main import run_optimisation
from src.settings import PORTFOLIO_TICKERS
from src.database import save_results_to_db, init_db

# Configure logging to print to console
logging.basicConfig(level=logging.INFO)

print("Starting debug run...")
try:
    # Use a small subset to match previous run or just standard
    tickers = PORTFOLIO_TICKERS
    
    # Check if we can run optimization (we know we can from previous step, but let's do it again to get fresh result object)
    result = run_optimisation(tickers=tickers)
    
    if result:
        print("\nOptimization SUCCESS!")
        print("Attempting to save to DB...")
        try:
           save_results_to_db(result)
           print("Successfully saved to DB.")
        except Exception as e:
           print(f"FAILED to save to DB: {e}")
           import traceback
           traceback.print_exc()
    else:
        print("\nOptimization returned EMPTY result.")

except Exception as e:
    print(f"\nOptimization FAILED with error: {e}")
    import traceback
    traceback.print_exc()
