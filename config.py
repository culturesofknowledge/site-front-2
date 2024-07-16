import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    PORT = os.getenv('PORT', 5000)
