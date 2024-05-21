#!/usr/bin/env python3
"""Module that creates and configures the Flask application
"""
from flask import Flask, jsonify
from config import Config
from routes import auth_bp, home_bp, profile_bp
from flask_jwt_extended import JWTManager


def create_app(config=Config):
    """Create the flask application
    """
    app = Flask(__name__)

    # # Initialize the JWTManager
    jwt = JWTManager(app)

    # Set configuration
    app.config.from_object(config)

    # Disable strict slashes
    app.url_map.strict_slashes = False

    # Register blueprints
    app.register_blueprint(auth_bp)
    app.register_blueprint(home_bp)
    app.register_blueprint(profile_bp, url_prefix='/me')

    @jwt.invalid_token_loader
    def unauthorized_response(callback):
        """Return an error if invalid JWT
        """
        return jsonify({'error': 'The token is invalid or has expired'}), 401

    @jwt.unauthorized_loader
    def unauthorized_callback(error):
        """Return an error if missing JWT
        """
        return jsonify({'error': 'Missing Authorization Header'}), 401

    return app


# Create and run app for developement purpose
if __name__ == '__main__':
    app = create_app()
    app.run(debug=True, host=Config.HOST, port=Config.PORT)
