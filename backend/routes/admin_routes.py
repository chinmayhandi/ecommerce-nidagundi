from flask import Blueprint, request, jsonify
from supabase import create_client, Client
from config import Config
from utils.auth_required import admin_required

admin_bp = Blueprint('admin', __name__)
supabase: Client = create_client(Config.SUPABASE_URL, Config.SUPABASE_SERVICE_ROLE_KEY)

@admin_bp.route('/admin/dashboard', methods=['GET'])
@admin_required
def get_dashboard_stats(current_user):
    try:
        # Get counts (using select with count='exact')
        products_res = supabase.table('products').select('*', count='exact').execute()
        orders_res = supabase.table('orders').select('*', count='exact').execute()
        users_res = supabase.table('users_profile').select('*', count='exact').eq('role', 'customer').execute()
        
        # Calculate totals
        all_orders = supabase.table('orders').select('*').execute()
        total_sales = sum(float(order['total_amount']) for order in all_orders.data if order['status'] == 'delivered' or order['status'] == 'paid')
        
        pending_orders = sum(1 for order in all_orders.data if order['status'] == 'pending' or order['status'] == 'paid')
        
        low_stock_res = supabase.table('products').select('*', count='exact').lte('stock', 10).execute()
        
        stats = {
            'totalProducts': products_res.count,
            'totalOrders': orders_res.count,
            'totalUsers': users_res.count,
            'totalSales': total_sales,
            'pendingOrders': pending_orders,
            'lowStockAlerts': low_stock_res.count
        }
        return jsonify({'stats': stats}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@admin_bp.route('/admin/orders', methods=['GET'])
@admin_required
def get_all_orders(current_user):
    try:
        res = supabase.table('orders').select('*, users_profile(full_name, email), items:order_items(*)').order('created_at', desc=True).execute()
        return jsonify({'orders': res.data}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@admin_bp.route('/admin/orders/<id>/status', methods=['PUT'])
@admin_required
def update_order_status(current_user, id):
    try:
        status = request.json.get('status')
        res = supabase.table('orders').update({'status': status}).eq('id', id).execute()
        return jsonify({'message': 'Status updated'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@admin_bp.route('/admin/orders/<id>/tracking', methods=['PUT'])
@admin_required
def update_order_tracking(current_user, id):
    try:
        data = request.json
        res = supabase.table('orders').update({
            'tracking_id': data.get('tracking_id'),
            'courier_name': data.get('courier_name'),
            'status': 'shipped' # Automatically update status
        }).eq('id', id).execute()
        return jsonify({'message': 'Tracking updated'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@admin_bp.route('/admin/customers', methods=['GET'])
@admin_required
def get_customers(current_user):
    try:
        res = supabase.table('users_profile').select('*').order('created_at', desc=True).execute()
        return jsonify({'customers': res.data}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 400
