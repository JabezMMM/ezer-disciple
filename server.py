from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import os
import requests
import time
from flask import make_response
from dotenv import load_dotenv

# Load environment variables from .env if present
load_dotenv()

# Serve static files from project root so the app and proxy share origin
app = Flask(__name__, static_folder='.', static_url_path='')
CORS(app, resources={r"/generate": {"origins": "*"}})

GOOGLE_API_BASE = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent'


@app.route('/generate', methods=['POST'])
def generate():
    data = request.get_json() or {}
    prompt = data.get('prompt', '')

    api_key = os.getenv('GEMINI_API_KEY')
    if not api_key:
        return jsonify({'error': 'GEMINI_API_KEY not set on server'}), 500

    payload = {
        "contents": [{
            "parts": [{
                "text": prompt
            }]
        }],
        "generationConfig": {
            "temperature": 0.3,
            "maxOutputTokens": 200
        }
    }

    url = f"{GOOGLE_API_BASE}?key={api_key}"
    # Try with a small number of retries/backoff for transient errors (e.g., 429)
    max_attempts = 3
    backoff_seconds = [1, 2, 4]

    for attempt in range(1, max_attempts + 1):
        try:
            resp = requests.post(url, json=payload, timeout=30)
        except requests.RequestException as e:
            if attempt == max_attempts:
                return jsonify({'error': 'request failed', 'details': str(e)}), 502
            time.sleep(backoff_seconds[min(attempt-1, len(backoff_seconds)-1)])
            continue

        # If Google returns 429, try to respect RetryInfo.retryDelay if present
        if resp.status_code == 429:
            retry_secs = None
            try:
                body = resp.json()
                details = body.get('error', {}).get('details', []) if isinstance(body, dict) else []
                for d in details:
                    if isinstance(d, dict) and 'retryDelay' in d:
                        s = d.get('retryDelay', '')
                        if s.endswith('s'):
                            try:
                                retry_secs = int(float(s[:-1]))
                            except Exception:
                                pass
                        break
            except ValueError:
                body = None

            # If this was the last attempt, return the 429 response with Retry-After header if available
            if attempt == max_attempts:
                # Return a sanitized, user-friendly error body to avoid exposing raw API details
                resp_body = {"error": {"code": resp.status_code, "message": "Service temporarily unavailable. Please try again shortly."}}
                flask_resp = make_response(jsonify(resp_body), resp.status_code)
                if retry_secs is not None:
                    flask_resp.headers['Retry-After'] = str(retry_secs)
                    # Also include retry info in body
                    resp_body['error']['retryAfter'] = retry_secs
                return flask_resp

            # Wait for suggested time if available, otherwise exponential backoff
            wait = retry_secs if retry_secs is not None else backoff_seconds[min(attempt-1, len(backoff_seconds)-1)]
            time.sleep(wait)
            continue

        # For other status codes, return the result directly
        try:
            # For error responses, return a sanitized message rather than the full upstream body
            if resp.status_code >= 400:
                safe_body = {"error": {"code": resp.status_code, "message": "Service temporarily unavailable. Please try again shortly."}}
                flask_resp = make_response(jsonify(safe_body), resp.status_code)
            else:
                flask_resp = make_response(jsonify(resp.json()), resp.status_code)

            # If upstream provided Retry-After, forward it
            if 'Retry-After' in resp.headers:
                flask_resp.headers['Retry-After'] = resp.headers['Retry-After']
            return flask_resp
        except ValueError:
            return (resp.text, resp.status_code, {'Content-Type': 'text/plain'})



@app.route('/', methods=['GET'])
def index():
    return send_from_directory('.', 'index.html')


@app.route('/<path:filename>')
def static_files(filename):
    return send_from_directory('.', filename)


if __name__ == '__main__':
    port = int(os.getenv('PORT', 8000))
    app.run(host='0.0.0.0', port=port)
