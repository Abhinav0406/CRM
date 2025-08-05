#!/usr/bin/env python
import requests
import json

def test_specific_pipeline():
    """Test the specific pipeline detail API call that's failing"""
    
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
        
        # Test getting pipelines list first
        print("\n--- Testing pipelines list ---")
        list_response = requests.get('http://localhost:8000/api/sales/pipeline/my/', headers=headers)
        print(f"List response status: {list_response.status_code}")
        if list_response.status_code == 200:
            data = list_response.json()
            pipelines = data.get('results', []) if isinstance(data, dict) else data
            print(f"Found {len(pipelines)} pipelines")
            for pipeline in pipelines:
                print(f"  - Pipeline {pipeline.get('id')}: {pipeline.get('title')}")
                
                # Test each pipeline detail
                pipeline_id = pipeline.get('id')
                print(f"\n--- Testing pipeline {pipeline_id} detail ---")
                detail_response = requests.get(f'http://localhost:8000/api/sales/pipeline/my/{pipeline_id}/', headers=headers)
                print(f"Detail response status: {detail_response.status_code}")
                if detail_response.status_code == 200:
                    print("✅ SUCCESS: Pipeline detail retrieved")
                else:
                    print(f"❌ FAILURE: {detail_response.text}")
        else:
            print(f"List failed: {list_response.text}")
    else:
        print(f"Login failed: {login_response.text}")

if __name__ == "__main__":
    test_specific_pipeline() 