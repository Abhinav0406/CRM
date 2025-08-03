#!/usr/bin/env python
import os
import sys
import django

# Add the backend directory to the Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Set up Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from apps.sales.models import SalesPipeline
from apps.clients.models import Client
from apps.tenants.models import Tenant
from apps.users.models import User
from decimal import Decimal
from django.utils import timezone
from datetime import timedelta
import random

def add_sample_sales_pipeline():
    """Add sample sales pipeline data for testing"""
    
    try:
        tenant = Tenant.objects.first()
        if not tenant:
            print("No tenant found. Please create a tenant first.")
            return
        
        # Get or create a sales user
        sales_user, created = User.objects.get_or_create(
            username='sales_user',
            tenant=tenant,
            defaults={
                'email': 'sales@example.com',
                'first_name': 'Sales',
                'last_name': 'User',
                'role': 'inhouse_sales',
                'is_active': True
            }
        )
        
        if created:
            sales_user.set_password('password123')
            sales_user.save()
            print("Created sales user")
        else:
            print("Sales user already exists")
        
        # Get some customers
        customers = Client.objects.filter(tenant=tenant)[:5]
        if not customers.exists():
            print("No customers found. Please create customers first.")
            return
        
        # Sample pipeline data
        sample_pipelines = [
            {
                'title': 'Gold Ring Deal',
                'client': customers[0] if customers.count() > 0 else None,
                'sales_representative': sales_user,
                'stage': 'lead',
                'probability': 10,
                'expected_value': Decimal('75000.00'),
                'notes': 'Customer interested in gold ring collection',
                'next_action': 'Schedule follow-up call',
                'next_action_date': timezone.now() + timedelta(days=3)
            },
            {
                'title': 'Diamond Necklace Opportunity',
                'client': customers[1] if customers.count() > 1 else customers[0],
                'sales_representative': sales_user,
                'stage': 'contacted',
                'probability': 25,
                'expected_value': Decimal('120000.00'),
                'notes': 'High-value diamond necklace inquiry',
                'next_action': 'Send product catalog',
                'next_action_date': timezone.now() + timedelta(days=1)
            },
            {
                'title': 'Wedding Collection Deal',
                'client': customers[2] if customers.count() > 2 else customers[0],
                'sales_representative': sales_user,
                'stage': 'qualified',
                'probability': 50,
                'expected_value': Decimal('200000.00'),
                'notes': 'Wedding jewelry collection for bride',
                'next_action': 'Prepare proposal',
                'next_action_date': timezone.now() + timedelta(days=5)
            },
            {
                'title': 'Corporate Gift Order',
                'client': customers[3] if customers.count() > 3 else customers[0],
                'sales_representative': sales_user,
                'stage': 'proposal',
                'probability': 75,
                'expected_value': Decimal('85000.00'),
                'notes': 'Corporate gift order for 50 employees',
                'next_action': 'Finalize pricing',
                'next_action_date': timezone.now() + timedelta(days=2)
            },
            {
                'title': 'VIP Customer Collection',
                'client': customers[4] if customers.count() > 4 else customers[0],
                'sales_representative': sales_user,
                'stage': 'negotiation',
                'probability': 90,
                'expected_value': Decimal('300000.00'),
                'notes': 'VIP customer looking for exclusive collection',
                'next_action': 'Close deal',
                'next_action_date': timezone.now() + timedelta(days=1)
            }
        ]
        
        created_count = 0
        for i, pipeline_data in enumerate(sample_pipelines):
            # Create pipeline with different dates
            days_ago = random.randint(1, 30)
            created_date = timezone.now() - timedelta(days=days_ago)
            
            pipeline = SalesPipeline.objects.create(
                tenant=tenant,
                created_at=created_date,
                updated_at=created_date,
                **pipeline_data
            )
            created_count += 1
            print(f"Created pipeline: {pipeline.title} - {pipeline.stage} - ${pipeline.expected_value}")
        
        print(f"\nTotal pipelines created: {created_count}")
        print(f"Total pipelines in database: {SalesPipeline.objects.filter(tenant=tenant).count()}")
        
        # Print pipeline summary by stage
        for stage in ['lead', 'contacted', 'qualified', 'proposal', 'negotiation', 'closed_won', 'closed_lost']:
            count = SalesPipeline.objects.filter(tenant=tenant, stage=stage).count()
            value = SalesPipeline.objects.filter(
                tenant=tenant, 
                stage=stage
            ).aggregate(total=Decimal('0'))['total'] or Decimal('0')
            print(f"  {stage.capitalize()}: {count} pipelines, ${value}")
        
    except Exception as e:
        print(f"Error adding sample sales pipeline: {e}")
        import traceback
        traceback.print_exc()

if __name__ == '__main__':
    add_sample_sales_pipeline() 