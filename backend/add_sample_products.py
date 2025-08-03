#!/usr/bin/env python
import os
import sys
import django
from django.utils import timezone

sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from apps.products.models import Product, Category
from apps.tenants.models import Tenant
from apps.users.models import User
from apps.stores.models import Store

def add_sample_products():
    print("=== Adding Sample Products ===")
    
    try:
        # Get or create tenant
        tenant, created = Tenant.objects.get_or_create(
            name="Sample Jewelry Store",
            defaults={
                'domain': 'sample-store.com',
                'is_active': True
            }
        )
        print(f"✅ Tenant: {tenant.name}")
        
        # Get or create store
        store, created = Store.objects.get_or_create(
            name="Main Store",
            tenant=tenant,
            defaults={
                'address': '123 Main St',
                'phone': '+1234567890',
                'email': 'store@sample-store.com'
            }
        )
        print(f"✅ Store: {store.name}")
        
        # Get or create user
        user, created = User.objects.get_or_create(
            username='manager1',
            defaults={
                'first_name': 'Sarah',
                'last_name': 'Manager',
                'email': 'sarah@sample-store.com',
                'role': 'manager',
                'tenant': tenant,
                'store': store
            }
        )
        print(f"✅ User: {user.first_name} {user.last_name}")
        
        # Create categories
        categories_data = [
            {'name': 'Gold Jewelry', 'description': 'Pure gold jewelry items'},
            {'name': 'Silver Jewelry', 'description': 'Sterling silver jewelry items'},
            {'name': 'Diamond Jewelry', 'description': 'Diamond-studded jewelry'},
            {'name': 'Pearl Jewelry', 'description': 'Pearl jewelry items'},
            {'name': 'Platinum Jewelry', 'description': 'Platinum jewelry items'},
        ]
        
        created_categories = []
        for cat_data in categories_data:
            category, created = Category.objects.get_or_create(
                name=cat_data['name'],
                tenant=tenant,
                defaults={
                    'description': cat_data['description'],
                    'is_active': True
                }
            )
            created_categories.append(category)
            print(f"✅ Created category: {category.name}")
        
        # Clear existing products
        Product.objects.filter(tenant=tenant).delete()
        print("🗑️ Cleared existing products")
        
        # Create sample products
        products_data = [
            {
                'name': '22K Gold Ring',
                'sku': 'GR001',
                'description': 'Beautiful 22K gold ring with traditional design',
                'category': created_categories[0],
                'brand': 'Traditional Gold',
                'cost_price': 45000,
                'selling_price': 52000,
                'quantity': 15,
                'min_quantity': 5,
                'max_quantity': 50,
                'weight': 8.5,
                'material': '22K Gold',
                'color': 'Yellow Gold',
                'size': '18',
                'status': 'active',
                'is_featured': True,
                'is_bestseller': True,
            },
            {
                'name': 'Silver Necklace',
                'sku': 'SN001',
                'description': 'Elegant silver necklace with pendant',
                'category': created_categories[1],
                'brand': 'Silver Elegance',
                'cost_price': 2500,
                'selling_price': 3200,
                'quantity': 25,
                'min_quantity': 10,
                'max_quantity': 100,
                'weight': 12.0,
                'material': 'Sterling Silver',
                'color': 'Silver',
                'size': '18 inch',
                'status': 'active',
                'is_featured': False,
                'is_bestseller': True,
            },
            {
                'name': 'Diamond Stud Earrings',
                'sku': 'DSE001',
                'description': 'Classic diamond stud earrings, 1 carat total',
                'category': created_categories[2],
                'brand': 'Diamond Classics',
                'cost_price': 85000,
                'selling_price': 95000,
                'quantity': 8,
                'min_quantity': 3,
                'max_quantity': 20,
                'weight': 2.1,
                'material': '18K White Gold',
                'color': 'White',
                'size': 'Standard',
                'status': 'active',
                'is_featured': True,
                'is_bestseller': False,
            },
            {
                'name': 'Pearl Strand Necklace',
                'sku': 'PSN001',
                'description': 'Luxurious pearl strand necklace, 18 inches',
                'category': created_categories[3],
                'brand': 'Pearl Luxury',
                'cost_price': 18000,
                'selling_price': 22000,
                'quantity': 12,
                'min_quantity': 5,
                'max_quantity': 30,
                'weight': 15.0,
                'material': 'Freshwater Pearls',
                'color': 'White',
                'size': '18 inch',
                'status': 'active',
                'is_featured': False,
                'is_bestseller': True,
            },
            {
                'name': 'Platinum Wedding Band',
                'sku': 'PWB001',
                'description': 'Classic platinum wedding band for men',
                'category': created_categories[4],
                'brand': 'Platinum Classics',
                'cost_price': 35000,
                'selling_price': 42000,
                'quantity': 6,
                'min_quantity': 2,
                'max_quantity': 15,
                'weight': 4.2,
                'material': 'Platinum',
                'color': 'Platinum',
                'size': '10',
                'status': 'active',
                'is_featured': True,
                'is_bestseller': False,
            },
            {
                'name': 'Gold Bangle Set',
                'sku': 'GBS001',
                'description': 'Traditional gold bangle set, 4 pieces',
                'category': created_categories[0],
                'brand': 'Traditional Gold',
                'cost_price': 28000,
                'selling_price': 35000,
                'quantity': 20,
                'min_quantity': 8,
                'max_quantity': 50,
                'weight': 22.0,
                'material': '18K Gold',
                'color': 'Yellow Gold',
                'size': '2.5 inch',
                'status': 'active',
                'is_featured': False,
                'is_bestseller': True,
            },
            {
                'name': 'Silver Anklet',
                'sku': 'SA001',
                'description': 'Delicate silver anklet with bells',
                'category': created_categories[1],
                'brand': 'Silver Elegance',
                'cost_price': 800,
                'selling_price': 1200,
                'quantity': 35,
                'min_quantity': 15,
                'max_quantity': 100,
                'weight': 8.0,
                'material': 'Sterling Silver',
                'color': 'Silver',
                'size': '10 inch',
                'status': 'active',
                'is_featured': False,
                'is_bestseller': False,
            },
            {
                'name': 'Diamond Pendant',
                'sku': 'DP001',
                'description': 'Elegant diamond pendant on 18K gold chain',
                'category': created_categories[2],
                'brand': 'Diamond Classics',
                'cost_price': 65000,
                'selling_price': 75000,
                'quantity': 10,
                'min_quantity': 4,
                'max_quantity': 25,
                'weight': 3.5,
                'material': '18K Gold',
                'color': 'Yellow Gold',
                'size': '16 inch',
                'status': 'active',
                'is_featured': True,
                'is_bestseller': False,
            },
        ]
        
        created_products = []
        for i, data in enumerate(products_data, 1):
            product = Product.objects.create(
                name=data['name'],
                sku=data['sku'],
                description=data['description'],
                category=data['category'],
                brand=data['brand'],
                cost_price=data['cost_price'],
                selling_price=data['selling_price'],
                quantity=data['quantity'],
                min_quantity=data['min_quantity'],
                max_quantity=data['max_quantity'],
                weight=data['weight'],
                material=data['material'],
                color=data['color'],
                size=data['size'],
                status=data['status'],
                is_featured=data['is_featured'],
                is_bestseller=data['is_bestseller'],
                tenant=tenant,
                created_by=user
            )
            created_products.append(product)
            print(f"✅ Created product: {product.name} (SKU: {product.sku})")
        
        print(f"\n🎉 Successfully created {len(created_products)} sample products!")
        print(f"📊 Product breakdown:")
        print(f"   - Total Products: {Product.objects.filter(tenant=tenant).count()}")
        print(f"   - Active Products: {Product.objects.filter(tenant=tenant, status='active').count()}")
        print(f"   - Featured Products: {Product.objects.filter(tenant=tenant, is_featured=True).count()}")
        print(f"   - Best Sellers: {Product.objects.filter(tenant=tenant, is_bestseller=True).count()}")
        
        # Show products by category
        for category in created_categories:
            count = Product.objects.filter(tenant=tenant, category=category).count()
            print(f"   - {category.name}: {count} products")
        
    except Exception as e:
        print(f"❌ Error adding sample products: {e}")
        import traceback
        traceback.print_exc()

if __name__ == '__main__':
    add_sample_products() 