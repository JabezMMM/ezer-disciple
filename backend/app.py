import os
from flask import Flask, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
from routes.generate import generate_bp

# Load environment variables
load_dotenv(os.path.join(os.path.dirname(__file__), '../.env'))

def create_app():
    app = Flask(__name__)
    CORS(app)

    # Register Blueprints
    app.register_blueprint(generate_bp)

    @app.route('/', methods=['GET'])
    def health_check():
        return jsonify({
            "status": "healthy", 
            "service": "Ezer Disciple API",
            "environment": os.getenv('FLASK_ENV', 'production')
        }), 200

    return app

app = create_app()

if __name__ == '__main__':
    port = int(os.getenv('PORT', 8000))
    app.run(host='0.0.0.0', port=port)
