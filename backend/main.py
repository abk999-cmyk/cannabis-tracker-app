from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_jwt_extended import JWTManager, jwt_required, get_jwt_identity
import logging
import os
import pg8000
from datetime import datetime, timedelta
import bcrypt
import uuid
from decouple import config

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler(os.path.join(os.path.dirname(__file__), '../logs/backend.log')),
        logging.StreamHandler()
    ]
)

logger = logging.getLogger(__name__)

app = Flask(__name__)

# Configure CORS - Allow production and development origins
CORS(app, origins=[
    "http://localhost:3000", 
    "http://localhost:5173", 
    "http://127.0.0.1:3000",
    "https://*.netlify.app",
    "https://*.netlify.com",
    os.getenv('FRONTEND_URL', 'https://cannabis-tracker-app.netlify.app')
])

# JWT Configuration
app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY', 'your-secret-key-change-in-production')
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(hours=1)
jwt = JWTManager(app)

# Database configuration
DB_CONFIG = {
    'host': os.getenv('DB_HOST', 'localhost'),
    'database': os.getenv('DB_NAME', 'cannabis_tracker'),
    'user': os.getenv('DB_USER', os.getenv('USER', 'postgres')),
    'password': os.getenv('DB_PASSWORD', ''),
    'port': int(os.getenv('DB_PORT', '5432'))
}

def get_db_connection():
    """Get database connection"""
    try:
        conn = pg8000.connect(**DB_CONFIG)
        return conn
    except Exception as e:
        logger.error(f"Database connection error: {e}")
        return None

