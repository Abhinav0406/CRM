#!/usr/bin/env python
"""
Script to add sample stores to the database.
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

def create_sample_stores():
    """Create sample stores for testing."""
    
    # Find the existing mandeep tenant
    tenant = Tenant.objects.filter(name__icontains='mandeep').first()
    if not tenant:
        print("❌ No mandeep tenant found. Creating a new tenant...")
        tenant, created = Tenant.objects.get_or_create(
            name="Mandeep Jewelries",
            defaults={
                'code': 'MJ001',
                'address': '123 Main Street',
                'city': 'Mumbai',
                'state': 'Maharashtra',
                'timezone': 'Asia/Kolkata'
            }
        )
        if created:
            print(f"Created new tenant: {tenant.name}")
    else:
        print(f"Using existing mandeep tenant: {tenant.name}")
    
    # Create sample stores
    stores_data = [
        {
            'name': 'Mumbai Central Store',
            'code': 'MCS001',
            'address': '456 Central Avenue',
            'city': 'Mumbai',
            'state': 'Maharashtra',
            'timezone': 'Asia/Kolkata'
        },
        {
            'name': 'Andheri West Store',
            'code': 'AWS001',
            'address': '789 Andheri Road',
            'city': 'Mumbai',
            'state': 'Maharashtra',
            'timezone': 'Asia/Kolkata'
        },
        {
            'name': 'Bandra Store',
            'code': 'BS001',
            'address': '321 Bandra Street',
            'city': 'Mumbai',
            'state': 'Maharashtra',
            'timezone': 'Asia/Kolkata'
        }
    ]
    
    created_stores = []
    for store_data in stores_data:
        store, created = Store.objects.get_or_create(
            name=store_data['name'],
            tenant=tenant,
            defaults=store_data
        )
        
        if created:
            print(f"Created store: {store.name}")
            created_stores.append(store)
        else:
            print(f"Store already exists: {store.name}")
    
    print(f"\nTotal stores available for {tenant.name}: {Store.objects.filter(tenant=tenant).count()}")
    return created_stores

if __name__ == '__main__':
    print("Creating sample stores...")
    stores = create_sample_stores()
    print(f"Created {len(stores)} new stores")
    print("Sample stores creation completed!") 