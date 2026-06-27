from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ClientViewSet, SubscriptionViewSet, DashboardStatsViewSet, VilleListView, QuartierListView, PaymentViewSet

router = DefaultRouter()
router.register(r'clients', ClientViewSet)
router.register(r'subscriptions', SubscriptionViewSet)
router.register(r'dashboard-stats', DashboardStatsViewSet, basename='dashboard-stats')
router.register(r'payments', PaymentViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('villes/', VilleListView.as_view(), name='ville-list'),
    path('quartiers/', QuartierListView.as_view(), name='quartier-list'),
]
