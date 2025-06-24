from flask import Blueprint
from app.controllers.common_controller import (
    get_current_user,
    update_user_profile,
    update_user_password,
)

common_routes = Blueprint("common_routes", __name__)

common_routes.route("/me", methods=["GET"])(get_current_user)
common_routes.route("/me/update", methods=["POST"])(update_user_profile)
common_routes.route("/me/password", methods=["POST"])(update_user_password)