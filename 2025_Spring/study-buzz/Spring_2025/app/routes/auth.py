from flask import Blueprint, render_template, redirect, url_for, flash, request
from flask_login import login_user, logout_user, login_required, current_user
from app.models import User, db
from werkzeug.security import generate_password_hash
import re

auth = Blueprint('auth', __name__)

@auth.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        email = request.form.get('email')
        password = request.form.get('password')
        user = User.query.filter_by(email=email).first()
        
        if user and user.check_password(password):
            login_user(user)
            return redirect(url_for('main.index'))
        flash('Invalid email or password')
    return render_template('auth/login.html')

@auth.route('/logout')
@login_required
def logout():
    logout_user()
    return redirect(url_for('main.index'))

def is_valid_email(email):
    # Basic email validation pattern
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return re.match(pattern, email) is not None

def is_valid_password(password):
    # Password must be at least 8 characters long and contain at least one number and one letter
    if len(password) < 8:
        return False
    if not any(c.isalpha() for c in password):
        return False
    if not any(c.isdigit() for c in password):
        return False
    return True

@auth.route('/register', methods=['GET', 'POST'])
def register():
    if current_user.is_authenticated:
        return redirect(url_for('main.index'))

    errors = {}
    
    if request.method == 'POST':
        username = request.form.get('username', '').strip()
        email = request.form.get('email', '').strip()
        password = request.form.get('password', '')
        confirm_password = request.form.get('confirm_password', '')
        
        # Username validation
        if not username:
            errors['username_error'] = 'Username is required'
        elif len(username) < 3:
            errors['username_error'] = 'Username must be at least 3 characters long'
        elif User.query.filter_by(username=username).first():
            errors['username_error'] = 'Username already exists'
            
        # Email validation
        if not email:
            errors['email_error'] = 'Email is required'
        elif not is_valid_email(email):
            errors['email_error'] = 'Invalid email format'
        elif User.query.filter_by(email=email).first():
            errors['email_error'] = 'Email already registered'
            
        # Password validation
        if not password:
            errors['password_error'] = 'Password is required'
        elif not is_valid_password(password):
            errors['password_error'] = 'Password must be at least 8 characters long and contain at least one letter and one number'
        elif password != confirm_password:
            errors['password_error'] = 'Passwords do not match'
        
        # If no errors, create the user
        if not errors:
            try:
                new_user = User(
                    username=username,
                    email=email
                )
                new_user.set_password(password)
                db.session.add(new_user)
                db.session.commit()
                
                # Log the user in after registration
                login_user(new_user)
                flash('Registration successful! Welcome to StudyIt!', 'success')
                return redirect(url_for('main.index'))
                
            except Exception as e:
                db.session.rollback()
                flash('An error occurred during registration. Please try again.', 'error')
                return render_template('auth/register.html', **errors)
        
        return render_template('auth/register.html', **errors)
    
    return render_template('auth/register.html')