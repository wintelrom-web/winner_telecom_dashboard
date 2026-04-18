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
    ville = models.CharField(max_length=100, default='Abidjan')
    nom = models.CharField(max_length=200)
    telephone = models.CharField(max_length=20)
    prix = models.CharField(max_length=50)
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
        # Returns True if we are within 3 days of the expiration date
        # This alerts when payment/echeance is due soon
        if self.date_fin:
            # Convertir string en date si nécessaire
            if isinstance(self.date_fin, str):
                from datetime import datetime
                date_fin_obj = datetime.strptime(self.date_fin, "%Y-%m-%d").date()
            else:
                date_fin_obj = self.date_fin
            
            from datetime import timedelta
            aujourd_hui = timezone.now().date()
            jours_restants = (date_fin_obj - aujourd_hui).days
            
            return 0 <= jours_restants <= 3
        return False
