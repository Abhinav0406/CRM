#!/usr/bin/env python
import os
import sys
import django
import json

# Add the backend directory to the Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Set up Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from apps.sales.models import SalesPipeline
from apps.sales.serializers import SalesPipelineSerializer
from apps.tenants.models import Tenant
from apps.users.models import User

def debug_pipeline_data():
    """Debug pipeline data to understand NaN values"""
    
    print("=== Pipeline Data Debug ===")
    
    # Get first tenant
    tenant = Tenant.objects.first()
    if not tenant:
        print("❌ No tenant found")
        return
    
    print(f"Tenant: {tenant.name}")
    
    # Get all pipelines
    pipelines = SalesPipeline.objects.filter(tenant=tenant)
    print(f"Total pipelines: {pipelines.count()}")
    
    if pipelines.count() == 0:
        print("❌ No pipelines found")
        return
    
    # Check each pipeline
    for i, pipeline in enumerate(pipelines[:5]):  # Check first 5
        print(f"\n--- Pipeline {i+1} ---")
        print(f"ID: {pipeline.id}")
        print(f"Title: {pipeline.title}")
        print(f"Stage: {pipeline.stage}")
        print(f"Expected Value: {pipeline.expected_value} (type: {type(pipeline.expected_value)})")
        print(f"Client: {pipeline.client}")
        
        if pipeline.client:
            print(f"Client ID: {pipeline.client.id}")
            print(f"Client Name: {pipeline.client.full_name}")
        
        # Test serializer
        serializer = SalesPipelineSerializer(pipeline)
        serialized_data = serializer.data
        print(f"Serialized expected_value: {serialized_data.get('expected_value')}")
        print(f"Serialized client: {serialized_data.get('client')}")
        
        # Check for NaN or invalid values
        if pipeline.expected_value is None:
            print("⚠️ Expected value is None")
        elif str(pipeline.expected_value) == 'nan':
            print("⚠️ Expected value is NaN")
        elif not isinstance(pipeline.expected_value, (int, float)):
            print(f"⚠️ Expected value is not a number: {type(pipeline.expected_value)}")
    
    # Test API response format
    print("\n=== API Response Test ===")
    try:
        from rest_framework.test import APIRequestFactory
        from apps.sales.views import SalesPipelineListView
        
        factory = APIRequestFactory()
        
        # Create a mock user
        user = User.objects.filter(tenant=tenant).first()
        if not user:
            print("❌ No user found for API test")
            return
        
        # Create request
        request = factory.get('/api/sales/pipeline/')
        request.user = user
        
        # Get view
        view = SalesPipelineListView.as_view()
        response = view(request)
        
        print(f"Response status: {response.status_code}")
        if response.status_code == 200:
            data = response.data
            print(f"Response data type: {type(data)}")
            if hasattr(data, 'data'):
                print(f"Data length: {len(data.data) if data.data else 0}")
                if data.data:
                    first_item = data.data[0]
                    print(f"First item expected_value: {first_item.get('expected_value')}")
                    print(f"First item client: {first_item.get('client')}")
        else:
            print(f"Response error: {response.data}")
            
    except Exception as e:
        print(f"❌ Error testing API: {e}")
        import traceback
        traceback.print_exc()

if __name__ == '__main__':
    debug_pipeline_data() 