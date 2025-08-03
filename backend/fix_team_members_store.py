#!/usr/bin/env python
"""
Script to fix team members store assignment.
This script will assign team members to the correct store so they appear in the manager's team view.
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

def fix_team_members_store():
    """Fix team members store assignment."""
    
    # Find the mandeep tenant
    tenant = Tenant.objects.filter(name__icontains='mandeep').first()
    if not tenant:
        print("❌ No mandeep tenant found!")
        return
    
    print(f"Using tenant: {tenant.name}")
    
    # Find the store that the manager is assigned to
    store = Store.objects.filter(name__icontains='nagole', tenant=tenant).first()
    if not store:
        print("❌ No nagole store found!")
        return
    
    print(f"Using store: {store.name}")
    
    # Get all users that should be team members (excluding platform/business admins)
    team_users = User.objects.filter(
        tenant=tenant,
        role__in=['manager', 'inhouse_sales', 'tele_calling', 'marketing'],
        is_active=True
    ).exclude(role__in=['platform_admin', 'business_admin'])
    
    print(f"Found {team_users.count()} team users")
    
    updated_count = 0
    for user in team_users:
        # Update user's store assignment
        if user.store != store:
            user.store = store
            user.save()
            print(f"Updated user {user.username} store to {store.name}")
            updated_count += 1
        else:
            print(f"User {user.username} already assigned to {store.name}")
    
    # Also ensure all team members have TeamMember records
    for user in team_users:
        team_member, created = TeamMember.objects.get_or_create(
            user=user,
            defaults={
                'employee_id': f'EMP{user.id:03d}',
                'department': 'Sales' if user.role in ['inhouse_sales', 'tele_calling'] else 'Marketing',
                'position': user.get_role_display(),
                'status': 'active',
                'performance_rating': 'good',
                'sales_target': 50000.00,
                'current_sales': 25000.00,
                'hire_date': user.date_joined.date(),
                'notes': f'Auto-created team member for {user.get_full_name()}'
            }
        )
        
        if created:
            print(f"Created team member record for {user.get_full_name()}")
        else:
            print(f"Team member record already exists for {user.get_full_name()}")
    
    print(f"\nSummary:")
    print(f"Updated {updated_count} users' store assignment")
    print(f"Total team members in database: {TeamMember.objects.count()}")
    print(f"Total users in database: {User.objects.count()}")

if __name__ == '__main__':
    fix_team_members_store() 