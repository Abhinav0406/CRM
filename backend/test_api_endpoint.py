#!/usr/bin/env python
"""
Simple test to verify API endpoint with middleware.
"""

import os
import sys
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from apps.users.models import User
from apps.sales.models import SalesPipeline
from apps.clients.models import Client

def test_api_data():
    """Test the actual data that should be returned by the API."""
    
    print("=== Testing API Data ===")
    
    # Get yakoob user
    yakoob = User.objects.filter(username='yakoob').first()
    if not yakoob:
        print("❌ yakoob user not found!")
        return
    
    print(f"User: {yakoob.username}")
    print(f"Role: {yakoob.role}")
    print(f"Store: {yakoob.store}")
    
    # Get pipelines for yakoob's store
    store_pipelines = SalesPipeline.objects.filter(client__store=yakoob.store)
    closed_won_pipelines = store_pipelines.filter(stage='closed_won')
    
    print(f"\nStore pipelines: {store_pipelines.count()}")
    print(f"Closed won pipelines: {closed_won_pipelines.count()}")
    
    print(f"\nPipeline details:")
    for pipeline in store_pipelines:
        client_name = pipeline.client.full_name if pipeline.client else 'Unknown'
        print(f"  - {pipeline.title} (Client: {client_name}, Stage: {pipeline.stage})")
    
    # Check all pipelines in the system
    all_pipelines = SalesPipeline.objects.all()
    all_closed_won = all_pipelines.filter(stage='closed_won')
    
    print(f"\nAll pipelines in system: {all_pipelines.count()}")
    print(f"All closed won in system: {all_closed_won.count()}")
    
    print(f"\nAll closed won pipelines:")
    for pipeline in all_closed_won:
        client_name = pipeline.client.full_name if pipeline.client else 'Unknown'
        client_store = pipeline.client.store.name if pipeline.client and pipeline.client.store else 'No store'
        print(f"  - {pipeline.title} (Client: {client_name}, Store: {client_store})")

if __name__ == '__main__':
    test_api_data() 