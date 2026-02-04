from fastapi import APIRouter, HTTPException, BackgroundTasks
from pydantic import BaseModel
from typing import List, Optional
import logging

from src.main import run_optimisation
from src.settings import PORTFOLIO_TICKERS, START_DATE, END_DATE

router = APIRouter(prefix="/api/optimization", tags=["optimization"])
logger = logging.getLogger(__name__)

class ProphetParams(BaseModel):
    yearly_seasonality: Optional[bool] = None
    weekly_seasonality: Optional[bool] = None
    daily_seasonality: Optional[bool] = None

class OptimizationRequest(BaseModel):
    tickers: List[str] = PORTFOLIO_TICKERS
    start_date: str = START_DATE
    end_date: str = END_DATE
    risk_aversion: Optional[float] = None
    min_allocation: Optional[float] = None
    max_allocation: Optional[float] = None
    prophet_params: Optional[ProphetParams] = None

class OptimizationResponse(BaseModel):
    status: str
    message: str
    data: Optional[dict] = None

@router.post("/run", response_model=OptimizationResponse)
async def trigger_optimization(request: OptimizationRequest, background_tasks: BackgroundTasks):
    """
    Trigger the portfolio optimization process.
    """
    try:
        # Convert Pydantic model to dict for prophet_params if present
        prophet_params_dict = None
        if request.prophet_params:
            prophet_params_dict = request.prophet_params.dict(exclude_unset=True)

        result = run_optimisation(
            tickers=request.tickers,
            start_date=request.start_date,
            end_date=request.end_date,
            risk_aversion=request.risk_aversion,
            min_allocation=request.min_allocation,
            max_allocation=request.max_allocation,
            prophet_params=prophet_params_dict
        )
        
        if not result:
            raise HTTPException(status_code=500, detail="Optimization failed to produce results")
            
        # Save results to database
        from src.database import save_results_to_db
        save_results_to_db(result)
        
        return {
            "status": "success",
            "message": "Optimization completed successfully",
            "data": {
                "date": result["date"],
                "weights": result["weights"]
            }
        }
        
    except Exception as e:
        logger.error(f"Optimization endpoint error: {e}")
        raise HTTPException(status_code=500, detail=str(e))
