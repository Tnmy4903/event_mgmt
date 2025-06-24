from flask import Blueprint
from app.controllers.admin_controller import (
    manage_event,
    manage_users,
    get_pending_events,
    create_coupon
)

admin_routes = Blueprint("admin_routes", __name__)

admin_routes.route("/events", methods=["GET"])(get_pending_events)
admin_routes.route("/events/<event_id>", methods=["PUT", "DELETE"])(manage_event)
admin_routes.route("/users", methods=["GET"])(manage_users)
admin_routes.route("/coupons", methods=["POST"])(create_coupon)
