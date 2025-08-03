#!/usr/bin/env python
"""
Script to debug user authentication.
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
from django.contrib.auth import authenticate

def debug_user():
    """Debug user authentication."""
    
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
    print(f"Password hash: {user.password[:50]}...")
    
    # Test password check
    print("\nTesting password verification:")
    test_passwords = ['password123', 'demo123', 'admin123', 'wrong']
    
    for pwd in test_passwords:
        is_valid = user.check_password(pwd)
        print(f"  '{pwd}': {is_valid}")
    
    # Test authenticate function
    print("\nTesting authenticate function:")
    for pwd in test_passwords:
        auth_user = authenticate(username='rara', password=pwd)
        print(f"  authenticate('rara', '{pwd}'): {auth_user}")
    
    # Test with different username
    print("\nTesting with different usernames:")
    usernames = ['rara', 'RARA', 'Rara']
    for username in usernames:
        auth_user = authenticate(username=username, password='password123')
        print(f"  authenticate('{username}', 'password123'): {auth_user}")

if __name__ == '__main__':
    debug_user() 