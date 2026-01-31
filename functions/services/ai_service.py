import os
import time
from groq import Groq
from dotenv import load_dotenv
from services.rag_service import find_relevant_verses
from utils.prompt_builder import build_biblical_prompt

# Load environment variables (useful for local emulator)
load_dotenv()

# Initialize Groq client
# In Firebase Functions, GROQ_API_KEY should be set via secrets
client = Groq(api_key=os.getenv("GROQ_API_KEY"))

def get_ai_response(prompt):
    """
    Calls the Groq API using Llama 3.
    """
    if not os.getenv("GROQ_API_KEY"):
        return {"error": "GROQ_API_KEY not configured", "status": 500}

    try:
        chat_completion = client.chat.completions.create(
            messages=[
                {
                    "role": "user",
                    "content": prompt,
                }
            ],
            model="llama-3.1-8b-instant", # Updated from decommissioned llama3-8b-8192
            temperature=0.2, # Low temperature for factual biblical answers
            max_tokens=300,
        )
        
        return {"text": chat_completion.choices[0].message.content}

    except Exception as e:
        print(f"Groq API Error: {e}")
        return {"error": str(e), "status": 500}

def generate_response(user_query):
    # 1. RAG: Find verses from local JSON
    relevant_verses = find_relevant_verses(user_query)
    
    # 2. Build the restricted prompt
    prompt = build_biblical_prompt(user_query, relevant_verses)
    
    # 3. Call Groq
    return get_ai_response(prompt)

