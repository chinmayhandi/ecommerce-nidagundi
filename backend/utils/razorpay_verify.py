import hmac
import hashlib
import requests
from requests.auth import HTTPBasicAuth
from config import Config

def verify_payment_signature(razorpay_order_id, razorpay_payment_id, razorpay_signature):
    try:
        # Construct the string to hash
        msg = f"{razorpay_order_id}|{razorpay_payment_id}"
        
        # Generate HMAC SHA256 signature
        generated_signature = hmac.new(
            Config.RAZORPAY_KEY_SECRET.encode('utf-8'),
            msg.encode('utf-8'),
            hashlib.sha256
        ).hexdigest()
        
        return hmac.compare_digest(generated_signature, razorpay_signature)
    except Exception as e:
        print(f"Razorpay verify error: {e}")
        return False

def create_order(amount, currency="INR", receipt=None):
    try:
        url = "https://api.razorpay.com/v1/orders"
        data = {
            "amount": int(amount * 100), # Amount in paise
            "currency": currency,
            "receipt": receipt
        }
        response = requests.post(
            url, 
            json=data, 
            auth=HTTPBasicAuth(Config.RAZORPAY_KEY_ID, Config.RAZORPAY_KEY_SECRET)
        )
        
        if response.status_code == 200:
            return response.json()
        else:
            raise Exception(f"Razorpay error {response.status_code}: {response.text}")
    except Exception as e:
        print(f"Razorpay create order error: {e}")
        raise e
