"""
Detector automático de estrutura de planilhas
Identifica linha de headers e início dos dados
"""
import pandas as pd
import openpyxl
from typing import Tuple, Optional, List


def find_header_row(df: pd.DataFrame, max_search_rows: int = 20) -> Optional[int]:
    """
    Encontra a linha que contém os headers da planilha

    Args:
        df: DataFrame da planilha
        max_search_rows: Máximo de linhas para procurar

    Returns:
        Índice da linha de header ou None se não encontrado
    """
    # Palavras-chave que indicam headers de produtos
    header_keywords = [
        'codigo', 'código', 'code', 'cod',
        'descricao', 'descrição', 'description', 'desc',
        'dimensoes', 'dimensões', 'dimensions',
        'peso', 'weight',
        'cubico', 'cúbico', 'cubic',
        'ncm', 'preco', 'preço', 'price'
    ]

    for idx in range(min(max_search_rows, len(df))):
        row = df.iloc[idx]

        # Contar quantas células têm texto (não números)
        text_cells = 0
        matching_keywords = 0

        for val in row:
            if pd.notna(val) and isinstance(val, str):
                text_cells += 1
                val_lower = val.lower().strip()

                # Verificar se contém alguma palavra-chave
                for keyword in header_keywords:
                    if keyword in val_lower:
                        matching_keywords += 1
                        break

        # Se temos pelo menos 3 células de texto e 2 keywords, provavelmente é header
        if text_cells >= 3 and matching_keywords >= 2:
            return idx

    return None


def find_data_start_row(df: pd.DataFrame, header_row: int) -> int:
    """
    Encontra a linha onde começam os dados (após o header)

    Args:
        df: DataFrame da planilha
        header_row: Índice da linha de header

    Returns:
        Índice da primeira linha de dados
    """
    # Normalmente é a próxima linha após o header
    data_start = header_row + 1

    # Verificar se há linhas vazias ou subtítulos
    while data_start < len(df):
        row = df.iloc[data_start]

        # Contar células não vazias
        non_empty = sum(1 for val in row if pd.notna(val))

        # Se temos dados suficientes, é a linha de início
        if non_empty >= 3:
            return data_start

        data_start += 1

    return header_row + 1


def detect_spreadsheet_structure(df: pd.DataFrame) -> dict:
    """
    Detecta automaticamente a estrutura completa da planilha

    Args:
        df: DataFrame da planilha

    Returns:
        Dict com informações da estrutura
    """
    header_row = find_header_row(df)

    if header_row is None:
        # Se não encontrou headers, assume linha 0
        header_row = 0

    data_start_row = find_data_start_row(df, header_row)

    # Extrair headers
    if header_row < len(df):
        headers = []
        for idx, val in enumerate(df.iloc[header_row]):
            if pd.notna(val):
                headers.append({
                    'index': idx,
                    'name': str(val).strip()
                })
    else:
        headers = []

    # Contar linhas de dados
    total_data_rows = len(df) - data_start_row

    return {
        'header_row': header_row,
        'data_start_row': data_start_row,
        'total_rows': len(df),
        'total_columns': len(df.columns),
        'total_data_rows': total_data_rows,
        'headers': headers
    }


def get_column_index_by_name(headers: list, search_terms: list) -> Optional[int]:
    """
    Encontra o índice de uma coluna pelo nome

    Args:
        headers: Lista de headers [{index, name}, ...]
        search_terms: Lista de termos para buscar (case-insensitive)

    Returns:
        Índice da coluna ou None
    """
    for header in headers:
        name_lower = header['name'].lower()
        for term in search_terms:
            if term.lower() in name_lower:
                return header['index']

    return None


def get_hidden_columns(file_path: str) -> List[int]:
    """
    Identifica quais colunas estão ocultas no arquivo Excel

    Args:
        file_path: Caminho do arquivo Excel

    Returns:
        Lista de índices (0-based) das colunas ocultas
    """
    try:
        wb = openpyxl.load_workbook(file_path)
        ws = wb.active

        hidden_columns = []

        # Verificar até coluna 100 (suficiente para a maioria das planilhas)
        for col_idx in range(1, 101):
            col_letter = openpyxl.utils.get_column_letter(col_idx)
            col_dim = ws.column_dimensions[col_letter]

            if col_dim.hidden:
                # Converter para índice 0-based
                hidden_columns.append(col_idx - 1)

        wb.close()
        return hidden_columns

    except Exception as e:
        # Se der erro, retornar lista vazia (não filtrar nada)
        print(f"Erro ao detectar colunas ocultas: {e}")
        return []


def remove_hidden_columns(df: pd.DataFrame, file_path: str) -> Tuple[pd.DataFrame, dict]:
    """
    Remove colunas ocultas do DataFrame

    Args:
        df: DataFrame original
        file_path: Caminho do arquivo Excel

    Returns:
        Tupla (DataFrame filtrado, mapeamento de índices)
        mapeamento: {indice_original: indice_novo} ou None para colunas removidas
    """
    hidden_columns = get_hidden_columns(file_path)

    if not hidden_columns:
        # Nenhuma coluna oculta, retornar original
        mapping = {i: i for i in range(len(df.columns))}
        return df, mapping

    # Colunas visíveis
    visible_columns = [i for i in range(len(df.columns)) if i not in hidden_columns]

    # Criar mapeamento: índice original -> índice após remoção
    mapping = {}
    for original_idx in range(len(df.columns)):
        if original_idx in hidden_columns:
            mapping[original_idx] = None  # Coluna removida
        else:
            # Calcular novo índice
            new_idx = sum(1 for i in visible_columns if i < original_idx)
            mapping[original_idx] = new_idx

    # Filtrar DataFrame
    df_filtered = df.iloc[:, visible_columns]

    return df_filtered, mapping
