#!/bin/bash
# Script to create admin user with proper environment variables

cd "$(dirname "$0")"

# Set environment variables
export SECRET_KEY='django-insecure-dev-key-change-in-production-12345'
export ENVIRNOMENT=1

# Create superuser
python3.10 manage.py createsuperuser

