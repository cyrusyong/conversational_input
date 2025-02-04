import os

class Config:
    # Secret key for session management and CSRF protection
    SECRET_KEY = 'your-secret-key-here'
    
    # Database configuration (SQLite example)
    SQLALCHEMY_DATABASE_URI = 'sqlite:///study-buzz.db'
    
    # Disable modification tracking to save resources
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    # Upload configurations
    MAX_CONTENT_LENGTH = 16 * 1024 * 1024  # 16MB max file size
    UPLOAD_FOLDER = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'app/static/uploads')
    UPLOADED_IMAGES_ALLOW = set(['png', 'jpg', 'jpeg', 'gif'])
    UPLOADED_DOCUMENTS_ALLOW = set(['pdf', 'doc', 'docx'])
    #UPLOADED_PHOTOS_DEST = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'app/static/uploads')