#!/usr/bin/env python
"""
Script para gerar SECRET_KEY segura para Django
Uso: python scripts/generate_secret_key.py
"""

from django.core.management.utils import get_random_secret_key

if __name__ == '__main__':
    secret_key = get_random_secret_key()
    print("=" * 70)
    print("SECRET_KEY GERADA COM SUCESSO!")
    print("=" * 70)
    print(f"\nCopie e cole no Railway/Vercel:\n")
    print(f"SECRET_KEY={secret_key}\n")
    print("=" * 70)
    print("⚠️  IMPORTANTE: Mantenha esta chave em segredo!")
    print("=" * 70)
