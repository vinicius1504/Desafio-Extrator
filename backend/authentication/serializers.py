"""
Serializers para autenticação
"""

from rest_framework import serializers
from django.contrib.auth import authenticate
from django.contrib.auth.password_validation import validate_password
from .models import User


class UserSerializer(serializers.ModelSerializer):
    """Serializer para o model User"""

    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'first_name', 'last_name',
            'is_admin', 'is_active', 'created_at', 'updated_at', 'last_activity'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'last_activity']


class RegisterSerializer(serializers.ModelSerializer):
    """Serializer para registro de novos usuários"""
    password = serializers.CharField(
        write_only=True,
        required=True,
        validators=[validate_password],
        style={'input_type': 'password'}
    )
    password_confirm = serializers.CharField(
        write_only=True,
        required=True,
        style={'input_type': 'password'}
    )
    is_admin = serializers.BooleanField(
        required=False,
        default=False
    )

    class Meta:
        model = User
        fields = [
            'username', 'email', 'password', 'password_confirm',
            'first_name', 'last_name', 'is_admin'
        ]

    def validate(self, attrs):
        """Validação customizada"""
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError({
                'password_confirm': 'As senhas não coincidem'
            })
        return attrs

    def create(self, validated_data):
        """Cria um novo usuário"""
        validated_data.pop('password_confirm')
        is_admin = validated_data.pop('is_admin', False)

        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password'],
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', ''),
        )

        # Definir is_admin se fornecido
        if is_admin:
            user.is_admin = True
            user.save()

        return user


class LoginSerializer(serializers.Serializer):
    """Serializer para login"""
    username = serializers.CharField(required=True)
    password = serializers.CharField(
        required=True,
        write_only=True,
        style={'input_type': 'password'}
    )

    def validate(self, attrs):
        """Valida credenciais do usuário"""
        username = attrs.get('username')
        password = attrs.get('password')

        if username and password:
            user = authenticate(
                request=self.context.get('request'),
                username=username,
                password=password
            )

            if not user:
                raise serializers.ValidationError({
                    'detail': 'Credenciais inválidas'
                })

            if not user.is_active:
                raise serializers.ValidationError({
                    'detail': 'Usuário desativado'
                })

            attrs['user'] = user
            return attrs
        else:
            raise serializers.ValidationError({
                'detail': 'Username e password são obrigatórios'
            })


class ChangePasswordSerializer(serializers.Serializer):
    """Serializer para alteração de senha"""
    old_password = serializers.CharField(
        required=True,
        write_only=True,
        style={'input_type': 'password'}
    )
    new_password = serializers.CharField(
        required=True,
        write_only=True,
        validators=[validate_password],
        style={'input_type': 'password'}
    )
    new_password_confirm = serializers.CharField(
        required=True,
        write_only=True,
        style={'input_type': 'password'}
    )

    def validate(self, attrs):
        """Validação customizada"""
        if attrs['new_password'] != attrs['new_password_confirm']:
            raise serializers.ValidationError({
                'new_password_confirm': 'As senhas não coincidem'
            })
        return attrs

    def validate_old_password(self, value):
        """Valida senha antiga"""
        user = self.context['request'].user
        if not user.check_password(value):
            raise serializers.ValidationError('Senha antiga incorreta')
        return value


class UserManagementSerializer(serializers.ModelSerializer):
    """Serializer para gerenciamento de usuários (admin)"""

    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'first_name', 'last_name',
            'is_admin', 'is_active', 'is_staff', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class AdminUserCreateSerializer(serializers.ModelSerializer):
    """Serializer para criação de usuários por admin (sem confirmação de senha)"""
    password = serializers.CharField(
        write_only=True,
        required=True,
        validators=[validate_password],
        style={'input_type': 'password'},
        help_text='Senha do novo usuário'
    )
    is_admin = serializers.BooleanField(
        required=False,
        default=False
    )

    class Meta:
        model = User
        fields = [
            'username', 'email', 'password',
            'first_name', 'last_name', 'is_admin'
        ]

    def validate(self, attrs):
        """Remove password_confirm se foi enviado por engano"""
        # Ignorar password_confirm caso o frontend envie
        attrs.pop('password_confirm', None)
        return attrs

    def create(self, validated_data):
        """Cria um novo usuário"""
        is_admin = validated_data.pop('is_admin', False)

        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password'],
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', ''),
        )

        # Definir is_admin se fornecido
        if is_admin:
            user.is_admin = True
            user.save()

        return user
