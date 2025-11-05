"""
Permissões customizadas para autenticação
"""

from rest_framework import permissions


class IsAdminUser(permissions.BasePermission):
    """
    Permissão para usuários admin
    Verifica se user.is_admin == True
    """

    def has_permission(self, request, view):
        return (
            request.user and
            request.user.is_authenticated and
            request.user.is_admin
        )
