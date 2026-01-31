import json
import os

class ModelLoader:
    def __init__(self, config_path='models/config.json'):
        self.config = self._load_config(config_path)

    def _load_config(self, path):
        try:
            with open(path, 'r') as f:
                return json.load(f)
        except FileNotFoundError:
            print(f"Config not found at {path}, using defaults.")
            return {}

    def get_config(self):
        return self.config

    def load_model(self):
        # Placeholder for loading local weights or initializing HF client
        source = self.config.get('model_source', 'huggingface_space')
        print(f"Initializing model source: {source}")
        return None
