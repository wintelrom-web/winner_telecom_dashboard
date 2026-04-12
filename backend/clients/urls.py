from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ClientViewSet, SubscriptionViewSet, DashboardStatsViewSet, PaymentViewSet

router = DefaultRouter()
router.register(r'clients', ClientViewSet)
router.register(r'subscriptions', SubscriptionViewSet)
router.register(r'payments', PaymentViewSet)
router.register(r'dashboard-stats', DashboardStatsViewSet, basename='dashboard-stats')

urlpatterns = [
    path('', include(router.urls)),
]