def init_db():
    """Initialize database tables"""
    conn = get_db_connection()
    if not conn:
        logger.error("Failed to connect to database")
        return

    try:
        cur = conn.cursor()

        # Create users table
        cur.execute("""
            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                username VARCHAR(50) UNIQUE NOT NULL,
                email VARCHAR(100) UNIQUE NOT NULL,
                password_hash VARCHAR(255) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)

        # Create entries table
        cur.execute("""
            CREATE TABLE IF NOT EXISTS entries (
                id SERIAL PRIMARY KEY,
                user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
                thc_mg DECIMAL(10,2) NOT NULL,
                timestamp TIMESTAMP NOT NULL,
                date DATE NOT NULL,
                time TIME NOT NULL,
                method VARCHAR(20) NOT NULL,
                amount VARCHAR(50),
                puffs VARCHAR(50),
                thc_percent DECIMAL(5,2),
                strain VARCHAR(100),
                mood INTEGER NOT NULL DEFAULT 5,
                energy INTEGER NOT NULL DEFAULT 5,
                focus INTEGER NOT NULL DEFAULT 5,
                creativity INTEGER NOT NULL DEFAULT 5,
                anxiety INTEGER NOT NULL DEFAULT 0,
                activities TEXT[],
                notes TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)

        conn.commit()
        logger.info("Database tables initialized successfully")

    except Exception as e:
        logger.error(f"Database initialization error: {e}")
        conn.rollback()
    finally:
        if 'cur' in locals():
            cur.close()
        if conn:
            conn.close()

# Initialize database on startup
init_db()

# Authentication routes
@app.route('/api/v1/register', methods=['POST'])
def register():
    """Register a new user"""
    try:
        data = request.get_json()

        if not data or not data.get('username') or not data.get('password') or not data.get('email'):
            return jsonify({'error': 'Username, password, and email are required'}), 400

        username = data['username']
        password = data['password']
        email = data['email']

        # Hash password
        password_hash = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

        conn = get_db_connection()
        if not conn:
            return jsonify({'error': 'Database connection failed'}), 500

        cur = conn.cursor()

        # Check if user exists
        cur.execute("SELECT id FROM users WHERE username = %s OR email = %s", (username, email))
        if cur.fetchone():
            return jsonify({'error': 'Username or email already exists'}), 400

        # Create user
        cur.execute(
            "INSERT INTO users (username, email, password_hash) VALUES (%s, %s, %s) RETURNING id",
            (username, email, password_hash)
        )

        user_id = cur.fetchone()[0]
        conn.commit()

        return jsonify({
            'message': 'User registered successfully',
            'user_id': user_id
        }), 201

    except Exception as e:
        logger.error(f"Registration error: {e}")
        return jsonify({'error': 'Registration failed'}), 500
    finally:
        if 'cur' in locals():
            cur.close()
        if conn:
            conn.close()

@app.route('/api/v1/login', methods=['POST'])
def login():
    """Login user"""
    try:
        data = request.get_json()

        if not data or not data.get('username') or not data.get('password'):
            return jsonify({'error': 'Username and password are required'}), 400

        username = data['username']
        password = data['password']

        conn = get_db_connection()
        if not conn:
            return jsonify({'error': 'Database connection failed'}), 500

        cur = conn.cursor()

        # Get user
        cur.execute("SELECT id, username, email, password_hash FROM users WHERE username = %s", (username,))
        user_row = cur.fetchone()

        if not user_row:
            return jsonify({'error': 'Invalid credentials'}), 401

        user = {
            'id': user_row[0],
            'username': user_row[1],
            'email': user_row[2],
            'password_hash': user_row[3]
        }

        if not bcrypt.checkpw(password.encode('utf-8'), user['password_hash'].encode('utf-8')):
            return jsonify({'error': 'Invalid credentials'}), 401

        # Create access token
        from flask_jwt_extended import create_access_token
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
        logger.error(f"Login error: {e}")
        return jsonify({'error': 'Login failed'}), 500
    finally:
        if 'cur' in locals():
            cur.close()
        if conn:
            conn.close()

# Entry routes
@app.route('/api/v1/entries', methods=['POST'])
@jwt_required()
def create_entry():
    """Create a new entry"""
    try:
        user_id = get_jwt_identity()
        data = request.get_json()

        if not data:
            return jsonify({'error': 'No data provided'}), 400

        # Calculate THC mg
        method = data.get('method', 'vape')
        thc_mg = 0.0

        if method in ['vape', 'smoke']:
            puffs = data.get('puffs', '0')
            thc_percent = data.get('thc_percent', 75)
            thc_mg = float(puffs) * (thc_percent / 100) * 2.5
        elif method in ['edible', 'tincture']:
            amount = data.get('amount', '0')
            thc_mg = float(amount)

        # Create timestamp
        date_str = data.get('date')
        time_str = data.get('time')
        timestamp = datetime.fromisoformat(f"{date_str} {time_str}")

        conn = get_db_connection()
        if not conn:
            return jsonify({'error': 'Database connection failed'}), 500

        cur = conn.cursor()

        cur.execute("""
            INSERT INTO entries (
                user_id, thc_mg, timestamp, date, time, method, amount, puffs,
                thc_percent, strain, mood, energy, focus, creativity, anxiety,
                activities, notes
            ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            RETURNING id, user_id, thc_mg, timestamp, date, time, method, amount, puffs, thc_percent, strain, mood, energy, focus, creativity, anxiety, activities, notes, created_at, updated_at
        """, (
            user_id, thc_mg, timestamp, date_str, time_str,
            method, data.get('amount'), data.get('puffs'), data.get('thc_percent'),
            data.get('strain'), data.get('mood', 5), data.get('energy', 5),
            data.get('focus', 5), data.get('creativity', 5), data.get('anxiety', 0),
            data.get('activities', []), data.get('notes')
        ))

        entry_row = cur.fetchone()
        conn.commit()

        entry = {
            'id': entry_row[0],
            'user_id': entry_row[1],
            'thc_mg': float(entry_row[2]),
            'timestamp': entry_row[3].isoformat() if entry_row[3] else None,
            'date': str(entry_row[4]),
            'time': str(entry_row[5]),
            'method': entry_row[6],
            'amount': entry_row[7],
            'puffs': entry_row[8],
            'thc_percent': float(entry_row[9]) if entry_row[9] else None,
            'strain': entry_row[10],
            'mood': int(entry_row[11]),
            'energy': int(entry_row[12]),
            'focus': int(entry_row[13]),
            'creativity': int(entry_row[14]),
            'anxiety': int(entry_row[15]),
            'activities': entry_row[16] if entry_row[16] else [],
            'notes': entry_row[17],
            'created_at': entry_row[18].isoformat() if entry_row[18] else None,
            'updated_at': entry_row[19].isoformat() if entry_row[19] else None
        }

        return jsonify(entry), 201

    except Exception as e:
        logger.error(f"Create entry error: {e}")
        return jsonify({'error': 'Failed to create entry'}), 500
    finally:
        if 'cur' in locals():
            cur.close()
        if conn:
            conn.close()

@app.route('/api/v1/entries', methods=['GET'])
@jwt_required()
def get_entries():
    """Get user's entries"""
    try:
        user_id = get_jwt_identity()

        conn = get_db_connection()
        if not conn:
            return jsonify({'error': 'Database connection failed'}), 500

        cur = conn.cursor()

        cur.execute("""
            SELECT id, user_id, thc_mg, timestamp, date, time, method, amount, puffs,
                   thc_percent, strain, mood, energy, focus, creativity, anxiety,
                   activities, notes, created_at, updated_at
            FROM entries
            WHERE user_id = %s
            ORDER BY timestamp DESC
        """, (user_id,))

        entries_rows = cur.fetchall()
        entries = []

        for row in entries_rows:
            entries.append({
                'id': row[0],
                'user_id': row[1],
                'thc_mg': float(row[2]),
                'timestamp': row[3].isoformat() if row[3] else None,
                'date': str(row[4]),
                'time': str(row[5]),
                'method': row[6],
                'amount': row[7],
                'puffs': row[8],
                'thc_percent': float(row[9]) if row[9] else None,
                'strain': row[10],
                'mood': int(row[11]),
                'energy': int(row[12]),
                'focus': int(row[13]),
                'creativity': int(row[14]),
                'anxiety': int(row[15]),
                'activities': row[16] if row[16] else [],
                'notes': row[17],
                'created_at': row[18].isoformat() if row[18] else None,
                'updated_at': row[19].isoformat() if row[19] else None
            })

        return jsonify(entries), 200

    except Exception as e:
        logger.error(f"Get entries error: {e}")
        return jsonify({'error': 'Failed to get entries'}), 500
    finally:
        if 'cur' in locals():
            cur.close()
        if conn:
            conn.close()

@app.route('/api/v1/entries/stats', methods=['GET'])
@jwt_required()
def get_stats():
    """Get user's statistics"""
    try:
        user_id = get_jwt_identity()

        conn = get_db_connection()
        if not conn:
            return jsonify({'error': 'Database connection failed'}), 500

        cur = conn.cursor()

        # Get last 7 days stats
        cur.execute("""
            SELECT
                COALESCE(SUM(thc_mg), 0) as weekly_total,
                COALESCE(AVG(thc_mg), 0) as daily_avg,
                COALESCE(AVG(mood), 0) as avg_mood,
                COUNT(*) as total_sessions
            FROM entries
            WHERE user_id = %s AND timestamp >= CURRENT_DATE - INTERVAL '7 days'
        """, (user_id,))

        stats_row = cur.fetchone()
        stats = {
            'weekly_total': float(stats_row[0]),
            'daily_avg': float(stats_row[1]),
            'avg_mood': float(stats_row[2]),
            'total_sessions': stats_row[3]
        }

        return jsonify(stats), 200

    except Exception as e:
        logger.error(f"Get stats error: {e}")
        return jsonify({'error': 'Failed to get statistics'}), 500
    finally:
        if 'cur' in locals():
            cur.close()
        if conn:
            conn.close()

@app.route('/api/v1/entries/<int:entry_id>', methods=['DELETE'])
@jwt_required()
def delete_entry(entry_id):
    """Delete an entry"""
    try:
        user_id = get_jwt_identity()

        conn = get_db_connection()
        if not conn:
            return jsonify({'error': 'Database connection failed'}), 500

        cur = conn.cursor()

        cur.execute("""
            DELETE FROM entries
            WHERE id = %s AND user_id = %s
            RETURNING id
        """, (entry_id, user_id))

        result = cur.fetchone()
        if result:
            conn.commit()
            return jsonify({'message': 'Entry deleted successfully'}), 200
        else:
            return jsonify({'error': 'Entry not found'}), 404

    except Exception as e:
        logger.error(f"Delete entry error: {e}")
        return jsonify({'error': 'Failed to delete entry'}), 500
    finally:
        if 'cur' in locals():
            cur.close()
        if conn:
            conn.close()

@app.route('/')
def root():
    """Root endpoint"""
    return jsonify({
        'message': 'Cannabis Tracker API',
        'version': '1.0.0'
    })

@app.route('/health')
def health_check():
    """Health check endpoint"""
    return jsonify({'status': 'healthy'})

if __name__ == '__main__':
    logger.info("Starting Cannabis Tracker API...")
    port = int(os.getenv('PORT', 8000))
    debug = os.getenv('FLASK_ENV', 'production') == 'development'
    
    app.run(
        host='0.0.0.0',
        port=port,
        debug=debug
    )
