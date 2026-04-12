from rest_framework import serializers
from .models import Client, Subscription

class ClientSerializer(serializers.ModelSerializer):
    subscription = serializers.SerializerMethodField()
    date_debut = serializers.DateField(write_only=True, required=False)
    date_fin = serializers.DateField(write_only=True, required=False)
    
    class Meta:
        model = Client
        fields = ['id', 'matricule', 'quartier', 'nom', 'telephone', 'photo_url', 'statut', 'date_creation', 'date_mise_a_jour', 'subscription', 'date_debut', 'date_fin']
    
    def validate(self, data):
        # La photo n'est plus obligatoire avec URLField
        return data
    
    def get_subscription(self, obj):
        try:
            subscription = obj.subscription
            return {
                'date_debut': subscription.date_debut,
                'date_fin': subscription.date_fin,
                'est_actif': subscription.est_actif,
                'jours_restants': subscription.jours_restants,
                'est_expiré': subscription.est_expiré,
                'échéance_proche': subscription.échéance_proche
            }
        except Subscription.DoesNotExist:
            return None

class SubscriptionSerializer(serializers.ModelSerializer):
    client_nom = serializers.CharField(source='client.nom', read_only=True)
    client_matricule = serializers.CharField(source='client.matricule', read_only=True)
    client_quartier = serializers.CharField(source='client.quartier', read_only=True)
    client_telephone = serializers.CharField(source='client.telephone', read_only=True)
    client_statut = serializers.CharField(source='client.statut', read_only=True)
    jours_restants = serializers.ReadOnlyField()
    est_expiré = serializers.ReadOnlyField()
    échéance_proche = serializers.ReadOnlyField()
    
    class Meta:
        model = Subscription
        fields = ['id', 'client', 'client_nom', 'client_matricule', 'client_quartier', 
                 'client_telephone', 'client_statut', 'date_debut', 'date_fin', 
                 'est_actif', 'jours_restants', 'est_expiré', 'échéance_proche']

class DashboardStatsSerializer(serializers.Serializer):
    total_clients = serializers.IntegerField()
    abonnements_actifs = serializers.IntegerField()
    expirés = serializers.IntegerField()
    échéances_proches = serializers.IntegerField()
