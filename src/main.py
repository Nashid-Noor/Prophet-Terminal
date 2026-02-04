"""Main entry point for portfolio optimisation."""

from __future__ import annotations

import logging
import sys
from typing import Any

import pandas as pd

from src.database import save_results_to_supabase
from src.extractor import extract_data
from src.model import ProphetModel
from src.optimiser import optimize_portfolio_mean_variance
from src.processor import append_predictions, collect_recent_prices, preprocess_data
from src.settings import END_DATE, PORTFOLIO_TICKERS, START_DATE

# Set up logging
logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")
logger = logging.getLogger(__name__)


def run_optimisation(
    tickers: list[str],
    start_date: str = START_DATE,
    end_date: str = END_DATE,
    risk_aversion: float | None = None,
    min_allocation: float | None = None,
    max_allocation: float | None = None,
    prophet_params: dict | None = None,
) -> dict[str, Any]:
    """
    Run portfolio optimisation: pull data, predict, calculate allocation, and log result.

    Args:
        tickers: List of stock ticker symbols
        start_date: Start date for historical data
        end_date: End date for historical data
        risk_aversion: Optional override for risk aversion
        min_allocation: Optional override for min allocation
        max_allocation: Optional override for max allocation
        prophet_params: Optional override for Prophet params (seasonality)
    """

    as_of_date = pd.to_datetime(end_date).date()
    logger.info(f"Running optimization for {len(tickers)} tickers as of {as_of_date}")
    
    # Log config overrides
    if risk_aversion: logger.info(f"Override: Risk Aversion = {risk_aversion}")
    if min_allocation: logger.info(f"Override: Min Allocation = {min_allocation}")
    if prophet_params: logger.info(f"Override: Prophet Params = {prophet_params}")

    # -- Data Extraction & Prep --
    all_stock_data = extract_data(tickers, start_date=start_date, end_date=end_date)
    if not all_stock_data:
        logger.warning("No data extracted. Exiting.")
        return {}

    portfolio_data = preprocess_data(all_stock_data)

    # -- Forecasting (Prophet) --
    logger.info("Generating price forecasts...")
    model = ProphetModel()
    predictions, predicted_returns = model.predict_for_tickers(
        portfolio_data,
        prophet_params=prophet_params
    )

    # Capture recent history for context
    actual_prices_last_month = collect_recent_prices(portfolio_data)

    # Merge predictions for the optimizer
    predicted_data = append_predictions(portfolio_data, predictions, predicted_returns)

    # -- Optimization (Markowitz) --
    logger.info("Calculating optimal weights...")
    
    opt_kwargs = {}
    if risk_aversion is not None: opt_kwargs['risk_aversion'] = risk_aversion
    if min_allocation is not None: opt_kwargs['minimum_allocation'] = min_allocation
    if max_allocation is not None: opt_kwargs['maximum_allocation'] = max_allocation

    weights_dict = optimize_portfolio_mean_variance(predicted_data, **opt_kwargs)

    # -- Reporting --
    logger.info("--- Results ---")
    logger.info(f"Forecast Date: {as_of_date}")

    logger.info("Next Day Price Targets:")
    for ticker, price in predictions.items():
        logger.info(f"  {ticker:<5} ${price:.2f}")

    logger.info("Target Allocation:")
    for ticker, weight in weights_dict.items():
        if weight > 0.001: # Only log meaningful weights
            logger.info(f"  {ticker:<5} {weight * 100:.1f}%")

    return {
        "date": as_of_date,
        "predictions": predictions,
        "predicted_returns": predicted_returns,
        "actual_prices_last_month": actual_prices_last_month,
        "weights": weights_dict,
    }


def main() -> None:
    """Main CLI entry point - saves results to Supabase."""
    try:
        result = run_optimisation(tickers=PORTFOLIO_TICKERS)

        if not result:
            logger.error("Optimisation returned empty result")
            sys.exit(1)

        try:
            save_results_to_supabase(result)
            print("\nResults successfully saved to Supabase database")
        except Exception as db_error:
            logger.error(f"Failed to save to Supabase: {db_error}")
            print(f"\nWarning: Failed to save to Supabase: {db_error}")
            sys.exit(1)

    except Exception as e:
        logger.error(f"Error during optimisation: {e}")
        print(f"Error during optimisation: {e}", file=sys.stderr)
        import traceback

        traceback.print_exc()
        sys.exit(1)


if __name__ == "__main__":
    main()
