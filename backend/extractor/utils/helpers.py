"""
Funções auxiliares e helpers
"""
from typing import Any, Optional
import pandas as pd


def safe_float_convert(value: Any) -> Optional[float]:
    """
    Converte valor para float de forma segura

    Args:
        value: Valor a ser convertido

    Returns:
        Float ou None
    """
    if pd.isna(value):
        return None

    try:
        return float(value)
    except (ValueError, TypeError):
        return None


def safe_str_convert(value: Any) -> Optional[str]:
    """
    Converte valor para string de forma segura

    Args:
        value: Valor a ser convertido

    Returns:
        String ou None
    """
    if pd.isna(value):
        return None

    str_value = str(value)
    return None if str_value == 'nan' else str_value


def format_file_size(size_bytes: int) -> str:
    """
    Formata tamanho de arquivo em formato legível

    Args:
        size_bytes: Tamanho em bytes

    Returns:
        String formatada (ex: "1.5 MB")
    """
    for unit in ['B', 'KB', 'MB', 'GB']:
        if size_bytes < 1024.0:
            return f"{size_bytes:.1f} {unit}"
        size_bytes /= 1024.0
    return f"{size_bytes:.1f} TB"


def get_column_letter(index: int) -> str:
    """
    Converte índice numérico para letra de coluna Excel

    Args:
        index: Índice da coluna (0-based)

    Returns:
        Letra da coluna (ex: 0 -> A, 25 -> Z, 26 -> AA)
    """
    result = []
    index += 1  # Excel é 1-based

    while index > 0:
        index -= 1
        result.append(chr(65 + (index % 26)))
        index //= 26

    return ''.join(reversed(result))


def get_row_range_description(start: int, end: int) -> str:
    """
    Gera descrição de range de linhas

    Args:
        start: Linha inicial
        end: Linha final

    Returns:
        String descritiva (ex: "Linhas 10-50 (41 linhas)")
    """
    count = end - start + 1
    return f"Linhas {start}-{end} ({count} linha{'s' if count != 1 else ''})"
