from django.shortcuts import render
from rest_framework import viewsets, status, generics
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.pagination import PageNumberPagination
from django.utils import timezone
from django.db import DatabaseError, models
import logging
from .models import Client, Subscription, Payment
from .serializers import ClientSerializer, SubscriptionSerializer, DashboardStatsSerializer, PaymentSerializer

VILLES_CAMEROUN = [
    'Yaoundé',  # Centre
    'Douala',   # Littoral
    'Bafoussam',  # West
    'Garoua',  # North
    'Maroua',  # Far North
    'Bamenda',  # Northwest
    'Buea',     # Southwest
    'Bertoua',  # East
    'Ebolowa',  # South
    'Ngaoundéré',  # Adamawa
]

QUARTIERS_CAMEROUN = {
    'Yaoundé': ['Centre Administrative', 'Bastos', 'Ngoussou', 'Mvog-Ada', 'Elig-Mfomo', 'Ekoudou', 'Etoug-Ebe', 'Mokolo', 'Nkol-Eton', 'Nkol-Afamba'],
    'Douala': ['Douala 1er', 'Douala 2e', 'Douala 3e', 'Douala 4e', 'Douala 5e', 'Bonaberi', 'Nkongsamba', 'Kotto', 'New Bell', 'Bonapriso', 'Japoma', 'Mouelle'],
    'Bafoussam': ['Bafoussam 1er', 'Bafoussam 2e', 'Bafoussam 3e', 'Tchecoua', 'Foumbot', 'Foumban', 'Bandjoun', 'Soumtcha', 'Bangante', 'Magba'],
    'Garoua': ['Garoua 1er', 'Garoua 2e', 'Garoua 3e', 'Maga', 'Tchamba', 'Touboro', 'Tchanaga', 'Poli'],
    'Maroua': ['Maroua 1er', 'Maroua 2e', 'Maroua 3e', 'Tokombéri', 'Mokolo', 'Kalerah', 'Bouda'],
    'Bamenda': ['Bamenda 1er', 'Bamenda 2e', 'Bamenda 3e', 'Bamenda 4e', 'Bambui', 'Wum', 'Kumbo', 'Oku', 'Njinike'],
    'Buea': ['Buea 1er', 'Buea 2e', 'Buea 3e', 'Tiko', 'Muyuka', 'Kumba', 'Mamfe', 'Widikum'],
    'Bertoua': ['Bertoua 1er', 'Bertoua 2e', 'Betare-Oya', 'Garoua-Boulaï', 'Lomie', 'Somalomo', 'Mandjou'],
    'Ebolowa': ['Ebolowa 1er', 'Ebolowa 2e', 'Meyomessala', 'Ntui', 'Mfou', 'Bikok', 'Djoum'],
    'Ngaoundéré': ['Ngaoundéré 1er', 'Ngaoundéré 2e', 'Ngaoundal', 'Tcholliré', 'Moutoun', 'Baboua'],
}

logger = logging.getLogger(__name__)

def _parse_prix(prix_str):
    if not prix_str:
        return '1Mo', 0
    amount = 0
    payment_type = '1Mo'
    try:
        import re
        match = re.search(r'(\d+)', str(prix_str))
        if match:
            amount = float(match.group(1))
    except (ValueError, TypeError):
        amount = 0
    if 'VIP' in str(prix_str):
        payment_type = 'VIP'
    elif 'Premium' in str(prix_str):
        payment_type = 'Premium'
    elif 'Access' in str(prix_str):
        payment_type = 'Access'
    return payment_type, amount

def _create_payment(client, today=None):
    if today is None:
        today = timezone.now().date()
    payment_type, amount = _parse_prix(client.prix)
    if amount > 0:
        Payment.objects.create(
            client=client,
            username=client.nom,
            amount=amount,
            type=payment_type,
            month=today.month,
            year=today.year,
            day=today.day
        )

