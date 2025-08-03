#!/usr/bin/env python
"""
Simple test script to test the login API.
"""

import requests
import json

def test_login():
    """Test the login API."""
    
    url = "http://localhost:8000/api/auth/login/"
    data = {
        "username": "rara",
        "password": "password123"
    }
    
    try:
        print("Testing login API...")
        print(f"URL: {url}")
        print(f"Data: {data}")
        
        response = requests.post(url, json=data)
        print(f"Response status: {response.status_code}")
        print(f"Response headers: {dict(response.headers)}")
        print(f"Response text: {response.text}")
        
        if response.status_code == 200:
            response_data = response.json()
            print(f"Response data: {json.dumps(response_data, indent=2)}")
        else:
            print(f"Login failed with status {response.status_code}")
            
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    test_login() 