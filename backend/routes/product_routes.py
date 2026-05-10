from flask import Blueprint, request, jsonify
from supabase import create_client, Client
from config import Config
from utils.auth_required import admin_required
from utils.cloudinary_upload import upload_image

product_bp = Blueprint('product', __name__)
supabase: Client = create_client(Config.SUPABASE_URL, Config.SUPABASE_SERVICE_ROLE_KEY)

@product_bp.route('/products', methods=['GET'])
def get_products():
    try:
        query = supabase.table('products').select('*')
        
        category = request.args.get('category')
        if category and category != 'All':
            query = query.eq('category', category)
            
        search = request.args.get('search')
        if search:
            query = query.ilike('name', f'%{search}%')
            
        min_price = request.args.get('min_price')
        if min_price:
            query = query.gte('price', float(min_price))
            
        max_price = request.args.get('max_price')
        if max_price:
            query = query.lte('price', float(max_price))
            
        featured = request.args.get('featured')
        if featured == 'true':
            query = query.eq('is_featured', True)
            
        limit = request.args.get('limit')
        if limit:
            query = query.limit(int(limit))
            
        sort = request.args.get('sort')
        if sort == 'price_asc':
            query = query.order('price', desc=False)
        elif sort == 'price_desc':
            query = query.order('price', desc=True)
        elif sort == 'rating':
            query = query.order('rating', desc=True)
        else:
            query = query.order('created_at', desc=True)
            
        res = query.execute()
        return jsonify({'products': res.data}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@product_bp.route('/products/<id>', methods=['GET'])
def get_product(id):
    try:
        res = supabase.table('products').select('*').eq('id', id).execute()
        if not res.data:
            return jsonify({'error': 'Product not found'}), 404
        return jsonify({'product': res.data[0]}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@product_bp.route('/admin/products', methods=['POST'])
@admin_required
def add_product(current_user):
    try:
        name = request.form.get('name')
        description = request.form.get('description')
        price = request.form.get('price')
        discount_price = request.form.get('discount_price') or price
        stock = request.form.get('stock')
        category = request.form.get('category')
        is_featured = request.form.get('is_featured') == 'true'
        is_best_seller = request.form.get('is_best_seller') == 'true'
        
        image = request.files.get('image')
        image_url = None
        if image:
            image_url = upload_image(image)
            
        data = {
            'name': name,
            'description': description,
            'price': float(price),
            'discount_price': float(discount_price),
            'stock': int(stock),
            'category': category,
            'image_url': image_url,
            'is_featured': is_featured,
            'is_best_seller': is_best_seller
        }
        
        res = supabase.table('products').insert(data).execute()
        return jsonify({'product': res.data[0], 'message': 'Product added successfully'}), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@product_bp.route('/admin/products/<id>', methods=['DELETE'])
@admin_required
def delete_product(current_user, id):
    try:
        res = supabase.table('products').delete().eq('id', id).execute()
        return jsonify({'message': 'Product deleted successfully'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 400
