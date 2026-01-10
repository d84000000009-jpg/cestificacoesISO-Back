from rest_framework import serializers
from django.core.exceptions import ValidationError as DjangoValidationError
from .models import Certification, Modulo


class ModuloSerializer(serializers.ModelSerializer):
    class Meta:
        model = Modulo
        fields = ['id', 'nome']
        read_only_fields = ['id']

class CertificationSerializer(serializers.ModelSerializer):
    foto = serializers.SerializerMethodField()
    link_completo = serializers.SerializerMethodField()
    modulos = ModuloSerializer(many=True, read_only=True)

    class Meta:
        model = Certification
        fields = [
            'id', 'nome_completo', 'documento', 'foto', 'curso', 'duracao',
            'carga_horaria', 'data_conclusao', 'ano', 'codigo', 'status',
            'declaracao', 'descricao', 'unique_link', 'link_completo',
            'modulos', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'unique_link', 'created_at', 'updated_at']

    def get_foto(self, obj):
        """Retorna URL completa da foto"""
        request = self.context.get('request')
        
        if obj.foto:
            # Se houver request, constrói URL absoluta
            if request is not None:
                return request.build_absolute_uri(obj.foto.url)
            # Caso contrário, retorna o caminho relativo
            return obj.foto.url
        
        # Retorna avatar padrão se não houver foto
        if request is not None:
            nome = obj.nome_completo.replace(' ', '+')
            return f"https://ui-avatars.com/api/?name={nome}&background=3b82f6&color=fff&size=200"
        
        return None

    def get_link_completo(self, obj):
        """Retorna link completo da certificação"""
        if obj.unique_link:
            return f"https://www.cptec.co.mz/declaracoes/{obj.unique_link}"
        return None

    def validate_codigo(self, value):
        """Valida que o código é único"""
        if not value or len(value.strip()) < 3:
            raise serializers.ValidationError("Código deve ter pelo menos 3 caracteres")
        
        # Verifica se já existe (exceto na atualização)
        instance = self.instance
        queryset = Certification.objects.filter(codigo=value)
        if instance:
            queryset = queryset.exclude(pk=instance.pk)
        
        if queryset.exists():
            raise serializers.ValidationError("Já existe uma certificação com este código")
        
        return value.strip()

    def validate_documento(self, value):
        """Valida documento de identificação"""
        if not value or len(value.strip()) < 5:
            raise serializers.ValidationError("Documento deve ter pelo menos 5 caracteres")
        return value.strip()

    def validate(self, data):
        """Validações gerais"""
        # Valida data de conclusão não é futura
        from datetime import date
        if 'data_conclusao' in data and data['data_conclusao'] > date.today():
            raise serializers.ValidationError({
                "data_conclusao": "Data de conclusão não pode ser no futuro"
            })
        
        return data