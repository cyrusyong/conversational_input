import os
from flask import Flask, Blueprint, current_app, send_from_directory, abort
from werkzeug.utils import secure_filename
from werkzeug.datastructures import FileStorage
import imghdr

class UploadSet:
    def __init__(self, name, extensions=None, default_dest=None):
        self.name = name
        self.extensions = extensions
        self.default_dest = default_dest

    def save(self, storage, folder=None, name=None):
        if not isinstance(storage, FileStorage):
            raise TypeError("storage must be a werkzeug.FileStorage")

        if folder is None:
            folder = self.default_dest
        
        if name is None:
            name = secure_filename(storage.filename)
        
        target = os.path.join(folder, name)
        storage.save(target)
        
        return name

def configure_uploads(app, upload_sets):
    if isinstance(upload_sets, UploadSet):
        upload_sets = (upload_sets,)

    for uset in upload_sets:
        if uset.name not in app.config:
            app.config[uset.name] = uset.default_dest

IMAGES = set(['jpg', 'jpeg', 'png', 'gif'])
ALL = set(['pdf', 'doc', 'docx'] + list(IMAGES))