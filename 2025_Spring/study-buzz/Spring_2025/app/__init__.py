from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_login import LoginManager
from flask_uploads import configure_uploads, UploadSet, IMAGES
from config import Config


db = SQLAlchemy()
login_manager = LoginManager()
login_manager.login_view = 'auth.login'

photos = UploadSet('photos', IMAGES)

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    # Configure upload settings
    app.config['UPLOADED_PHOTOS_DEST'] = 'app/static/uploads'

    db.init_app(app)
    login_manager.init_app(app)
    # Set up uploads
    configure_uploads(app, photos)
    
    from app.routes import main, auth
    app.register_blueprint(main)
    app.register_blueprint(auth)

    with app.app_context():
        db.create_all()

    return app

from app.models import User, Post, Tag