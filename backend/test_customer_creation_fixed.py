#!/usr/bin/env python
"""
Script to test customer creation with interests - simulating frontend behavior
This will help identify where the customer interests are getting lost
"""

import os
import sys
import django
import json
from decimal import Decimal

# Add the backend directory to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from apps.clients.serializers import ClientSerializer
from apps.clients.models import Client, CustomerInterest
from apps.products.models import Category, Product
from apps.tenants.models import Tenant
from apps.stores.models import Store
from apps.users.models import User
from rest_framework.test import APIRequestFactory

def test_customer_creation_with_interests():
    """Test the complete customer creation flow with interests"""
    print("🧪 Testing Customer Creation with Interests")
    print("=" * 60)
    
    try:
        # Find the tenant and store for user 'das'
        print("🔍 Finding user 'das' and their tenant/store...")
        
        try:
            user = User.objects.get(username='das')
            print(f"✅ Found user: {user.username} (ID: {user.id})")
            print(f"   Role: {user.role}")
            print(f"   Tenant: {user.tenant.name if user.tenant else 'None'}")
            print(f"   Store: {user.store.name if user.store else 'None'}")
        except User.DoesNotExist:
            print("❌ User 'das' not found!")
            return False
        
        if not user.tenant:
            print("❌ User 'das' has no tenant assigned!")
            return False
        
        if not user.store:
            print("❌ User 'das' has no store assigned!")
            return False
        
        tenant = user.tenant
        store = user.store
        
        print(f"\n📋 Using Tenant: {tenant.name} (ID: {tenant.id})")
        print(f"📍 Using Store: {store.name} (ID: {store.id})")
        
        # Check existing categories and products
        print("\n🔍 Checking existing categories and products...")
        categories = Category.objects.filter(tenant=tenant, store=store)
        products = Product.objects.filter(tenant=tenant, store=store)
        
        print(f"   Categories: {categories.count()}")
        for cat in categories:
            print(f"     - {cat.name} (ID: {cat.id})")
        
        print(f"   Products: {products.count()}")
        for prod in products:
            print(f"     - {prod.name} (ID: {prod.id}) - Category: {prod.category.name if prod.category else 'None'}")
        
        # Create a mock request with the user for all tests
        factory = APIRequestFactory()
        request = factory.post('/')
        request.user = user
        
        # Test 1: Create customer with existing category and product
        print("\n📝 Test 1: Customer with existing category/product")
        print("-" * 50)
        
        if categories.exists() and products.exists():
            category = categories.first()
            product = products.first()
            
            test_data_1 = {
                'first_name': 'Test Customer 1',
                'last_name': 'With Existing Products',
                'email': 'test1@example.com',
                'phone': '9876543210',
                'customer_type': 'individual',
                'tenant': tenant.id,
                'store': store.id,
                'customer_interests_input': [
                    json.dumps({
                        'category': str(category.id),  # Existing category ID
                        'products': [
                            {
                                'product': str(product.id),  # Existing product ID
                                'revenue': '5000'
                            }
                        ],
                        'preferences': {
                            'designSelected': True,
                            'wantsDiscount': False
                        }
                    })
                ]
            }
            
            print(f"Test data 1: {test_data_1}")
            print(f"Category: {category.name} (ID: {category.id})")
            print(f"Product: {product.name} (ID: {product.id})")
            
            # Test the serializer
            serializer = ClientSerializer(data=test_data_1, context={'request': request})
            if serializer.is_valid():
                print("✅ Serializer validation passed for test 1")
                customer1 = serializer.save()
                print(f"✅ Customer created: {customer1.first_name} {customer1.last_name}")
                
                # Check interests
                interests1 = customer1.interests.all()
                print(f"✅ Customer has {interests1.count()} interests")
                for interest in interests1:
                    print(f"  - Category: {interest.category.name if interest.category else 'None'}")
                    print(f"  - Product: {interest.product.name if interest.product else 'None'}")
                    print(f"  - Revenue: {interest.revenue}")
            else:
                print(f"❌ Serializer validation failed for test 1: {serializer.errors}")
                return False
        else:
            print("⚠️ No existing categories/products found, skipping test 1")
        
        # Test 2: Create customer with new category and product names
        print("\n📝 Test 2: Customer with new category/product names")
        print("-" * 50)
        
        test_data_2 = {
            'first_name': 'Test Customer 2',
            'last_name': 'With New Products',
            'email': 'test2@example.com',
            'phone': '9876543211',
            'customer_type': 'individual',
            'tenant': tenant.id,
            'store': store.id,
            'customer_interests_input': [
                json.dumps({
                    'category': 'Platinum Collection',  # New category name
                    'products': [
                        {
                            'product': 'Diamond Necklace',  # New product name
                            'revenue': '8000'
                        }
                    ],
                    'preferences': {
                        'designSelected': False,
                        'wantsDiscount': True
                    }
                })
            ]
        }
        
        print(f"Test data 2: {test_data_2}")
        
        # Test the serializer
        serializer2 = ClientSerializer(data=test_data_2, context={'request': request})
        if serializer2.is_valid():
            print("✅ Serializer validation passed for test 2")
            customer2 = serializer2.save()
            print(f"✅ Customer created: {customer2.first_name} {customer2.last_name}")
            
            # Check interests
            interests2 = customer2.interests.all()
            print(f"✅ Customer has {interests2.count()} interests")
            for interest in interests2:
                print(f"  - Category: {interest.category.name if interest.category else 'None'}")
                print(f"  - Product: {interest.product.name if interest.product else 'None'}")
                print(f"  - Revenue: {interest.revenue}")
        else:
            print(f"❌ Serializer validation failed for test 2: {serializer2.errors}")
            return False
        
        # Test 3: Create customer with mixed data (existing category, new product)
        print("\n📝 Test 3: Customer with mixed data")
        print("-" * 50)
        
        if categories.exists():
            category = categories.first()
            
            test_data_3 = {
                'first_name': 'Test Customer 3',
                'last_name': 'With Mixed Data',
                'email': 'test3@example.com',
                'phone': '9876543212',
                'customer_type': 'individual',
                'tenant': tenant.id,
                'store': store.id,
                'customer_interests_input': [
                    json.dumps({
                        'category': str(category.id),  # Existing category ID
                        'products': [
                            {
                                'product': 'Custom Bracelet',  # New product name
                                'revenue': '3000'
                            }
                        ],
                        'preferences': {
                            'designSelected': True,
                            'wantsDiscount': True
                        }
                    })
                ]
            }
            
            print(f"Test data 3: {test_data_3}")
            print(f"Category: {category.name} (ID: {category.id})")
            
            # Test the serializer
            serializer3 = ClientSerializer(data=test_data_3, context={'request': request})
            if serializer3.is_valid():
                print("✅ Serializer validation passed for test 3")
                customer3 = serializer3.save()
                print(f"✅ Customer created: {customer3.first_name} {customer3.last_name}")
                
                # Check interests
                interests3 = customer3.interests.all()
                print(f"✅ Customer has {interests3.count()} interests")
                for interest in interests3:
                    print(f"  - Category: {interest.category.name if interest.category else 'None'}")
                    print(f"  - Product: {interest.product.name if interest.product else 'None'}")
                    print(f"  - Revenue: {interest.revenue}")
            else:
                print(f"❌ Serializer validation failed for test 3: {serializer3.errors}")
                return False
        else:
            print("⚠️ No existing categories found, skipping test 3")
        
        # Test 4: Final Verification
        print("\n📝 Test 4: Final Verification")
        print("-" * 50)
        
        # Check all test customers
        test_customers = Client.objects.filter(email__contains='@example.com')
        print(f"Total test customers: {test_customers.count()}")
        
        # Check all test interests
        all_test_interests = CustomerInterest.objects.filter(client__in=test_customers)
        print(f"Total test interests: {all_test_interests.count()}")
        
        # Check all categories (including newly created ones)
        all_categories = Category.objects.filter(tenant=tenant)
        print(f"Total categories: {all_categories.count()}")
        for cat in all_categories:
            print(f"  - {cat.name} (ID: {cat.id})")
        
        # Check all products (including newly created ones)
        all_products = Product.objects.filter(tenant=tenant)
        print(f"Total products: {all_products.count()}")
        for prod in all_products:
            print(f"  - {prod.name} (ID: {prod.id}) - Category: {prod.category.name if prod.category else 'None'}")
        
        print("\n🎉 All customer creation tests completed successfully!")
        return True
        
    except Exception as e:
        print(f"❌ Test failed with error: {e}")
        import traceback
        print(f"Traceback: {traceback.format_exc()}")
        return False

