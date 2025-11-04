"""
Settings module for backend project.

Use DJANGO_SETTINGS_MODULE environment variable to select settings:
- backend.settings.development (default)
- backend.settings.production
"""

import os

# Default to development settings
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings.development')
