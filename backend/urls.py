from django.contrib import admin
from django.urls import path, include, re_path
from django.conf import settings
from django.views.static import serve
from django.http import JsonResponse
import logging

logger = logging.getLogger(__name__)

# Função de health check
def health_check(request):
    """Endpoint de health check para monitoramento"""
    return JsonResponse({
        "status": "ok",
        "service": "CPTec Academy Backend",
        "debug": settings.DEBUG
    })

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/submissions/', include('submissions.urls')),
    path('api/certifications/', include('certifications.urls')),
    path('api/accounts/', include('accounts.urls')),
    path('health/', health_check, name='health-check'),
    path('', health_check),  # rota raiz
]

# Servir arquivos de mídia (somente em desenvolvimento)
urlpatterns += [
    re_path(r'^media/(?P<path>.*)$', serve, {'document_root': settings.MEDIA_ROOT}),
]


# Configurações do admin
admin.site.site_header = settings.ADMIN_SITE_HEADER
admin.site.site_title = settings.ADMIN_SITE_TITLE
admin.site.index_title = settings.ADMIN_INDEX_TITLE
