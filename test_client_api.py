#!/usr/bin/env python
import requests
import json

def test_client_api():
    """Test the client API that's failing"""
    
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
        
        # Test getting client details for sonu (ID: 49)
        print("\n--- Testing client API for sonu (ID: 49) ---")
        client_response = requests.get('http://localhost:8000/api/clients/clients/49/', headers=headers)
        print(f"Client response status: {client_response.status_code}")
        if client_response.status_code == 200:
            print("Client data:", json.dumps(client_response.json(), indent=2))
        else:
            print("Client response:", client_response.text)
        
        # Test getting client details for meenu (ID: 48)
        print("\n--- Testing client API for meenu (ID: 48) ---")
        client_response2 = requests.get('http://localhost:8000/api/clients/clients/48/', headers=headers)
        print(f"Client response status: {client_response2.status_code}")
        if client_response2.status_code == 200:
            print("Client data:", json.dumps(client_response2.json(), indent=2))
        else:
            print("Client response:", client_response2.text)
    else:
        print("Login failed:", login_response.text)

if __name__ == "__main__":
    test_client_api() 