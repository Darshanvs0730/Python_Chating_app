#!/usr/bin/env python3
"""
Interactive script to create Django admin user
"""
import os
import sys
import django

# Set environment variables
os.environ.setdefault('SECRET_KEY', 'django-insecure-dev-key-change-in-production-12345')
os.environ.setdefault('ENVIRNOMENT', '1')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'chatapp.settings')

# Setup Django
django.setup()

from users.models import User

def create_admin():
    username = input("Username: ").strip()
    email = input("Email address: ").strip() or None
    
    while True:
        password = input("Password: ")
        password_again = input("Password (again): ")
        if password == password_again:
            break
        print("Error: Passwords don't match. Try again.")
    
    # Create superuser
    try:
        user = User.objects.create_superuser(
            username=username,
            email=email,
            password=password,
            first_name=username,
            last_name="Admin"
        )
        print(f"\n✅ Superuser '{username}' created successfully!")
        print(f"\nYou can now login at http://localhost:8000/admin/")
        print(f"Username: {username}")
        print(f"Email: {email or 'N/A'}")
        return True
    except Exception as e:
        if "already exists" in str(e):
            print(f"\n❌ Error: User '{username}' already exists!")
            print("Try a different username or use: python manage.py changepassword admin")
        else:
            print(f"\n❌ Error: {e}")
        return False

if __name__ == '__main__':
    create_admin()

