from django.db import models
from django.utils import timezone

class Client(models.Model):
    STATUS_CHOICES = [
        ('actif', 'Actif'),
        ('expiré', 'Expiré'),
        ('bloqué', 'Bloqué'),
    ]
    
    matricule = models.CharField(max_length=20, unique=True)
    quartier = models.CharField(max_length=100)
    nom = models.CharField(max_length=200)
    telephone = models.CharField(max_length=20)
    photo_url = models.URLField(max_length=500, blank=True, null=True)
    statut = models.CharField(max_length=10, choices=STATUS_CHOICES, default='actif')
    date_creation = models.DateTimeField(auto_now_add=True)
    date_mise_a_jour = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.matricule} - {self.nom}"
    
    class Meta:
        ordering = ['-date_creation']

class Subscription(models.Model):
    client = models.OneToOneField(Client, on_delete=models.CASCADE, related_name='subscription')
    date_debut = models.DateField()
    date_fin = models.DateField()
    est_actif = models.BooleanField(default=True)
    
    def __str__(self):
        return f"Abonnement {self.client.nom}"
    
    @property
    def jours_restants(self):
        if self.date_fin:
            aujourd_hui = timezone.now().date()
            difference = self.date_fin - aujourd_hui
            return difference.days
        return 0
    
    @property
    def est_expiré(self):
        return self.date_fin and self.date_fin < timezone.now().date()
    
    @property
    def échéance_proche(self):
        # Returns True if the expiration date is on the 30th or 31st of any month
        # This alerts when payment/echeance is due at month end
        if self.date_fin:
            return self.date_fin.day in [30, 31]
        return False
