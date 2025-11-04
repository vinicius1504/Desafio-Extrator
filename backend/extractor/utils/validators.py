"""
Validadores e funções de validação
"""
from typing import Optional
import openpyxl
from django.core.exceptions import ValidationError


def validate_excel_file(file) -> bool:
    """
    Valida se o arquivo é um Excel válido

    Args:
        file: Arquivo enviado

    Returns:
        True se válido

    Raises:
        ValidationError: Se o arquivo não for válido
    """
    # Verificar extensão
    if not file.name.endswith(('.xlsx', '.xls')):
        raise ValidationError('Arquivo deve ser no formato Excel (.xlsx ou .xls)')

    # Verificar tamanho (max 50MB)
    max_size = 50 * 1024 * 1024  # 50MB
    if file.size > max_size:
        raise ValidationError(f'Arquivo muito grande. Máximo permitido: 50MB')

    # Tentar abrir o arquivo
    try:
        openpyxl.load_workbook(file, read_only=True, data_only=True)
    except Exception as e:
        raise ValidationError(f'Arquivo Excel inválido ou corrompido: {str(e)}')

    return True


def validate_column_index(index: Optional[int], max_columns: int) -> bool:
    """
    Valida índice de coluna

    Args:
        index: Índice da coluna
        max_columns: Número máximo de colunas

    Returns:
        True se válido

    Raises:
        ValidationError: Se o índice for inválido
    """
    if index is None:
        return True

    if not isinstance(index, int):
        raise ValidationError('Índice de coluna deve ser um número inteiro')

    if index < 0:
        raise ValidationError('Índice de coluna não pode ser negativo')

    if index >= max_columns:
        raise ValidationError(f'Índice de coluna ({index}) excede o número de colunas disponíveis ({max_columns})')

    return True


def validate_row_index(row: int, max_rows: int) -> bool:
    """
    Valida índice de linha

    Args:
        row: Índice da linha
        max_rows: Número máximo de linhas

    Returns:
        True se válido

    Raises:
        ValidationError: Se o índice for inválido
    """
    if not isinstance(row, int):
        raise ValidationError('Índice de linha deve ser um número inteiro')

    if row < 0:
        raise ValidationError('Índice de linha não pode ser negativo')

    if row >= max_rows:
        raise ValidationError(f'Índice de linha ({row}) excede o número de linhas disponíveis ({max_rows})')

    return True


def validate_price_columns(price_columns: list, max_columns: int) -> bool:
    """
    Valida estrutura de colunas de preço

    Args:
        price_columns: Lista de dicionários com índice e nome
        max_columns: Número máximo de colunas

    Returns:
        True se válido

    Raises:
        ValidationError: Se a estrutura for inválida
    """
    if not isinstance(price_columns, list):
        raise ValidationError('price_columns deve ser uma lista')

    for i, price_col in enumerate(price_columns):
        if not isinstance(price_col, dict):
            raise ValidationError(f'Item {i} de price_columns deve ser um dicionário')

        if 'index' not in price_col:
            raise ValidationError(f'Item {i} de price_columns deve conter campo "index"')

        if 'name' not in price_col:
            raise ValidationError(f'Item {i} de price_columns deve conter campo "name"')

        # Validar índice
        validate_column_index(price_col['index'], max_columns)

        # Validar nome
        if not isinstance(price_col['name'], str) or not price_col['name'].strip():
            raise ValidationError(f'Item {i} de price_columns deve ter um nome válido')

    return True
