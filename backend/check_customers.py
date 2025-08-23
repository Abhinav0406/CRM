#!/usr/bin/env python
import os
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from apps.clients.models import Client
from apps.users.models import User

def check_and_update_customers():
    print("=== Checking Customers Database ===")
    
    # Check total customers
    total_customers = Client.objects.count()
    print(f"Total customers: {total_customers}")
    
    # Check customers with created_by
    customers_with_created_by = Client.objects.filter(created_by__isnull=False).count()
    print(f"Customers with created_by: {customers_with_created_by}")
    
    # Check customers without created_by
    customers_without_created_by = Client.objects.filter(created_by__isnull=True).count()
    print(f"Customers without created_by: {customers_without_created_by}")
    
    # Get a sample customer to see the structure
    if total_customers > 0:
        sample_customer = Client.objects.first()
        print(f"\nSample customer ID: {sample_customer.id}")
        print(f"Sample customer name: {sample_customer.first_name} {sample_customer.last_name}")
        print(f"Sample customer created_by: {sample_customer.created_by}")
        print(f"Sample customer created_at: {sample_customer.created_at}")
        
        # Check if created_by field exists
        if hasattr(sample_customer, 'created_by'):
            print("✅ created_by field exists in model")
        else:
            print("❌ created_by field does not exist in model")
    
    # Try to get a user to assign as created_by
    try:
        first_user = User.objects.first()
        if first_user:
            print(f"\nFirst user found: {first_user.username} ({first_user.first_name} {first_user.last_name})")
            
            # Update customers without created_by
            if customers_without_created_by > 0:
                print(f"\nUpdating {customers_without_created_by} customers to set created_by...")
                updated_count = Client.objects.filter(created_by__isnull=True).update(created_by=first_user)
                print(f"Updated {updated_count} customers")
                
                # Verify the update
                customers_with_created_by_after = Client.objects.filter(created_by__isnull=False).count()
                print(f"Customers with created_by after update: {customers_with_created_by_after}")
        else:
            print("❌ No users found in database")
    except Exception as e:
        print(f"❌ Error updating customers: {e}")

if __name__ == "__main__":
    check_and_update_customers()
