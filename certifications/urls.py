# from rest_framework import routers
# from .views import CertificationViewSet

# router = routers.DefaultRouter()
# router.register(r'', CertificationViewSet)

# urlpatterns = router.urls



from rest_framework import routers
from django.urls import path
from .views import CertificationViewSet, certification_public_view

router = routers.DefaultRouter()
router.register(r'', CertificationViewSet)

urlpatterns = [
    path('link/<str:unique_link>/', CertificationViewSet.as_view({'get': 'get_by_link'}), name='certification-by-link'),
    path('view/<str:unique_link>/', certification_public_view, name='certification-public-view'),
] + router.urls