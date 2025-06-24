from flask_pymongo import PyMongo

mongo = PyMongo()  # Define globally

def init_extensions(app):
    mongo.init_app(app)
