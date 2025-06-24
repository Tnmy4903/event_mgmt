from flask import request, jsonify, make_response
from reportlab.lib.pagesizes import A4
from reportlab.pdfgen import canvas
from PIL import Image
import qrcode
from io import BytesIO
from flask_jwt_extended import jwt_required, get_jwt_identity
from bson.objectid import ObjectId
from app import mongo
from datetime import datetime
import uuid  # Import the UUID library

@jwt_required()
def view_all_events():
    try:
        events = mongo.db.events.find({"status": "approved"})
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
def book_event():
    try:
        data = request.json
        event_id = data.get('eventId')
        quantity = int(data.get('quantity', 1))
        coupon = data.get('coupon', '').strip().upper()
        user_info = data.get('userDetails', {})

        user_id = get_jwt_identity()
        user = mongo.db.users.find_one({'_id': ObjectId(user_id)})

        if not user:
            return jsonify({'success': False, 'message': 'User not found'}), 404

        event = mongo.db.events.find_one({'_id': ObjectId(event_id)})
        if not event:
            return jsonify({'success': False, 'message': 'Event not found'}), 404

        available = int(event.get('capacity', 0)) - int(event.get('booked', 0))
        if available < quantity:
            return jsonify({'success': False, 'message': f'Only {available} tickets available'}), 400

        # 🔍 Coupon validation from MongoDB
        discount = 0
        if coupon:
            coupon_data = mongo.db.coupons.find_one({
                "code": coupon,
                "active": True,
                "expires_at": {"$gte": datetime.utcnow()}
            })

            if not coupon_data:
                return jsonify({'success': False, 'message': 'Invalid or expired coupon'}), 400

            discount = (coupon_data['discount_percent'] / 100) * event['price'] * quantity

        # 🎟️ Book tickets
        for _ in range(quantity):
            ticket_id = str(uuid.uuid4())
            mongo.db.bookings.insert_one({
                'user_id': user['_id'],
                'event_id': event['_id'],
                'vendor_id': event['created_by'],
                'timestamp': datetime.utcnow(),
                'ticket_id': ticket_id,
                'user_info': user_info,
                'coupon_code': coupon if coupon else None,
                'discount_applied': round(discount / quantity, 2)
            })

        # Get accurate total bookings from DB
        current_count = mongo.db.bookings.count_documents({"event_id": ObjectId(event_id)})

        # Update event with accurate count
        mongo.db.events.update_one(
            {"_id": ObjectId(event_id)},
            {"$set": {"booked": current_count}}
        )

        # ✅ Final response
        return jsonify({
            'success': True,
            'message': f'{quantity} ticket(s) booked.',
            'discount': round(discount, 2),
            'final_price': round(event['price'] * quantity - discount, 2)
        }), 200

    except Exception as e:
        print("🔥 Error in booking:", str(e))
        return jsonify({'success': False, 'message': 'Booking failed'}), 500

@jwt_required()
def view_bookings():
    try:
        user_id = get_jwt_identity()
        bookings = mongo.db.bookings.find({"user_id": ObjectId(user_id)})
        bookings_list = [
            {
                "_id": str(b["_id"]),
                "event_id": str(b["event_id"]),
                "booked_at": b["timestamp"].isoformat(),
                "ticket_id": b["ticket_id"]
            }
            for b in bookings
        ]
        return jsonify(bookings_list), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@jwt_required()
def download_ticket(ticket_id):
    try:
        booking = mongo.db.bookings.find_one({"ticket_id": ticket_id})
        if not booking:
            return jsonify({"error": "Booking not found"}), 404

        event = mongo.db.events.find_one({"_id": booking["event_id"]})
        user = mongo.db.users.find_one({"_id": booking["user_id"]})

        buffer = BytesIO()
        pdf = canvas.Canvas(buffer, pagesize=A4)
        pdf.setTitle("Ticket")

        # Title
        pdf.setFont("Helvetica-Bold", 20)
        pdf.drawString(100, 800, "🎟 Event Ticket")

        # Details
        pdf.setFont("Helvetica", 12)
        pdf.drawString(100, 770, f"Event: {event['event_name']}")
        pdf.drawString(100, 750, f"Date: {event['event_date']} at {event.get('time', 'N/A')}")
        pdf.drawString(100, 730, f"Location: {event.get('location', 'N/A')}")
        pdf.drawString(100, 710, f"Name: {user.get('name', '')}")
        pdf.drawString(100, 690, f"Email: {user.get('email', '')}")
        pdf.drawString(100, 670, f"Ticket ID: {ticket_id}")
        pdf.drawString(100, 650, f"Booking Time: {booking['timestamp'].isoformat()}")

        # QR Code
        qr_data = f"TICKET:{ticket_id}"
        qr_img = qrcode.make(qr_data)
        qr_buffer = BytesIO()
        qr_img.save(qr_buffer, format="PNG")
        qr_buffer.seek(0)
        qr_pil = Image.open(qr_buffer)
        pdf.drawInlineImage(qr_pil, 400, 700, width=120, height=120)

        pdf.save()
        buffer.seek(0)

        response = make_response(buffer.read())
        response.headers['Content-Type'] = 'application/pdf'
        response.headers['Content-Disposition'] = f'attachment; filename=ticket_{ticket_id}.pdf'

        return response

    except Exception as e:
        print("🔥 Error generating ticket:", str(e))
        return jsonify({"error": "Failed to generate ticket"}), 500
    
@jwt_required()
def cancel_booking(booking_id):
    try:
        user_id = get_jwt_identity()

        # Find the booking
        booking = mongo.db.bookings.find_one({"_id": ObjectId(booking_id), "user_id": ObjectId(user_id)})
        if not booking:
            return jsonify({"error": "Booking not found"}), 404

        # Delete the booking
        mongo.db.bookings.delete_one({"_id": ObjectId(booking_id)})

        # Decrease event's booked count
        mongo.db.events.update_one(
            {"_id": booking["event_id"]},
            {"$inc": {"booked": -1}}
        )

        return jsonify({"message": "Booking cancelled successfully"}), 200

    except Exception as e:
        print("🔥 Error cancelling booking:", str(e))
        return jsonify({"error": "Failed to cancel booking"}), 500

