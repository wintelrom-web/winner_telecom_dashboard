import os
import sys
import django
from datetime import date, timedelta

# Add the project directory to the Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Set up Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'winner_telecom.settings')
django.setup()

from clients.models import Client, Subscription

def create_sample_data():
    # Create sample clients
    clients_data = [
        {
            'matricule': 'WT-2026-0001',
            'quartier': 'MBOLLO',
            'nom': 'Jean Dupont',
            'telephone': '672345678',
            'statut': 'actif'
        },
        {
            'matricule': 'WT-2026-0002',
            'quartier': 'NKOLO',
            'nom': 'Alice Ngono',
            'telephone': '655567890',
            'statut': 'actif'
        },
        {
            'matricule': 'WT-2026-0003',
            'quartier': 'OKOLO',
            'nom': 'Paul Kamga',
            'telephone': '699123456',
            'statut': 'expiré'
        },
        {
            'matricule': 'WT-2026-0004',
            'quartier': 'MBOLLO',
            'nom': 'Marie Tchamba',
            'telephone': '677234567',
            'statut': 'actif'
        },
        {
            'matricule': 'WT-2026-0005',
            'quartier': 'NKOLO',
            'nom': 'Pierre Mballa',
            'telephone': '688345678',
            'statut': 'actif'
        }
    ]

    created_clients = []
    for client_data in clients_data:
        client, created = Client.objects.get_or_create(
            matricule=client_data['matricule'],
            defaults=client_data
        )
        if created:
            created_clients.append(client)
            print(f"Created client: {client.nom}")
        else:
            created_clients.append(client)
            print(f"Client already exists: {client.nom}")

    # Create subscriptions for clients
    today = date.today()
    
    subscription_data = [
        (created_clients[0], today - timedelta(days=30), today + timedelta(days=30)),  # Active
        (created_clients[1], today - timedelta(days=15), today + timedelta(days=15)),  # Active, due soon
        (created_clients[2], today - timedelta(days=60), today - timedelta(days=10)),  # Expired
        (created_clients[3], today - timedelta(days=20), today + timedelta(days=40)),  # Active
        (created_clients[4], today - timedelta(days=10), today + timedelta(days=5)),   # Active, due very soon
    ]

    for client, start_date, end_date in subscription_data:
        subscription, created = Subscription.objects.get_or_create(
            client=client,
            defaults={
                'date_debut': start_date,
                'date_fin': end_date,
                'est_actif': end_date >= today
            }
        )
        if created:
            print(f"Created subscription for: {client.nom}")
        else:
            print(f"Subscription already exists for: {client.nom}")

    print("\nSample data creation completed!")
    print(f"Total clients: {Client.objects.count()}")
    print(f"Total subscriptions: {Subscription.objects.count()}")

if __name__ == '__main__':
    create_sample_data()
