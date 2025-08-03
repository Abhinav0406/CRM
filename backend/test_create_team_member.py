#!/usr/bin/env python
"""
Test script to create a team member and verify store assignment.
"""

import requests
import json
import random

def test_create_team_member():
    """Test creating a team member with auto store assignment."""
    
    # First, login to get a token
    login_url = "http://localhost:8000/api/auth/login/"
    login_data = {
        "username": "rara",
        "password": "password123"
    }
    
    try:
        print("Logging in...")
        login_response = requests.post(login_url, json=login_data)
        print(f"Login response status: {login_response.status_code}")
        
        if login_response.status_code == 200:
            login_data = login_response.json()
            token = login_data.get('token')
            print(f"Got token: {token[:20]}...")
            
            # Now test creating a team member
            team_member_url = "http://localhost:8000/api/auth/team-members/"
            headers = {
                "Authorization": f"Bearer {token}",
                "Content-Type": "application/json"
            }
            
            # Generate unique test data
            random_suffix = random.randint(1000, 9999)
            team_member_data = {
                "username": f"testuser{random_suffix}",
                "email": f"testuser{random_suffix}@example.com",
                "first_name": f"Test{random_suffix}",
                "last_name": "User",
                "password": f"TestPass{random_suffix}!",
                "role": "inhouse_sales",
                "phone": f"98765{random_suffix}",
                "address": "Test Address"
            }
            
            print(f"\nCreating team member with data: {team_member_data}")
            create_response = requests.post(team_member_url, json=team_member_data, headers=headers)
            print(f"Create team member response status: {create_response.status_code}")
            
            if create_response.status_code == 201:
                response_data = create_response.json()
                print(f"Team member created successfully!")
                print(f"Response data: {json.dumps(response_data, indent=2)}")
                
                # Check if store was auto-assigned
                if 'store' in response_data and response_data['store']:
                    print(f"✅ Store auto-assigned: {response_data['store']}")
                else:
                    print("❌ No store assigned")
                    
            else:
                print(f"Failed to create team member: {create_response.status_code}")
                print(f"Response: {create_response.text}")
                
        else:
            print(f"Login failed: {login_response.text}")
            
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    test_create_team_member() 