# app/controllers/admin_controller.py
from flask import request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import mongo
from bson.objectid import ObjectId
from datetime import datetime

@jwt_required()
def manage_event(event_id):
    try:
        user_id = get_jwt_identity()
        user = mongo.db.users.find_one({"_id": ObjectId(user_id)})
        if user["role"] != "admin":
            return jsonify({"error": "Unauthorized"}), 403

        event = mongo.db.events.find_one({"_id": ObjectId(event_id)})
        if not event:
            return jsonify({"error": "Event not found"}), 404

        if request.method == "PUT":
            mongo.db.events.update_one({"_id": ObjectId(event_id)}, {"$set": {"status": "approved"}})
            return jsonify({"message": "Event approved"}), 200

        if request.method == "DELETE":
            mongo.db.events.delete_one({"_id": ObjectId(event_id)})
            return jsonify({"message": "Event deleted"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@jwt_required()
def manage_users():
    try:
        user_id = get_jwt_identity()
        user = mongo.db.users.find_one({"_id": ObjectId(user_id)})
        if user["role"] != "admin":
            return jsonify({"error": "Unauthorized"}), 403

        users = mongo.db.users.find()
        users_list = [{"_id": str(u["_id"]), "email": u["email"], "role": u["role"]} for u in users]
        return jsonify(users_list), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@jwt_required()
def get_pending_events():
    try:
        user_id = get_jwt_identity()
        user = mongo.db.users.find_one({"_id": ObjectId(user_id)})
        if user["role"] != "admin":
            return jsonify({"error": "Unauthorized"}), 403

        # Fetch events with status "pending"
        events = list(mongo.db.events.find({"status": "pending"}))
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
                "booked": event.get("booked", 0),
                "created_by": str(event["created_by"]),
                "organizer": event.get("organizer", "N/A"),
            }
            for event in events
        ]
        return jsonify(events_list), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@jwt_required()
def create_coupon():
    try:
        user_id = get_jwt_identity()
        user = mongo.db.users.find_one({"_id": ObjectId(user_id)})
        if user["role"] != "admin":
            return jsonify({"error": "Unauthorized"}), 403

        data = request.get_json()
        new_coupon = {
            "code": data["code"].upper(),
            "discount_percent": int(data["discount_percent"]),
            "expires_at": datetime.strptime(data["expires_at"], "%Y-%m-%d"),
            "active": True,
            "created_at": datetime.utcnow()
        }
        mongo.db.coupons.insert_one(new_coupon)
        return jsonify({"message": "Coupon created successfully"}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
