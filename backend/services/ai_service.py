import os
import requests
import time
from flask import current_app
from .rag_service import find_relevant_verses

def get_ai_response(prompt, user_ip):
    """
    Proxies the request to Hugging Face Space.
    """
    hf_user = os.getenv("YOUR_USERNAME")
    hf_space = os.getenv("YOUR_SPACE_NAME")
    upstream_timeout = int(os.getenv("UPSTREAM_TIMEOUT", "15"))

    if not hf_user or not hf_space:
        raise ValueError("HF Space not configured (YOUR_USERNAME, YOUR_SPACE_NAME missing).")

    api_url = f'https://{hf_user}-{hf_space}.hf.space/generate'
    payload = {"prompt": prompt}
    
    max_attempts = 3
    backoff = [2, 4, 8]
    
    for attempt in range(1, max_attempts + 1):
        try:
            resp = requests.post(api_url, json=payload, timeout=upstream_timeout)
            
            if resp.status_code == 200:
                return resp.json() # Expects {'text': '...'}
                
            if resp.status_code == 503:
                current_app.logger.warning(f"Upstream 503 (Attempt {attempt}/{max_attempts})")
                time.sleep(backoff[attempt-1])
                continue
                
            # Other errors
            current_app.logger.error(f"Upstream error {resp.status_code}: {resp.text}")
            return {
                'error': 'Upstream Service Error',
                'status': resp.status_code,
                'details': resp.text
            }
            
        except requests.RequestException as e:
            if attempt == max_attempts:
                current_app.logger.error(f"Upstream connection failed: {e}")
                raise e
            time.sleep(backoff[attempt-1])
            continue
            
    return {'error': 'Service Unavailable'}

def generate_response(user_query, user_ip):
    # 1. RAG: Find verses
    relevant_verses = find_relevant_verses(user_query)
    
    # 2. Build Prompt
    if not relevant_verses:
        context_str = "No specific verses found for this topic."
    else:
        context_str = "\n".join([f"{v['ref']}: \"{v['text']}\"" for v in relevant_verses])

    system_prompt = f"""You are a biblical assistant. 
Authorized Knowledge Base:
{context_str}

Instructions:
1. Answer the user's question using ONLY the verses provided in the Authorized Knowledge Base.
2. If the Authorized Knowledge Base says "No specific verses found" or doesn't contain the answer, state: "I cannot answer this based on the provided scripture context."
3. Do NOT use Markdown formatting. Return plain text.
4. Keep it conversational but concise (2-3 sentences).
5. Always cite the verse reference (e.g. John 3:16) when using it.

USER QUERY: {user_query}"""

    # 3. Call AI
    return get_ai_response(system_prompt, user_ip)
