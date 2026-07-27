from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.core.exceptions import ValidationError
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
import logging

from .models import Submission
from .serializers import SubmissionSerializer

logger = logging.getLogger(__name__)

@method_decorator(csrf_exempt, name='dispatch')
class SubmissionCreateView(generics.CreateAPIView):
    """
    Cria submissões sem bloqueio CSRF, com logging e tratamento de erros.
    """
    queryset = Submission.objects.all()
    serializer_class = SubmissionSerializer

    def create(self, request, *args, **kwargs):
        try:
            serializer = self.get_serializer(data=request.data)
            
            if serializer.is_valid():
                self.perform_create(serializer)
                logger.info(f"Submissão criada com sucesso: {serializer.data.get('email')}")
                return Response({
                    'message': 'Submissão recebida com sucesso!',
                    'data': serializer.data
                }, status=status.HTTP_201_CREATED)
            
            logger.warning(f"Erro na validação dos dados: {serializer.errors}")
            return Response({
                'message': 'Erro na validação dos dados.',
                'errors': serializer.errors
            }, status=status.HTTP_400_BAD_REQUEST)
            
        except ValidationError as e:
            logger.error(f"Erro de validação ao criar submissão: {str(e)}")
            return Response({
                'message': 'Dados inválidos.',
                'errors': str(e)
            }, status=status.HTTP_400_BAD_REQUEST)
            
        except Exception as e:
            logger.error(f"Erro ao criar submissão: {str(e)}")
            return Response({
                'message': 'Erro ao processar submissão. Tente novamente mais tarde.'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class SubmissionListView(generics.ListAPIView):
    """Lista todas as submissões com paginação"""
    queryset = Submission.objects.all()
    serializer_class = SubmissionSerializer
    permission_classes = [IsAuthenticated]
    filterset_fields = ['service', 'consent']
    search_fields = ['name', 'email', 'service']
    ordering_fields = ['created_at', 'name']
    ordering = ['-created_at']
