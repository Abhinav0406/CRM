#!/usr/bin/env python3
"""
Setup script to create demo users for the Jewellery CRM
Run this script to create users with different roles for testing
"""

import os
import sys
import django
from django.contrib.auth import get_user_model
from django.db import transaction

# Add the backend directory to the Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

User = get_user_model()

def create_demo_users():
    """Create demo users with different roles"""
    
    # Demo users data
    demo_users = [
        {
            'username': 'platform_admin',
            'email': 'admin@jewellerycrm.com',
            'first_name': 'Platform',
            'last_name': 'Admin',
            'password': 'admin123',
            'role': 'platform_admin',
            'is_staff': True,
            'is_superuser': True,
        },
        {
            'username': 'business_admin',
            'email': 'business@jewellerycrm.com',
            'first_name': 'Business',
            'last_name': 'Admin',
            'password': 'business123',
            'role': 'business_admin',
            'is_staff': True,
            'is_superuser': False,
        },
        {
            'username': 'store_manager',
            'email': 'manager@jewellerycrm.com',
            'first_name': 'Store',
            'last_name': 'Manager',
            'password': 'manager123',
            'role': 'store_manager',
            'is_staff': False,
            'is_superuser': False,
        },
        {
            'username': 'sales_team',
            'email': 'sales@jewellerycrm.com',
            'first_name': 'Sales',
            'last_name': 'Team',
            'password': 'sales123',
            'role': 'sales_team',
            'is_staff': False,
            'is_superuser': False,
        },
        {
            'username': 'marketing_team',
            'email': 'marketing@jewellerycrm.com',
            'first_name': 'Marketing',
            'last_name': 'Team',
            'password': 'marketing123',
            'role': 'marketing_team',
            'is_staff': False,
            'is_superuser': False,
        },
        {
            'username': 'telecaller',
            'email': 'telecaller@jewellerycrm.com',
            'first_name': 'Tele',
            'last_name': 'Caller',
            'password': 'telecaller123',
            'role': 'telecaller',
            'is_staff': False,
            'is_superuser': False,
        },
    ]
    
    created_users = []
    
    with transaction.atomic():
        for user_data in demo_users:
            username = user_data['username']
            
            # Check if user already exists
            if User.objects.filter(username=username).exists():
                print(f"User {username} already exists, skipping...")
                continue
            
            # Create user
            user = User.objects.create_user(
                username=username,
                email=user_data['email'],
                first_name=user_data['first_name'],
                last_name=user_data['last_name'],
                password=user_data['password'],
                is_staff=user_data['is_staff'],
                is_superuser=user_data['is_superuser'],
            )
            
            # Add role to user (you might need to adjust this based on your user model)
            # If you have a custom user model with role field, uncomment the next line:
            # user.role = user_data['role']
            # user.save()
            
            created_users.append(user)
            print(f"Created user: {username} ({user_data['email']})")
    
    print(f"\nSuccessfully created {len(created_users)} demo users!")
    print("\nLogin credentials:")
    print("=" * 50)
    
    for user_data in demo_users:
        print(f"Username: {user_data['username']}")
        print(f"Password: {user_data['password']}")
        print(f"Role: {user_data['role']}")
        print("-" * 30)

if __name__ == '__main__':
    print("Setting up demo users for Jewellery CRM...")
    print("=" * 50)
    
    try:
        create_demo_users()
        print("\nSetup completed successfully!")
    except Exception as e:
        print(f"Error during setup: {e}")
        sys.exit(1) 