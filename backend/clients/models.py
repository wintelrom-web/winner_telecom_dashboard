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
    photo = models.ImageField(upload_to='client_photos/', blank=True, null=True)
    prix = models.CharField(max_length=50, default='1Mo 5000F')
    statut = models.CharField(max_length=10, choices=STATUS_CHOICES, default='actif')
    date_creation = models.DateTimeField(auto_now_add=True)
    date_mise_a_jour = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.matricule} - {self.nom}"
    
    @property
    def photo_url(self):
        """Retourne l'URL de la photo pour le frontend"""
        if self.photo:
            return self.photo.url
        return None
    
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
            # Convertir string en date si nécessaire
            if isinstance(self.date_fin, str):
                from datetime import datetime
                self.date_fin = datetime.strptime(self.date_fin, "%Y-%m-%d").date()
            difference = self.date_fin - aujourd_hui
            return difference.days
        return 0
    
    @property
    def est_expiré(self):
        if self.date_fin:
            # Convertir string en date si nécessaire
            if isinstance(self.date_fin, str):
                from datetime import datetime
                date_fin_obj = datetime.strptime(self.date_fin, "%Y-%m-%d").date()
            else:
                date_fin_obj = self.date_fin
            return date_fin_obj < timezone.now().date()
        return False
    
    @property
    def échéance_proche(self):
        # Returns True if the expiration date is on the 30th or 31st of any month
        # This alerts when payment/echeance is due at month end
        if self.date_fin:
            # Convertir string en date si nécessaire
            if isinstance(self.date_fin, str):
                from datetime import datetime
                date_fin_obj = datetime.strptime(self.date_fin, "%Y-%m-%d").date()
            else:
                date_fin_obj = self.date_fin
            return date_fin_obj.day in [30, 31]
        return False
