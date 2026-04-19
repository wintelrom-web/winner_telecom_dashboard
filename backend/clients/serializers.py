from rest_framework import serializers
from .models import Client, Subscription

class ClientSerializer(serializers.ModelSerializer):
    subscription = serializers.SerializerMethodField()
    date_debut = serializers.DateField(write_only=True, required=False)
    date_fin = serializers.DateField(write_only=True, required=False)
    prix = serializers.CharField(max_length=50, required=False, allow_blank=True)
    image = serializers.FileField(required=False)  # No Pillow
    
    class Meta:
        model = Client
        fields = [
            'id', 'matricule', 'quartier', 'ville', 'nom', 'telephone',
            'prix', 'statut', 'date_creation', 'date_mise_a_jour',
            'image', 'subscription', 'date_debut', 'date_fin'
        ]
    
    def validate(self, data):
        return data
    
    def create(self, validated_data):
        date_debut = validated_data.pop('date_debut', None)
        date_fin = validated_data.pop('date_fin', None)
        client = Client.objects.create(**validated_data)
        if date_debut and date_fin:
            Subscription.objects.create(
                client=client,
                date_debut=date_debut,
                date_fin=date_fin,
                est_actif=True
            )
        return client
    
    def update(self, instance, validated_data):
        date_debut = validated_data.pop('date_debut', None)
        date_fin = validated_data.pop('date_fin', None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        if date_debut or date_fin:
            subscription, created = Subscription.objects.get_or_create(client=instance)
            if date_debut:
                subscription.date_debut = date_debut
            if date_fin:
                subscription.date_fin = date_fin
            subscription.save()
        return instance
    
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
        fields = [
            'id', 'client', 'client_nom', 'client_matricule', 'client_quartier',
            'client_telephone', 'client_statut', 'date_debut', 'date_fin',
            'est_actif', 'jours_restants', 'est_expiré', 'échéance_proche'
        ]


class DashboardStatsSerializer(serializers.Serializer):
    total_clients = serializers.IntegerField()
    abonnements_actifs = serializers.IntegerField()
    expirés = serializers.IntegerField()
    échéances_proches = serializers.IntegerField()
