from flask import Blueprint, request, jsonify
from supabase import create_client, Client
from config import Config
from utils.auth_required import admin_required

coupon_bp = Blueprint('coupon', __name__)
supabase: Client = create_client(Config.SUPABASE_URL, Config.SUPABASE_SERVICE_ROLE_KEY)

@coupon_bp.route('/coupons', methods=['GET'])
@admin_required
def get_coupons(current_user):
    try:
        res = supabase.table('coupons').select('*').order('created_at', desc=True).execute()
        return jsonify({'coupons': res.data}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@coupon_bp.route('/admin/coupons', methods=['POST'])
@admin_required
def add_coupon(current_user):
    try:
        data = request.json
        res = supabase.table('coupons').insert(data).execute()
        return jsonify({'coupon': res.data[0]}), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@coupon_bp.route('/admin/coupons/<id>', methods=['DELETE'])
@admin_required
def delete_coupon(current_user, id):
    try:
        supabase.table('coupons').delete().eq('id', id).execute()
        return jsonify({'message': 'Deleted'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 400
