from functools import wraps
from flask import request, jsonify
from supabase import create_client, Client
from config import Config

supabase: Client = create_client(Config.SUPABASE_URL, Config.SUPABASE_SERVICE_ROLE_KEY)

def auth_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        if 'Authorization' in request.headers:
            token = request.headers['Authorization'].split(" ")[1]
            
        if not token:
            return jsonify({'error': 'Token is missing!'}), 401
            
        try:
            user = supabase.auth.get_user(token)
            if not user:
                return jsonify({'error': 'Token is invalid!'}), 401
            # add user to kwargs to pass to route
            kwargs['current_user'] = user.user
        except Exception as e:
            return jsonify({'error': str(e)}), 401
            
        return f(*args, **kwargs)
    return decorated

def admin_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        if 'Authorization' in request.headers:
            token = request.headers['Authorization'].split(" ")[1]
            
        if not token:
            return jsonify({'error': 'Token is missing!'}), 401
            
        try:
            user = supabase.auth.get_user(token)
            if not user:
                return jsonify({'error': 'Token is invalid!'}), 401
                
            # Check if admin
            profile = supabase.table('users_profile').select('role').eq('id', user.user.id).execute()
            if not profile.data or profile.data[0]['role'] != 'admin':
                return jsonify({'error': 'Admin privileges required!'}), 403
                
            kwargs['current_user'] = user.user
        except Exception as e:
            return jsonify({'error': str(e)}), 401
            
        return f(*args, **kwargs)
    return decorated
