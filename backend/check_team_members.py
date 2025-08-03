#!/usr/bin/env python
"""
Script to check team members and their store assignments.
"""

import os
import sys
import django

# Add the project directory to the Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from apps.users.models import User, TeamMember
from apps.stores.models import Store
from apps.tenants.models import Tenant

def check_team_members():
    """Check team members and their store assignments."""
    
    # Find the mandeep tenant
    tenant = Tenant.objects.filter(name__icontains='mandeep').first()
    if not tenant:
        print("❌ No mandeep tenant found!")
        return
    
    print(f"Using tenant: {tenant.name}")
    
    # Find the store
    store = Store.objects.filter(name__icontains='nagole', tenant=tenant).first()
    if not store:
        print("❌ No nagole store found!")
        return
    
    print(f"Using store: {store.name}")
    
    # Get all team members
    team_members = TeamMember.objects.filter(user__tenant=tenant)
    print(f"\nTotal team members in database: {team_members.count()}")
    
    # Get team members for the specific store
    store_team_members = TeamMember.objects.filter(user__tenant=tenant, user__store=store)
    print(f"Team members in store {store.name}: {store_team_members.count()}")
    
    print("\nTeam members in store:")
    for tm in store_team_members:
        user = tm.user
        print(f"- {user.get_full_name()} ({user.username}) - Role: {user.role} - Store: {user.store}")
    
    # Get all users in the tenant
    users = User.objects.filter(tenant=tenant, is_active=True)
    print(f"\nTotal users in tenant: {users.count()}")
    
    print("\nAll users in tenant:")
    for user in users:
        print(f"- {user.get_full_name()} ({user.username}) - Role: {user.role} - Store: {user.store}")
    
    # Check if user 'rara' exists and their details
    rara_user = User.objects.filter(username='rara').first()
    if rara_user:
        print(f"\nUser 'rara' details:")
        print(f"- Name: {rara_user.get_full_name()}")
        print(f"- Role: {rara_user.role}")
        print(f"- Store: {rara_user.store}")
        print(f"- Tenant: {rara_user.tenant}")
        print(f"- Is active: {rara_user.is_active}")
    else:
        print("\nUser 'rara' not found!")

if __name__ == '__main__':
    check_team_members() 