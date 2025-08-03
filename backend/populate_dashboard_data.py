#!/usr/bin/env python
import os
import sys
import django
from decimal import Decimal
from datetime import timedelta

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from django.utils import timezone
from apps.tenants.models import Tenant
from apps.users.models import User
from apps.clients.models import Client
from apps.products.models import Product, Category
from apps.sales.models import Sale, SalesPipeline
from apps.stores.models import Store
from django.db.models import Sum

def create_dashboard_data():
    """Create sample data for dashboard testing"""
    print("Creating dashboard sample data...")
    
    # Get or create a tenant
    tenant, created = Tenant.objects.get_or_create(
        slug='diamond-palace',
        defaults={
            'name': 'Diamond Palace',
            'business_type': 'Jewelry Store',
            'subscription_status': 'active',
            'subscription_plan': 'professional'
        }
    )
    
    if created:
        print(f"Created tenant: {tenant.name}")
    else:
        print(f"Using existing tenant: {tenant.name}")
    
    # Create or get a store (without invalid fields)
    store, created = Store.objects.get_or_create(
        name='Main Store',
        tenant=tenant,
        defaults={
            'address': '123 Main Street, City'
        }
    )
    
    # Create or get a business admin user
    admin_user, created = User.objects.get_or_create(
        username='business_admin',
        defaults={
            'email': 'admin@diamondpalace.com',
            'first_name': 'Business',
            'last_name': 'Admin',
            'role': User.Role.BUSINESS_ADMIN,
            'tenant': tenant,
            'store': store,
            'is_active': True
        }
    )
    
    if created:
        admin_user.set_password('admin123')
        admin_user.save()
        print(f"Created admin user: {admin_user.username}")
    
    # Create categories
    categories = {}
    category_names = ['Rings', 'Necklaces', 'Earrings', 'Bracelets', 'Watches']
    
    for cat_name in category_names:
        category, created = Category.objects.get_or_create(
            name=cat_name,
            tenant=tenant,
            defaults={'description': f'{cat_name} category'}
        )
        categories[cat_name] = category
        if created:
            print(f"Created category: {cat_name}")
    
    # Create products
    products = []
    product_data = [
        {'name': 'Diamond Ring', 'category': 'Rings', 'price': 50000, 'quantity': 10},
        {'name': 'Gold Necklace', 'category': 'Necklaces', 'price': 75000, 'quantity': 15},
        {'name': 'Pearl Earrings', 'category': 'Earrings', 'price': 25000, 'quantity': 20},
        {'name': 'Silver Bracelet', 'category': 'Bracelets', 'price': 15000, 'quantity': 25},
        {'name': 'Luxury Watch', 'category': 'Watches', 'price': 120000, 'quantity': 5},
        {'name': 'Wedding Ring Set', 'category': 'Rings', 'price': 85000, 'quantity': 8},
        {'name': 'Diamond Necklace', 'category': 'Necklaces', 'price': 95000, 'quantity': 12},
        {'name': 'Gold Earrings', 'category': 'Earrings', 'price': 35000, 'quantity': 18},
    ]
    
    for i, prod_data in enumerate(product_data):
        product, created = Product.objects.get_or_create(
            name=prod_data['name'],
            tenant=tenant,
            defaults={
                'sku': f'DP-{prod_data["category"][:3].upper()}-{i+1:03d}',
                'description': f'Sample {prod_data["name"]} for {tenant.name}',
                'cost_price': Decimal(prod_data['price'] * 0.6),
                'selling_price': Decimal(prod_data['price']),
                'quantity': prod_data['quantity'],
                'category': categories[prod_data['category']],
                'status': 'active'
            }
        )
        products.append(product)
        if created:
            print(f"Created product: {product.name}")
    
    # Create clients
    clients = []
    client_data = [
        {'first_name': 'Priya', 'last_name': 'Sharma', 'email': 'priya@example.com', 'phone': '+919876543210'},
        {'first_name': 'Amit', 'last_name': 'Kumar', 'email': 'amit@example.com', 'phone': '+919876543211'},
        {'first_name': 'Neha', 'last_name': 'Patel', 'email': 'neha@example.com', 'phone': '+919876543212'},
        {'first_name': 'Raj', 'last_name': 'Singh', 'email': 'raj@example.com', 'phone': '+919876543213'},
        {'first_name': 'Sita', 'last_name': 'Verma', 'email': 'sita@example.com', 'phone': '+919876543214'},
        {'first_name': 'Vikram', 'last_name': 'Malhotra', 'email': 'vikram@example.com', 'phone': '+919876543215'},
        {'first_name': 'Anjali', 'last_name': 'Gupta', 'email': 'anjali@example.com', 'phone': '+919876543216'},
        {'first_name': 'Rahul', 'last_name': 'Joshi', 'email': 'rahul@example.com', 'phone': '+919876543217'},
    ]
    
    for client_data_item in client_data:
        client, created = Client.objects.get_or_create(
            email=client_data_item['email'],
            tenant=tenant,
            defaults={
                'first_name': client_data_item['first_name'],
                'last_name': client_data_item['last_name'],
                'phone': client_data_item['phone'],
                'status': 'customer',
                'lead_source': 'website'
            }
        )
        clients.append(client)
        if created:
            print(f"Created client: {client.full_name}")
    
    # Create sales with different dates to show trends
    sales = []
    sale_data = [
        {'amount': 50000, 'days_ago': 1, 'status': 'delivered'},
        {'amount': 75000, 'days_ago': 2, 'status': 'confirmed'},
        {'amount': 25000, 'days_ago': 3, 'status': 'delivered'},
        {'amount': 120000, 'days_ago': 5, 'status': 'confirmed'},
        {'amount': 85000, 'days_ago': 7, 'status': 'delivered'},
        {'amount': 95000, 'days_ago': 10, 'status': 'confirmed'},
        {'amount': 35000, 'days_ago': 15, 'status': 'delivered'},
        {'amount': 15000, 'days_ago': 20, 'status': 'confirmed'},
        {'amount': 65000, 'days_ago': 25, 'status': 'delivered'},
        {'amount': 45000, 'days_ago': 30, 'status': 'confirmed'},
    ]
    
    for i, sale_data_item in enumerate(sale_data):
        sale_date = timezone.now() - timedelta(days=sale_data_item['days_ago'])
        sale, created = Sale.objects.get_or_create(
            order_number=f'ORD-DP-{i+1:03d}',
            tenant=tenant,
            defaults={
                'client': clients[i % len(clients)],
                'sales_representative': admin_user,
                'subtotal': Decimal(sale_data_item['amount']),
                'tax_amount': Decimal(sale_data_item['amount'] * 0.1),
                'total_amount': Decimal(sale_data_item['amount'] * 1.1),
                'status': sale_data_item['status'],
                'payment_status': 'paid',
                'created_at': sale_date,
                'order_date': sale_date
            }
        )
        sales.append(sale)
        if created:
            print(f"Created sale: {sale.order_number} - ₹{sale.total_amount}")
    
    # Create sales pipelines
    pipeline_data = [
        {'title': 'Wedding Collection', 'stage': 'negotiation', 'value': 200000, 'days_ago': 2},
        {'title': 'Anniversary Gift', 'stage': 'proposal', 'value': 85000, 'days_ago': 5},
        {'title': 'Birthday Present', 'stage': 'qualified', 'value': 45000, 'days_ago': 8},
        {'title': 'Corporate Gift', 'stage': 'contacted', 'value': 150000, 'days_ago': 12},
        {'title': 'Custom Design', 'stage': 'lead', 'value': 300000, 'days_ago': 15},
    ]
    
    for i, pipeline_data_item in enumerate(pipeline_data):
        pipeline_date = timezone.now() - timedelta(days=pipeline_data_item['days_ago'])
        pipeline, created = SalesPipeline.objects.get_or_create(
            title=pipeline_data_item['title'],
            tenant=tenant,
            defaults={
                'client': clients[i % len(clients)],
                'sales_representative': admin_user,
                'stage': pipeline_data_item['stage'],
                'expected_value': Decimal(pipeline_data_item['value']),
                'probability': 75 if pipeline_data_item['stage'] in ['negotiation', 'proposal'] else 50,
                'created_at': pipeline_date
            }
        )
        if created:
            print(f"Created pipeline: {pipeline.title} - {pipeline.get_stage_display()}")
    
    print("\nDashboard data creation completed!")
    print(f"Total clients: {Client.objects.filter(tenant=tenant).count()}")
    print(f"Total products: {Product.objects.filter(tenant=tenant).count()}")
    print(f"Total sales: {Sale.objects.filter(tenant=tenant).count()}")
    print(f"Total pipelines: {SalesPipeline.objects.filter(tenant=tenant).count()}")
    print(f"Total revenue: ₹{Sale.objects.filter(tenant=tenant, status__in=['confirmed', 'delivered']).aggregate(total=Sum('total_amount'))['total'] or 0:,.0f}")

if __name__ == '__main__':
    create_dashboard_data() 