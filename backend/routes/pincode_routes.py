from flask import Blueprint, request, jsonify
from supabase import create_client, Client
from config import Config
from utils.auth_required import admin_required

pincode_bp = Blueprint('pincode', __name__)
supabase: Client = create_client(Config.SUPABASE_URL, Config.SUPABASE_SERVICE_ROLE_KEY)

@pincode_bp.route('/check-pincode', methods=['POST'])
def check_pincode():
    try:
        pincode = request.json.get('pincode')
        if not pincode:
            return jsonify({'error': 'Pincode is required'}), 400
            
        res = supabase.table('delivery_pincodes').select('*').eq('pincode', pincode).eq('status', True).execute()
        
        if res.data:
            data = res.data[0]
            return jsonify({
                'available': True,
                'message': 'Delivery available',
                'delivery_charge': data['delivery_charge'],
                'min_days': data['min_delivery_days'],
                'max_days': data['max_delivery_days'],
                'city': data['city'],
                'state': data['state']
            }), 200
        else:
            return jsonify({
                'available': False,
                'message': 'Currently we do not deliver to this location'
            }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@pincode_bp.route('/admin/pincodes', methods=['GET'])
@admin_required
def get_pincodes(current_user):
    try:
        res = supabase.table('delivery_pincodes').select('*').order('created_at', desc=True).execute()
        return jsonify({'pincodes': res.data}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@pincode_bp.route('/admin/pincodes', methods=['POST'])
@admin_required
def add_pincode(current_user):
    try:
        data = request.json
        # Convert numeric fields
        data['delivery_charge'] = float(data.get('delivery_charge', 0))
        data['min_delivery_days'] = int(data.get('min_delivery_days', 3))
        data['max_delivery_days'] = int(data.get('max_delivery_days', 7))
        
        res = supabase.table('delivery_pincodes').insert(data).execute()
        return jsonify({'pincode': res.data[0]}), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@pincode_bp.route('/admin/pincodes/<id>', methods=['PUT'])
@admin_required
def update_pincode_status(current_user, id):
    try:
        status = request.json.get('status')
        res = supabase.table('delivery_pincodes').update({'status': status}).eq('id', id).execute()
        return jsonify({'message': 'Updated'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@pincode_bp.route('/admin/pincodes/<id>', methods=['DELETE'])
@admin_required
def delete_pincode(current_user, id):
    try:
        supabase.table('delivery_pincodes').delete().eq('id', id).execute()
        return jsonify({'message': 'Deleted'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 400
