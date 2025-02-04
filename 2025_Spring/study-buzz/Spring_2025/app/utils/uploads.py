import os
from flask import current_app
from werkzeug.utils import secure_filename
from app.utils.flask_uploads import UploadSet, IMAGES, configure_uploads, ALL

# Define allowed file types
ALLOWED_EXTENSIONS = {
    'image': {'png', 'jpg', 'jpeg', 'gif'},
    'document': {'pdf', 'doc', 'docx'},
}

# Create upload sets for different file types
images = UploadSet('images', IMAGES)
documents = UploadSet('documents', ALL)

def setup_uploads(app):
    # Configure upload folders
    app.config['UPLOADED_IMAGES_DEST'] = os.path.join(app.root_path, 'static/uploads/images')
    app.config['UPLOADED_DOCUMENTS_DEST'] = os.path.join(app.root_path, 'static/uploads/documents')
    
    # Create directories if they don't exist
    os.makedirs(app.config['UPLOADED_IMAGES_DEST'], exist_ok=True)
    os.makedirs(app.config['UPLOADED_DOCUMENTS_DEST'], exist_ok=True)
    
    # Configure uploads
    configure_uploads(app, (images, documents))

def allowed_file(filename, file_type):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS[file_type]