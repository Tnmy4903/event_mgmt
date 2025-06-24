from flask import Blueprint
from app.controllers.vendor_controller import (
    create_event,
    view_vendor_events,
    delete_event,
    get_event_bookings,
    validate_ticket_vendor
)

vendor_routes = Blueprint("vendor_routes", __name__)

vendor_routes.route("/events", methods=["POST"])(create_event)
vendor_routes.route("/events", methods=["GET"])(view_vendor_events)
vendor_routes.route("/events/<event_id>", methods=["DELETE"])(delete_event)
vendor_routes.route('/events/bookings/<event_id>', methods=['GET'])(get_event_bookings)
vendor_routes.route('/validate-ticket/<ticket_id>', methods=['GET'])(validate_ticket_vendor)
