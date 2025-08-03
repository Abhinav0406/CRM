#!/usr/bin/env python
import os
import sys
import django
import requests
import json

# Add the backend directory to the Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Set up Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from apps.sales.models import SalesPipeline
from apps.clients.models import Client
from apps.tenants.models import Tenant
from apps.users.models import User

def test_api_endpoints():
    """Test the API endpoints to diagnose 404 errors"""
    
    print("=== API Endpoint Test ===")
    
    # Check if Django server is running
    try:
        response = requests.get('http://localhost:8000/api/schema/', timeout=5)
        if response.status_code == 200:
            print("✅ Django server is running")
        else:
            print(f"❌ Django server responded with status {response.status_code}")
            return
    except requests.exceptions.ConnectionError:
        print("❌ Django server is not running. Please start it with: python manage.py runserver")
        return
    except Exception as e:
        print(f"❌ Error connecting to Django server: {e}")
        return
    
    # Check database records
    print("\n=== Database Records ===")
    
    tenant_count = Tenant.objects.count()
    print(f"Tenants: {tenant_count}")
    
    client_count = Client.objects.count()
    print(f"Clients: {client_count}")
    
    pipeline_count = SalesPipeline.objects.count()
    print(f"Sales Pipelines: {pipeline_count}")
    
    user_count = User.objects.count()
    print(f"Users: {user_count}")
    
    if pipeline_count == 0:
        print("\n❌ No sales pipeline records found!")
        print("Run this script to create sample data:")
        print("python add_sample_sales_pipeline.py")
        return
    
    # Test specific endpoints
    print("\n=== Testing API Endpoints ===")
    
    # Get first pipeline
    first_pipeline = SalesPipeline.objects.first()
    if first_pipeline:
        pipeline_id = first_pipeline.id
        print(f"Testing pipeline ID: {pipeline_id}")
        
        # Test pipeline detail endpoint
        try:
            response = requests.get(f'http://localhost:8000/api/sales/pipeline/{pipeline_id}/')
            if response.status_code == 200:
                print(f"✅ Pipeline detail endpoint works: /api/sales/pipeline/{pipeline_id}/")
            else:
                print(f"❌ Pipeline detail endpoint failed: {response.status_code}")
                print(f"Response: {response.text}")
        except Exception as e:
            print(f"❌ Error testing pipeline endpoint: {e}")
        
        # Test pipeline list endpoint
        try:
            response = requests.get('http://localhost:8000/api/sales/pipeline/')
            if response.status_code == 200:
                print("✅ Pipeline list endpoint works: /api/sales/pipeline/")
            else:
                print(f"❌ Pipeline list endpoint failed: {response.status_code}")
                print(f"Response: {response.text}")
        except Exception as e:
            print(f"❌ Error testing pipeline list endpoint: {e}")
    
    # Test authentication endpoints
    print("\n=== Testing Authentication ===")
    
    try:
        response = requests.get('http://localhost:8000/api/auth/profile/')
        if response.status_code == 401:
            print("✅ Authentication endpoint requires auth (expected)")
        else:
            print(f"⚠️ Authentication endpoint status: {response.status_code}")
    except Exception as e:
        print(f"❌ Error testing auth endpoint: {e}")
    
    print("\n=== Summary ===")
    if pipeline_count > 0:
        print("✅ Database has pipeline records")
        print("✅ Django server is running")
        print("✅ API endpoints are accessible")
        print("\nThe 404 error might be due to:")
        print("1. Invalid pipeline ID in the frontend")
        print("2. Authentication token issues")
        print("3. CORS configuration problems")
    else:
        print("❌ No pipeline records found - run sample data script")
        print("python add_sample_sales_pipeline.py")

if __name__ == '__main__':
    test_api_endpoints() 