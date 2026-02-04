from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from typing import List, Any
import json

from src.database import get_db, OptimizationResult

router = APIRouter(prefix="/api/historical", tags=["historical"])

@router.get("/latest")
def get_latest_results(db: Session = Depends(get_db)):
    """
    Get the most recent optimization results.
    """
    # Find the latest date
    latest_date = db.query(OptimizationResult.as_of_date)\
        .order_by(OptimizationResult.as_of_date.desc())\
        .first()
        
    if not latest_date:
        return {"message": "No data found"}
        
    results = db.query(OptimizationResult)\
        .filter(OptimizationResult.as_of_date == latest_date[0])\
        .all()
        
    return parse_results(results)

@router.get("/all")
def get_all_results(limit: int = 100, db: Session = Depends(get_db)):
    """
    Get historical results.
    """
    results = db.query(OptimizationResult)\
        .order_by(OptimizationResult.as_of_date.desc())\
        .limit(limit)\
        .all()
        
    return parse_results(results)

def parse_results(results: List[OptimizationResult]):
    """Helper to format DB results."""
    data = []
    for r in results:
        data.append({
            "ticker": r.ticker,
            "date": r.as_of_date,
            "predicted_price": r.predicted_price,
            "predicted_return": r.predicted_return,
            "weight": r.portfolio_weight,
            "actual_history": json.loads(r.actual_prices_last_month) if r.actual_prices_last_month else []
        })
    return data
