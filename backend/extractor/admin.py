from django.contrib import admin
from .models import SpreadsheetUpload, ColumnMapping, Product, ProductVariant


@admin.register(SpreadsheetUpload)
class SpreadsheetUploadAdmin(admin.ModelAdmin):
    """Admin para uploads de planilhas"""
    list_display = ['id', 'original_filename', 'total_rows', 'total_columns', 'uploaded_at']
    list_filter = ['uploaded_at']
    search_fields = ['original_filename']
    readonly_fields = ['uploaded_at']


@admin.register(ColumnMapping)
class ColumnMappingAdmin(admin.ModelAdmin):
    """Admin para mapeamento 100% dinâmico"""
    list_display = ['id', 'upload', 'total_dynamic_fields', 'data_start_row', 'created_at']
    list_filter = ['created_at']
    search_fields = ['upload__original_filename']
    readonly_fields = ['created_at']

    def total_dynamic_fields(self, obj):
        """Retorna total de campos dinâmicos detectados"""
        return len(obj.dynamic_fields) if obj.dynamic_fields else 0
    total_dynamic_fields.short_description = 'Campos Detectados'


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    """Admin para produtos"""
    list_display = ['id', 'description', 'upload', 'created_at']
    list_filter = ['created_at', 'upload']
    search_fields = ['description']
    readonly_fields = ['created_at']


@admin.register(ProductVariant)
class ProductVariantAdmin(admin.ModelAdmin):
    """Admin para variantes 100% dinâmicas"""
    list_display = ['id', 'first_field_value', 'upload', 'row_number', 'created_at']
    list_filter = ['upload', 'created_at']
    search_fields = ['fields']
    readonly_fields = ['created_at', 'raw_data']

    def first_field_value(self, obj):
        """Retorna o primeiro valor do campo dinâmico"""
        if obj.fields:
            first_key = next(iter(obj.fields.keys()), None)
            if first_key:
                return f"{first_key}: {obj.fields[first_key]}"
        return '-'
    first_field_value.short_description = 'Primeiro Campo'
