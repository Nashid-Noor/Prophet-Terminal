from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
import yfinance as yf
from datetime import date, timedelta
from typing import List, Dict, Any
import logging
import pandas as pd

from src.database import get_db, OptimizationResult
from src.settings import PORTFOLIO_TICKERS

router = APIRouter(prefix="/api/accuracy", tags=["accuracy"])
logger = logging.getLogger(__name__)

@router.get("/")
def get_accuracy_metrics(db: Session = Depends(get_db)):
    """
    Calculate accuracy metrics by comparing past predictions with actual market close prices.
    """
    today = date.today()
    
    # Get the most recent past prediction date
    past_dates = db.query(OptimizationResult.as_of_date)\
        .filter(OptimizationResult.as_of_date <= today)\
        .distinct()\
        .order_by(OptimizationResult.as_of_date.desc())\
        .limit(1)\
        .all()
        
    if not past_dates:
        return []

    target_date = past_dates[0][0]
    
    # Fetch predictions for the target date
    predictions_raw = db.query(OptimizationResult)\
        .filter(OptimizationResult.as_of_date == target_date)\
        .all()
        
    if not predictions_raw:
        return []

    # Deduplicate ticker predictions (use latest if multiple runs exist)
    predictions_map = {p.ticker: p for p in predictions_raw}
    predictions = list(predictions_map.values())

    logger.info(f"Calculating accuracy for {target_date} ({len(predictions)} tickers)")

    # Fetch actual market data
    start_d = target_date
    end_d = target_date + timedelta(days=1)
    tickers = [p.ticker for p in predictions]
    ticker_str = " ".join(tickers)
    
    actual_prices = {}
    
    try:
        data = yf.download(ticker_str, start=start_d, end=end_d, group_by='ticker', progress=False)
        
        if not data.empty:
            # Handle single ticker case (yfinance returns different structure)
            if len(tickers) == 1:
                val = data['Close'].iloc[0] if hasattr(data['Close'], 'iloc') else data['Close']
                if hasattr(val, 'item'): val = val.item()
                actual_prices[tickers[0]] = val
            else:
                for ticker in tickers:
                    try:
                        # Check if ticker exists in the MultiIndex columns
                        if ticker in data.columns.levels[0]:
                            val = data[ticker]['Close'].iloc[0]
                            if hasattr(val, 'item'): val = val.item()
                            actual_prices[ticker] = val
                    except Exception:
                        continue
                        
    except Exception as e:
        logger.error(f"Failed to fetch actual prices: {e}")
        return []

    # Compute accuracy scores
    metrics = []
    for p in predictions:
        actual = actual_prices.get(p.ticker)
        
        if actual and not (pd.isna(actual) or pd.isnull(actual)):
            error_pct = abs(p.predicted_price - actual) / actual
            accuracy = max(0.0, 100.0 * (1.0 - error_pct))
            
            if pd.isna(accuracy):
                accuracy = 0.0
            
            metrics.append({
                "ticker": p.ticker,
                "predicted_price": p.predicted_price,
                "actual_price": actual,
                "accuracy": accuracy,
                "date": target_date
            })

    metrics.sort(key=lambda x: x["ticker"])
    return metrics
