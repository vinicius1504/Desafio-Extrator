"""
Models para autenticação e gerenciamento de usuários
"""

from django.contrib.auth.models import AbstractUser
from django.db import models
from django.utils import timezone
from datetime import timedelta


class User(AbstractUser):
    """
    User customizado com campos adicionais
    """
    email = models.EmailField(unique=True, verbose_name='E-mail')
    is_admin = models.BooleanField(default=False, verbose_name='É Administrador')
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='Criado em')
    updated_at = models.DateTimeField(auto_now=True, verbose_name='Atualizado em')
    last_activity = models.DateTimeField(null=True, blank=True, verbose_name='Última atividade')

    # USERNAME_FIELD = 'email'  # Usar email para login
    REQUIRED_FIELDS = ['email']

    class Meta:
        verbose_name = 'Usuário'
        verbose_name_plural = 'Usuários'
        ordering = ['-created_at']

    def __str__(self):
        return self.username

    def update_last_activity(self):
        """Atualiza timestamp da última atividade"""
        self.last_activity = timezone.now()
        self.save(update_fields=['last_activity'])

    def is_session_expired(self, timeout_minutes=10):
        """
        Verifica se a sessão expirou baseado na última atividade

        Args:
            timeout_minutes: Tempo em minutos para considerar sessão expirada

        Returns:
            True se sessão expirou, False caso contrário
        """
        if not self.last_activity:
            return True

        timeout = timedelta(minutes=timeout_minutes)
        return timezone.now() - self.last_activity > timeout


class RefreshToken(models.Model):
    """
    Model para rastrear refresh tokens ativos
    Permite invalidar tokens ao fazer logout
    """
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='refresh_tokens')
    token = models.CharField(max_length=500, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()
    is_blacklisted = models.BooleanField(default=False)

    class Meta:
        verbose_name = 'Refresh Token'
        verbose_name_plural = 'Refresh Tokens'
        ordering = ['-created_at']

    def __str__(self):
        return f'{self.user.username} - {self.created_at}'

    def blacklist(self):
        """Adiciona o token à blacklist"""
        self.is_blacklisted = True
        self.save(update_fields=['is_blacklisted'])

    @property
    def is_expired(self):
        """Verifica se o token expirou"""
        return timezone.now() > self.expires_at

    @property
    def is_valid(self):
        """Verifica se o token é válido (não expirado e não na blacklist)"""
        return not self.is_expired and not self.is_blacklisted
