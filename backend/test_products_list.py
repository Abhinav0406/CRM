#!/usr/bin/env python
"""
Test script to verify products list endpoint.
"""

import requests
import json

def test_products_list():
    """Test the products list endpoint."""
    
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
            
            # Test products list endpoint
            headers = {
                'Authorization': f'Bearer {token}',
                'Content-Type': 'application/json'
            }
            
            products_url = "http://localhost:8000/api/products/list/"
            print(f"\nTesting products list endpoint: {products_url}")
            
            products_response = requests.get(products_url, headers=headers)
            print(f"Products response status: {products_response.status_code}")
            
            if products_response.status_code == 200:
                products_data = products_response.json()
                print(f"Products response structure: {type(products_data)}")
                print(f"Products response keys: {list(products_data.keys()) if isinstance(products_data, dict) else 'Not a dict'}")
                
                if isinstance(products_data, dict) and 'results' in products_data:
                    products = products_data['results']
                    print(f"Found {len(products)} products in results")
                    if products:
                        print("First product:")
                        print(json.dumps(products[0], indent=2))
                elif isinstance(products_data, list):
                    print(f"Found {len(products_data)} products directly")
                    if products_data:
                        print("First product:")
                        print(json.dumps(products_data[0], indent=2))
                else:
                    print("Unexpected response structure:")
                    print(json.dumps(products_data, indent=2))
            else:
                print(f"Error: {products_response.status_code}")
                print(products_response.text)
                
        else:
            print(f"Login failed: {login_response.status_code}")
            print(login_response.text)
            
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    test_products_list() 