from flask import Blueprint
from app.controllers.user_controller import (
    view_all_events,
    book_event,
    view_bookings,
    download_ticket,
    cancel_booking,
)

customer_routes = Blueprint("customer_routes", __name__)

customer_routes.route("/events", methods=["GET"])(view_all_events)
customer_routes.route("/bookings", methods=["GET"])(view_bookings)
customer_routes.route("/events/book", methods=["POST"])(book_event)
customer_routes.route("/tickets/<ticket_id>", methods=["GET"])(download_ticket)
customer_routes.route('/bookings/<booking_id>', methods=['DELETE'])(cancel_booking)


