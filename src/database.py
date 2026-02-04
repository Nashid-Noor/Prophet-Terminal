"""Database operations using SQLAlchemy."""

from __future__ import annotations

import json
import logging
from datetime import datetime, date
from typing import Any, Generator

from sqlalchemy import create_engine, Column, String, Float, Date, DateTime, Text, Integer
from sqlalchemy.orm import sessionmaker, declarative_base, Session
from sqlalchemy.dialects.postgresql import JSONB

from src.settings import DATABASE_URL, SUPABASE_TABLE_NAME

logger = logging.getLogger(__name__)

Base = declarative_base()

class OptimizationResult(Base):
    """SQLAlchemy model for portfolio optimization results."""
    __tablename__ = SUPABASE_TABLE_NAME

    id = Column(String, primary_key=True)
    created_at = Column(DateTime, default=datetime.now)
    as_of_date = Column(Date, nullable=True)
    ticker = Column(String, nullable=False)
    predicted_price = Column(Float, nullable=False)
    predicted_return = Column(Float, nullable=False)
    # Storing JSON as Text to be compatible with SQLite (for testing) and Postgres
    actual_prices_last_month = Column(Text, nullable=True) 
    portfolio_weight = Column(Float, nullable=False)

def get_db_engine():
    """Create and return SQLAlchemy engine."""
    if not DATABASE_URL:
        raise ValueError("DATABASE_URL environment variable not set")
    
    # Handle 'postgres://' vs 'postgresql://' for some hosting providers
    url = DATABASE_URL
    if url.startswith("postgres://"):
        url = url.replace("postgres://", "postgresql://", 1)
        
    masked_url = url.split("@")[-1] if "@" in url else "local_sqlite_or_other"
    logger.info(f"Connecting to database: ...{masked_url}")
    return create_engine(
        url,
        pool_pre_ping=True,  # Critical: Checks if connection is alive before using it
        pool_recycle=300,    # Recycle connections every 5 minutes
        pool_size=5,         # Keep 5 connections open
        max_overflow=10      # Allow 10 extra connections during burst load
    )

SessionLocal = None

def init_db():
    """Initialize database connection."""
    global SessionLocal
    try:
        engine = get_db_engine()
        SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
        # Create tables if they don't exist
        Base.metadata.create_all(bind=engine)
    except Exception as e:
        logger.error(f"Failed to initialize database: {e}")
        raise

def get_db() -> Generator[Session, None, None]:
    """Dependency for getting DB session."""
    if SessionLocal is None:
        init_db()
    
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def save_results_to_db(result: dict[str, Any]) -> None:
    """
    Save optimisation results to database using SQLAlchemy.
    
    Args:
        result: Dictionary containing optimisation results
    """
    import uuid
    
    if SessionLocal is None:
        init_db()
        
    session = SessionLocal()
    try:
        as_of_date = result.get("date")
        predictions = result.get("predictions", {})
        predicted_returns = result.get("predicted_returns", {})
        weights = result.get("weights", {})
        actual_prices_last_month = result.get("actual_prices_last_month", {})

        if not predictions:
            logger.warning("No predictions to save")
            return

        rows = []
        for ticker in predictions.keys():
            db_obj = OptimizationResult(
                id=str(uuid.uuid4()),
                created_at=datetime.now(),
                as_of_date=as_of_date,
                ticker=ticker,
                predicted_price=float(predictions.get(ticker, 0.0)),
                predicted_return=float(predicted_returns.get(ticker, 0.0)),
                actual_prices_last_month=json.dumps(actual_prices_last_month.get(ticker, [])),
                portfolio_weight=float(weights.get(ticker, 0.0)),
            )
            rows.append(db_obj)

        logger.info(f"Inserting {len(rows)} rows into database...")
        session.add_all(rows)
        session.commit()
        logger.info(f"Successfully saved {len(rows)} predictions to database")
        
    except Exception as e:
        logger.error(f"Error saving to database: {e}")
        session.rollback()
        raise
    finally:
        session.close()

# Backward compatibility alias
save_results_to_supabase = save_results_to_db
