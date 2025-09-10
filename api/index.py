#!/usr/bin/env python3
from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
import json
import os
from datetime import datetime, timedelta

app = Flask(__name__)

# Simple CORS for all origins
CORS(app, origins=["*"])

# JWT Configuration
app.config['JWT_SECRET_KEY'] = 'oI4WuOz_wVv-ZpJlI__QtihZmuxZfgRAotehuIDtC-A'
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(hours=24)
jwt = JWTManager(app)

# Simple in-memory storage (for demo purposes)
users = {}
entries = {}
user_counter = 1

@app.route('/')
def root():
    return jsonify({
        'message': 'Cannabis Tracker API - Simple Version',
        'status': 'working',
        'version': '1.0.0'
    })

@app.route('/health')
def health():
    return jsonify({'status': 'healthy'})

@app.route('/api/v1/register', methods=['POST'])
def register():
    try:
        data = request.get_json()
        username = data.get('username')
        password = data.get('password')
        email = data.get('email')
        
        if not username or not password or not email:
            return jsonify({'error': 'Username, password, and email required'}), 400
            
        # Check if user exists
        for user in users.values():
            if user['username'] == username or user['email'] == email:
                return jsonify({'error': 'User already exists'}), 400
        
        global user_counter
        user_id = user_counter
        user_counter += 1
        
        users[user_id] = {
            'id': user_id,
            'username': username,
            'password': password,  # In real app, hash this!
            'email': email
        }
        
        return jsonify({'message': 'User registered successfully', 'user_id': user_id}), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/v1/login', methods=['POST'])
def login():
    try:
        data = request.get_json()
        username = data.get('username')
        password = data.get('password')
        
        if not username or not password:
            return jsonify({'error': 'Username and password required'}), 400
        
        # Find user
        user = None
        for u in users.values():
            if u['username'] == username and u['password'] == password:
                user = u
                break
                
        if not user:
            return jsonify({'error': 'Invalid credentials'}), 401
        
        access_token = create_access_token(identity=str(user['id']))
        
        return jsonify({
            'access_token': access_token,
            'user': {
                'id': user['id'],
                'username': user['username'],
                'email': user['email']
            }
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/v1/entries', methods=['POST'])
@jwt_required()
def create_entry():
    try:
        user_id = int(get_jwt_identity())
        data = request.get_json()
        
        # Calculate THC mg
        method = data.get('method', 'vape')
        thc_mg = 0.0
        
        if method in ['vape', 'smoke']:
            puffs = float(data.get('puffs', 0))
            thc_percent = float(data.get('thc_percent', 75))
            thc_mg = puffs * (thc_percent / 100) * 2.5
        elif method in ['edible', 'tincture']:
            thc_mg = float(data.get('amount', 0))
        
        entry_id = len(entries) + 1
        timestamp = datetime.now().isoformat()
        
        entry = {
            'id': entry_id,
            'user_id': user_id,
            'thc_mg': thc_mg,
            'timestamp': timestamp,
            'date': data.get('date'),
            'time': data.get('time'),
            'method': method,
            'amount': data.get('amount'),
            'puffs': data.get('puffs'),
            'thc_percent': data.get('thc_percent'),
            'strain': data.get('strain'),
            'mood': data.get('mood', 5),
            'energy': data.get('energy', 5),
            'focus': data.get('focus', 5),
            'creativity': data.get('creativity', 5),
            'anxiety': data.get('anxiety', 0),
            'activities': data.get('activities', []),
            'notes': data.get('notes'),
            'created_at': timestamp,
            'updated_at': timestamp
        }
        
        entries[entry_id] = entry
        return jsonify(entry), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/v1/entries', methods=['GET'])
@jwt_required()
def get_entries():
    try:
        user_id = int(get_jwt_identity())
        user_entries = [entry for entry in entries.values() if entry['user_id'] == user_id]
        user_entries.sort(key=lambda x: x['timestamp'], reverse=True)
        return jsonify(user_entries), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/v1/entries/stats', methods=['GET'])
@jwt_required()
def get_stats():
    try:
        user_id = int(get_jwt_identity())
        user_entries = [entry for entry in entries.values() if entry['user_id'] == user_id]
        
        if not user_entries:
            return jsonify({
                'weekly_total': 0,
                'daily_avg': 0,
                'avg_mood': 0,
                'total_sessions': 0
            }), 200
        
        # Calculate basic stats
        total_thc = sum(entry['thc_mg'] for entry in user_entries)
        avg_mood = sum(entry['mood'] for entry in user_entries) / len(user_entries)
        
        stats = {
            'weekly_total': total_thc,
            'daily_avg': total_thc / 7,
            'avg_mood': avg_mood,
            'total_sessions': len(user_entries)
        }
        
        return jsonify(stats), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/v1/entries/<int:entry_id>', methods=['DELETE'])
@jwt_required()
def delete_entry(entry_id):
    try:
        user_id = int(get_jwt_identity())
        
        if entry_id in entries and entries[entry_id]['user_id'] == user_id:
            del entries[entry_id]
            return jsonify({'message': 'Entry deleted successfully'}), 200
        else:
            return jsonify({'error': 'Entry not found'}), 404
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=False)
