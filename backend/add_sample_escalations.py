#!/usr/bin/env python
import os
import sys
import django
from django.utils import timezone
from datetime import timedelta

sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from apps.escalation.models import Escalation, EscalationNote
from apps.tenants.models import Tenant
from apps.users.models import User
from apps.clients.models import Client
from apps.stores.models import Store

def add_sample_escalations():
    print("=== Adding Sample Escalations ===")
    
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
        
        # Get or create users
        user1, created = User.objects.get_or_create(
            username='sales1',
            defaults={
                'first_name': 'John',
                'last_name': 'Sales',
                'email': 'john@sample-store.com',
                'role': 'sales',
                'tenant': tenant,
                'store': store
            }
        )
        
        user2, created = User.objects.get_or_create(
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
        
        print(f"✅ Users: {user1.first_name} {user1.last_name}, {user2.first_name} {user2.last_name}")
        
        # Get or create clients
        client1, created = Client.objects.get_or_create(
            email='client1@example.com',
            defaults={
                'first_name': 'Alice',
                'last_name': 'Johnson',
                'phone': '+1234567891',
                'tenant': tenant,
                'assigned_to': user1
            }
        )
        
        client2, created = Client.objects.get_or_create(
            email='client2@example.com',
            defaults={
                'first_name': 'Bob',
                'last_name': 'Smith',
                'phone': '+1234567892',
                'tenant': tenant,
                'assigned_to': user1
            }
        )
        
        client3, created = Client.objects.get_or_create(
            email='client3@example.com',
            defaults={
                'first_name': 'Carol',
                'last_name': 'Davis',
                'phone': '+1234567893',
                'tenant': tenant,
                'assigned_to': user2
            }
        )
        
        print(f"✅ Clients: {client1.first_name} {client1.last_name}, {client2.first_name} {client2.last_name}, {client3.first_name} {client3.last_name}")
        
        # Clear existing escalations
        Escalation.objects.filter(tenant=tenant).delete()
        print("🗑️ Cleared existing escalations")
        
        # Create sample escalations
        escalations_data = [
            {
                'title': 'Product Quality Issue',
                'description': 'Customer reported that the gold ring they purchased has started tarnishing after only 2 weeks of wear. They are very disappointed and want a replacement or refund.',
                'category': 'product_issue',
                'priority': 'high',
                'status': 'open',
                'client': client1,
                'created_by': user1,
                'sla_hours': 48
            },
            {
                'title': 'Delivery Delay Complaint',
                'description': 'Customer ordered a necklace for their anniversary but it was delivered 3 days late. They missed their anniversary celebration and are very upset.',
                'category': 'delivery',
                'priority': 'urgent',
                'status': 'in_progress',
                'client': client2,
                'created_by': user1,
                'assigned_to': user2,
                'sla_hours': 24
            },
            {
                'title': 'Billing Dispute',
                'description': 'Customer claims they were charged twice for the same order. They have proof of both charges and want the duplicate charge refunded immediately.',
                'category': 'billing',
                'priority': 'urgent',
                'status': 'open',
                'client': client3,
                'created_by': user2,
                'sla_hours': 12
            },
            {
                'title': 'Service Quality Feedback',
                'description': 'Customer was not satisfied with the in-store service. They felt ignored by staff and want to speak to a manager about the experience.',
                'category': 'service_quality',
                'priority': 'medium',
                'status': 'pending_customer',
                'client': client1,
                'created_by': user1,
                'sla_hours': 72
            },
            {
                'title': 'Refund Request',
                'description': 'Customer wants to return a bracelet that was purchased as a gift. The recipient already has a similar piece and they would like a full refund.',
                'category': 'refund',
                'priority': 'medium',
                'status': 'resolved',
                'client': client2,
                'created_by': user1,
                'assigned_to': user2,
                'sla_hours': 48
            },
            {
                'title': 'Technical Website Issue',
                'description': 'Customer cannot complete their online order due to a website error. They have been trying for 2 hours and are frustrated.',
                'category': 'technical',
                'priority': 'high',
                'status': 'open',
                'client': client3,
                'created_by': user2,
                'sla_hours': 6
            }
        ]
        
        created_escalations = []
        for i, data in enumerate(escalations_data, 1):
            # Adjust due dates for some escalations to be overdue
            if i == 1:  # Make first escalation overdue
                due_date = timezone.now() - timedelta(hours=12)
            elif i == 2:  # Make second escalation due soon
                due_date = timezone.now() + timedelta(hours=2)
            else:
                due_date = timezone.now() + timedelta(hours=data['sla_hours'])
            
            escalation = Escalation.objects.create(
                title=data['title'],
                description=data['description'],
                category=data['category'],
                priority=data['priority'],
                status=data['status'],
                client=data['client'],
                created_by=data['created_by'],
                assigned_to=data.get('assigned_to'),
                tenant=tenant,
                sla_hours=data['sla_hours'],
                due_date=due_date
            )
            created_escalations.append(escalation)
            print(f"✅ Created escalation: {escalation.title}")
        
        # Add some notes to escalations
        notes_data = [
            {
                'escalation': created_escalations[0],
                'author': user1,
                'content': 'Contacted customer to understand the issue better. They mentioned the ring was exposed to lotion which might have caused the tarnishing.',
                'is_internal': False
            },
            {
                'escalation': created_escalations[0],
                'author': user2,
                'content': 'Internal note: Check if this is a manufacturing defect or user care issue. May need to review our care instructions.',
                'is_internal': True
            },
            {
                'escalation': created_escalations[1],
                'author': user2,
                'content': 'Spoke with delivery partner. There was a delay due to weather conditions. Offered customer a 20% discount on their next purchase.',
                'is_internal': False
            },
            {
                'escalation': created_escalations[2],
                'author': user2,
                'content': 'Verified duplicate charge with payment processor. Processing refund immediately.',
                'is_internal': False
            }
        ]
        
        for note_data in notes_data:
            EscalationNote.objects.create(**note_data)
            print(f"✅ Added note to escalation: {note_data['escalation'].title}")
        
        print(f"\n🎉 Successfully created {len(created_escalations)} sample escalations with notes!")
        print(f"📊 Escalation breakdown:")
        print(f"   - Open: {Escalation.objects.filter(status='open').count()}")
        print(f"   - In Progress: {Escalation.objects.filter(status='in_progress').count()}")
        print(f"   - Resolved: {Escalation.objects.filter(status='resolved').count()}")
        print(f"   - Overdue: {Escalation.objects.filter(is_overdue=True).count()}")
        
    except Exception as e:
        print(f"❌ Error adding sample escalations: {e}")
        import traceback
        traceback.print_exc()

if __name__ == '__main__':
    add_sample_escalations() 