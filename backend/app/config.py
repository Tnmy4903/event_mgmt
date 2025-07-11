import os
from dotenv import load_dotenv

load_dotenv()  # Load from .env file

class Config:
    SECRET_KEY = os.getenv("SECRET_KEY", "default_secret_key")
    JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "default_jwt_secret_key")
    MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017/default_db")