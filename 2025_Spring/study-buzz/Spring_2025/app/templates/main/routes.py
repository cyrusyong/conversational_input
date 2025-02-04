from flask import Blueprint, render_template, redirect, url_for, request, flash
from flask_login import login_required, current_user
from app.models import Post, Tag, db
from app import photos
from werkzeug.utils import secure_filename
import os

main = Blueprint('main', __name__)

@main.route('/post/create', methods=['GET', 'POST'])
@login_required
def create_post():
    if request.method == 'POST':
        title = request.form.get('title')
        content = request.form.get('content')
        course = request.form.get('course')
        tag_names = request.form.getlist('tags')
        
        # Handle file upload
        image_url = None
        if 'photo' in request.files:
            file = request.files['photo']
            if file.filename != '':
                try:
                    filename = photos.save(file)
                    image_url = url_for('static', filename=f'uploads/{filename}')
                except Exception as e:
                    flash(f'Error uploading image: {str(e)}', 'error')
        
        post = Post(
            title=title,
            content=content,
            course=course,
            user_id=current_user.id,
            image_url=image_url
        )
        
        # Handle tags
        for tag_name in tag_names:
            tag = Tag.query.filter_by(name=tag_name).first()
            if not tag:
                tag = Tag(name=tag_name)
                db.session.add(tag)
            post.tags.append(tag)
        
        db.session.add(post)
        db.session.commit()
        
        flash('Post created successfully!', 'success')
        return redirect(url_for('main.index'))
    
    tags = Tag.query.filter_by(is_predefined=True).all()
    return render_template('main/create_post.html', tags=tags)