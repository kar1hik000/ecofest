"""JWT Authentication module for Festival Waste Prediction API."""

import os
import jwt
import hashlib
from datetime import datetime, timedelta
from functools import wraps
from flask import request, jsonify
from dotenv import load_dotenv

load_dotenv(os.path.join(os.path.dirname(__file__), '..', '.env'))

# Secret key for JWT - in production, use a secure secret
SECRET_KEY = os.getenv('JWT_SECRET_KEY', 'festival-waste-prediction-secret-key-2024')

# Try to import Supabase, fallback to demo users if not available
try:
    from database import supabase
    USE_SUPABASE = True
except Exception as e:
    print(f"Supabase not available, using demo users: {e}")
    USE_SUPABASE = False

# Fallback demo users (used if Supabase connection fails)
DEMO_USERS = {
    'admin': {
        'password_hash': hashlib.sha256('admin123'.encode()).hexdigest(),
        'role': 'Admin',
        'name': 'Administrator',
        'email': 'admin@ecofest.com'
    },
    'municipality': {
        'password_hash': hashlib.sha256('muni2024'.encode()).hexdigest(),
        'role': 'Municipality',
        'name': 'BBMP Officer',
        'email': 'officer@bbmp.gov.in'
    },
    'shopkeeper': {
        'password_hash': hashlib.sha256('shop123'.encode()).hexdigest(),
        'role': 'Shopkeeper',
        'name': 'Demo Shopkeeper',
        'email': 'shop@demo.com'
    }
}


def generate_token(username, role, name):
    """Generate JWT token for authenticated user."""
    payload = {
        'username': username,
        'role': role,
        'name': name,
        'exp': datetime.utcnow() + timedelta(hours=24),
        'iat': datetime.utcnow()
    }
    return jwt.encode(payload, SECRET_KEY, algorithm='HS256')


def verify_token(token):
    """Verify JWT token and return payload."""
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=['HS256'])
        return payload
    except jwt.ExpiredSignatureError:
        return None
    except jwt.InvalidTokenError:
        return None


def authenticate_user(username, password):
    """Authenticate user credentials - tries Supabase first, then fallback to demo users."""
    password_hash = hashlib.sha256(password.encode()).hexdigest()
    
    # Try Supabase authentication
    if USE_SUPABASE:
        try:
            response = supabase.table('users').select('*').eq('username', username).execute()
            if response.data and len(response.data) > 0:
                user = response.data[0]
                if user['password_hash'] == password_hash:
                    return {
                        'username': username,
                        'role': user['role'],
                        'name': user['name'],
                        'email': user.get('email', '')
                    }
            # User not found in Supabase, try demo users
        except Exception as e:
            print(f"Supabase auth error: {e}")
    
    # Fallback to demo users
    if username in DEMO_USERS:
        user = DEMO_USERS[username]
        if user['password_hash'] == password_hash:
            return {
                'username': username,
                'role': user['role'],
                'name': user['name'],
                'email': user['email']
            }
    
    return None


def register_user(username, password, name, email, role='shopkeeper'):
    """Register a new user - tries Supabase first, then fallback to demo users."""
    password_hash = hashlib.sha256(password.encode()).hexdigest()
    
    # Validate role
    valid_roles = ['shopkeeper', 'municipality', 'Shopkeeper', 'Municipality']
    if role not in valid_roles:
        role = 'Shopkeeper'
    
    # Capitalize role for consistency
    role = role.capitalize()
    
    # Try Supabase registration
    if USE_SUPABASE:
        try:
            # Check if username already exists
            existing = supabase.table('users').select('username').eq('username', username).execute()
            if existing.data and len(existing.data) > 0:
                return {'error': 'Username already exists'}
            
            # Create new user
            response = supabase.table('users').insert({
                'username': username,
                'password_hash': password_hash,
                'name': name,
                'email': email,
                'role': role
            }).execute()
            
            if response.data:
                return {
                    'success': True,
                    'username': username,
                    'name': name,
                    'role': role
                }
        except Exception as e:
            print(f"Supabase registration error: {e}")
            # Fall through to demo user creation
    
    # Fallback: Add to demo users (in-memory only)
    if username in DEMO_USERS:
        return {'error': 'Username already exists'}
    
    DEMO_USERS[username] = {
        'password_hash': password_hash,
        'role': role,
        'name': name,
        'email': email
    }
    
    return {
        'success': True,
        'username': username,
        'name': name,
        'role': role
    }


def token_required(f):
    """Decorator to protect routes with JWT authentication."""
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        
        # Get token from header
        if 'Authorization' in request.headers:
            auth_header = request.headers['Authorization']
            try:
                token = auth_header.split(' ')[1]  # Bearer <token>
            except IndexError:
                return jsonify({'error': 'Invalid token format'}), 401
        
        if not token:
            return jsonify({'error': 'Token is missing'}), 401
        
        payload = verify_token(token)
        if not payload:
            return jsonify({'error': 'Token is invalid or expired'}), 401
        
        # Add user info to request
        request.current_user = payload
        return f(*args, **kwargs)
    
    return decorated


def admin_required(f):
    """Decorator to require admin role."""
    @wraps(f)
    def decorated(*args, **kwargs):
        if not hasattr(request, 'current_user'):
            return jsonify({'error': 'Authentication required'}), 401
        
        if request.current_user.get('role') != 'admin':
            return jsonify({'error': 'Admin access required'}), 403
        
        return f(*args, **kwargs)
    
    return decorated
