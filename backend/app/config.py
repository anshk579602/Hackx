import os
from pydantic_settings import BaseSettings
from typing import List

class Settings(BaseSettings):
    PROJECT_NAME: str = "HackJudge (VeriJudge AI)"
    API_V1_STR: str = "/api"
    SECRET_KEY: str = os.getenv("SECRET_KEY", "super-secret-jwt-key-verijudge-ai-2026")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days
    
    # Database
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite+aiosqlite:///./hackjudge.db")
    
    # CORS
    BACKEND_CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://localhost:3001",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:3001",
        "http://localhost:8000",
    ]
    
    # Blockchain
    POLYGON_AMOY_RPC: str = os.getenv("POLYGON_AMOY_RPC", "https://rpc-amoy.polygon.technology/")
    ANCHOR_CONTRACT_ADDRESS: str = os.getenv("ANCHOR_CONTRACT_ADDRESS", "0x5FbDB2315678afecb367f032d93F642f64180aa3")
    ANCHOR_WALLET_PRIVATE_KEY: str = os.getenv("ANCHOR_WALLET_PRIVATE_KEY", "")
    BLOCKCHAIN_NETWORK: str = os.getenv("BLOCKCHAIN_NETWORK", "Polygon Amoy (Testnet)")
    
    # AI Engine
    AI_PROVIDER: str = os.getenv("AI_PROVIDER", "mock")  # 'mock', 'openai', 'gemini'
    AI_API_KEY: str = os.getenv("AI_API_KEY", "")
    
    # Demo Mode
    DEMO_MODE: bool = True

    model_config = {"case_sensitive": True}

settings = Settings()
