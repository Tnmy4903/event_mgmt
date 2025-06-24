from flask import Flask
from flask_jwt_extended import JWTManager
from flask_cors import CORS
from flask_pymongo import PyMongo
from app.config import Config

# Initialize Flask app
app = Flask(__name__)

# Load config
app.config.from_object("app.config.Config")

# Enable CORS (allow frontend to make requests)
CORS(app)

# Initialize JWT
jwt = JWTManager(app)

# Initialize MongoDB
from app import mongo
from app import init_extensions
init_extensions(app)

# Make mongo globally available (optional)
from app import mongo

# Register Blueprints (Routes)
from app.routes.auth_routes import auth_routes
app.register_blueprint(auth_routes, url_prefix="/api/auth")

from app.routes.customer_routes import customer_routes
from app.routes.vendor_routes import vendor_routes
from app.routes.admin_routes import admin_routes
from app.routes.common_routes import common_routes

app.register_blueprint(customer_routes, url_prefix="/api/customer")
app.register_blueprint(vendor_routes, url_prefix="/api/vendor")
app.register_blueprint(admin_routes, url_prefix="/api/admin")
app.register_blueprint(common_routes, url_prefix="/api/common")

# Run the app
if __name__ == "__main__":
    app.run(debug=True)