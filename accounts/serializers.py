from django.contrib.admin.models import ADDITION, CHANGE, DELETION, LogEntry
from django.contrib.auth.models import User
from rest_framework import serializers

from .models import LoginEvent

ACTION_LABELS = {
    ADDITION: "Criado",
    CHANGE: "Atualizado",
    DELETION: "Removido",
}


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "username", "email", "is_active", "is_staff", "is_superuser", "last_login", "date_joined"]


class UserWriteSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=False, allow_blank=True, min_length=8)

    class Meta:
        model = User
        fields = ["id", "username", "email", "password", "is_active", "is_staff", "is_superuser"]

    def validate_password(self, value):
        if not value and self.instance is None:
            raise serializers.ValidationError("Password é obrigatória para criar um utilizador.")
        return value

    def create(self, validated_data):
        password = validated_data.pop("password")
        user = User(**validated_data)
        user.set_password(password)
        user.save()
        return user

    def update(self, instance, validated_data):
        password = validated_data.pop("password", None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        if password:
            instance.set_password(password)
        instance.save()
        return instance


class LoginEventSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source="user.username", read_only=True)

    class Meta:
        model = LoginEvent
        fields = ["id", "username", "timestamp", "ip_address"]


class ChangeLogSerializer(serializers.ModelSerializer):
    username = serializers.SerializerMethodField()
    action = serializers.SerializerMethodField()

    class Meta:
        model = LogEntry
        fields = ["id", "username", "action", "object_repr", "action_time"]

    def get_username(self, obj):
        return obj.user.username if obj.user_id else "Sistema"

    def get_action(self, obj):
        return ACTION_LABELS.get(obj.action_flag, "Alterado")
