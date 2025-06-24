# app/controllers/vendor_controller.py
from flask import request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import mongo
from bson.objectid import ObjectId
from datetime import datetime

@jwt_required()
def create_event():
    try:
        user_id = get_jwt_identity()
        user = mongo.db.users.find_one({"_id": ObjectId(user_id)})
        if user["role"] != "vendor":
            return jsonify({"error": "Unauthorized"}), 403

        data = request.get_json()
        event = {
            "event_name": data["event_name"],
            "event_date": data["event_date"],
            "event_description": data["event_description"],
            "price": int(data.get("price")),
            'capacity': int(data['capacity']),
            "location": data.get("location", ""),
            "time": data.get("time", "N/A"),
            "booked": 0,
            "created_by": user_id,
            "organizer": data.get("organizer", "N/A"),
            "status": "pending",
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow(),
        }
        mongo.db.events.insert_one(event)
        return jsonify({"message": "Event created successfully"}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@jwt_required()
def view_vendor_events():
    try:
        user_id = get_jwt_identity()
        events = mongo.db.events.find({"created_by": user_id})
        events_list = [
            {
                "_id": str(event["_id"]),
                "title": event["event_name"],  
                "description": event["event_description"], 
                "date": event["event_date"],
                "time": event.get("time", "N/A"),
                "location": event.get("location", "N/A"),
                "price": event.get("price", 0),
                "status": event["status"],
                "capacity": event.get("capacity", 0),
                "booked": mongo.db.bookings.count_documents({"event_id": event["_id"]}),
                "organizer": event.get("organizer", "N/A"),
            }
            for event in events
        ]
        return jsonify(events_list), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@jwt_required()
def delete_event(event_id):
    try:
        user_id = get_jwt_identity()
        event = mongo.db.events.find_one({"_id": ObjectId(event_id)})

        if not event:
            return jsonify({"error": "Event not found"}), 404

        if event["created_by"] != user_id:
            return jsonify({"error": "Unauthorized"}), 403

        mongo.db.events.delete_one({"_id": ObjectId(event_id)})
        return jsonify({"message": "Event deleted successfully"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
@jwt_required()
def get_event_bookings(event_id):
    try:
        event_obj_id = ObjectId(event_id)
        print(f"🔍 Looking for bookings with event_id: {event_obj_id}")

        bookings_cursor = mongo.db.bookings.find({"event_id": event_obj_id})
        bookings_list = list(bookings_cursor)
        print(f"✅ Found {len(bookings_list)} bookings")

        result = []
        for booking in bookings_list:
            user = mongo.db.users.find_one({"_id": ObjectId(booking["user_id"])})
            raw_date = booking.get("timestamp") or booking.get("booked_at")
            booking_date = raw_date.isoformat() if isinstance(raw_date, datetime) else raw_date

            result.append({
                "user_id": str(user["_id"]) if user else None,
                "user_name": user.get("name", "") if user else "",
                "user_email": user.get("email", "") if user else "",
                "tickets": booking.get("tickets", 1),
                "ticket_id": booking["ticket_id"],
                "booking_date": booking_date,
                "coupon_code": booking.get("user_info", {}).get("coupon_code", None),
                "discount_applied": booking.get("user_info", {}).get("discount_applied", 0),
            })

        return jsonify(result), 200

    except Exception as e:
        print("🔥 Error in get_event_bookings:", e)
        return jsonify({"error": str(e)}), 500

@jwt_required()
def validate_ticket_vendor(ticket_id):
    try:
        user_id = get_jwt_identity()
        vendor = mongo.db.users.find_one({"_id": ObjectId(user_id), "role": "vendor"})
        if not vendor:
            return jsonify({"error": "Unauthorized"}), 403

        booking = mongo.db.bookings.find_one({"ticket_id": ticket_id})
        if not booking:
            return jsonify({"valid": False, "message": "Ticket not found"}), 404

        if booking.get("status") == "cancelled":
            return jsonify({"valid": False, "message": "Ticket is cancelled"}), 400

        if booking.get("checkin") is True:
            already_checked = True
        else:
            already_checked = False
            mongo.db.bookings.update_one(
                {"_id": booking["_id"]},
                {"$set": {"checkin": True}}
            )

        event = mongo.db.events.find_one({"_id": booking["event_id"]})
        if str(event["created_by"]) != str(user_id):
            return jsonify({"valid": False, "message": "Unauthorized: Not your event"}), 403

        user = mongo.db.users.find_one({"_id": booking["user_id"]})

        return jsonify({
            "valid": True,
            "ticket_id": ticket_id,
            "event": event["event_name"],
            "user_name": user.get("name", ""),
            "user_email": user.get("email", ""),
            "booked_at": booking["timestamp"].isoformat() if isinstance(booking["timestamp"], datetime) else booking["timestamp"],
            "already_checked_in": already_checked
        }), 200

    except Exception as e:
        return jsonify({"valid": False, "message": str(e)}), 500
    
    




