from flask import Blueprint, request, jsonify
from supabase import create_client, Client
from config import Config

contact_bp = Blueprint('contact', __name__)
supabase: Client = create_client(Config.SUPABASE_URL, Config.SUPABASE_SERVICE_ROLE_KEY)

@contact_bp.route('/contact', methods=['POST'])
def send_contact_message():
    try:
        data = request.json
        res = supabase.table('contact_messages').insert(data).execute()
        return jsonify({'message': 'Message sent successfully'}), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 400
