from django.db import models
import json


class SpreadsheetUpload(models.Model):
    """Armazena informações sobre o upload da planilha"""
    file = models.FileField(upload_to='spreadsheets/')
    uploaded_at = models.DateTimeField(auto_now_add=True)
    original_filename = models.CharField(max_length=255)
    total_rows = models.IntegerField(default=0)
    total_columns = models.IntegerField(default=0)
    company_name = models.CharField(max_length=255, blank=True, null=True, help_text="Nome da empresa vinculada")
    processed = models.BooleanField(default=False, help_text="Indica se a planilha foi processada")
    processed_at = models.DateTimeField(blank=True, null=True, help_text="Data/hora do processamento")

    class Meta:
        ordering = ['-uploaded_at']

    def __str__(self):
        return f"{self.original_filename} - {self.uploaded_at}"


class ColumnMapping(models.Model):
    """
    Armazena o mapeamento de colunas 100% DINÂMICO detectado pela IA
    TODOS os campos são detectados automaticamente pelo Gemini AI
    """
    upload = models.OneToOneField(SpreadsheetUpload, on_delete=models.CASCADE, related_name='column_mapping')

    # Linha onde começam os dados (após os headers)
    data_start_row = models.IntegerField(default=0, help_text="Linha onde começam os dados (baseado em 0)")

    # ÚNICO CAMPO: Mapeamento 100% dinâmico - todos os campos detectados pela IA
    # Estrutura: [
    #   {'index': 0, 'name': 'Código OR', 'type': 'code', 'confidence': 0.95},
    #   {'index': 1, 'name': 'Cor', 'type': 'attribute', 'confidence': 0.85},
    #   {'index': 2, 'name': 'Tamanho', 'type': 'attribute', 'confidence': 0.90},
    #   {'index': 3, 'name': 'Preço Atacado', 'type': 'price', 'confidence': 0.95}
    # ]
    dynamic_fields = models.JSONField(
        default=list,
        help_text="Lista de TODOS os campos detectados pela IA com índice, nome original, tipo e confiança"
    )

    sheet_index = models.IntegerField(
        default=0,
        help_text="Índice da aba/sheet da planilha (0 = primeira aba)"
    )

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Dynamic Mapping for {self.upload.original_filename} ({len(self.dynamic_fields)} campos)"


class Product(models.Model):
    """Produto principal (primeira ocorrência com descrição)"""
    upload = models.ForeignKey(SpreadsheetUpload, on_delete=models.CASCADE, related_name='products')

    description = models.TextField(blank=True, null=True)
    code = models.CharField(max_length=255, blank=True, null=True, help_text="Código do produto")
    cubic = models.CharField(max_length=100, blank=True, null=True, help_text="Cubagem")
    weight = models.CharField(max_length=100, blank=True, null=True, help_text="Peso")
    ncm = models.CharField(max_length=100, blank=True, null=True, help_text="NCM")
    image = models.ImageField(upload_to='products/', blank=True, null=True, help_text="Imagem do produto")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['id']

    def __str__(self):
        return self.description or f"Product {self.id}"


class ProductVariant(models.Model):
    """
    Variante de produto com campos 100% DINÂMICOS
    Todos os dados são armazenados no campo 'fields' detectado pela IA
    """
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='variants', null=True, blank=True)
    upload = models.ForeignKey(SpreadsheetUpload, on_delete=models.CASCADE, related_name='variants')

    # ÚNICO CAMPO DE DADOS: Campos 100% dinâmicos detectados pela IA
    # Estrutura: {
    #   'código or': 'ABC123',
    #   'cor': 'Vermelho',
    #   'tamanho': 'M',
    #   'preço atacado': 100.50,
    #   'estoque': 50
    # }
    fields = models.JSONField(
        default=dict,
        help_text="TODOS os campos da linha com nomes originais da planilha"
    )

    # Dados brutos da linha (para referência/debug)
    raw_data = models.JSONField(default=dict, help_text="Dados brutos da linha da planilha")

    # Linha original na planilha
    row_number = models.IntegerField(help_text="Número da linha na planilha original")

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['row_number']

    def __str__(self):
        # Tenta usar primeiro campo como identificador
        first_field = next(iter(self.fields.values()), f"Variant {self.id}") if self.fields else f"Variant {self.id}"
        return f"Row {self.row_number}: {first_field}"
