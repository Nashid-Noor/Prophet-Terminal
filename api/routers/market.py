from fastapi import APIRouter
from datetime import datetime
import pytz
import pandas as pd
import pandas_market_calendars as mcal

router = APIRouter(prefix="/api/market", tags=["market"])

@router.get("/status")
def get_market_status():
    """
    Check if markets (NYSE, NSE) are currently open.
    """
    exchanges = ["NYSE", "NSE"]
    results = []
    
    now_utc = datetime.now(pytz.UTC)

    for exchange_name in exchanges:
        try:
            calendar = mcal.get_calendar(exchange_name)
            
            # Check if market is open right now
            schedule = calendar.schedule(start_date=now_utc, end_date=now_utc)
            if schedule.empty:
                is_open = False
            else:
                is_open = calendar.open_at_time(schedule, timestamp=now_utc)
        except Exception:
             # Fallback if exchange not found or other error
            is_open = False
            
        results.append({
            "exchange": exchange_name,
            "isOpen": is_open,
            "timestamp": now_utc.isoformat()
        })
    
    return results

@router.get("/indices")
def get_market_indices():
    """
    Fetch live market indices (SPX, NDX, Nifty 50).
    """
    import yfinance as yf
    
    symbols = {
        "SPX": "^GSPC",
        "NDX": "^NDX",
        "NIFTY": "^NSEI"
    }
    
    data = []
    
    # Fetch all at once
    tickers = yf.Tickers(" ".join(symbols.values()))
    
    for label, symbol in symbols.items():
        try:
            ticker = tickers.tickers[symbol]
            info = ticker.info
            
            # Helper to safely get price and prev_close
            price = info.get("regularMarketPrice")
            previous_close = info.get("regularMarketPreviousClose")
            
            if price is None:
                # Fallback to recent history
                hist = ticker.history(period="1d")
                if not hist.empty:
                    price = hist["Close"].iloc[-1]
                    if len(hist) > 1:
                        previous_close = hist["Close"].iloc[-2]
            
            # Sanitize inputs
            if price is not None and (pd.isna(price) or pd.isnull(price)):
                price = None
            if previous_close is not None and (pd.isna(previous_close) or pd.isnull(previous_close)):
                previous_close = None

            change_percent = 0.0
            if price and previous_close:
                change_percent = ((price - previous_close) / previous_close) * 100
                
            # Sanitize outputs for JSON
            if pd.isna(change_percent) or pd.isnull(change_percent):
                change_percent = 0.0
                
            data.append({
                "label": label,
                "value": f"{price:,.2f}" if price else "N/A",
                "change": f"{change_percent:+.2f}%",
                "up": change_percent >= 0
            })
            
        except Exception:
            data.append({
                "label": label,
                "value": "Error",
                "change": "0.0%",
                "up": True
            })
            
    return data
