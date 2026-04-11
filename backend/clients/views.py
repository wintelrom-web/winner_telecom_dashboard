from django.shortcuts import render
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils import timezone
from .models import Client, Subscription
from .serializers import ClientSerializer, SubscriptionSerializer, DashboardStatsSerializer

class ClientViewSet(viewsets.ModelViewSet):
    queryset = Client.objects.all()
    serializer_class = ClientSerializer
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        client = serializer.save()
        
        # Create subscription if echeance is provided
        echeance = request.data.get('echeance')
        if echeance:
            from datetime import datetime
            try:
                date_fin = datetime.strptime(echeance, '%Y-%m-%d').date()
                Subscription.objects.create(
                    client=client,
                    date_debut=timezone.now().date(),
                    date_fin=date_fin,
                    est_actif=True
                )
            except ValueError:
                pass  # Invalid date format, skip subscription creation
        
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)
    
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

class SubscriptionViewSet(viewsets.ModelViewSet):
    queryset = Subscription.objects.select_related('client').all()
    serializer_class = SubscriptionSerializer

class DashboardStatsViewSet(viewsets.ViewSet):
    def list(self, request):
        total_clients = Client.objects.count()
        abonnements_actifs = Subscription.objects.filter(est_actif=True, date_fin__gte=timezone.now().date()).count()
        expirés = Subscription.objects.filter(date_fin__lt=timezone.now().date()).count()
        
        # Échéances proches: count subscriptions ending on the 30th or 31st of any month
        # This alerts when payment/echeance is due at month end
        today = timezone.now().date()
        échéances_proches = Subscription.objects.filter(
            date_fin__gt=today,
            date_fin__day__in=[30, 31]
        ).count()
        
        stats = {
            'total_clients': total_clients,
            'abonnements_actifs': abonnements_actifs,
            'expirés': expirés,
            'échéances_proches': échéances_proches
        }
        
        serializer = DashboardStatsSerializer(stats)
        return Response(serializer.data)
