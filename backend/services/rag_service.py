import os
import json

# Load verses on module import
try:
    with open(os.path.join(os.path.dirname(__file__), '../data/verses.json'), 'r') as f:
        ALL_VERSES = json.load(f)
except Exception as e:
    print(f"Error loading verses: {e}")
    ALL_VERSES = []

def find_relevant_verses(query, top_k=5):
    """
    Finds verses relevant to the user query using keyword matching.
    """
    if not query:
        return []
        
    query_words = set(query.lower().split())
    ranked = []
    
    for verse in ALL_VERSES:
        text_lower = verse['text'].lower()
        score = sum(1 for word in query_words if word in text_lower)
        
        if score > 0:
            ranked.append((score, verse))
            
    ranked.sort(key=lambda x: x[0], reverse=True)
    return [item[1] for item in ranked[:top_k]]
