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
from apps.stores.models import Store

def fix_user_tenant():
    print("=== Fixing User-Tenant Assignment ===")
    
    try:
        # Find Mandeep Jewelers tenant
        mandeep_tenant = Tenant.objects.filter(name__icontains='mandeep').first()
        if not mandeep_tenant:
            print("❌ Mandeep Jewelers tenant not found!")
            return
        
        print(f"✅ Found Mandeep Jewelers tenant: {mandeep_tenant.name} (ID: {mandeep_tenant.id})")
        
        # Get or create a store for this tenant
        store, created = Store.objects.get_or_create(
            name="Main Store",
            tenant=mandeep_tenant,
            defaults={
                'code': 'MAIN',
                'address': '123 Main St, Hyderabad',
                'city': 'Hyderabad',
                'state': 'Telangana',
                'timezone': 'Asia/Kolkata'
            }
        )
        print(f"✅ Store: {store.name}")
        
        # Create or update users for Mandeep Jewelers
        users_data = [
            {
                'username': 'chary',
                'first_name': 'Chary',
                'last_name': '',
                'email': 'chary@gmail.com',
                'role': 'inhouse_sales',
                'tenant': mandeep_tenant,
                'store': store
            },
            {
                'username': 'ram',
                'first_name': 'Ram',
                'last_name': '',
                'email': 'ram@gmail.com',
                'role': 'inhouse_sales',
                'tenant': mandeep_tenant,
                'store': store
            },
            {
                'username': 'ajay',
                'first_name': 'Ajay',
                'last_name': '',
                'email': 'ajay@gmail.com',
                'role': 'inhouse_sales',
                'tenant': mandeep_tenant,
                'store': store
            },
            {
                'username': 'srav',
                'first_name': 'Sravanti',
                'last_name': '',
                'email': 'srav@gmail.com',
                'role': 'inhouse_sales',
                'tenant': mandeep_tenant,
                'store': store
            },
            {
                'username': 'moni',
                'first_name': 'Monish',
                'last_name': '',
                'email': 'moni@gmail.com',
                'role': 'marketing',
                'tenant': mandeep_tenant,
                'store': store
            },
            {
                'username': 'vedu',
                'first_name': 'Vedu',
                'last_name': '',
                'email': 'vedu@gmail.com',
                'role': 'tele_calling',
                'tenant': mandeep_tenant,
                'store': store
            },
            {
                'username': 'akshay',
                'first_name': 'Akshay',
                'last_name': '',
                'email': 'akshay@gmail.com',
                'role': 'manager',
                'tenant': mandeep_tenant,
                'store': store
            },
        ]
        
        created_users = []
        for user_data in users_data:
            user, created = User.objects.get_or_create(
                username=user_data['username'],
                defaults={
                    'first_name': user_data['first_name'],
                    'last_name': user_data['last_name'],
                    'email': user_data['email'],
                    'role': user_data['role'],
                    'tenant': user_data['tenant'],
                    'store': user_data['store'],
                    'is_active': True
                }
            )
            
            # Update existing users to ensure they have the correct tenant
            if not created:
                user.tenant = user_data['tenant']
                user.store = user_data['store']
                user.save()
            
            created_users.append(user)
            print(f"✅ User: {user.username} ({user.first_name} {user.last_name}) - Role: {user.role}")
        
        # Check products for this tenant
        products = Product.objects.filter(tenant=mandeep_tenant)
        print(f"\n📦 Products for Mandeep Jewelers: {products.count()}")
        
        # Test what a user would see
        if created_users:
            test_user = created_users[0]  # Use the first user
            print(f"\n🧪 Testing with user: {test_user.username}")
            
            # Simulate the ProductListView.get_queryset() logic
            queryset = Product.objects.filter(tenant=test_user.tenant)
            print(f"   - Products visible to {test_user.username}: {queryset.count()}")
            
            if queryset.count() > 0:
                print(f"   - Sample products:")
                for product in queryset[:3]:
                    print(f"     * {product.name} (₹{product.selling_price})")
            else:
                print("   - No products visible to this user!")
        
        print(f"\n🎉 Successfully set up {len(created_users)} users for Mandeep Jewelers!")
        print("💡 Now when you login with any of these users, you should see the products.")
        
    except Exception as e:
        print(f"❌ Error fixing user tenant: {e}")
        import traceback
        traceback.print_exc()

if __name__ == '__main__':
    fix_user_tenant() 