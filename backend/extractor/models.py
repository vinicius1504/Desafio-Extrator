from django.db import models
import json


class MappingTemplate(models.Model):
    """Template de mapeamento reutilizável para planilhas com estrutura similar"""
    name = models.CharField(max_length=255, unique=True, help_text="Nome do template (ex: 'Planilha Fornecedor A')")
    description = models.TextField(blank=True, null=True, help_text="Descrição do template")

    # Configurações do mapeamento
    code_column = models.IntegerField(null=True, blank=True)
    description_column = models.IntegerField(null=True, blank=True)
    dimensions_column = models.IntegerField(null=True, blank=True)
    cubic_column = models.IntegerField(null=True, blank=True)
    weight_column = models.IntegerField(null=True, blank=True)
    ncm_column = models.IntegerField(null=True, blank=True)
    price_columns = models.JSONField(default=list)
    data_start_row = models.IntegerField(default=0)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['name']

    def __str__(self):
        return self.name

    def apply_to_mapping(self, column_mapping):
        """Aplica este template a um ColumnMapping"""
        column_mapping.code_column = self.code_column
        column_mapping.description_column = self.description_column
        column_mapping.dimensions_column = self.dimensions_column
        column_mapping.cubic_column = self.cubic_column
        column_mapping.weight_column = self.weight_column
        column_mapping.ncm_column = self.ncm_column
        column_mapping.price_columns = self.price_columns
        column_mapping.data_start_row = self.data_start_row
        return column_mapping


class SpreadsheetUpload(models.Model):
    """Armazena informações sobre o upload da planilha"""
    file = models.FileField(upload_to='spreadsheets/')
    uploaded_at = models.DateTimeField(auto_now_add=True)
    original_filename = models.CharField(max_length=255)
    total_rows = models.IntegerField(default=0)
    total_columns = models.IntegerField(default=0)

    class Meta:
        ordering = ['-uploaded_at']

    def __str__(self):
        return f"{self.original_filename} - {self.uploaded_at}"


class ColumnMapping(models.Model):
    """Armazena o mapeamento de colunas definido pelo usuário"""
    upload = models.OneToOneField(SpreadsheetUpload, on_delete=models.CASCADE, related_name='column_mapping')
    template = models.ForeignKey(MappingTemplate, on_delete=models.SET_NULL, null=True, blank=True, help_text="Template utilizado (opcional)")

    # Índices das colunas (baseado em 0)
    code_column = models.IntegerField(null=True, blank=True, help_text="Índice da coluna de código")
    description_column = models.IntegerField(null=True, blank=True, help_text="Índice da coluna de descrição")
    dimensions_column = models.IntegerField(null=True, blank=True, help_text="Índice da coluna de dimensões")
    cubic_column = models.IntegerField(null=True, blank=True, help_text="Índice da coluna de cúbico")
    weight_column = models.IntegerField(null=True, blank=True, help_text="Índice da coluna de peso")
    ncm_column = models.IntegerField(null=True, blank=True, help_text="Índice da coluna de NCM")

    # Colunas de preços (pode ter múltiplas)
    price_columns = models.JSONField(
        default=list,
        help_text="Lista de objetos com índice e nome da coluna de preço, ex: [{'index': 8, 'name': 'Preço Fornecido'}]"
    )

    # Linha onde começam os dados (após os headers)
    data_start_row = models.IntegerField(default=0, help_text="Linha onde começam os dados (baseado em 0)")

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Mapping for {self.upload.original_filename}"


class Product(models.Model):
    """Produto principal (primeira ocorrência com descrição)"""
    upload = models.ForeignKey(SpreadsheetUpload, on_delete=models.CASCADE, related_name='products')

    description = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['id']

    def __str__(self):
        return self.description or f"Product {self.id}"


class ProductVariant(models.Model):
    """Variação de produto (pode ter múltiplos códigos por produto)"""
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='variants', null=True, blank=True)
    upload = models.ForeignKey(SpreadsheetUpload, on_delete=models.CASCADE, related_name='variants')

    # Dados básicos
    code = models.CharField(max_length=100)
    dimensions = models.CharField(max_length=255, blank=True, null=True)
    cubic = models.FloatField(null=True, blank=True)
    weight = models.FloatField(null=True, blank=True)
    ncm = models.CharField(max_length=50, blank=True, null=True)

    # Preços (armazenados como JSON para flexibilidade)
    prices = models.JSONField(
        default=dict,
        help_text="Dicionário de preços, ex: {'Preço Fornecido': 123.45, 'Grupo 1': 150.00}"
    )

    # Dados brutos da linha (para referência)
    raw_data = models.JSONField(default=dict, help_text="Dados brutos da linha da planilha")

    # Linha original na planilha
    row_number = models.IntegerField(help_text="Número da linha na planilha original")

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['row_number']

    def __str__(self):
        return f"{self.code} - {self.dimensions}"
