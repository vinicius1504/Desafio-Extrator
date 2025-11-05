"""
Views para autenticação
"""

from rest_framework import status, generics, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken as JWTRefreshToken
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from rest_framework_simplejwt.exceptions import TokenError, InvalidToken
from django.utils import timezone
from datetime import timedelta

from .models import User, RefreshToken
from .serializers import (
    UserSerializer,
    RegisterSerializer,
    LoginSerializer,
    ChangePasswordSerializer,
    UserManagementSerializer
)
from .permissions import IsAdminUser


class RegisterView(generics.CreateAPIView):
    """
    Registro de novos usuários
    POST /api/auth/register/
    """
    queryset = User.objects.all()
    permission_classes = [permissions.AllowAny]
    serializer_class = RegisterSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()

        return Response({
            'user': UserSerializer(user).data,
            'message': 'Usuário criado com sucesso'
        }, status=status.HTTP_201_CREATED)


class LoginView(APIView):
    """
    Login de usuários - retorna JWT tokens
    POST /api/auth/login/
    """
    permission_classes = [permissions.AllowAny]
    serializer_class = LoginSerializer

    def post(self, request):
        serializer = self.serializer_class(
            data=request.data,
            context={'request': request}
        )
        serializer.is_valid(raise_exception=True)

        user = serializer.validated_data['user']

        # Atualizar última atividade
        user.update_last_activity()

        # Gerar tokens JWT
        refresh = JWTRefreshToken.for_user(user)
        access = str(refresh.access_token)
        refresh_token = str(refresh)

        # Salvar refresh token no banco
        expires_at = timezone.now() + timedelta(days=1)  # Refresh token válido por 1 dia
        RefreshToken.objects.create(
            user=user,
            token=refresh_token,
            expires_at=expires_at
        )

        return Response({
            'user': UserSerializer(user).data,
            'access': access,
            'refresh': refresh_token,
            'message': 'Login realizado com sucesso'
        }, status=status.HTTP_200_OK)


class LogoutView(APIView):
    """
    Logout de usuários - invalida refresh token
    POST /api/auth/logout/
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        try:
            refresh_token = request.data.get('refresh')

            if refresh_token:
                # Blacklist o token
                token_obj = RefreshToken.objects.filter(
                    token=refresh_token,
                    user=request.user
                ).first()

                if token_obj:
                    token_obj.blacklist()

            return Response({
                'message': 'Logout realizado com sucesso'
            }, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({
                'error': str(e)
            }, status=status.HTTP_400_BAD_REQUEST)


class UserProfileView(generics.RetrieveUpdateAPIView):
    """
    Ver e atualizar perfil do usuário autenticado
    GET/PUT/PATCH /api/auth/profile/
    """
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        # Atualizar última atividade
        self.request.user.update_last_activity()
        return self.request.user


class ChangePasswordView(APIView):
    """
    Alterar senha do usuário autenticado
    POST /api/auth/change-password/
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        serializer = ChangePasswordSerializer(
            data=request.data,
            context={'request': request}
        )
        serializer.is_valid(raise_exception=True)

        user = request.user
        user.set_password(serializer.validated_data['new_password'])
        user.save()

        # Invalidar todos os refresh tokens do usuário
        RefreshToken.objects.filter(user=user).update(is_blacklisted=True)

        return Response({
            'message': 'Senha alterada com sucesso. Faça login novamente.'
        }, status=status.HTTP_200_OK)


class CheckSessionView(APIView):
    """
    Verifica se a sessão do usuário ainda é válida
    GET /api/auth/check-session/
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user

        # Verificar se sessão expirou (10 minutos de inatividade)
        if user.is_session_expired(timeout_minutes=10):
            return Response({
                'valid': False,
                'message': 'Sessão expirada por inatividade'
            }, status=status.HTTP_401_UNAUTHORIZED)

        # Atualizar última atividade
        user.update_last_activity()

        return Response({
            'valid': True,
            'user': UserSerializer(user).data
        }, status=status.HTTP_200_OK)


# ======================
# VIEWS DE ADMINISTRAÇÃO
# ======================

class UserListView(generics.ListAPIView):
    """
    Listar todos os usuários (admin apenas)
    GET /api/auth/users/
    """
    queryset = User.objects.all()
    serializer_class = UserManagementSerializer
    permission_classes = [permissions.IsAuthenticated, IsAdminUser]


class UserCreateView(generics.CreateAPIView):
    """
    Criar novo usuário (admin apenas)
    POST /api/auth/users/create/
    """
    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [permissions.IsAuthenticated, IsAdminUser]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()

        # Se for admin, pode definir se o novo usuário também é admin
        if request.data.get('is_admin'):
            user.is_admin = True
            user.save()

        return Response({
            'user': UserManagementSerializer(user).data,
            'message': 'Usuário criado com sucesso'
        }, status=status.HTTP_201_CREATED)


class UserDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    Ver, atualizar ou deletar um usuário específico (admin apenas)
    GET/PUT/PATCH/DELETE /api/auth/users/<id>/
    """
    queryset = User.objects.all()
    serializer_class = UserManagementSerializer
    permission_classes = [permissions.IsAuthenticated, IsAdminUser]


class UserToggleActiveView(APIView):
    """
    Ativar/desativar usuário (admin apenas)
    POST /api/auth/users/<id>/toggle-active/
    """
    permission_classes = [permissions.IsAuthenticated, IsAdminUser]

    def post(self, request, pk):
        try:
            user = User.objects.get(pk=pk)

            # Não permitir desativar a si mesmo
            if user == request.user:
                return Response({
                    'error': 'Você não pode desativar sua própria conta'
                }, status=status.HTTP_400_BAD_REQUEST)

            user.is_active = not user.is_active
            user.save()

            action = 'ativado' if user.is_active else 'desativado'

            return Response({
                'message': f'Usuário {action} com sucesso',
                'user': UserManagementSerializer(user).data
            }, status=status.HTTP_200_OK)

        except User.DoesNotExist:
            return Response({
                'error': 'Usuário não encontrado'
            }, status=status.HTTP_404_NOT_FOUND)
