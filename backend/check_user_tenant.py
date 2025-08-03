#!/usr/bin/env python
"""
Script to check mandeep user's tenant association.
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
from apps.users.models import User

def check_user_tenant():
    """Check mandeep user's tenant association."""
    
    # Find the mandeep user
    mandeep_user = User.objects.filter(username__icontains='mandeep').first()
    if not mandeep_user:
        print("❌ No mandeep user found!")
        return
    
    print(f"✅ Found mandeep user: {mandeep_user.username}")
    print(f"   Email: {mandeep_user.email}")
    print(f"   Role: {mandeep_user.role}")
    print(f"   Tenant: {mandeep_user.tenant}")
    
    # Find the mandeep tenant
    mandeep_tenant = Tenant.objects.filter(name__icontains='mandeep').first()
    if not mandeep_tenant:
        print("❌ No mandeep tenant found!")
        return
    
    print(f"\n✅ Found mandeep tenant: {mandeep_tenant.name}")
    print(f"   ID: {mandeep_tenant.id}")
    
    # Check if user is associated with the correct tenant
    if mandeep_user.tenant == mandeep_tenant:
        print("✅ User is correctly associated with mandeep tenant")
    else:
        print("❌ User is NOT associated with mandeep tenant!")
        print(f"   User tenant: {mandeep_user.tenant}")
        print(f"   Mandeep tenant: {mandeep_tenant}")
        
        # Fix the association
        mandeep_user.tenant = mandeep_tenant
        mandeep_user.save()
        print("✅ Fixed user-tenant association")
    
    # Check stores for this tenant
    stores = Store.objects.filter(tenant=mandeep_tenant)
    print(f"\n📊 Stores for mandeep tenant: {stores.count()}")
    for store in stores:
        print(f"   - {store.name} (ID: {store.id})")

if __name__ == '__main__':
    print("Checking mandeep user-tenant association...")
    check_user_tenant()
    print("\n✅ User-tenant check completed!") 