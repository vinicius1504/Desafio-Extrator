"""
Middleware de debug temporário
"""
import json


class DebugMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        if request.path == '/api/auth/users/create/' and request.method == 'POST':
            print("=" * 100)
            print("🔍 DEBUG MIDDLEWARE - Capturou requisição para /api/auth/users/create/")
            print(f"Method: {request.method}")
            print(f"User: {request.user}")
            print(f"User is_authenticated: {request.user.is_authenticated if hasattr(request.user, 'is_authenticated') else False}")
            print(f"User is_admin: {request.user.is_admin if hasattr(request.user, 'is_admin') else False}")
            print(f"Content-Type: {request.content_type}")
            print(f"Body: {request.body.decode('utf-8') if request.body else 'VAZIO'}")
            print("=" * 100)

        response = self.get_response(request)

        if request.path == '/api/auth/users/create/' and request.method == 'POST':
            print("=" * 100)
            print(f"📤 RESPONSE Status: {response.status_code}")
            if hasattr(response, 'data'):
                print(f"Response data: {response.data}")
            print("=" * 100)

        return response
