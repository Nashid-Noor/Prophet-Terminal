# Prophet Terminal

A portfolio optimization dashboard that uses Facebook Prophet for price forecasting and Mean-Variance Optimization (Markowitz) for asset allocation.

Built with **Next.js 14**, **FastAPI**, and **Supabase**.

## Setup

### Backend
1.  Install dependencies:
    ```bash
    pip install -r requirements.txt
    ```
2.  Set up env:
    ```bash
    cp .env.example .env
    # Add your SUPABASE_URL and SUPABASE_KEY
    ```
3.  Run server:
    ```bash
    uvicorn api.main:app --reload --port 8000
    ```

### Frontend
1.  Install dependencies:
    ```bash
    npm install
    ```
2.  Run dev server:
    ```bash
    npm run dev
    ```

## Architecture

-   **Forecasting**: Uses `prophet` to predict $T+1$ closing prices based on historical data. Handles weekly seasonality and holidays.
-   **Optimization**: Uses `scipy.optimize` to solve for weights that maximize the Sharpe Ratio, constrained by your risk aversion setting.
-   **Data**: Fetches live market data via `yfinance`.
