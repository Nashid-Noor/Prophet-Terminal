from api.main import app

# Vercel expects the app instance to be exposed
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
