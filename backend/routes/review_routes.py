from flask import Blueprint, request, jsonify
from supabase import create_client, Client
from config import Config
from utils.auth_required import admin_required

review_bp = Blueprint('review', __name__)
supabase: Client = create_client(Config.SUPABASE_URL, Config.SUPABASE_SERVICE_ROLE_KEY)

@review_bp.route('/reviews/<product_id>', methods=['GET'])
def get_product_reviews(product_id):
    try:
        res = supabase.table('reviews').select('*, users_profile(full_name)').eq('product_id', product_id).order('created_at', desc=True).execute()
        return jsonify({'reviews': res.data}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@review_bp.route('/admin/reviews', methods=['GET'])
@admin_required
def get_all_reviews(current_user):
    try:
        res = supabase.table('reviews').select('*, users_profile(full_name), products(name)').order('created_at', desc=True).execute()
        return jsonify({'reviews': res.data}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@review_bp.route('/admin/reviews/<id>', methods=['DELETE'])
@admin_required
def delete_review(current_user, id):
    try:
        supabase.table('reviews').delete().eq('id', id).execute()
        return jsonify({'message': 'Deleted'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 400
