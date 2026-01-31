from firebase_functions import https_fn
from firebase_admin import initialize_app
import json
from services.ai_service import generate_response

initialize_app()

@https_fn.on_request(secrets=["GROQ_API_KEY"])
def generate(req: https_fn.Request) -> https_fn.Response:
    # Handle CORS
    if req.method == "OPTIONS":
        headers = {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "POST",
            "Access-Control-Allow-Headers": "Content-Type",
            "Access-Control-Max-Age": "3600",
        }
        return https_fn.Response("", status=204, headers=headers)

    # Set CORS headers for the main request
    headers = {"Access-Control-Allow-Origin": "*"}

    if req.method != "POST":
        return https_fn.Response("Method Not Allowed", status=405, headers=headers)

    try:
        data = req.get_json()
        prompt = data.get("prompt", "")
        
        if not prompt:
            return https_fn.Response(json.dumps({"error": "No prompt provided"}), status=400, headers=headers)

        # We assume the prompt sent by frontend is just the question for now, 
        # or we could parse it if it follows the old "QUESTION: ..." format.
        # To be safe, let's just pass it to generate_response.
        result = generate_response(prompt)
        
        status = result.get("status", 200)
        return https_fn.Response(json.dumps(result), status=status, headers=headers, mimetype="application/json")

    except Exception as e:
        return https_fn.Response(json.dumps({"error": str(e)}), status=500, headers=headers, mimetype="application/json")
