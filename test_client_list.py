#!/usr/bin/env python
import requests
import json

def test_client_list():
    """Test the client list API endpoint"""
    
    # Login as das
    login_data = {
        'username': 'das',
        'password': 'das1234@'
    }
    
    login_response = requests.post('http://localhost:8000/api/auth/login/', json=login_data)
    print(f"Login status: {login_response.status_code}")
    
    if login_response.status_code == 200:
        token = login_response.json()['token']
        headers = {'Authorization': f'Bearer {token}'}
        
        # Test getting client list
        print("\n--- Testing client list API ---")
        client_response = requests.get('http://localhost:8000/api/clients/clients/', headers=headers)
        print(f"Client list response status: {client_response.status_code}")
        if client_response.status_code == 200:
            print("Client list data:", json.dumps(client_response.json(), indent=2))
        else:
            print("Client list response:", client_response.text)
    else:
        print("Login failed:", login_response.text)

if __name__ == "__main__":
    test_client_list() 