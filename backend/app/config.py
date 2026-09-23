import os
from pydantic_settings import BaseSettings
from typing import List

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DEFAULT_DB_PATH = os.path.join(BASE_DIR, "hackjudge.db").replace("\\", "/")

class Settings(BaseSettings):
    PROJECT_NAME: str = "HackX"
    API_V1_STR: str = "/api"
    SECRET_KEY: str = os.getenv("SECRET_KEY", "super-secret-jwt-key-hackx-platform-2026-secure")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days
    
    # Database (always resolves to absolute path so data is never lost regardless of cwd)
    DATABASE_URL: str = os.getenv("DATABASE_URL", f"sqlite+aiosqlite:///{DEFAULT_DB_PATH}")
    
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
