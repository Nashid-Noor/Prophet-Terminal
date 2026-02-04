from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="Portfolio Optimisation API")

# Configure CORS for Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with Vercel URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api/health")
def health_check():
    return {"status": "ok", "message": "API is running"}

# Import routers
# Import routers
from api.routers import optimization, historical, market, accuracy
app.include_router(optimization.router)
app.include_router(historical.router)
app.include_router(market.router)
app.include_router(accuracy.router)
