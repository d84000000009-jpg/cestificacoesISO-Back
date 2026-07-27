import logging

from django.contrib.admin.models import ADDITION, CHANGE, DELETION, LogEntry
from django.contrib.auth import authenticate, login, logout, update_session_auth_hash
from django.contrib.auth.models import User
from django.contrib.contenttypes.models import ContentType
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import ensure_csrf_cookie
from rest_framework import generics, status, viewsets
from rest_framework.exceptions import ValidationError
from rest_framework.permissions import AllowAny, BasePermission, IsAdminUser, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import LoginEvent
from .serializers import ChangeLogSerializer, LoginEventSerializer, UserSerializer, UserWriteSerializer

logger = logging.getLogger(__name__)


class IsSuperUser(BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_superuser)


@method_decorator(ensure_csrf_cookie, name="get")
class CsrfView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        return Response({"detail": "CSRF cookie set"})


class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        username = request.data.get("username", "").strip()
        password = request.data.get("password", "")

        if not username or not password:
            return Response({"detail": "Utilizador e password são obrigatórios"}, status=status.HTTP_400_BAD_REQUEST)

        user = authenticate(request, username=username, password=password)
        if user is None:
            return Response({"detail": "Credenciais inválidas"}, status=status.HTTP_401_UNAUTHORIZED)

        if not user.is_staff:
            return Response({"detail": "Utilizador sem acesso ao painel administrativo"}, status=status.HTTP_403_FORBIDDEN)

        login(request, user)
        logger.info(f"Login efetuado: {user.username}")
        return Response(UserSerializer(user).data)


class LogoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        logout(request)
        return Response(status=status.HTTP_204_NO_CONTENT)


class MeView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response(UserSerializer(request.user).data)


class ChangePasswordView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        old_password = request.data.get("old_password", "")
        new_password = request.data.get("new_password", "")

        if not old_password or not new_password:
            return Response({"detail": "Password atual e nova password são obrigatórias"}, status=status.HTTP_400_BAD_REQUEST)

        if len(new_password) < 8:
            return Response({"detail": "A nova password deve ter pelo menos 8 caracteres"}, status=status.HTTP_400_BAD_REQUEST)

        if not request.user.check_password(old_password):
            return Response({"detail": "Password atual incorreta"}, status=status.HTTP_400_BAD_REQUEST)

        request.user.set_password(new_password)
        request.user.save()
        update_session_auth_hash(request, request.user)
        logger.info(f"Password alterada: {request.user.username}")
        return Response({"detail": "Password alterada com sucesso"})


class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all().order_by("username")

    def get_serializer_class(self):
        if self.action in ("create", "update", "partial_update"):
            return UserWriteSerializer
        return UserSerializer

    def get_permissions(self):
        if self.action in ("create", "update", "partial_update", "destroy"):
            return [IsSuperUser()]
        return [IsAdminUser()]

    def _log_action(self, instance, action_flag, message=""):
        LogEntry.objects.log_action(
            user_id=self.request.user.pk,
            content_type_id=ContentType.objects.get_for_model(User).pk,
            object_id=instance.pk,
            object_repr=str(instance),
            action_flag=action_flag,
            change_message=message,
        )

    def perform_create(self, serializer):
        instance = serializer.save()
        self._log_action(instance, ADDITION, "Utilizador criado via painel admin")

    def perform_update(self, serializer):
        instance = serializer.instance
        if instance.pk == self.request.user.pk and serializer.validated_data.get("is_active") is False:
            raise ValidationError("Não podes desativar a tua própria conta.")
        if instance.pk == self.request.user.pk and serializer.validated_data.get("is_superuser") is False:
            raise ValidationError("Não podes remover o teu próprio acesso de superuser.")
        instance = serializer.save()
        self._log_action(instance, CHANGE, "Utilizador atualizado via painel admin")

    def perform_destroy(self, instance):
        if instance.pk == self.request.user.pk:
            raise ValidationError("Não podes remover a tua própria conta.")
        self._log_action(instance, DELETION, "Utilizador removido via painel admin")
        instance.delete()


class LoginHistoryView(generics.ListAPIView):
    serializer_class = LoginEventSerializer
    permission_classes = [IsAdminUser]
    queryset = LoginEvent.objects.select_related("user").all()[:50]


class ChangeLogView(generics.ListAPIView):
    serializer_class = ChangeLogSerializer
    permission_classes = [IsAdminUser]
    queryset = LogEntry.objects.select_related("user").order_by("-action_time")[:50]
