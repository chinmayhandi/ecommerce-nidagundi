import cloudinary
import cloudinary.uploader
from config import Config

cloudinary.config(
  cloud_name = Config.CLOUDINARY_CLOUD_NAME,
  api_key = Config.CLOUDINARY_API_KEY,
  api_secret = Config.CLOUDINARY_API_SECRET
)

def upload_image(file_obj):
    try:
        response = cloudinary.uploader.upload(file_obj, folder="premiumcart/products")
        return response['secure_url']
    except Exception as e:
        print(f"Cloudinary upload error: {e}")
        return None
