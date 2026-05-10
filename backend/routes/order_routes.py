from flask import Blueprint, request, jsonify
from supabase import create_client, Client
from config import Config
from utils.auth_required import auth_required

order_bp = Blueprint('order', __name__)
supabase: Client = create_client(Config.SUPABASE_URL, Config.SUPABASE_SERVICE_ROLE_KEY)

@order_bp.route('/my-orders', methods=['GET'])
@auth_required
def get_my_orders(current_user):
    try:
        # Get orders ordered by latest first
        res = supabase.table('orders').select('*, items:order_items(*)').eq('user_id', current_user.id).order('created_at', desc=True).execute()
        return jsonify({'orders': res.data}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@order_bp.route('/orders/<id>', methods=['GET'])
@auth_required
def get_order_details(current_user, id):
    try:
        res = supabase.table('orders').select('*, items:order_items(*)').eq('id', id).eq('user_id', current_user.id).execute()
        if not res.data:
            return jsonify({'error': 'Order not found'}), 404
        return jsonify({'order': res.data[0]}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@order_bp.route('/cancel-order', methods=['POST'])
@auth_required
def cancel_order(current_user):
    try:
        order_id = request.json.get('order_id')
        
        # Verify order belongs to user and is in a cancellable state
        order_res = supabase.table('orders').select('*').eq('id', order_id).eq('user_id', current_user.id).execute()
        if not order_res.data:
            return jsonify({'error': 'Order not found'}), 404
            
        order = order_res.data[0]
        if order['status'] in ['shipped', 'delivered', 'cancelled']:
            return jsonify({'error': f'Order cannot be cancelled in {order["status"]} state'}), 400
            
        # Update status
        supabase.table('orders').update({'status': 'cancelled'}).eq('id', order_id).execute()
        
        # Restore stock logic would go here
        
        return jsonify({'message': 'Order cancelled successfully'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 400
