"""
Admin para autenticação
"""

from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User, RefreshToken


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    """Admin para o modelo User customizado"""
    list_display = ['username', 'email', 'first_name', 'last_name', 'is_admin', 'is_active', 'created_at']
    list_filter = ['is_admin', 'is_active', 'is_staff', 'created_at']
    search_fields = ['username', 'email', 'first_name', 'last_name']
    ordering = ['-created_at']

    fieldsets = BaseUserAdmin.fieldsets + (
        ('Campos Customizados', {
            'fields': ('is_admin', 'last_activity')
        }),
    )


@admin.register(RefreshToken)
class RefreshTokenAdmin(admin.ModelAdmin):
    """Admin para Refresh Tokens"""
    list_display = ['user', 'created_at', 'expires_at', 'is_blacklisted', 'is_valid']
    list_filter = ['is_blacklisted', 'created_at']
    search_fields = ['user__username', 'user__email']
    readonly_fields = ['token', 'created_at', 'expires_at']
    ordering = ['-created_at']

    def is_valid(self, obj):
        """Exibe se o token é válido"""
        return obj.is_valid
    is_valid.boolean = True
    is_valid.short_description = 'Válido'
