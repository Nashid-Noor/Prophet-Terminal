import sys
import os
import logging

# Add the project root to the python path
sys.path.append(os.getcwd())

# Configure logging
logging.basicConfig(level=logging.INFO)

from src.extractor import extract_data

def test_extraction():
    # Test valid US stock
    print("\n--- Testing US Stock (AAPL) ---")
    data_us = extract_data(["AAPL"], start_date="2024-01-01")
    if "AAPL" in data_us:
        print("SUCCESS: Found AAPL data.")
        print(data_us["AAPL"].head(1))
    else:
        print("FAILURE: Could not find AAPL data.")

    # Test Indian stock without suffix
    print("\n--- Testing Indian Stock without suffix (RELIANCE) ---")
    data_in = extract_data(["RELIANCE"], start_date="2024-01-01")
    if "RELIANCE" in data_in:
        print("SUCCESS: Found RELIANCE data (auto-resolved).")
        print(data_in["RELIANCE"].head(1))
    else:
        print("FAILURE: Could not find RELIANCE data.")

if __name__ == "__main__":
    test_extraction()
