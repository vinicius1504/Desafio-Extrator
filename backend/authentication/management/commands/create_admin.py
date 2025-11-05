"""
Management command para criar usuário admin padrão
Uso: python manage.py create_admin
"""

from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model

User = get_user_model()


class Command(BaseCommand):
    help = 'Cria usuário admin padrão se não existir'

    def add_arguments(self, parser):
        parser.add_argument(
            '--username',
            type=str,
            default='admin',
            help='Username do admin (padrão: admin)',
        )
        parser.add_argument(
            '--email',
            type=str,
            default='admin@example.com',
            help='Email do admin (padrão: admin@example.com)',
        )
        parser.add_argument(
            '--password',
            type=str,
            default='admin123',
            help='Senha do admin (padrão: admin123)',
        )

    def handle(self, *args, **options):
        username = options['username']
        email = options['email']
        password = options['password']

        if User.objects.filter(username=username).exists():
            self.stdout.write(
                self.style.WARNING(f'Usuário "{username}" já existe. Pulando criação.')
            )
            return

        try:
            user = User.objects.create_superuser(
                username=username,
                email=email,
                password=password,
                is_admin=True,
                first_name='Admin',
                last_name='System'
            )
            self.stdout.write(
                self.style.SUCCESS(f'✓ Superuser "{username}" criado com sucesso!')
            )
            self.stdout.write(f'  Username: {username}')
            self.stdout.write(f'  Email: {email}')
            self.stdout.write(f'  Password: {password}')
            self.stdout.write(
                self.style.WARNING('\n⚠️  IMPORTANTE: Altere a senha após o primeiro login!')
            )
        except Exception as e:
            self.stdout.write(
                self.style.ERROR(f'✗ Erro ao criar superuser: {str(e)}')
            )
