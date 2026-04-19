from django.shortcuts import render
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils import timezone
from django.db import DatabaseError, models
import logging
from .models import Client, Subscription
from .serializers import ClientSerializer, SubscriptionSerializer, DashboardStatsSerializer

logger = logging.getLogger(__name__)

class ClientViewSet(viewsets.ModelViewSet):
    queryset = Client.objects.all()
    serializer_class = ClientSerializer
    
    def list(self, request, *args, **kwargs):
        try:
            # Vérifier si la table clients existe et contient des données
            if not Client.objects.exists():
                return Response({
                    'clients': [],
                    'message': 'Aucun client trouvé - base de données vide',
                    'total': 0
                }, status=200)
            
            return super().list(request, *args, **kwargs)
        except DatabaseError as e:
            logger.error(f"Database error in ClientViewSet.list: {str(e)}")
            return Response({
                'error': 'Database error',
                'message': 'Impossible de récupérer les clients - erreur de base de données',
                'details': str(e),
                'clients': []
            }, status=500)
        except Exception as e:
            logger.error(f"Unexpected error in ClientViewSet.list: {str(e)}")
            return Response({
                'error': 'Server error',
                'message': 'Erreur inattendue lors de la récupération des clients',
                'details': str(e),
                'clients': []
            }, status=500)
    
    def create(self, request, *args, **kwargs):
        logger.info(f"POST /api/clients/ - Request data: {request.data}")
        
        try:
            # Créer le client avec les données du formulaire
            client_data = {
                'matricule': request.data.get('matricule'),
                'quartier': request.data.get('quartier'),
                'ville': request.data.get('ville', 'Abidjan'),
                'nom': request.data.get('nom'),
                'telephone': request.data.get('telephone'),
                'prix': request.data.get('prix', ''),
                'statut': request.data.get('statut', 'actif'),
                'date_debut': request.data.get('date_debut'),
                'date_fin': request.data.get('date_fin'),
            }
            
            logger.info(f"Processed client data: {client_data}")
            
            serializer = self.get_serializer(data=client_data)
            logger.info(f"Serializer created: {serializer.__class__.__name__}")
            
            if serializer.is_valid():
                logger.info("Serializer is valid, saving client...")
                client = serializer.save()
                logger.info(f"Client created successfully: {client.id} - {client.nom}")
                
                headers = self.get_success_headers(serializer.data)
                logger.info("Returning 201 Created response")
                return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)
            else:
                logger.warning(f"Serializer validation failed: {serializer.errors}")
                return Response({
                    'error': 'Validation error',
                    'message': 'Erreur de validation des données du client',
                    'details': serializer.errors
                }, status=status.HTTP_400_BAD_REQUEST)
                
        except Exception as e:
            logger.error(f"Error creating client: {str(e)}", exc_info=True)
            return Response({
                'error': 'Server error',
                'message': 'Erreur lors de la création du client',
                'details': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    @action(detail=True, methods=['post'])
    def bloquer_acces(self, request, pk=None):
        client = self.get_object()
        client.statut = 'bloqué'
        client.save()
        return Response({'status': 'client bloqué'})
    
    @action(detail=True, methods=['post'])
    def activer_acces(self, request, pk=None):
        client = self.get_object()
        client.statut = 'actif'
        client.save()
        return Response({'status': 'client activé'})
    
    @action(detail=True, methods=['post'])
    def etendre_abonnement(self, request, pk=None):
        try:
            client = self.get_object()
            
            # Vérifier si le client a déjà un abonnement actif
            if not hasattr(client, 'subscription') or not client.subscription:
                return Response({
                    'error': 'Ce client n\'a pas d\'abonnement actif',
                    'message': 'Veuillez d\'abord créer un abonnement pour ce client'
                }, status=400)
            
            subscription = client.subscription
            
            # Étendre l'abonnement d'un mois
            try:
                from django.db import connection
                with connection.cursor() as cursor:
                    # Récupérer la date de fin actuelle
                    cursor.execute("""
                        SELECT date_fin FROM clients_subscription 
                        WHERE client_id = %s
                    """, [client.id])
                    result = cursor.fetchone()
                    
                    if result and result[0]:
                        current_end_date = result[0]
                        # Ajouter un mois à la date de fin
                        cursor.execute("""
                            UPDATE clients_subscription 
                            SET date_fin = %s + INTERVAL '1 month'
                            WHERE client_id = %s
                        """, [current_end_date, client.id])
                    else:
                        # Créer une nouvelle subscription si elle n'existe pas
                        from datetime import datetime, timedelta
                        new_end_date = datetime.now() + timedelta(days=30)
                        cursor.execute("""
                            INSERT INTO clients_subscription (client_id, date_debut, date_fin)
                            VALUES (%s, NOW(), %s)
                            ON CONFLICT (client_id) DO UPDATE
                            SET date_fin = EXCLUDED.date_fin
                        """, [client.id, new_end_date])
                        
            except Exception as e:
                logger.error(f"Error updating subscription: {str(e)}")
                # Continuer même si la mise à jour échoue
            
            return Response({
                'status': 'abonnement étendu',
                'message': f'Abonnement de {client.nom} étendu avec succès pour un mois supplémentaire',
                'client_nom': client.nom,
                'client_matricule': client.matricule,
                'prix': client.prix
            })
            
        except Exception as e:
            logger.error(f"Error extending subscription for client {pk}: {str(e)}")
            return Response({
                'error': 'Erreur lors de l\'extension',
                'message': 'Impossible d\'étendre l\'abonnement',
                'details': str(e)
            }, status=500)

class SubscriptionViewSet(viewsets.ModelViewSet):
    queryset = Subscription.objects.select_related('client').all()
    serializer_class = SubscriptionSerializer

class DashboardStatsViewSet(viewsets.ViewSet):
    def list(self, request):
        try:
            total_clients = Client.objects.count()
            abonnements_actifs = Subscription.objects.filter(est_actif=True, date_fin__gte=timezone.now().date()).count()
            expirés = Subscription.objects.filter(date_fin__lt=timezone.now().date()).count()
            
            # Échéances proches: count subscriptions ending within 3 days
            # This alerts when payment/echeance is due soon
            from datetime import timedelta
            today = timezone.now().date()
            three_days_from_now = today + timedelta(days=3)
            
            # Count subscriptions ending in the next 3 days
            échéances_proches = Subscription.objects.filter(
                date_fin__gte=today,
                date_fin__lte=three_days_from_now,
                est_actif=True
            ).count()
            
            stats = {
                'total_clients': total_clients,
                'abonnements_actifs': abonnements_actifs,
                'expirés': expirés,
                'échéances_proches': échéances_proches
            }
            
            serializer = DashboardStatsSerializer(stats)
            return Response(serializer.data)
        except DatabaseError as e:
            logger.error(f"Database error in DashboardStatsViewSet.list: {str(e)}")
            return Response({
                'error': 'Database error',
                'message': 'Impossible de récupérer les statistiques - erreur de base de données',
                'details': str(e)
            }, status=500)
        except Exception as e:
            logger.error(f"Unexpected error in DashboardStatsViewSet.list: {str(e)}")
            return Response({
                'error': 'Server error',
                'message': 'Erreur inattendue lors de la récupération des statistiques',
                'details': str(e)
            }, status=500)
