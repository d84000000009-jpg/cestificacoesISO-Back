from django.urls import path
from rest_framework.routers import DefaultRouter

from .views import (
    ChangeLogView,
    ChangePasswordView,
    CsrfView,
    LoginHistoryView,
    LoginView,
    LogoutView,
    MeView,
    UserViewSet,
)

router = DefaultRouter()
router.register('users', UserViewSet, basename='accounts-users')

urlpatterns = [
    path('csrf/', CsrfView.as_view(), name='accounts-csrf'),
    path('login/', LoginView.as_view(), name='accounts-login'),
    path('logout/', LogoutView.as_view(), name='accounts-logout'),
    path('me/', MeView.as_view(), name='accounts-me'),
    path('change-password/', ChangePasswordView.as_view(), name='accounts-change-password'),
    path('login-history/', LoginHistoryView.as_view(), name='accounts-login-history'),
    path('change-log/', ChangeLogView.as_view(), name='accounts-change-log'),
] + router.urls
