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

def test_user_tenant():
    print("=== Testing User Tenant Assignment ===")
    
    try:
        # Check all tenants
        tenants = Tenant.objects.all()
        print(f"\n📋 All Tenants ({tenants.count()}):")
        for tenant in tenants:
            print(f"   - ID: {tenant.id}, Name: {tenant.name}")
        
        # Check all users
        users = User.objects.all()
        print(f"\n👥 All Users ({users.count()}):")
        for user in users:
            tenant_name = user.tenant.name if user.tenant else "No Tenant"
            print(f"   - {user.username} ({user.first_name} {user.last_name})")
            print(f"     Role: {user.role}, Tenant: {tenant_name}")
        
        # Find Mandeep Jewelers tenant
        mandeep_tenant = Tenant.objects.filter(name__icontains='mandeep').first()
        if mandeep_tenant:
            print(f"\n🎯 Mandeep Jewelers Tenant:")
            print(f"   - ID: {mandeep_tenant.id}")
            print(f"   - Name: {mandeep_tenant.name}")
            
            # Check products for this tenant
            products = Product.objects.filter(tenant=mandeep_tenant)
            print(f"\n📦 Products for Mandeep Jewelers ({products.count()}):")
            for product in products[:3]:  # Show first 3
                print(f"   - {product.name} (SKU: {product.sku}, Status: {product.status})")
            
            # Check which users belong to this tenant
            tenant_users = User.objects.filter(tenant=mandeep_tenant)
            print(f"\n👤 Users in Mandeep Jewelers ({tenant_users.count()}):")
            for user in tenant_users:
                print(f"   - {user.username} ({user.first_name} {user.last_name}) - Role: {user.role}")
        
        # Test what a user would see if they were in Mandeep Jewelers tenant
        if mandeep_tenant:
            print(f"\n🧪 Testing Product Access for Mandeep Jewelers Tenant:")
            # Simulate what the ProductListView.get_queryset() would return
            queryset = Product.objects.filter(tenant=mandeep_tenant)
            print(f"   - Total products visible: {queryset.count()}")
            print(f"   - Active products: {queryset.filter(status='active').count()}")
            
            # Show some sample products
            sample_products = queryset[:5]
            print(f"   - Sample products:")
            for product in sample_products:
                print(f"     * {product.name} (₹{product.selling_price})")
        
    except Exception as e:
        print(f"❌ Error testing user tenant: {e}")
        import traceback
        traceback.print_exc()

if __name__ == '__main__':
    test_user_tenant() 