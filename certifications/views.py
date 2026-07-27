from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from django.contrib.admin.models import ADDITION, CHANGE, DELETION, LogEntry
from django.contrib.contenttypes.models import ContentType
from django.db.models import Q
from django.core.exceptions import ValidationError
from django.shortcuts import render, get_object_or_404
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
import logging

from .models import Certification
from .serializers import CertificationSerializer

logger = logging.getLogger(__name__)

# Ações de consulta pública para verificação de certificados (usadas pelo site,
# sem login); a listagem/CRUD administrativo exige autenticação.
PUBLIC_ACTIONS = {'get_by_link', 'get_by_codigo'}


class CertificationViewSet(viewsets.ModelViewSet):
    queryset = Certification.objects.select_related().prefetch_related('modulos')
    serializer_class = CertificationSerializer
    filterset_fields = ['status', 'curso', 'ano']
    search_fields = ['nome_completo', 'documento', 'codigo', 'curso']
    ordering_fields = ['data_conclusao', 'created_at', 'nome_completo']
    ordering = ['-created_at']

    def get_permissions(self):
        if self.action in PUBLIC_ACTIONS:
            return [AllowAny()]
        return [IsAuthenticated()]

    def _log_action(self, instance, action_flag, message=''):
        LogEntry.objects.log_action(
            user_id=self.request.user.pk,
            content_type_id=ContentType.objects.get_for_model(Certification).pk,
            object_id=instance.pk,
            object_repr=str(instance),
            action_flag=action_flag,
            change_message=message,
        )

    def perform_create(self, serializer):
        instance = serializer.save()
        self._log_action(instance, ADDITION, 'Criada via painel admin')

    def perform_update(self, serializer):
        instance = serializer.save()
        self._log_action(instance, CHANGE, 'Atualizada via painel admin')

    def perform_destroy(self, instance):
        self._log_action(instance, DELETION, 'Removida via painel admin')
        instance.delete()

    def get_queryset(self):
        """Otimiza queries com filtros adicionais"""
        queryset = super().get_queryset()
        
        # Filtro por nome
        nome = self.request.query_params.get('nome', None)
        if nome:
            queryset = queryset.filter(nome_completo__icontains=nome)
        
        # Filtro por documento
        documento = self.request.query_params.get('documento', None)
        if documento:
            queryset = queryset.filter(documento__iexact=documento)
            
        return queryset

    def create(self, request, *args, **kwargs):
        """Cria certificação com tratamento de erros melhorado"""
        try:
            return super().create(request, *args, **kwargs)
        except ValidationError as e:
            logger.error(f"Erro de validação ao criar certificação: {str(e)}")
            return Response(
                {"error": "Dados inválidos", "details": str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            logger.error(f"Erro ao criar certificação: {str(e)}")
            return Response(
                {"error": "Erro ao criar certificação"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def update(self, request, *args, **kwargs):
        """Atualiza certificação com tratamento de erros"""
        try:
            return super().update(request, *args, **kwargs)
        except ValidationError as e:
            logger.error(f"Erro de validação ao atualizar certificação: {str(e)}")
            return Response(
                {"error": "Dados inválidos", "details": str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            logger.error(f"Erro ao atualizar certificação: {str(e)}")
            return Response(
                {"error": "Erro ao atualizar certificação"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=False, methods=['get'], url_path='link/(?P<unique_link>[^/.]+)')
    def get_by_link(self, request, unique_link=None):
        """Busca certificação por link único"""
        try:
            certification = Certification.objects.select_related().prefetch_related('modulos').get(
                unique_link=unique_link
            )
            serializer = self.get_serializer(certification)
            return Response(serializer.data)
        except Certification.DoesNotExist:
            logger.warning(f"Certificação não encontrada para link: {unique_link}")
            return Response(
                {"error": "Certificação não encontrada"}, 
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            logger.error(f"Erro ao buscar certificação por link: {str(e)}")
            return Response(
                {"error": "Erro ao buscar certificação"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=False, methods=['get'], url_path='codigo/(?P<codigo>[^/.]+)')
    def get_by_codigo(self, request, codigo=None):
        """Busca certificação por código"""
        try:
            certification = Certification.objects.select_related().prefetch_related('modulos').get(
                codigo=codigo
            )
            serializer = self.get_serializer(certification)
            return Response(serializer.data)
        except Certification.DoesNotExist:
            logger.warning(f"Certificação não encontrada para código: {codigo}")
            return Response(
                {"error": "Certificação não encontrada"}, 
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            logger.error(f"Erro ao buscar certificação por código: {str(e)}")
            return Response(
                {"error": "Erro ao buscar certificação"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


def certification_public_view(request, unique_link):
    """View pública para exibir certificação sem autenticação"""
    certification = get_object_or_404(
        Certification.objects.prefetch_related('modulos'),
        unique_link=unique_link
    )
    
    context = {
        'certification': certification,
        'modulos': certification.modulos.all()
    }
    
    return render(request, 'certifications/public_view.html', context)