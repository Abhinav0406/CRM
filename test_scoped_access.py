#!/usr/bin/env python
import os
import django
import requests
import json

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from apps.users.models import User
from apps.sales.models import SalesPipeline
from rest_framework_simplejwt.tokens import RefreshToken

def get_user_token(username):
    """Get JWT token for a user"""
    try:
        user = User.objects.get(username=username)
        refresh = RefreshToken.for_user(user)
        return str(refresh.access_token)
    except User.DoesNotExist:
        print(f"User {username} not found")
        return None

def test_scoped_access():
    """Test that each user can only see their own data"""
    
    print("=== Testing Scoped Visibility ===")
    
    # Test Mani's access
    print("\n--- Testing Mani's Access ---")
    mani_token = get_user_token('mani')
    if mani_token:
        headers = {'Authorization': f'Bearer {mani_token}'}
        response = requests.get('http://localhost:8000/api/sales/pipeline/', headers=headers)
        
        if response.status_code == 200:
            data = response.json()
            pipelines = data.get('data', []) if isinstance(data, dict) else data
            print(f"Mani can see {len(pipelines)} pipeline entries")
            for p in pipelines:
                print(f"  - {p.get('title', 'Unknown')} (Stage: {p.get('stage', 'Unknown')})")
        else:
            print(f"Error: {response.status_code} - {response.text}")
    
    # Test Das's access
    print("\n--- Testing Das's Access ---")
    das_token = get_user_token('das')
    if das_token:
        headers = {'Authorization': f'Bearer {das_token}'}
        response = requests.get('http://localhost:8000/api/sales/pipeline/', headers=headers)
        
        if response.status_code == 200:
            data = response.json()
            pipelines = data.get('data', []) if isinstance(data, dict) else data
            print(f"Das can see {len(pipelines)} pipeline entries")
            for p in pipelines:
                print(f"  - {p.get('title', 'Unknown')} (Stage: {p.get('stage', 'Unknown')})")
        else:
            print(f"Error: {response.status_code} - {response.text}")
    
    # Test with "My" endpoint for salespeople
    print("\n--- Testing 'My' Endpoint for Mani ---")
    if mani_token:
        headers = {'Authorization': f'Bearer {mani_token}'}
        response = requests.get('http://localhost:8000/api/sales/pipeline/my/', headers=headers)
        
        if response.status_code == 200:
            data = response.json()
            pipelines = data.get('data', []) if isinstance(data, dict) else data
            print(f"Mani can see {len(pipelines)} pipeline entries via 'my' endpoint")
            for p in pipelines:
                print(f"  - {p.get('title', 'Unknown')} (Stage: {p.get('stage', 'Unknown')})")
        else:
            print(f"Error: {response.status_code} - {response.text}")
    
    print("\n--- Testing 'My' Endpoint for Das ---")
    if das_token:
        headers = {'Authorization': f'Bearer {das_token}'}
        response = requests.get('http://localhost:8000/api/sales/pipeline/my/', headers=headers)
        
        if response.status_code == 200:
            data = response.json()
            pipelines = data.get('data', []) if isinstance(data, dict) else data
            print(f"Das can see {len(pipelines)} pipeline entries via 'my' endpoint")
            for p in pipelines:
                print(f"  - {p.get('title', 'Unknown')} (Stage: {p.get('stage', 'Unknown')})")
        else:
            print(f"Error: {response.status_code} - {response.text}")

if __name__ == "__main__":
    test_scoped_access() 