#!/usr/bin/env python
"""
Script to check customer interests data in the database
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
from apps.products.models import Category, Product
from apps.tenants.models import Tenant
from apps.stores.models import Store
from apps.users.models import User

def check_customer_interests():
    """Check all customer interests in the database"""
    print("🔍 Checking Customer Interests Data")
    print("=" * 50)
    
    try:
        # Check all tenants
        tenants = Tenant.objects.all()
        print(f"Total tenants: {tenants.count()}")
        
        for tenant in tenants:
            print(f"\n📋 Tenant: {tenant.name} (ID: {tenant.id})")
            
            # Check stores for this tenant
            stores = Store.objects.filter(tenant=tenant)
            print(f"  Stores: {stores.count()}")
            
            for store in stores:
                print(f"    📍 Store: {store.name} (ID: {store.id})")
                
                # Check categories for this store
                categories = Category.objects.filter(tenant=tenant, store=store)
                print(f"      Categories: {categories.count()}")
                for cat in categories:
                    print(f"        - {cat.name} (ID: {cat.id})")
                
                # Check products for this store
                products = Product.objects.filter(tenant=tenant, store=store)
                print(f"      Products: {products.count()}")
                for prod in products:
                    print(f"        - {prod.name} (ID: {prod.id}) - Category: {prod.category.name if prod.category else 'None'}")
                
                # Check clients for this store
                clients = Client.objects.filter(tenant=tenant, store=store)
                print(f"      Clients: {clients.count()}")
                
                for client in clients:
                    print(f"        👤 Client: {client.first_name} {client.last_name} (ID: {client.id})")
                    print(f"          Email: {client.email}")
                    print(f"          Phone: {client.phone}")
                    
                    # Check customer interests for this client
                    interests = client.interests.all()
                    print(f"          Interests: {interests.count()}")
                    
                    for interest in interests:
                        print(f"            💎 Interest ID: {interest.id}")
                        print(f"              Category: {interest.category.name if interest.category else 'None'}")
                        print(f"              Product: {interest.product.name if interest.product else 'None'}")
                        print(f"              Revenue: {interest.revenue}")
                        print(f"              Notes: {interest.notes}")
                        print(f"              Created: {interest.created_at}")
        
        # Summary
        print("\n📊 SUMMARY")
        print("=" * 50)
        total_clients = Client.objects.count()
        total_interests = CustomerInterest.objects.count()
        total_categories = Category.objects.count()
        total_products = Product.objects.count()
        
        print(f"Total Clients: {total_clients}")
        print(f"Total Customer Interests: {total_interests}")
        print(f"Total Categories: {total_categories}")
        print(f"Total Products: {total_products}")
        
        # Check for clients with interests
        clients_with_interests = Client.objects.filter(interests__isnull=False).distinct().count()
        print(f"Clients with Interests: {clients_with_interests}")
        
        # Check for clients without interests
        clients_without_interests = total_clients - clients_with_interests
        print(f"Clients without Interests: {clients_without_interests}")
        
        return True
        
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        print(f"Traceback: {traceback.format_exc()}")
        return False

if __name__ == "__main__":
    print("🚀 Starting Customer Interests Check")
    print("=" * 50)
    
    success = check_customer_interests()
    
    if success:
        print("\n✅ Check completed successfully!")
    else:
        print("\n❌ Check failed!")
    
    print("\n�� Script finished")