class ClientViewSet(viewsets.ModelViewSet):
    queryset = Client.objects.all()
    serializer_class = ClientSerializer
    
    def list(self, request, *args, **kwargs):
        try:
            if not Client.objects.exists():
                return Response({
                    'clients': [],
                    'message': 'Aucun client trouvé - base de données vide',
                    'total': 0
                }, status=200)
            
            queryset = Client.objects.all()
            ville = request.query_params.get('ville')
            if ville:
                queryset = queryset.filter(ville__iexact=ville)
            
            statut = request.query_params.get('statut')
            if statut == 'actif':
                queryset = queryset.filter(subscription__est_actif=True, subscription__date_fin__gte=timezone.now().date())
            elif statut == 'expiré':
                queryset = queryset.filter(subscription__date_fin__lt=timezone.now().date())
            elif statut == 'échéance':
                from datetime import timedelta
                today = timezone.now().date()
                trois_jours = today + timedelta(days=3)
                queryset = queryset.filter(
                    subscription__est_actif=True,
                    subscription__date_fin__gte=today,
                    subscription__date_fin__lt=trois_jours
                )
            
            serializer = self.get_serializer(queryset, many=True)
            return Response({
                'clients': serializer.data,
                'total': queryset.count()
            })
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
            client_data = {
                'matricule': request.data.get('matricule'),
                'quartier': request.data.get('quartier'),
                'nom': request.data.get('nom'),
                'telephone': request.data.get('telephone'),
                'prix': request.data.get('prix', ''),
                'ville': request.data.get('ville', ''),
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
                _create_payment(client)
                
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
    def etendre_abonnement(self, request, pk=None):
        from datetime import timedelta
        try:
            client = self.get_object()
            
            today = timezone.now().date()
            
            if not hasattr(client, 'subscription') or not client.subscription:
                subscription = Subscription.objects.create(
                    client=client,
                    date_debut=today,
                    date_fin=today + timedelta(days=30),
                    est_actif=True
                )
                client.save()
                
                _create_payment(client)
                
                return Response({
                    'status': 'abonnement créé',
                    'message': f'Abonnement de {client.nom} créé pour un mois',
                    'client_nom': client.nom,
                    'client_matricule': client.matricule,
                    'prix': client.prix,
                    'date_debut': subscription.date_debut,
                    'date_fin': subscription.date_fin,
                    'jours_restants': subscription.jours_restants
                })
            
            subscription = client.subscription
            
            current_date_debut = subscription.date_debut
            current_date_fin = subscription.date_fin
            
            new_date_debut = current_date_fin + timedelta(days=1)
            new_date_fin = current_date_fin + timedelta(days=31)
            
            subscription.date_debut = new_date_debut
            subscription.date_fin = new_date_fin
            subscription.est_actif = True
            client.save()
            subscription.save()
            _create_payment(client)
            
            return Response({
                'status': 'abonnement étendu',
                'message': f'Abonnement de {client.nom} étendu pour un mois supplémentaire',
                'client_nom': client.nom,
                'client_matricule': client.matricule,
                'prix': client.prix,
                'date_debut': subscription.date_debut,
                'date_fin': subscription.date_fin,
                'jours_restants': subscription.jours_restants
            })
            
        except Exception as e:
            logger.error(f"Error extending subscription for client {pk}: {str(e)}", exc_info=True)
            return Response({
                'error': 'Erreur lors de l\'extension',
                'message': 'Impossible d\'étendre l\'abonnement',
                'details': str(e)
            }, status=500)

class SubscriptionViewSet(viewsets.ModelViewSet):
    queryset = Subscription.objects.select_related('client').all()
    serializer_class = SubscriptionSerializer

class VilleListView(generics.ListAPIView):
    def get(self, request, *args, **kwargs):
        return Response({'villes': VILLES_CAMEROUN})

class QuartierListView(generics.ListAPIView):
    def get(self, request, *args, **kwargs):
        ville = request.query_params.get('ville')
        if ville and ville in QUARTIERS_CAMEROUN:
            return Response({'quartiers': QUARTIERS_CAMEROUN[ville]})
        return Response({'quartiers': []})

class DashboardStatsViewSet(viewsets.ViewSet):
    def list(self, request):
        try:
            total_clients = Client.objects.count()
            abonnements_actifs = Subscription.objects.filter(est_actif=True, date_fin__gte=timezone.now().date()).count()
            expirer = Subscription.objects.filter(date_fin__lt=timezone.now().date()).count()
            
            # Échéances proches: count subscriptions ending within 3 days
            from datetime import timedelta
            today = timezone.now().date()
            trois_jours = today + timedelta(days=3)
            
            # Count subscriptions ending strictly before 3 days from now
            échéances_proches = Subscription.objects.filter(
                date_fin__gte=today,
                date_fin__lt=trois_jours,
                est_actif=True
            ).count()
            
            stats = {
                'total_clients': total_clients,
                'abonnements_actifs': abonnements_actifs,
                'expirer': expirer,
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


class NoPagination(PageNumberPagination):
    page_size = None

class PaymentViewSet(viewsets.ModelViewSet):
    queryset = Payment.objects.select_related('client').all()
    serializer_class = PaymentSerializer
    pagination_class = NoPagination
    
    def get_queryset(self):
        queryset = super().get_queryset()
        month = self.request.query_params.get('month')
        year = self.request.query_params.get('year')
        ville = self.request.query_params.get('ville')
        quartier = self.request.query_params.get('quartier')
        
        if month:
            queryset = queryset.filter(month=month)
        if year:
            queryset = queryset.filter(year=year)
        if ville:
            queryset = queryset.filter(client__ville__iexact=ville)
        if quartier:
            queryset = queryset.filter(client__quartier__iexact=quartier)
        
        return queryset
