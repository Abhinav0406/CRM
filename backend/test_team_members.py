#!/usr/bin/env python
import os
import sys
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from django.test import TestCase
from django.contrib.auth import get_user_model
from apps.users.models import TeamMember
from apps.tenants.models import Tenant
from rest_framework.test import APIClient
from rest_framework_simplejwt.tokens import RefreshToken

User = get_user_model()

def test_team_members_api():
    """Test the team members API"""
    print("Testing Team Members API...")
    
    # Get a business admin user
    business_admin = User.objects.filter(role='business_admin', tenant__isnull=False).first()
    if not business_admin:
        print("No business admin found with tenant")
        return
    
    print(f"Using business admin: {business_admin.username} (tenant: {business_admin.tenant})")
    
    # Create JWT token
    refresh = RefreshToken.for_user(business_admin)
    access_token = str(refresh.access_token)
    
    # Create API client
    client = APIClient()
    client.credentials(HTTP_AUTHORIZATION=f'Bearer {access_token}')
    
    # Test GET team members
    response = client.get('/api/auth/team-members/', HTTP_HOST='localhost')
    print(f"GET /api/auth/team-members/ - Status: {response.status_code}")
    
    if response.status_code == 200:
        data = response.json()
        print(f"Response data type: {type(data)}")
        
        # Handle both list and dictionary responses
        if isinstance(data, dict):
            # Paginated response
            results = data.get('results', [])
            print(f"Response data length: {len(results)}")
            if results and len(results) > 0:
                print(f"First item: {results[0]}")
            else:
                print("No team members found")
        elif isinstance(data, list):
            print(f"Response data length: {len(data)}")
            if data and len(data) > 0:
                print(f"First item: {data[0]}")
            else:
                print("No team members found")
        else:
            print(f"Unexpected response format: {data}")
    else:
        print(f"Error response: {response.content}")
    
    # Test GET team members list endpoint
    response2 = client.get('/api/auth/team-members/list/', HTTP_HOST='localhost')
    print(f"\nGET /api/auth/team-members/list/ - Status: {response2.status_code}")
    
    if response2.status_code == 200:
        data2 = response2.json()
        print(f"Response data type: {type(data2)}")
        
        # Handle both list and dictionary responses
        if isinstance(data2, dict):
            # Paginated response
            results2 = data2.get('results', [])
            print(f"Response data length: {len(results2)}")
            if results2 and len(results2) > 0:
                print(f"First item: {results2[0]}")
            else:
                print("No team members found")
        elif isinstance(data2, list):
            print(f"Response data length: {len(data2)}")
            if data2 and len(data2) > 0:
                print(f"First item: {data2[0]}")
            else:
                print("No team members found")
        else:
            print(f"Unexpected response format: {data2}")
    else:
        print(f"Error response: {response2.content}")

if __name__ == '__main__':
    test_team_members_api() 