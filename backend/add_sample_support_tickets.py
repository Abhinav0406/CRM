#!/usr/bin/env python
"""
Script to add sample support tickets for testing.
Run this script to populate the database with sample support tickets.
"""

import os
import sys
import django
from django.utils import timezone
from datetime import timedelta

# Add the project directory to the Python path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Set up Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from apps.support.models import SupportTicket
from apps.users.models import User
from apps.tenants.models import Tenant

def create_sample_support_tickets():
    """Create sample support tickets for testing."""
    
    # Get or create a tenant
    tenant, created = Tenant.objects.get_or_create(
        name="Sample Jewelry Store",
        slug="sample-jewelry-store",
        defaults={
            'business_type': 'jewelry',
            'industry': 'retail',
            'description': 'Sample jewelry store for testing',
            'email': 'admin@samplejewelry.com',
            'phone': '+91-9876543210',
            'address': '123 Main St, Sample City, Sample State',
            'website': 'https://samplejewelry.com',
            'subscription_plan': 'professional',
            'subscription_status': 'active',
            'is_active': True,
            'max_users': 10,
            'max_storage_gb': 20
        }
    )
    
    # Get or create a user
    user, created = User.objects.get_or_create(
        username='business_admin',
        defaults={
            'email': 'admin@sample.com',
            'first_name': 'Business',
            'last_name': 'Admin',
            'role': 'business_admin',
            'tenant': tenant,
            'is_active': True,
            'is_staff': True,
            'is_superuser': True
        }
    )
    
    # Sample support tickets
    sample_tickets = [
        {
            'ticket_id': 'TICKET-001',
            'title': 'Login Issue',
            'summary': 'Unable to login to the system. Getting authentication error.',
            'category': 'technical',
            'priority': 'high',
            'status': 'open',
            'created_by': user,
            'tenant': tenant,
            'is_urgent': True,
            'requires_callback': False,
        },
        {
            'ticket_id': 'TICKET-002',
            'title': 'Feature Request - Bulk Import',
            'summary': 'Need ability to bulk import customer data from Excel files.',
            'category': 'feature_request',
            'priority': 'medium',
            'status': 'in_progress',
            'created_by': user,
            'tenant': tenant,
            'is_urgent': False,
            'requires_callback': True,
            'callback_phone': '+91-9876543210',
            'callback_preferred_time': 'Morning (9 AM - 12 PM)',
        },
        {
            'ticket_id': 'TICKET-003',
            'title': 'Payment Integration Issue',
            'summary': 'Payment gateway integration is not working properly.',
            'category': 'integration',
            'priority': 'critical',
            'status': 'open',
            'created_by': user,
            'tenant': tenant,
            'is_urgent': True,
            'requires_callback': True,
            'callback_phone': '+91-9876543211',
            'callback_preferred_time': 'Afternoon (2 PM - 5 PM)',
        },
        {
            'ticket_id': 'TICKET-004',
            'title': 'Billing Question',
            'summary': 'Need clarification on monthly subscription charges.',
            'category': 'billing',
            'priority': 'low',
            'status': 'resolved',
            'created_by': user,
            'tenant': tenant,
            'is_urgent': False,
            'requires_callback': False,
        },
        {
            'ticket_id': 'TICKET-005',
            'title': 'Bug Report - Dashboard Loading',
            'summary': 'Dashboard takes too long to load and sometimes shows blank screen.',
            'category': 'bug_report',
            'priority': 'high',
            'status': 'in_progress',
            'created_by': user,
            'tenant': tenant,
            'is_urgent': False,
            'requires_callback': False,
        },
    ]
    
    created_count = 0
    for ticket_data in sample_tickets:
        ticket, created = SupportTicket.objects.get_or_create(
            ticket_id=ticket_data['ticket_id'],
            defaults=ticket_data
        )
        if created:
            created_count += 1
            print(f"Created ticket: {ticket.ticket_id} - {ticket.title}")
        else:
            print(f"Ticket already exists: {ticket.ticket_id}")
    
    print(f"\nTotal tickets created: {created_count}")
    print(f"Total tickets in database: {SupportTicket.objects.count()}")

if __name__ == '__main__':
    print("Creating sample support tickets...")
    create_sample_support_tickets()
    print("Done!") 