#!/usr/bin/env python
import os
import sys
import django
from datetime import datetime, timedelta
from decimal import Decimal

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from apps.tenants.models import Tenant
from apps.stores.models import Store
from apps.users.models import User
from apps.clients.models import Client
from apps.sales.models import Sale, SalesPipeline

def create_sample_data():
    print("=== Creating Sample Data for Date Filtering Test ===")
    
    # Get or create tenant
    tenant, created = Tenant.objects.get_or_create(
        slug="sample-jewellery-business",
        defaults={
            'name': "Sample Jewellery Business",
            'business_type': 'Jewelry',
            'subscription_status': 'active'
        }
    )
    print(f"Tenant: {tenant.name} (ID: {tenant.id})")
    
    # Get or create store
    store, created = Store.objects.get_or_create(
        code='MS002',  # Use a unique code
        tenant=tenant,
        defaults={
            'name': "Sample Store",
            'address': '123 Sample St',
            'city': 'Sample City',
            'state': 'Sample State',
            'timezone': 'Asia/Kolkata'
        }
    )
    print(f"Store: {store.name} (ID: {store.id})")
    
    # Get or create business admin user
    admin_user, created = User.objects.get_or_create(
        username='sample_admin',  # Use a unique username
        tenant=tenant,
        defaults={
            'email': 'sample_admin@sample.com',
            'password': 'admin123',
            'role': User.Role.BUSINESS_ADMIN,
            'first_name': 'Sample',
            'last_name': 'Admin'
        }
    )
    if created:
        admin_user.set_password('admin123')
        admin_user.save()
    print(f"Admin User: {admin_user.username} (ID: {admin_user.id})")
    
    # Get or create client
    client, created = Client.objects.get_or_create(
        email='sample_john@sample.com',  # Use a unique email
        tenant=tenant,
        defaults={
            'first_name': 'Sample',
            'last_name': 'John',
            'phone': '1234567891',  # Use a unique phone
            'store': store
        }
    )
    print(f"Client: {client.full_name} (ID: {client.id})")
    
    # Create sales with different dates
    today = datetime.now()
    
    # Today's sale
    today_sale = Sale.objects.create(
        order_number=f"ORD{today.strftime('%Y%m%d')}001",
        client=client,
        sales_representative=admin_user,
        status=Sale.Status.CONFIRMED,
        payment_status=Sale.PaymentStatus.PAID,
        subtotal=Decimal("5000.00"),
        tax_amount=Decimal("500.00"),
        discount_amount=Decimal("0.00"),
        total_amount=Decimal("5500.00"),
        paid_amount=Decimal("5500.00"),
        tenant=tenant
    )
    print(f"Created today's sale: {today_sale.order_number} - ₹{today_sale.total_amount}")
    
    # Yesterday's sale
    yesterday = today - timedelta(days=1)
    yesterday_sale = Sale.objects.create(
        order_number=f"ORD{yesterday.strftime('%Y%m%d')}001",
        client=client,
        sales_representative=admin_user,
        status=Sale.Status.CONFIRMED,
        payment_status=Sale.PaymentStatus.PAID,
        subtotal=Decimal("3000.00"),
        tax_amount=Decimal("300.00"),
        discount_amount=Decimal("0.00"),
        total_amount=Decimal("3300.00"),
        paid_amount=Decimal("3300.00"),
        tenant=tenant
    )
    print(f"Created yesterday's sale: {yesterday_sale.order_number} - ₹{yesterday_sale.total_amount}")
    
    # Sale from 5 days ago
    five_days_ago = today - timedelta(days=5)
    five_days_sale = Sale.objects.create(
        order_number=f"ORD{five_days_ago.strftime('%Y%m%d')}001",
        client=client,
        sales_representative=admin_user,
        status=Sale.Status.CONFIRMED,
        payment_status=Sale.PaymentStatus.PAID,
        subtotal=Decimal("8000.00"),
        tax_amount=Decimal("800.00"),
        discount_amount=Decimal("0.00"),
        total_amount=Decimal("8800.00"),
        paid_amount=Decimal("8800.00"),
        tenant=tenant
    )
    print(f"Created 5 days ago sale: {five_days_sale.order_number} - ₹{five_days_sale.total_amount}")
    
    # Sale from 15 days ago
    fifteen_days_ago = today - timedelta(days=15)
    fifteen_days_sale = Sale.objects.create(
        order_number=f"ORD{fifteen_days_ago.strftime('%Y%m%d')}001",
        client=client,
        sales_representative=admin_user,
        status=Sale.Status.CONFIRMED,
        payment_status=Sale.PaymentStatus.PAID,
        subtotal=Decimal("12000.00"),
        tax_amount=Decimal("1200.00"),
        discount_amount=Decimal("0.00"),
        total_amount=Decimal("13200.00"),
        paid_amount=Decimal("13200.00"),
        tenant=tenant
    )
    print(f"Created 15 days ago sale: {fifteen_days_sale.order_number} - ₹{fifteen_days_sale.total_amount}")
    
    # Sale from 35 days ago (outside 30 days)
    thirty_five_days_ago = today - timedelta(days=35)
    thirty_five_days_sale = Sale.objects.create(
        order_number=f"ORD{thirty_five_days_ago.strftime('%Y%m%d')}001",
        client=client,
        sales_representative=admin_user,
        status=Sale.Status.CONFIRMED,
        payment_status=Sale.PaymentStatus.PAID,
        subtotal=Decimal("20000.00"),
        tax_amount=Decimal("2000.00"),
        discount_amount=Decimal("0.00"),
        total_amount=Decimal("22000.00"),
        paid_amount=Decimal("22000.00"),
        tenant=tenant
    )
    print(f"Created 35 days ago sale: {thirty_five_days_sale.order_number} - ₹{thirty_five_days_sale.total_amount}")
    
    # Create pipeline opportunities
    # Today's pipeline
    today_pipeline = SalesPipeline.objects.create(
        title="Today's Opportunity",
        client=client,
        sales_representative=admin_user,
        stage=SalesPipeline.Stage.EXHIBITION,
        probability=50,
        expected_value=Decimal("15000.00"),
        tenant=tenant
    )
    print(f"Created today's pipeline: {today_pipeline.title} - ₹{today_pipeline.expected_value}")
    
    # Yesterday's pipeline
    yesterday_pipeline = SalesPipeline.objects.create(
        title="Yesterday's Opportunity",
        client=client,
        sales_representative=admin_user,
        stage=SalesPipeline.Stage.INTERESTED,
        probability=75,
        expected_value=Decimal("25000.00"),
        tenant=tenant
    )
    print(f"Created yesterday's pipeline: {yesterday_pipeline.title} - ₹{yesterday_pipeline.expected_value}")
    
    # Closed won pipeline from 10 days ago
    ten_days_ago = today - timedelta(days=10)
    closed_won_pipeline = SalesPipeline.objects.create(
        title="Closed Won Deal",
        client=client,
        sales_representative=admin_user,
        stage=SalesPipeline.Stage.CLOSED_WON,
        probability=100,
        expected_value=Decimal("30000.00"),
        actual_value=Decimal("30000.00"),
        actual_close_date=ten_days_ago.date(),
        tenant=tenant
    )
    print(f"Created closed won pipeline: {closed_won_pipeline.title} - ₹{closed_won_pipeline.expected_value}")
    
    print("\n=== Sample Data Created Successfully ===")
    print(f"Total Sales: {Sale.objects.filter(tenant=tenant).count()}")
    print(f"Total Pipelines: {SalesPipeline.objects.filter(tenant=tenant).count()}")
    print(f"Today's Total: ₹{today_sale.total_amount + today_pipeline.expected_value}")
    print(f"Last 7 Days Total: ₹{today_sale.total_amount + yesterday_sale.total_amount + five_days_sale.total_amount}")
    print(f"Last 30 Days Total: ₹{today_sale.total_amount + yesterday_sale.total_amount + five_days_sale.total_amount + fifteen_days_sale.total_amount + closed_won_pipeline.actual_value}")

if __name__ == "__main__":
    create_sample_data()
