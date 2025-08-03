#!/usr/bin/env python
"""
Test script to verify team member update and delete actions.
"""

import requests
import json
import random

def test_team_member_actions():
    """Test updating and deleting team members."""
    
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
            
            headers = {
                "Authorization": f"Bearer {token}",
                "Content-Type": "application/json"
            }
            
            # First, get team members to find one to test with
            team_url = "http://localhost:8000/api/auth/team-members/"
            team_response = requests.get(team_url, headers=headers)
            
            if team_response.status_code == 200:
                team_data = team_response.json()
                print(f"Team members response: {json.dumps(team_data, indent=2)}")
                
                if 'results' in team_data and len(team_data['results']) > 0:
                    # Use a team member that's not the current user (skip the first one if it's the current user)
                    test_member = None
                    print(f"Looking for team member that's not 'rara'...")
                    for i, member in enumerate(team_data['results']):
                        print(f"  Member {i}: {member['username']} (role: {member['role']})")
                        if member['username'] != 'rara':  # Skip the current user
                            test_member = member
                            print(f"  Found suitable member: {member['username']}")
                            break
                    
                    if test_member is None:
                        print("No suitable team member found for testing")
                        return
                        
                    user_id = test_member['user_id']  # Use user_id instead of team member id
                    print(f"\nTesting with team member: {test_member['first_name']} {test_member['last_name']} (Team Member ID: {test_member['id']}, User ID: {user_id})")
                    
                    # Test UPDATE
                    print("\n--- Testing UPDATE ---")
                    update_data = {
                        "first_name": f"Updated{random.randint(100, 999)}",
                        "last_name": "Test",
                        "email": f"updated{random.randint(100, 999)}@test.com",
                        "role": "marketing",
                        "phone": f"98765{random.randint(100, 999)}"
                    }
                    
                    update_url = f"http://localhost:8000/api/auth/team-members/{user_id}/update/"
                    update_response = requests.put(update_url, json=update_data, headers=headers)
                    print(f"Update response status: {update_response.status_code}")
                    
                    if update_response.status_code == 200:
                        print("✅ Update successful!")
                        print(f"Updated data: {json.dumps(update_response.json(), indent=2)}")
                    else:
                        print(f"❌ Update failed: {update_response.text}")
                    
                    # Test DELETE
                    print("\n--- Testing DELETE ---")
                    delete_url = f"http://localhost:8000/api/auth/team-members/{user_id}/delete/"
                    delete_response = requests.delete(delete_url, headers=headers)
                    print(f"Delete response status: {delete_response.status_code}")
                    
                    if delete_response.status_code == 200:
                        print("✅ Delete successful!")
                    else:
                        print(f"❌ Delete failed: {delete_response.text}")
                        
                else:
                    print("No team members found to test with")
            else:
                print(f"Failed to get team members: {team_response.status_code}")
                print(f"Response: {team_response.text}")
                
        else:
            print(f"Login failed: {login_response.text}")
            
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    test_team_member_actions() 