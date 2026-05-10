from flask import Blueprint, request, jsonify
from supabase import create_client, Client
from config import Config
from utils.auth_required import auth_required

cart_bp = Blueprint('cart', __name__)
supabase: Client = create_client(Config.SUPABASE_URL, Config.SUPABASE_SERVICE_ROLE_KEY)

@cart_bp.route('/cart', methods=['GET'])
@auth_required
def get_cart(current_user):
    try:
        # Supabase allows joining tables using select syntax
        res = supabase.table('cart').select('*, products(*)').eq('user_id', current_user.id).execute()
        return jsonify({'cart': res.data}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@cart_bp.route('/cart/add', methods=['POST'])
@auth_required
def add_to_cart(current_user):
    try:
        data = request.json
        product_id = data.get('product_id')
        quantity = data.get('quantity', 1)
        
        # Check if exists
        existing = supabase.table('cart').select('*').eq('user_id', current_user.id).eq('product_id', product_id).execute()
        if existing.data:
            new_quantity = existing.data[0]['quantity'] + quantity
            res = supabase.table('cart').update({'quantity': new_quantity}).eq('id', existing.data[0]['id']).execute()
        else:
            res = supabase.table('cart').insert({
                'user_id': current_user.id,
                'product_id': product_id,
                'quantity': quantity
            }).execute()
            
        return jsonify({'message': 'Added to cart', 'item': res.data[0]}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@cart_bp.route('/cart/update', methods=['PUT'])
@auth_required
def update_cart(current_user):
    try:
        data = request.json
        cart_item_id = data.get('cart_item_id')
        quantity = data.get('quantity')
        
        if quantity <= 0:
            supabase.table('cart').delete().eq('id', cart_item_id).eq('user_id', current_user.id).execute()
            return jsonify({'message': 'Item removed'}), 200
            
        res = supabase.table('cart').update({'quantity': quantity}).eq('id', cart_item_id).eq('user_id', current_user.id).execute()
        return jsonify({'message': 'Cart updated', 'item': res.data[0]}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@cart_bp.route('/cart/remove/<id>', methods=['DELETE'])
@auth_required
def remove_from_cart(current_user, id):
    try:
        supabase.table('cart').delete().eq('id', id).eq('user_id', current_user.id).execute()
        return jsonify({'message': 'Item removed from cart'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 400

# Wishlist Routes 
@cart_bp.route('/wishlist', methods=['GET'])
@auth_required
def get_wishlist(current_user):
    try:
        res = supabase.table('wishlist').select('*, products(*)').eq('user_id', current_user.id).execute()
        return jsonify({'wishlist': res.data}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@cart_bp.route('/wishlist/add', methods=['POST'])
@auth_required
def add_to_wishlist(current_user):
    try:
        data = request.json
        product_id = data.get('product_id')
        
        # Check if exists to avoid duplicates
        existing = supabase.table('wishlist').select('*').eq('user_id', current_user.id).eq('product_id', product_id).execute()
        if existing.data:
            return jsonify({'message': 'Already in wishlist'}), 200
            
        res = supabase.table('wishlist').insert({
            'user_id': current_user.id,
            'product_id': product_id
        }).execute()
        return jsonify({'message': 'Added to wishlist', 'item': res.data[0]}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@cart_bp.route('/wishlist/remove/<id>', methods=['DELETE'])
@auth_required
def remove_from_wishlist(current_user, id):
    try:
        supabase.table('wishlist').delete().eq('id', id).eq('user_id', current_user.id).execute()
        return jsonify({'message': 'Removed from wishlist'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 400
