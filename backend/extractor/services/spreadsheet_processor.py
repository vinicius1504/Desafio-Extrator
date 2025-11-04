"""
Serviço para processar planilhas Excel
"""
import pandas as pd
from typing import Tuple, Dict, Any
from extractor.models import SpreadsheetUpload, ColumnMapping, Product, ProductVariant


class SpreadsheetProcessorService:
    """Serviço responsável pelo processamento de planilhas"""

    def __init__(self, upload: SpreadsheetUpload, mapping: ColumnMapping):
        self.upload = upload
        self.mapping = mapping
        self.df = None

    def load_spreadsheet(self) -> pd.DataFrame:
        """Carrega a planilha Excel em um DataFrame"""
        self.df = pd.read_excel(self.upload.file.path, header=None)
        return self.df

    def get_preview(self, num_rows: int = 20) -> Dict[str, Any]:
        """
        Retorna preview das primeiras linhas da planilha

        Args:
            num_rows: Número de linhas a retornar

        Returns:
            Dict com total de linhas, colunas e preview dos dados
        """
        if self.df is None:
            self.load_spreadsheet()

        preview_data = []
        for idx, row in self.df.head(num_rows).iterrows():
            preview_data.append({
                'row_number': int(idx),
                'data': [str(val) if pd.notna(val) else None for val in row]
            })

        return {
            'total_rows': len(self.df),
            'total_columns': len(self.df.columns),
            'preview': preview_data,
            'column_count': len(self.df.columns)
        }

    def process(self) -> Tuple[int, int]:
        """
        Processa a planilha criando produtos e variantes

        Returns:
            Tupla (produtos_criados, variantes_criadas)
        """
        if self.df is None:
            self.load_spreadsheet()

        # Limpar dados anteriores
        self.upload.products.all().delete()
        self.upload.variants.all().delete()

        current_product = None
        variants_created = 0

        # Processar a partir da linha inicial
        for idx, row in self.df.iloc[self.mapping.data_start_row:].iterrows():
            # Extrair código
            code = self._extract_value(row, self.mapping.code_column)
            if not code:
                continue

            # Extrair descrição
            description = self._extract_value(row, self.mapping.description_column)

            # Se tem descrição, criar novo produto
            if description:
                current_product = Product.objects.create(
                    upload=self.upload,
                    description=description
                )

            # Criar variante
            variant_data = self._extract_variant_data(row, idx)
            ProductVariant.objects.create(
                product=current_product,
                upload=self.upload,
                code=code,
                **variant_data
            )
            variants_created += 1

        products_created = self.upload.products.count()
        return products_created, variants_created

    def _extract_value(self, row: pd.Series, column_index: int) -> str:
        """Extrai valor de uma célula tratando valores nulos"""
        if column_index is None:
            return None

        value = row.iloc[column_index] if column_index < len(row) else None

        if pd.notna(value):
            str_value = str(value)
            return None if str_value == 'nan' else str_value

        return None

    def _extract_variant_data(self, row: pd.Series, row_number: int) -> Dict[str, Any]:
        """
        Extrai todos os dados da variante de uma linha

        Args:
            row: Linha do DataFrame
            row_number: Número da linha na planilha

        Returns:
            Dict com dados da variante
        """
        # Extrair campos básicos
        dimensions = self._extract_value(row, self.mapping.dimensions_column)

        cubic = None
        if self.mapping.cubic_column is not None and self.mapping.cubic_column < len(row):
            try:
                cubic = float(row.iloc[self.mapping.cubic_column]) if pd.notna(row.iloc[self.mapping.cubic_column]) else None
            except (ValueError, TypeError):
                cubic = None

        weight = None
        if self.mapping.weight_column is not None and self.mapping.weight_column < len(row):
            try:
                weight = float(row.iloc[self.mapping.weight_column]) if pd.notna(row.iloc[self.mapping.weight_column]) else None
            except (ValueError, TypeError):
                weight = None

        ncm = self._extract_value(row, self.mapping.ncm_column)

        # Extrair preços
        prices = self._extract_prices(row)

        # Dados brutos
        raw_data = {str(i): str(val) if pd.notna(val) else None for i, val in enumerate(row)}

        return {
            'dimensions': dimensions,
            'cubic': cubic,
            'weight': weight,
            'ncm': ncm,
            'prices': prices,
            'raw_data': raw_data,
            'row_number': int(row_number)
        }

    def _extract_prices(self, row: pd.Series) -> Dict[str, float]:
        """Extrai todos os preços da linha"""
        prices = {}

        for price_col in self.mapping.price_columns:
            col_idx = price_col['index']
            col_name = price_col['name']

            if col_idx < len(row) and pd.notna(row.iloc[col_idx]):
                try:
                    prices[col_name] = float(row.iloc[col_idx])
                except (ValueError, TypeError):
                    prices[col_name] = str(row.iloc[col_idx])

        return prices
