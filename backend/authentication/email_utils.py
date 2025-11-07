"""
Utilitários para envio de emails
"""

from django.core.mail import send_mail
from django.conf import settings
from django.template.loader import render_to_string
from django.utils.html import strip_tags


def send_credentials_email(user_email, username, password, created_by=None):
    """
    Envia email com credenciais de acesso para novo usuário

    Args:
        user_email: Email do novo usuário
        username: Nome de usuário (login)
        password: Senha em texto plano
        created_by: Nome do admin que criou o usuário (opcional)

    Returns:
        bool: True se email foi enviado com sucesso, False caso contrário
    """

    subject = 'Suas credenciais de acesso - Sistema Extrator de Planilhas'

    # Conteúdo do email em HTML
    html_message = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body {{
                font-family: Arial, sans-serif;
                line-height: 1.6;
                color: #333;
            }}
            .container {{
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
                background-color: #f9f9f9;
                border-radius: 5px;
            }}
            .header {{
                background-color: #4CAF50;
                color: white;
                padding: 20px;
                text-align: center;
                border-radius: 5px 5px 0 0;
            }}
            .content {{
                background-color: white;
                padding: 30px;
                border-radius: 0 0 5px 5px;
            }}
            .credentials {{
                background-color: #f0f0f0;
                padding: 15px;
                border-left: 4px solid #4CAF50;
                margin: 20px 0;
            }}
            .credential-item {{
                margin: 10px 0;
            }}
            .credential-label {{
                font-weight: bold;
                color: #555;
            }}
            .credential-value {{
                font-family: monospace;
                font-size: 16px;
                color: #000;
                background-color: #fff;
                padding: 5px 10px;
                border-radius: 3px;
                display: inline-block;
                margin-top: 5px;
            }}
            .warning {{
                background-color: #fff3cd;
                border-left: 4px solid #ffc107;
                padding: 15px;
                margin: 20px 0;
            }}
            .footer {{
                text-align: center;
                margin-top: 20px;
                font-size: 12px;
                color: #777;
            }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>Bem-vindo ao Sistema Extrator de Planilhas!</h1>
            </div>
            <div class="content">
                <p>Olá,</p>

                <p>Uma conta foi criada para você no Sistema Extrator de Planilhas{' por ' + created_by if created_by else ''}.</p>

                <p>Abaixo estão suas credenciais de acesso:</p>

                <div class="credentials">
                    <div class="credential-item">
                        <div class="credential-label">👤 Nome de usuário:</div>
                        <div class="credential-value">{username}</div>
                    </div>
                    <div class="credential-item">
                        <div class="credential-label">🔑 Senha:</div>
                        <div class="credential-value">{password}</div>
                    </div>
                    <div class="credential-item">
                        <div class="credential-label">📧 Email:</div>
                        <div class="credential-value">{user_email}</div>
                    </div>
                </div>

                <div class="warning">
                    <strong>⚠️ Importante:</strong>
                    <ul>
                        <li>Guarde estas credenciais em um local seguro</li>
                        <li>Recomendamos que você altere sua senha após o primeiro acesso</li>
                        <li>Nunca compartilhe suas credenciais com outras pessoas</li>
                    </ul>
                </div>

                <p>Para acessar o sistema, acesse o link de login e utilize as credenciais acima.</p>

                <p>Se você tiver alguma dúvida ou problema, entre em contato com o administrador do sistema.</p>

                <p>Atenciosamente,<br>
                <strong>Equipe Sistema Extrator de Planilhas</strong></p>
            </div>
            <div class="footer">
                <p>Este é um email automático, por favor não responda.</p>
            </div>
        </div>
    </body>
    </html>
    """

    # Versão texto plano (fallback)
    plain_message = f"""
Bem-vindo ao Sistema Extrator de Planilhas!

Olá,

Uma conta foi criada para você no Sistema Extrator de Planilhas{' por ' + created_by if created_by else ''}.

Suas credenciais de acesso:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Nome de usuário: {username}
Senha: {password}
Email: {user_email}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

IMPORTANTE:
• Guarde estas credenciais em um local seguro
• Recomendamos que você altere sua senha após o primeiro acesso
• Nunca compartilhe suas credenciais com outras pessoas

Para acessar o sistema, acesse o link de login e utilize as credenciais acima.

Se você tiver alguma dúvida ou problema, entre em contato com o administrador do sistema.

Atenciosamente,
Equipe Sistema Extrator de Planilhas

---
Este é um email automático, por favor não responda.
    """

    try:
        result = send_mail(
            subject=subject,
            message=plain_message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[user_email],
            html_message=html_message,
            fail_silently=False,
        )
        return True
    except Exception as e:
        return False


def send_password_reset_email(user_email, reset_link):
    """
    Envia email com link para redefinição de senha

    Args:
        user_email: Email do usuário
        reset_link: Link para redefinir a senha

    Returns:
        bool: True se email foi enviado com sucesso, False caso contrário
    """

    subject = 'Redefinição de senha - Sistema Extrator de Planilhas'

    html_message = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body {{
                font-family: Arial, sans-serif;
                line-height: 1.6;
                color: #333;
            }}
            .container {{
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
            }}
            .button {{
                display: inline-block;
                padding: 12px 30px;
                background-color: #4CAF50;
                color: white;
                text-decoration: none;
                border-radius: 5px;
                margin: 20px 0;
            }}
        </style>
    </head>
    <body>
        <div class="container">
            <h2>Redefinição de Senha</h2>
            <p>Você solicitou a redefinição de sua senha.</p>
            <p>Clique no botão abaixo para criar uma nova senha:</p>
            <a href="{reset_link}" class="button">Redefinir Senha</a>
            <p>Ou copie e cole este link no seu navegador:</p>
            <p>{reset_link}</p>
            <p>Se você não solicitou esta redefinição, ignore este email.</p>
            <p>Este link expira em 24 horas.</p>
        </div>
    </body>
    </html>
    """

    plain_message = f"""
Redefinição de Senha

Você solicitou a redefinição de sua senha.

Clique no link abaixo para criar uma nova senha:
{reset_link}

Se você não solicitou esta redefinição, ignore este email.

Este link expira em 24 horas.
    """

    try:
        send_mail(
            subject=subject,
            message=plain_message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[user_email],
            html_message=html_message,
            fail_silently=False,
        )
        return True
    except Exception as e:
        return False
