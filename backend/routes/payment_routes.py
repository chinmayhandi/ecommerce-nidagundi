from flask import Blueprint, request, jsonify
from supabase import create_client, Client
from config import Config
from utils.auth_required import auth_required
from utils.razorpay_verify import create_order, verify_payment_signature

payment_bp = Blueprint('payment', __name__)
supabase: Client = create_client(Config.SUPABASE_URL, Config.SUPABASE_SERVICE_ROLE_KEY)

@payment_bp.route('/create-payment-order', methods=['POST'])
@auth_required
def create_payment_order(current_user):
    try:
        data = request.json
        amount = data.get('amount')
        currency = data.get('currency', 'INR')
        receipt = data.get('receipt')
        
        order = create_order(amount, currency, receipt)
        if not order:
            return jsonify({'error': 'Failed to create Razorpay order'}), 500
            
        return jsonify({'order': order}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@payment_bp.route('/verify-payment', methods=['POST'])
@auth_required
def verify_payment(current_user):
    try:
        data = request.json
        razorpay_order_id = data.get('razorpay_order_id')
        razorpay_payment_id = data.get('razorpay_payment_id')
        razorpay_signature = data.get('razorpay_signature')
        orderData = data.get('orderData')
        
        is_valid = verify_payment_signature(razorpay_order_id, razorpay_payment_id, razorpay_signature)
        
        if is_valid:
            # 1. Create Order in Database
            new_order = {
                'user_id': current_user.id,
                'total_amount': orderData['totalAmount'],
                'delivery_charge': orderData['deliveryCharge'],
                'status': 'paid',
                'shipping_address': orderData['address'],
                'razorpay_order_id': razorpay_order_id,
                'razorpay_payment_id': razorpay_payment_id
            }
            order_res = supabase.table('orders').insert(new_order).execute()
            db_order_id = order_res.data[0]['id']
            
            # 2. Insert Order Items and Update Stock
            for item in orderData['cartItems']:
                product = item['products']
                # Insert item
                supabase.table('order_items').insert({
                    'order_id': db_order_id,
                    'product_id': product['id'],
                    'product_name': product['name'],
                    'product_image': product['image_url'],
                    'price': product['discount_price'] or product['price'],
                    'quantity': item['quantity']
                }).execute()
                
                # Reduce stock
                new_stock = max(0, product['stock'] - item['quantity'])
                supabase.table('products').update({'stock': new_stock}).eq('id', product['id']).execute()
            
            # 3. Clear Cart (Handled on frontend too, but good to do here)
            supabase.table('cart').delete().eq('user_id', current_user.id).execute()
            
            return jsonify({'success': True, 'message': 'Payment verified and order saved', 'db_order_id': db_order_id}), 200
        else:
            return jsonify({'success': False, 'error': 'Invalid payment signature'}), 400
    except Exception as e:
        print(e)
        return jsonify({'error': str(e)}), 400
