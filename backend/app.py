from flask import Flask, jsonify
from flask_cors import CORS
from dotenv import load_dotenv

load_dotenv()

from routes.auth_routes import auth_bp
from routes.product_routes import product_bp
from routes.cart_routes import cart_bp
from routes.order_routes import order_bp
from routes.payment_routes import payment_bp
from routes.admin_routes import admin_bp
from routes.pincode_routes import pincode_bp
from routes.coupon_routes import coupon_bp
from routes.review_routes import review_bp
from routes.contact_routes import contact_bp

app = Flask(__name__)
# Enable CORS for the frontend app
CORS(app, resources={r"/api/*": {"origins": "*"}})

# Register Blueprints
app.register_blueprint(auth_bp, url_prefix='/api')
app.register_blueprint(product_bp, url_prefix='/api')
app.register_blueprint(cart_bp, url_prefix='/api')
app.register_blueprint(order_bp, url_prefix='/api')
app.register_blueprint(payment_bp, url_prefix='/api')
app.register_blueprint(admin_bp, url_prefix='/api')
app.register_blueprint(pincode_bp, url_prefix='/api')
app.register_blueprint(coupon_bp, url_prefix='/api')
app.register_blueprint(review_bp, url_prefix='/api')
app.register_blueprint(contact_bp, url_prefix='/api')

@app.route('/', methods=['GET'])
def health_check():
    return jsonify({'status': 'running', 'message': 'Premium E-Commerce API is up'}), 200

if __name__ == '__main__':
    app.run(debug=True, port=5000)
