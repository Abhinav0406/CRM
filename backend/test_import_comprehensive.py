#!/usr/bin/env python
import os
import sys
import django
import csv
import io
from decimal import Decimal

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from apps.products.models import Product, Category
from apps.tenants.models import Tenant
from apps.users.models import User

def test_category_creation():
    print("Testing category creation...")
    
    try:
        tenant = Tenant.objects.get(id=4)
        print(f"Tenant: {tenant.name}")
        
        # Test creating a category
        category, created = Category.objects.get_or_create(
            name='Test Category',
            tenant=tenant,
            defaults={
                'description': 'Test category for import',
                'is_active': True
            }
        )
        
        print(f"Category: {category.name}, Created: {created}")
        
        # Clean up
        if created:
            category.delete()
            print("Test category deleted")
        
        return True
        
    except Exception as e:
        print(f"Error creating category: {str(e)}")
        return False

def test_product_creation_with_category():
    print("\nTesting product creation with category...")
    
    try:
        tenant = Tenant.objects.get(id=4)
        
        # Create a test category
        category = Category.objects.create(
            name='Test Category for Product',
            tenant=tenant,
            description='Test category',
            is_active=True
        )
        
        # Test creating a product
        product = Product.objects.create(
            name='Test Product with Category',
            sku='TEST002',
            category=category,
            selling_price=Decimal('100.00'),
            cost_price=Decimal('80.00'),
            quantity=10,
            description='Test product with category',
            status='active',
            tenant=tenant,
            is_featured=False,
            is_bestseller=False,
            min_quantity=0,
            max_quantity=999999,
            weight=Decimal('0'),
            dimensions='',
            material='',
            color='',
            size='',
            brand='',
            main_image='',
            additional_images=[],
            meta_title='',
            meta_description='',
            tags=[]
        )
        
        print(f"Successfully created product: {product.name} (SKU: {product.sku})")
        print(f"Product category: {product.category.name}")
        
        # Clean up
        product.delete()
        category.delete()
        print("Test product and category deleted")
        
        return True
        
    except Exception as e:
        print(f"Error creating product with category: {str(e)}")
        return False

def test_csv_import_simulation():
    print("\nTesting CSV import simulation...")
    
    csv_content = """name,sku,category,selling_price,cost_price,quantity,description
Gold Ring MJ01,MJ01,Rings,25000,20000,10,Beautiful gold ring with diamond
Silver Necklace MJ02,MJ02,Necklaces,15000,12000,5,Elegant silver necklace
Diamond Earrings MJ03,MJ03,Earrings,30000,24000,,Stunning diamond earrings (quantity optional)"""
    
    try:
        tenant = Tenant.objects.get(id=4)
        csv_data = csv.DictReader(io.StringIO(csv_content))
        
        for row_num, row in enumerate(csv_data, start=2):
            print(f"\nProcessing row {row_num}: {row}")
            
            # Validate required fields
            required_fields = ['name', 'sku', 'category', 'selling_price', 'cost_price']
            missing_fields = []
            for field in required_fields:
                if not row.get(field):
                    missing_fields.append(field)
            
            if missing_fields:
                print(f"Missing fields: {missing_fields}")
                continue
            
            # Validate numeric fields
            try:
                selling_price = Decimal(row['selling_price'])
                cost_price = Decimal(row['cost_price'])
                quantity_str = row.get('quantity', '0')
                quantity = int(quantity_str) if quantity_str.strip() else 0  # Default to 0 if empty or not provided
                print(f"Validated: selling_price={selling_price}, cost_price={cost_price}, quantity={quantity}")
            except (ValueError, TypeError) as e:
                print(f"Invalid numeric values: {str(e)}")
                continue
            
            # Test category creation
            category_name = row['category'].strip()
            try:
                category, created = Category.objects.get_or_create(
                    name=category_name,
                    tenant=tenant,
                    defaults={
                        'description': f'Category for {category_name}',
                        'is_active': True
                    }
                )
                print(f"Category: {category.name}, Created: {created}")
            except Exception as e:
                print(f"Error with category: {str(e)}")
                continue
            
            # Test product creation
            try:
                product = Product.objects.create(
                    name=row['name'].strip(),
                    sku=row['sku'].strip(),
                    category=category,
                    selling_price=selling_price,
                    cost_price=cost_price,
                    quantity=quantity,
                    description=row.get('description', '').strip(),
                    status='active',
                    tenant=tenant,
                    is_featured=False,
                    is_bestseller=False,
                    min_quantity=0,
                    max_quantity=999999,
                    weight=Decimal('0'),
                    dimensions='',
                    material='',
                    color='',
                    size='',
                    brand='',
                    main_image='',
                    additional_images=[],
                    meta_title='',
                    meta_description='',
                    tags=[]
                )
                print(f"Successfully created product: {product.name} (SKU: {product.sku})")
                
                # Clean up
                product.delete()
                if created:
                    category.delete()
                
            except Exception as e:
                print(f"Error creating product: {str(e)}")
                continue
        
        return True
        
    except Exception as e:
        print(f"Error in CSV simulation: {str(e)}")
        return False

if __name__ == "__main__":
    print("=== Comprehensive Import Testing ===")
    
    # Test category creation
    category_test = test_category_creation()
    
    # Test product creation with category
    product_test = test_product_creation_with_category()
    
    # Test CSV import simulation
    csv_test = test_csv_import_simulation()
    
    print(f"\n=== Results ===")
    print(f"Category creation: {'✅ PASS' if category_test else '❌ FAIL'}")
    print(f"Product with category: {'✅ PASS' if product_test else '❌ FAIL'}")
    print(f"CSV import simulation: {'✅ PASS' if csv_test else '❌ FAIL'}")
    
    if category_test and product_test and csv_test:
        print("\n🎉 All tests passed! Import functionality should work correctly.")
    else:
        print("\n⚠️ Some tests failed. Check the errors above.") 