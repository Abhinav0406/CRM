#!/usr/bin/env python
"""
Script to check if customer "sarath" has interests
"""

import os
import sys
import django

# Add the backend directory to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from apps.clients.models import Client, CustomerInterest

def check_sarath_interests():
    """Check if customer sarath has interests"""
    print("🔍 Checking customer 'sarath' interests")
    print("=" * 50)
    
    try:
        # Find customer sarath
        sarath = Client.objects.filter(first_name__icontains='sarath').first()
        
        if not sarath:
            print("❌ Customer 'sarath' not found!")
            return False
        
        print(f"✅ Found customer: {sarath.first_name} {sarath.last_name}")
        print(f"   ID: {sarath.id}")
        print(f"   Email: {sarath.email}")
        print(f"   Tenant: {sarath.tenant.name if sarath.tenant else 'None'}")
        print(f"   Store: {sarath.store.name if sarath.store else 'None'}")
        
        # Check interests
        interests = sarath.interests.all()
        print(f"\n📋 Customer Interests: {interests.count()}")
        
        if interests.exists():
            for i, interest in enumerate(interests, 1):
                print(f"\n  Interest #{i}:")
                print(f"    ID: {interest.id}")
                print(f"    Category: {interest.category.name if interest.category else 'None'}")
                print(f"    Product: {interest.product.name if interest.product else 'None'}")
                print(f"    Revenue: {interest.revenue}")
                print(f"    Notes: {interest.notes}")
                print(f"    Created: {interest.created_at}")
        else:
            print("  ❌ No interests found!")
            
            # Check if there are any interests at all in the database
            all_interests = CustomerInterest.objects.all()
            print(f"\n📊 Total interests in database: {all_interests.count()}")
            
            if all_interests.exists():
                print("  Sample interests:")
                for interest in all_interests[:3]:
                    print(f"    - {interest.client.first_name} {interest.client.last_name}: {interest.category.name if interest.category else 'None'} - {interest.product.name if interest.product else 'None'}")
        
        return True
        
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        print(f"Traceback: {traceback.format_exc()}")
        return False

if __name__ == "__main__":
    print("🚀 Starting sarath interests check")
    print("=" * 50)
    
    success = check_sarath_interests()
    
    if success:
        print("\n✅ Check completed successfully!")
    else:
        print("\n❌ Check failed!")
    
    print("\n�� Script finished")
