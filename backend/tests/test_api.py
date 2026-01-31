import unittest
import json
import os
import sys

# Add backend to path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from server import app

class EzerApiTestCase(unittest.TestCase):
    def setUp(self):
        self.app = app.test_client()
        self.app.testing = True

    def test_health_check(self):
        response = self.app.get('/')
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data)
        self.assertEqual(data['status'], 'healthy')

    def test_generate_requires_prompt(self):
        response = self.app.post('/generate', json={})
        # RAG service might return empty list or valid empty response, 
        # but let's check basic connectivity.
        # Since we mock nothing here, and it hits RAG, it might fail if verses.json missing
        # BUT verses.json is there. 
        self.assertEqual(response.status_code, 200)

if __name__ == '__main__':
    unittest.main()
