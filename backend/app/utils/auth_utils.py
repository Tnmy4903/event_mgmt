from werkzeug.security import generate_password_hash, check_password_hash
from flask_jwt_extended import create_access_token
from datetime import timedelta

def hash_password(password):
    return generate_password_hash(password)

def verify_password(hashed_password, plain_password):
    return check_password_hash(hashed_password, plain_password)

def generate_jwt(identity, role):
    return create_access_token(
        identity=identity,
        additional_claims={"role": role},
        expires_delta=timedelta(days=1)
    )