from flask import Blueprint, render_template, redirect, url_for, request, flash, jsonify
from flask_login import login_required, current_user
from app.models import Post, Tag, PostMedia, db
from app.utils.uploads import images, documents, allowed_file
from werkzeug.utils import secure_filename
import os


main = Blueprint('main', __name__)

@main.route('/')
def index():
    course = request.args.get('course')
    tag = request.args.get('tag')
    sort = request.args.get('sort', 'new')
    
    query = Post.query
    
    if course:
        query = query.filter_by(course=course)
    if tag:
        query = query.filter(Post.tags.any(name=tag))
        
    if sort == 'top':
        query = query.order_by(Post.votes.desc())
    else:
        query = query.order_by(Post.timestamp.desc())
        
    posts = query.all()
    courses = db.session.query(Post.course).distinct().all()
    tags = Tag.query.all()
    
    return render_template('main/index.html', posts=posts, courses=courses, tags=tags)

@main.route('/post/create', methods=['GET', 'POST'])
@login_required
def create_post():
    if request.method == 'POST':
        title = request.form.get('title')
        content = request.form.get('content')
        course = request.form.get('course')
        tag_names = request.form.getlist('tags')
        
        post = Post(title=title, content=content, course=course, author=current_user, image_url=file_url)
        
        # Handle tags
        for tag_name in tag_names:
            tag = Tag.query.filter_by(name=tag_name).first()
            if not tag:
                tag = Tag(name=tag_name)
                db.session.add(tag)
            post.tags.append(tag)
        
        # Handle uploaded files
        uploaded_files = []
        
        # Handle images
        if 'images' in request.files:
            image_files = request.files.getlist('images')
            for file in image_files:
                if file and allowed_file(file.filename, 'image'):
                    filename = images.save(file)
                    media = PostMedia(
                        filename=filename,
                        file_type='image',
                        original_filename=file.filename
                    )
                    post.media.append(media)

        if 'photo' in request.files:
            file = request.files['photo']
            if file and file.filename != '':
                filename = secure_filename(file.filename)
                file_path = os.path.join(current_app.config['UPLOAD_FOLDER'], filename)
                file.save(file_path)
                post.image_url = url_for('static', filename=f'uploads/{filename}')
                post.media_type = 'image'
                post.original_filename = file.filename
        else:
            file_url = None
        
        # Handle documents
        if 'documents' in request.files:
            doc_files = request.files.getlist('documents')
            for file in doc_files:
                if file and allowed_file(file.filename, 'document'):
                    filename = documents.save(file)
                    media = PostMedia(
                        filename=filename,
                        file_type='document',
                        original_filename=file.filename
                    )
                    post.media.append(media)
        
        db.session.add(post)
        db.session.commit()
        flash('Post created successfully!', 'success')
        return redirect(url_for('main.index'))
        
    tags = Tag.query.filter_by(is_predefined=True).all()
    return render_template('main/create_post.html', tags=tags)

@main.route('/post/<int:post_id>/vote', methods=['POST'])
@login_required
def vote_post(post_id):
    post = Post.query.get_or_404(post_id)
    vote_type = request.json.get('vote_type')
    
    if vote_type == 'up':
        post.votes += 1
    elif vote_type == 'down':
        post.votes -= 1
        
    db.session.commit()
    return jsonify({'votes': post.votes})

@main.route('/tag/create', methods=['POST'])
@login_required
def create_tag():
    tag_name = request.form.get('tag_name')
    if not Tag.query.filter_by(name=tag_name).first():
        tag = Tag(name=tag_name)
        db.session.add(tag)
        db.session.commit()
        return jsonify({'status': 'success', 'tag_id': tag.id})
    return jsonify({'status': 'error', 'message': 'Tag already exists'})