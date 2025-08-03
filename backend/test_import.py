#!/usr/bin/env python
import os
import sys
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from apps.products.models import Product, Category
from apps.tenants.models import Tenant
from decimal import Decimal

def test_product_creation():
    print("Testing product creation...")
    
    try:
        # Get tenant
        tenant = Tenant.objects.get(id=4)
        print(f"Tenant: {tenant.name}")
        
        # Test creating a product
        product = Product.objects.create(
            name='Test Product',
            sku='TEST001',
            selling_price=Decimal('100.00'),
            cost_price=Decimal('80.00'),
            quantity=10,
            tenant=tenant,
            status='active',
            is_featured=False,
            is_bestseller=False,
            min_quantity=0,
            max_quantity=999999,
            weight=0,
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
        print("Test product deleted")
        
        return True
        
    except Exception as e:
        print(f"Error creating product: {str(e)}")
        return False

def test_csv_parsing():
    print("\nTesting CSV parsing...")
    
    csv_content = """name,sku,category,selling_price,cost_price,quantity,description
Gold Ring MJ01,MJ01,Rings,25000,20000,10,Beautiful gold ring with diamond
Silver Necklace MJ02,MJ02,Necklaces,15000,12000,5,Elegant silver necklace"""
    
    import csv
    import io
    
    try:
        csv_data = csv.DictReader(io.StringIO(csv_content))
        print(f"CSV headers: {csv_data.fieldnames}")
        
        for row_num, row in enumerate(csv_data, start=2):
            print(f"Row {row_num}: {row}")
            
            # Test field validation
            required_fields = ['name', 'sku', 'category', 'selling_price', 'cost_price', 'quantity']
            missing_fields = []
            for field in required_fields:
                if not row.get(field):
                    missing_fields.append(field)
            
            if missing_fields:
                print(f"Missing fields: {missing_fields}")
            else:
                print("All required fields present")
                
                # Test numeric conversion
                try:
                    selling_price = Decimal(row['selling_price'])
                    cost_price = Decimal(row['cost_price'])
                    quantity = int(row['quantity'])
                    print(f"Validated: selling_price={selling_price}, cost_price={cost_price}, quantity={quantity}")
                except (ValueError, TypeError) as e:
                    print(f"Invalid numeric values: {str(e)}")
        
        return True
        
    except Exception as e:
        print(f"Error parsing CSV: {str(e)}")
        return False

if __name__ == "__main__":
    print("=== Testing Import Functionality ===")
    
    # Test product creation
    product_test = test_product_creation()
    
    # Test CSV parsing
    csv_test = test_csv_parsing()
    
    print(f"\n=== Results ===")
    print(f"Product creation: {'✅ PASS' if product_test else '❌ FAIL'}")
    print(f"CSV parsing: {'✅ PASS' if csv_test else '❌ FAIL'}")
    
    if product_test and csv_test:
        print("All tests passed! Import should work.")
    else:
        print("Some tests failed. Check the errors above.") 