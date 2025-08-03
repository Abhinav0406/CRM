#!/usr/bin/env python
"""
Script to check stores for mandeep tenant.
"""
import os
import sys
import django

# Add the project directory to the Python path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Set up Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from apps.tenants.models import Tenant
from apps.stores.models import Store

def check_mandeep_stores():
    """Check what stores are available for mandeep tenant."""
    
    # Find the mandeep tenant
    tenant = Tenant.objects.filter(name__icontains='mandeep').first()
    if not tenant:
        print("❌ No mandeep tenant found!")
        return
    
    print(f"✅ Found mandeep tenant: {tenant.name}")
    
    # Get all stores for this tenant
    stores = Store.objects.filter(tenant=tenant)
    print(f"\n📊 Total stores for {tenant.name}: {stores.count()}")
    
    if stores.exists():
        print("\n🏪 Available stores:")
        for store in stores:
            print(f"- {store.name} (Code: {store.code}) - {store.city}")
    else:
        print("\n❌ No stores found for this tenant!")
    
    return stores

if __name__ == '__main__':
    print("Checking mandeep stores...")
    stores = check_mandeep_stores()
    print("\n✅ Store check completed!") 