def cleanup_test_data():
    """Clean up test data"""
    print("\n🧹 Cleaning up test data...")
    
    try:
        # Delete test customer interests
        test_customers = Client.objects.filter(email__contains='@example.com')
        CustomerInterest.objects.filter(client__in=test_customers).delete()
        print("✅ Deleted test customer interests")
        
        # Delete test customers
        test_customers.delete()
        print("✅ Deleted test customers")
        
        # Delete test products (only if they were created by our tests)
        test_products = Product.objects.filter(name__in=["Diamond Necklace", "Custom Bracelet"])
        test_products.delete()
        print("✅ Deleted test products")
        
        # Delete test categories (only if they were created by our tests)
        test_categories = Category.objects.filter(name="Platinum Collection")
        test_categories.delete()
        print("✅ Deleted test categories")
        
        print("✅ Cleanup completed successfully!")
        
    except Exception as e:
        print(f"❌ Cleanup failed: {e}")

if __name__ == "__main__":
    print("🚀 Starting Customer Creation Test")
    print("=" * 60)
    
    # Run the test
    success = test_customer_creation_with_interests()
    
    if success:
        print("\n✅ Customer creation test completed successfully!")
        
        # Ask if user wants to clean up
        response = input("\n🧹 Do you want to clean up test data? (y/n): ")
        if response.lower() in ['y', 'yes']:
            cleanup_test_data()
        else:
            print("ℹ️ Test data left in database for inspection")
    else:
        print("\n❌ Customer creation test failed!")
    
    print("\n🏁 Test script finished")
