#!/usr/bin/env python
import os
import sys
import django

sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from apps.products.models import Product
from apps.tenants.models import Tenant
from apps.users.models import User

def debug_products_tenant():
    print("=== Debug Products Tenant Issue ===")
    
    try:
        # Check all tenants
        tenants = Tenant.objects.all()
        print(f"\n📋 All Tenants ({tenants.count()}):")
        for tenant in tenants:
            print(f"   - ID: {tenant.id}, Name: {tenant.name}, Domain: {tenant.domain}")
        
        # Check Mandeep Jewelers specifically
        mandeep_tenant = Tenant.objects.filter(name__icontains='mandeep').first()
        if mandeep_tenant:
            print(f"\n🎯 Mandeep Jewelers Tenant:")
            print(f"   - ID: {mandeep_tenant.id}")
            print(f"   - Name: {mandeep_tenant.name}")
            print(f"   - Domain: {mandeep_tenant.domain}")
            print(f"   - Is Active: {mandeep_tenant.is_active}")
            
            # Check products for this tenant
            products = Product.objects.filter(tenant=mandeep_tenant)
            print(f"\n📦 Products for Mandeep Jewelers ({products.count()}):")
            for product in products[:5]:  # Show first 5
                print(f"   - {product.name} (SKU: {product.sku}, Status: {product.status})")
            if products.count() > 5:
                print(f"   ... and {products.count() - 5} more products")
        else:
            print("\n❌ No tenant found with 'mandeep' in the name")
        
        # Check all users and their tenants
        users = User.objects.all()
        print(f"\n👥 All Users ({users.count()}):")
        for user in users:
            tenant_name = user.tenant.name if user.tenant else "No Tenant"
            print(f"   - {user.username} ({user.first_name} {user.last_name})")
            print(f"     Role: {user.role}, Tenant: {tenant_name}")
        
        # Check products by tenant
        print(f"\n📊 Products by Tenant:")
        for tenant in tenants:
            product_count = Product.objects.filter(tenant=tenant).count()
            print(f"   - {tenant.name}: {product_count} products")
        
    except Exception as e:
        print(f"❌ Error debugging products tenant: {e}")
        import traceback
        traceback.print_exc()

if __name__ == '__main__':
    debug_products_tenant() 