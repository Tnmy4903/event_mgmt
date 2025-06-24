from flask import request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from bson.objectid import ObjectId
from app import mongo
from datetime import datetime
import bcrypt

@jwt_required()
def get_current_user():
    try:
        user_id = get_jwt_identity()
        user = mongo.db.users.find_one({"_id": ObjectId(user_id)}, {"password_hash": 0})
        if not user:
            return jsonify({"error": "User not found"}), 404

        user["_id"] = str(user["_id"])
        return jsonify(user), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@jwt_required()
def update_user_profile():
    try:
        user_id = get_jwt_identity()
        data = request.json

        update_data = {
            "name": data.get("name", ""),
            "profile": {
                "phone": data.get("phone", ""),
                "address": data.get("address", ""),
                "profile_picture": data.get("profile_picture", ""),
            },
            "updated_at": datetime.utcnow(),
        }

        mongo.db.users.update_one({"_id": ObjectId(user_id)}, {"$set": update_data})
        return jsonify({"message": "Profile updated successfully"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@jwt_required()
def update_user_password():
    try:
        user_id = get_jwt_identity()
        data = request.json

        current_password = data.get("current_password")
        new_password = data.get("new_password")

        if not current_password or not new_password:
            return jsonify({"error": "Both current and new passwords are required"}), 400

        user = mongo.db.users.find_one({"_id": ObjectId(user_id)})
        if not user:
            return jsonify({"error": "User not found"}), 404

        if not bcrypt.checkpw(current_password.encode(), user["password_hash"].encode()):
            return jsonify({"error": "Current password is incorrect"}), 401

        new_hash = bcrypt.hashpw(new_password.encode(), bcrypt.gensalt()).decode()

        mongo.db.users.update_one(
            {"_id": ObjectId(user_id)},
            {"$set": {"password_hash": new_hash, "updated_at": datetime.utcnow()}},
        )

        return jsonify({"message": "Password updated successfully"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500