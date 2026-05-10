from flask import Blueprint, request, jsonify
from supabase import create_client, Client
from config import Config

auth_bp = Blueprint('auth', __name__)
supabase: Client = create_client(Config.SUPABASE_URL, Config.SUPABASE_SERVICE_ROLE_KEY)

@auth_bp.route('/profile', methods=['GET'])
def get_profile():
    token = request.headers.get('Authorization', '').split(" ")[1] if 'Authorization' in request.headers else None
    if not token:
        return jsonify({'error': 'Token missing'}), 401
    
    try:
        user = supabase.auth.get_user(token)
        if not user:
            return jsonify({'error': 'Invalid token'}), 401
        
        profile = supabase.table('users_profile').select('*').eq('id', user.user.id).execute()
        return jsonify({'profile': profile.data[0] if profile.data else None}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@auth_bp.route('/elevate-admin', methods=['POST'])
def elevate_admin():
    data = request.json
    email = data.get('email')
    secret_key = data.get('secret_key')
    
    # Very simple secret code to prevent unauthorized elevation
    if secret_key != 'ADMIN123':
        return jsonify({'error': 'Invalid Admin Secret Key'}), 403
        
    try:
        res = supabase.table('users_profile').update({'role': 'admin'}).eq('email', email).execute()
        if not res.data:
            return jsonify({'error': 'User not found in profile table yet. Try again in a few seconds.'}), 404
            
        return jsonify({'message': 'Elevated to admin successfully!'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 400
