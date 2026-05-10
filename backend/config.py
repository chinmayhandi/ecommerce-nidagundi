import os
from dotenv import load_dotenv

basedir = os.path.abspath(os.path.dirname(__file__))
load_dotenv(os.path.join(basedir, '.env'), override=True)

class Config:
    SUPABASE_URL = os.environ.get('SUPABASE_URL')
    if SUPABASE_URL and not SUPABASE_URL.startswith('http'):
        SUPABASE_URL = f"https://{SUPABASE_URL}.supabase.co"
        
    SUPABASE_SERVICE_ROLE_KEY = os.environ.get('SUPABASE_SERVICE_ROLE_KEY')
    SUPABASE_ANON_KEY = os.environ.get('SUPABASE_ANON_KEY')
    
    CLOUDINARY_CLOUD_NAME = os.environ.get('CLOUDINARY_CLOUD_NAME')
    CLOUDINARY_API_KEY = os.environ.get('CLOUDINARY_API_KEY')
    CLOUDINARY_API_SECRET = os.environ.get('CLOUDINARY_API_SECRET')
    
    RAZORPAY_KEY_ID = os.environ.get('RAZORPAY_KEY_ID')
    RAZORPAY_KEY_SECRET = os.environ.get('RAZORPAY_KEY_SECRET')
    
    FRONTEND_URL = os.environ.get('FRONTEND_URL', 'http://localhost:5173')
