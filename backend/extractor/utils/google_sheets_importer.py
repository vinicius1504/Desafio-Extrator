"""
Utilitário para importar planilhas do Google Sheets
Converte links do Google Sheets em arquivos Excel processáveis
"""

import requests
import pandas as pd
import re
from io import BytesIO
from typing import Tuple, Optional
from django.core.files.base import ContentFile


class GoogleSheetsImporter:
    """
    Classe para importar e converter planilhas do Google Sheets
    """

    @staticmethod
    def extract_spreadsheet_id(url: str) -> Optional[str]:
        """
        Extrai o ID da planilha de uma URL do Google Sheets

        Formatos aceitos:
        - https://docs.google.com/spreadsheets/d/{ID}/edit#gid=0
        - https://docs.google.com/spreadsheets/d/{ID}/edit
        - https://docs.google.com/spreadsheets/d/{ID}
        """
        patterns = [
            r'/spreadsheets/d/([a-zA-Z0-9-_]+)',
            r'spreadsheets/d/([a-zA-Z0-9-_]+)',
        ]

        for pattern in patterns:
            match = re.search(pattern, url)
            if match:
                return match.group(1)

        return None

    @staticmethod
    def validate_google_sheets_url(url: str) -> Tuple[bool, Optional[str]]:
        """
        Valida se a URL é um link válido do Google Sheets

        Returns:
            Tuple[bool, Optional[str]]: (is_valid, error_message)
        """
        if not url:
            return False, "URL não pode estar vazia"

        if not isinstance(url, str):
            return False, "URL deve ser uma string"

        # Verificar se contém o domínio do Google Sheets
        if 'docs.google.com/spreadsheets' not in url:
            return False, "URL deve ser um link do Google Sheets (docs.google.com/spreadsheets)"

        # Extrair ID
        spreadsheet_id = GoogleSheetsImporter.extract_spreadsheet_id(url)
        if not spreadsheet_id:
            return False, "Não foi possível extrair o ID da planilha da URL"

        return True, None

    @staticmethod
    def get_export_url(spreadsheet_id: str, format: str = 'xlsx') -> str:
        """
        Gera a URL de exportação do Google Sheets

        Args:
            spreadsheet_id: ID da planilha
            format: Formato de exportação (xlsx, csv, pdf, ods)

        Returns:
            URL de exportação
        """
        base_url = f"https://docs.google.com/spreadsheets/d/{spreadsheet_id}/export"
        return f"{base_url}?format={format}"

    @staticmethod
    def download_sheet(url: str, timeout: int = 30) -> Tuple[Optional[BytesIO], Optional[str]]:
        """
        Baixa a planilha do Google Sheets

        Args:
            url: URL do Google Sheets
            timeout: Timeout da requisição em segundos

        Returns:
            Tuple[Optional[BytesIO], Optional[str]]: (file_buffer, error_message)
        """
        # Validar URL
        is_valid, error = GoogleSheetsImporter.validate_google_sheets_url(url)
        if not is_valid:
            return None, error

        # Extrair ID
        spreadsheet_id = GoogleSheetsImporter.extract_spreadsheet_id(url)
        if not spreadsheet_id:
            return None, "Não foi possível extrair o ID da planilha"

        # Gerar URL de exportação
        export_url = GoogleSheetsImporter.get_export_url(spreadsheet_id, format='xlsx')

        try:
            # Fazer o download
            response = requests.get(export_url, timeout=timeout)
            response.raise_for_status()

            # Verificar se retornou conteúdo
            if not response.content:
                return None, "A planilha está vazia ou não pôde ser acessada"

            # Verificar se é realmente um arquivo Excel
            # Arquivos XLSX começam com 'PK' (ZIP signature)
            if not response.content[:2] == b'PK':
                return None, "O arquivo baixado não é um Excel válido. Verifique se a planilha é pública ou se o link de compartilhamento está correto."

            # Criar buffer
            file_buffer = BytesIO(response.content)
            file_buffer.seek(0)

            return file_buffer, None

        except requests.exceptions.Timeout:
            return None, f"Timeout ao baixar planilha (limite: {timeout}s). Tente novamente."

        except requests.exceptions.HTTPError as e:
            if e.response.status_code == 404:
                return None, "Planilha não encontrada. Verifique se o link está correto e se a planilha é pública."
            elif e.response.status_code == 403:
                return None, "Acesso negado. A planilha precisa ser pública ou ter permissões de visualização para qualquer pessoa com o link."
            else:
                return None, f"Erro HTTP {e.response.status_code} ao baixar planilha"

        except requests.exceptions.RequestException as e:
            return None, f"Erro ao conectar com o Google Sheets: {str(e)}"

        except Exception as e:
            return None, f"Erro inesperado ao baixar planilha: {str(e)}"

    @staticmethod
    def import_from_url(url: str) -> Tuple[Optional[ContentFile], Optional[str], Optional[dict]]:
        """
        Importa uma planilha do Google Sheets e retorna um ContentFile
        pronto para ser salvo no Django

        Args:
            url: URL do Google Sheets

        Returns:
            Tuple contendo:
            - ContentFile para salvar no modelo
            - Nome do arquivo
            - Informações da planilha (total_rows, total_columns)
        """
        # Baixar planilha
        file_buffer, error = GoogleSheetsImporter.download_sheet(url)

        if error:
            return None, None, {'error': error}

        try:
            # Ler planilha para obter informações
            df = pd.read_excel(file_buffer, header=None)
            total_rows, total_columns = df.shape

            # Voltar ao início do buffer
            file_buffer.seek(0)

            # Extrair ID para usar no nome do arquivo
            spreadsheet_id = GoogleSheetsImporter.extract_spreadsheet_id(url)
            filename = f"google_sheets_{spreadsheet_id}.xlsx"

            # Criar ContentFile
            content_file = ContentFile(file_buffer.read(), name=filename)

            info = {
                'total_rows': total_rows,
                'total_columns': total_columns,
                'spreadsheet_id': spreadsheet_id
            }

            return content_file, filename, info

        except Exception as e:
            return None, None, {'error': f'Erro ao processar planilha: {str(e)}'}
