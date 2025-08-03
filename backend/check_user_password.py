#!/usr/bin/env python
"""
Script to check and reset user password.
"""

import os
import sys
import django

# Add the project directory to the Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from apps.users.models import User
from django.contrib.auth.hashers import make_password

def check_and_reset_password():
    """Check and reset user password."""
    
    # Find the user 'rara'
    user = User.objects.filter(username='rara').first()
    if not user:
        print("❌ User 'rara' not found!")
        return
    
    print(f"Found user: {user.get_full_name()} ({user.username})")
    print(f"Email: {user.email}")
    print(f"Role: {user.role}")
    print(f"Store: {user.store}")
    print(f"Tenant: {user.tenant}")
    print(f"Is active: {user.is_active}")
    
    # Reset password to 'password123'
    user.set_password('password123')
    user.save()
    print("\n✅ Password reset to 'password123'")
    
    # Test the password
    if user.check_password('password123'):
        print("✅ Password verification successful")
    else:
        print("❌ Password verification failed")

if __name__ == '__main__':
    check_and_reset_password() 