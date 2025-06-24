# app/controllers/auth_controller.py
from flask import request, jsonify
from app import mongo
from app.utils.auth_utils import hash_password, verify_password, generate_jwt
from datetime import datetime

def register_user():
    try:
        data = request.get_json()
        email = data.get("email")
        password = data.get("password")
        role = data.get("role", "client")

        if not email or not password:
            return jsonify({"error": "Email and password are required"}), 400
        if role not in ["client", "vendor", "admin"]:
            return jsonify({"error": "Invalid role"}), 400

        if mongo.db.users.find_one({"email": email}):
            return jsonify({"error": "Email already registered"}), 409

        user = {
            "email": email,
            "password_hash": hash_password(password),
            "role": role,
            "name": "",
            "profile": {
                "phone": "",
                "address": "",
                "profile_picture": ""
            },
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }

        mongo.db.users.insert_one(user)
        return jsonify({"message": "User registered successfully"}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500

def login_user():
    try:
        data = request.get_json()
        email = data.get("email")
        password = data.get("password")

        if not email or not password:
            return jsonify({"error": "Email and password are required"}), 400

        user = mongo.db.users.find_one({"email": email})
        if not user or not verify_password(user["password_hash"], password):
            return jsonify({"error": "Invalid credentials"}), 401

        token = generate_jwt(identity=str(user["_id"]), role=user["role"])
        return jsonify({
            "token": token,
            "role": user["role"],
            "user_id": str(user["_id"])
        }), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
