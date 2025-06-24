from flask import Blueprint
from app.controllers.auth_controller import register_user, login_user

auth_routes = Blueprint("auth_routes", __name__)

# Register route
auth_routes.route("/register", methods=["POST"])(register_user)

# Login route
auth_routes.route("/login", methods=["POST"])(login_user)