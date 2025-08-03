#!/usr/bin/env python
"""
Script to fix store assignments for team members.
"""
import os
import sys
import django

# Add the project directory to the Python path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Set up Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from apps.users.models import User, TeamMember
from apps.stores.models import Store
from apps.tenants.models import Tenant

def fix_store_assignments():
    """Fix store assignments for team members."""
    
    print("=== Fixing Store Assignments ===")
    
    # Get the mandeep tenant
    mandeep_tenant = Tenant.objects.filter(name__icontains='mandeep').first()
    if not mandeep_tenant:
        print("No mandeep tenant found!")
        return
    
    print(f"Using tenant: {mandeep_tenant.name}")
    
    # Get stores for this tenant
    stores = Store.objects.filter(tenant=mandeep_tenant)
    print(f"Found {stores.count()} stores for mandeep tenant:")
    for store in stores:
        print(f"- {store.name} (ID: {store.id})")
    
    # Get team members that need store assignments
    team_members = TeamMember.objects.filter(user__tenant=mandeep_tenant)
    print(f"\nFound {team_members.count()} team members in mandeep tenant:")
    
    # Assign team members to stores
    store_index = 0
    stores_list = list(stores)
    
    for member in team_members:
        user = member.user
        if not user.store and stores_list:
            # Assign to next store in rotation
            store = stores_list[store_index % len(stores_list)]
            user.store = store
            user.save()
            print(f"Assigned {user.get_full_name()} to {store.name}")
            store_index += 1
        elif user.store:
            print(f"{user.get_full_name()} already assigned to {user.store.name}")
        else:
            print(f"No stores available for {user.get_full_name()}")
    
    print("\nStore assignments completed!")

if __name__ == '__main__':
    fix_store_assignments() 