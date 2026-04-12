from django.shortcuts import render
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils import timezone
from django.db import DatabaseError, models
import logging
from .models import Client, Subscription, Payment
from .serializers import ClientSerializer, SubscriptionSerializer, DashboardStatsSerializer, PaymentSerializer

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
                'nom': request.data.get('nom'),
                'telephone': request.data.get('telephone'),
                'photo_url': request.data.get('photo_url', ''),
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
                
                # Créer l'abonnement si les dates sont fournies
                if client_data.get('date_debut') and client_data.get('date_fin'):
                    try:
                        logger.info(f"Creating subscription for client {client.id}")
                        Subscription.objects.create(
                            client=client,
                            date_debut=client_data['date_debut'],
                            date_fin=client_data['date_fin'],
                            est_actif=True
                        )
                        logger.info("Subscription created successfully")
                    except Exception as e:
                        logger.error(f"Error creating subscription: {str(e)}")
                
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
    def payer(self, request, pk=None):
        try:
            client = self.get_object()
            
            # Récupérer ou créer l'abonnement
            subscription, created = Subscription.objects.get_or_create(
                client=client,
                defaults={
                    'date_debut': timezone.now().date(),
                    'date_fin': timezone.now().date(),
                    'est_actif': True
                }
            )
            
            # Étendre l'abonnement d'un mois à partir de la date de fin actuelle
            from datetime import timedelta
            if subscription.date_fin:
                nouvelle_date_fin = subscription.date_fin + timedelta(days=30)
            else:
                nouvelle_date_fin = timezone.now().date() + timedelta(days=30)
            
            subscription.date_fin = nouvelle_date_fin
            subscription.est_actif = True
            subscription.save()
            
            # Mettre à jour le statut du client
            client.statut = 'actif'
            client.save()
            
            # Créer un enregistrement de paiement
            from .models import Payment
            from .serializers import PaymentSerializer
            
            # Extraire le montant du prix du client
            amount_map = {
                '1Mo 5000F': 5000,
                'Access 10000F': 10000,
                'Premium 15000F': 15000,
                'VIP 20000F': 20000
            }
            
            amount = amount_map.get(client.prix, 5000)  # Default 5000F
            
            # Déterminer le type d'abonnement
            type_map = {
                '1Mo 5000F': '1Mo',
                'Access 10000F': 'Access',
                'Premium 15000F': 'Premium',
                'VIP 20000F': 'VIP'
            }
            
            payment_type = type_map.get(client.prix, '1Mo')
            
            # Créer le paiement
            payment = Payment.objects.create(
                client=client,
                username=client.nom,
                amount=amount,
                type=payment_type,
                month=timezone.now().month,
                year=timezone.now().year,
                day=timezone.now().day
            )
            
            payment_serializer = PaymentSerializer(payment)
            
            return Response({
                'status': 'paiement effectué',
                'message': f'Abonnement étendu jusqu\'au {nouvelle_date_fin.strftime("%d/%m/%Y")}',
                'nouvelle_date_fin': nouvelle_date_fin,
                'client_nom': client.nom,
                'client_matricule': client.matricule,
                'payment': payment_serializer.data
            })
            
        except Exception as e:
            logger.error(f"Error processing payment for client {pk}: {str(e)}")
            return Response({
                'error': 'Erreur lors du paiement',
                'message': 'Impossible de traiter le paiement',
                'details': str(e)
            }, status=500)

class SubscriptionViewSet(viewsets.ModelViewSet):
    queryset = Subscription.objects.select_related('client').all()
    serializer_class = SubscriptionSerializer

class PaymentViewSet(viewsets.ModelViewSet):
    queryset = Payment.objects.all()
    serializer_class = PaymentSerializer
    filterset_fields = ['month', 'year', 'type', 'client']
    
    def get_queryset(self):
        try:
            queryset = Payment.objects.select_related('client').all().order_by('-payment_date')
            month = self.request.query_params.get('month')
            year = self.request.query_params.get('year')
            
            if month:
                queryset = queryset.filter(month=month)
            if year:
                queryset = queryset.filter(year=year)
                
            return queryset
        except Exception as e:
            logger.error(f"Error in PaymentViewSet.get_queryset: {str(e)}")
            # Return empty queryset if there's an error
            return Payment.objects.none()
    
    def list(self, request, *args, **kwargs):
        try:
            return super().list(request, *args, **kwargs)
        except Exception as e:
            logger.error(f"Error in PaymentViewSet.list: {str(e)}")
            # Return empty list if there's an error
            return Response([], status=200)

class DashboardStatsViewSet(viewsets.ViewSet):
    def list(self, request):
        try:
            total_clients = Client.objects.count()
            abonnements_actifs = Subscription.objects.filter(est_actif=True, date_fin__gte=timezone.now().date()).count()
            expirés = Subscription.objects.filter(date_fin__lt=timezone.now().date()).count()
            
            # Échéances proches: count subscriptions ending on the 30th or 31st of any month
            # This alerts when payment/echeance is due at month end
            today = timezone.now().date()
            current_month = today.month
            current_year = today.year
            
            # Count subscriptions ending this month on 30th or 31st
            échéances_proches = Subscription.objects.filter(
                date_fin__year=current_year,
                date_fin__month=current_month,
                date_fin__day__in=[30, 31],
                est_actif=True
            ).count()
            
            # Calculer le total des paiements avec gestion d'erreur
            try:
                total_versements = Payment.objects.aggregate(
                    total=models.Sum('amount')
                )['total'] or 0
            except Exception as e:
                # Si la colonne amount n'existe pas, retourner 0
                logger.error(f"Error calculating total_versements: {str(e)}")
                total_versements = 0
            
            stats = {
                'total_clients': total_clients,
                'abonnements_actifs': abonnements_actifs,
                'expirés': expirés,
                'échéances_proches': échéances_proches,
                'total_versements': total_versements
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
