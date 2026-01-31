from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
import os
import re
from dotenv import load_dotenv
from services.ai_service import generate_response

load_dotenv(os.path.join(os.path.dirname(__file__), '../.env'))

app = Flask(__name__, static_folder='.', static_url_path='')
CORS(app)

# Setup Rate Limiter
limiter = Limiter(
    get_remote_address,
    app=app,
    default_limits=["200 per day", "50 per hour"],
    storage_uri="memory://"
)

@app.route('/generate', methods=['POST'])
@limiter.limit("5 per minute") 
def generate():
    data = request.get_json() or {}
    raw_prompt = data.get('prompt', '')
    
    # Backward compatibility: Extract "QUESTION: <text>" if present
    # The current frontend sends a massive string with instructions.
    # We want just the user's question for our RAG search.
    # Regex looks for "QUESTION: " ... until "AVAILABLE VERSES" or end
    match = re.search(r"QUESTION:\s*(.*?)(?:\n\s*AVAILABLE VERSES|$)", raw_prompt, re.DOTALL)
    if match:
        user_query = match.group(1).strip()
    else:
        user_query = raw_prompt

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
        app.logger.error(f"Server error: {e}")
        return jsonify({'error': 'Internal Server Error'}), 500

@app.route('/', methods=['GET'])
def health_check():
    return jsonify({"status": "healthy", "service": "Ezer Disciple API"}), 200

if __name__ == '__main__':
    port = int(os.getenv('PORT', 8000))
    app.run(host='0.0.0.0', port=port)
