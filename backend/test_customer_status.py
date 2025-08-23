#!/usr/bin/env python
import os
import sys
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from apps.clients.models import Client
from apps.sales.models import Sale
from decimal import Decimal

def test_customer_status_logic():
    print("=== Testing Customer Status Update Logic ===\n")
    
    # Get all customers
    customers = Client.objects.all()
    print(f"Total customers found: {customers.count()}")
    
    # Show current status distribution
    print("\n--- Current Status Distribution ---")
    status_counts = {}
    for customer in customers:
        status = customer.status
        status_counts[status] = status_counts.get(status, 0) + 1
    
    for status, count in status_counts.items():
        status_display = dict(Client.Status.choices)[status]
        print(f"  {status_display}: {count}")
    
    # Test status update for a few customers
    print("\n--- Testing Status Updates ---")
    test_customers = customers[:5]  # Test first 5 customers
    
    for customer in test_customers:
        print(f"\nCustomer: {customer.full_name}")
        print(f"  Current Status: {customer.get_status_display()}")
        print(f"  Total Spent: ₹{customer.total_spent}")
        print(f"  Total Purchases: {customer.total_purchases}")
        
        # Update status based on behavior
        old_status = customer.status
        status_message = customer.update_status_based_on_behavior()
        new_status = customer.status
        
        if old_status != new_status:
            print(f"  ✅ Status Updated: {dict(Client.Status.choices)[old_status]} → {dict(Client.Status.choices)[new_status]}")
        else:
            print(f"  ℹ️  Status Unchanged: {dict(Client.Status.choices)[old_status]}")
        
        print(f"  Message: {status_message}")
    
    # Show final status distribution
    print("\n--- Final Status Distribution ---")
    final_status_counts = {}
    for customer in customers:
        status = customer.status
        final_status_counts[status] = final_status_counts.get(status, 0) + 1
    
    for status, count in final_status_counts.items():
        status_display = dict(Client.Status.choices)[status]
        print(f"  {status_display}: {count}")
    
    # Show customers who should be upgraded
    print("\n--- Customers Ready for Status Upgrade ---")
    customers_to_upgrade = []
    
    for customer in customers:
        if customer.status == 'lead':
            if customer.total_purchases > 0:
                customers_to_upgrade.append((customer, 'Has purchases - should be Prospect/Customer'))
            elif customer.pipelines.filter(stage__in=['qualified', 'proposal', 'negotiation']).exists():
                customers_to_upgrade.append((customer, 'Has qualified pipeline - should be Prospect'))
        
        elif customer.status == 'prospect':
            if customer.total_spent >= 10000 or customer.total_purchases >= 2:
                customers_to_upgrade.append((customer, 'High value - should be Customer'))
    
    if customers_to_upgrade:
        for customer, reason in customers_to_upgrade:
            print(f"  {customer.full_name}: {reason}")
            print(f"    Current: {customer.get_status_display()}")
            print(f"    Spent: ₹{customer.total_spent}, Purchases: {customer.total_purchases}")
    else:
        print("  No customers ready for status upgrade")
    
    print("\n=== Test Complete ===")

if __name__ == "__main__":
    test_customer_status_logic()
