#!/usr/bin/env python
"""
Test script to verify product stats endpoint.
"""

import requests
import json

def test_product_stats():
    """Test the product stats endpoint."""
    
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
            
            # Test product stats endpoint
            headers = {
                'Authorization': f'Bearer {token}',
                'Content-Type': 'application/json'
            }
            
            stats_url = "http://localhost:8000/api/products/stats/"
            print(f"\nTesting product stats endpoint: {stats_url}")
            
            stats_response = requests.get(stats_url, headers=headers)
            print(f"Stats response status: {stats_response.status_code}")
            
            if stats_response.status_code == 200:
                stats_data = stats_response.json()
                print("Product stats:")
                print(json.dumps(stats_data, indent=2))
            else:
                print(f"Error: {stats_response.status_code}")
                print(stats_response.text)
                
        else:
            print(f"Login failed: {login_response.status_code}")
            print(login_response.text)
            
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    test_product_stats() 