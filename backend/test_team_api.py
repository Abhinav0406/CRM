#!/usr/bin/env python
"""
Test script to test the team members API with authentication.
"""

import requests
import json

def test_team_members_api():
    """Test the team members API with authentication."""
    
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
            
            # Now test the team members API
            team_url = "http://localhost:8000/api/auth/team-members/"
            headers = {
                "Authorization": f"Bearer {token}",
                "Content-Type": "application/json"
            }
            
            print("\nTesting team members API...")
            team_response = requests.get(team_url, headers=headers)
            print(f"Team members response status: {team_response.status_code}")
            print(f"Team members response headers: {dict(team_response.headers)}")
            
            if team_response.status_code == 200:
                team_data = team_response.json()
                print(f"Team members data: {json.dumps(team_data, indent=2)}")
                print(f"Number of team members: {len(team_data) if isinstance(team_data, list) else 'Not a list'}")
                
                if isinstance(team_data, list):
                    print("\nTeam members:")
                    for i, member in enumerate(team_data[:5]):  # Show first 5
                        print(f"  {i+1}. {member.get('first_name', '')} {member.get('last_name', '')} ({member.get('role', '')})")
            else:
                print(f"Team members API error: {team_response.text}")
                
        else:
            print(f"Login failed: {login_response.text}")
            
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    test_team_members_api() 