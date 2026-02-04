from __future__ import annotations

import numpy as np
import pandas as pd
from scipy.optimize import minimize

from src.settings import MAXIMUM_ALLOCATION, MINIMUM_ALLOCATION, RISK_AVERSION


def calculate_mean_variance(
    data_dict: dict[str, pd.DataFrame],
    lookback_days: int = 252,  # ~1 year of trading days
) -> tuple[pd.Series, pd.DataFrame]:
    """
    Computes the risk/return profile (mean returns & covariance matrix) for the portfolio.
    
    Defaults to a 1-year lookback (252 trading days) to capture recent market regimes 
    while smoothing out short-term noise.

    Args:
        data_dict: Map of Ticker -> DataFrame (must contain 'Returns' column).
        lookback_days: Trading days to include in the calculation (default: 252).

    Returns:
        (mean_returns, cov_matrix) tuple for Markowitz optimization.
    """
    # For each ticker, take the last N days
    filtered_data = {}
    for ticker, df in data_dict.items():
        # Take last N rows (most recent data)
        filtered_df = df.tail(lookback_days)
        if len(filtered_df) > 0:
            filtered_data[ticker] = filtered_df

    if not filtered_data:
        # Fallback: use all data if filtering leaves nothing
        filtered_data = data_dict

    # Build returns DataFrame from filtered data
    returns_df = pd.DataFrame({ticker: df["Returns"] for ticker, df in filtered_data.items()})

    mean_returns = returns_df.mean()
    cov_matrix = returns_df.cov()

    return mean_returns, cov_matrix


def optimize_portfolio_mean_variance(
    data_dict: dict[str, pd.DataFrame],
    minimum_allocation: float = MINIMUM_ALLOCATION,
    maximum_allocation: float = MAXIMUM_ALLOCATION,
    risk_aversion: float = RISK_AVERSION,
) -> dict[str, float]:
    """
    Solves the Mean-Variance Optimization problem to find optimal asset weights.
    
    Objective: Maximize (Returns - Risk_Penalty)
    Where Risk_Penalty = 0.5 * risk_aversion * Portfolio_Variance
    """
    mu, cov = calculate_mean_variance(data_dict)
    tickers = list(data_dict.keys())
    num_assets = len(tickers)

    # Maximize Utility: R - (λ/2) * σ²
    # We minimize the negative: -R + (λ/2) * σ²
    def objective(weights: np.ndarray) -> float:
        port_return = float(np.dot(weights, mu))
        port_var = float(np.dot(weights.T, np.dot(cov, weights)))
        return -(port_return - 0.5 * risk_aversion * port_var)

    # Fully invested constraint: sum(weights) = 1
    constraints = [{"type": "eq", "fun": lambda w: np.sum(w) - 1}]

    # Bounds: enforce minimum allocation per asset
    bounds = tuple((minimum_allocation, maximum_allocation) for _ in range(num_assets))

    # Initial guess: equal weights
    initial_weights = np.array([1 / num_assets] * num_assets)

    # Run optimizer
    result = minimize(
        objective, initial_weights, method="SLSQP", bounds=bounds, constraints=constraints
    )

    if not result.success:
        raise ValueError(f"Optimisation failed: {result.message}")

    # Build a typed dictionary of weights to satisfy static type checking
    weights: dict[str, float] = {
        ticker: float(weight) for ticker, weight in zip(tickers, result.x, strict=True)
    }
    return weights
