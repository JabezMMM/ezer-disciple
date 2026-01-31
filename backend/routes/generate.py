from flask import Blueprint, request, jsonify, current_app
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
import re
from services.ai_provider import generate_response

generate_bp = Blueprint('generate', __name__)

# Note: In a larger app, you'd move limiter to an extensions.py file
# For now, we initialize it here or simply bypass if not configured in app.py
# To keep it simple and consistent with the previous version:
limiter = Limiter(
    get_remote_address,
    default_limits=["200 per day", "50 per hour"],
    storage_uri="memory://"
)

@generate_bp.route('/generate', methods=['POST'])
# @limiter.limit("5 per minute") # Optional: uncomment if you want to keep per-route limits
def generate():
    data = request.get_json() or {}
    raw_prompt = data.get('prompt', '')
    
    # Extract user query
    # The current frontend sends a massive string or just the question.
    match = re.search(r"QUESTION:\s*(.*?)(?:\n\s*AVAILABLE VERSES|$)", raw_prompt, re.DOTALL)
    user_query = match.group(1).strip() if match else raw_prompt

    user_ip = get_remote_address()
    
    try:
        response_data = generate_response(user_query, user_ip)
        
        if 'error' in response_data:
            status = response_data.get('status', 500)
            return jsonify(response_data), status
            
        return jsonify(response_data)
        
    except ValueError as e:
        return jsonify({'error': str(e)}), 500
    except Exception as e:
        current_app.logger.error(f"Server error: {e}")
        return jsonify({'error': 'Internal Server Error'}), 500
