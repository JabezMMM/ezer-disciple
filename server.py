from flask import Flask, request, jsonify, send_from_directory, make_response
from flask_cors import CORS
import os
import requests
import time
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__, static_folder='.', static_url_path='')
# Allow CORS for local testing and your production domain
CORS(app)

# Validate Hugging Face Space configuration and set upstream timeout
# HF Space format is: https://username-spacename.hf.space
HF_USER = os.getenv("YOUR_USERNAME")
HF_SPACE = os.getenv("YOUR_SPACE_NAME")
UPSTREAM_TIMEOUT = int(os.getenv("UPSTREAM_TIMEOUT", "15"))  # seconds

if HF_USER and HF_SPACE:
    TL_API_BASE = f'https://{HF_USER}-{HF_SPACE}.hf.space/generate'
else:
    TL_API_BASE = None
    print("WARNING: YOUR_USERNAME or YOUR_SPACE_NAME missing in environment; /generate will return 500 until configured")

@app.route('/generate', methods=['POST'])
def generate():
    data = request.get_json() or {}
    prompt = data.get('prompt', '')

    payload = {"prompt": prompt}
    headers = {"Content-Type": "application/json"} # Explicitly set this
    url = TL_API_BASE

    max_attempts = 3
    backoff_seconds = [2, 4, 8]

    for attempt in range(1, max_attempts + 1):
        try:
            # FIX 2: Increased timeout to 90s. 
            # Free tier Spaces need time to "Wake Up" (Cold Start)
            resp = requests.post(url, json=payload, timeout=90)
            
            # If successful, break the loop and return
            if resp.status_code == 200:
                return jsonify(resp.json())
            
            # If 503, the Space is still waking up, so we retry
            if resp.status_code == 503:
                time.sleep(backoff_seconds[attempt-1])
                continue
                
            # For other errors, return sanitized message
            return jsonify({
                "error": "Upstream Service Error", 
                "status": resp.status_code
            }), resp.status_code

        except requests.RequestException as e:
            if attempt == max_attempts:
                return jsonify({'error': 'HF Space Connection Failed', 'details': str(e)}), 502
            time.sleep(backoff_seconds[attempt-1])
            continue



@app.route('/')
def index():
    return send_from_directory('.', 'index.html')

@app.route('/<path:filename>')
def static_files(filename):
    return send_from_directory('.', filename)

if __name__ == '__main__':
    # Standard Codespace port
    port = int(os.getenv('PORT', 8000))
    app.run(host='0.0.0.0', port=port)
