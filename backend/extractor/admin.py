from django.contrib import admin
from .models import SpreadsheetUpload, ColumnMapping, Product, ProductVariant, MappingTemplate


@admin.register(MappingTemplate)
class MappingTemplateAdmin(admin.ModelAdmin):
    list_display = ['id', 'name', 'code_column', 'description_column', 'data_start_row', 'created_at']
    list_filter = ['created_at', 'updated_at']
    search_fields = ['name', 'description']
    readonly_fields = ['created_at', 'updated_at']


@admin.register(SpreadsheetUpload)
class SpreadsheetUploadAdmin(admin.ModelAdmin):
    list_display = ['id', 'original_filename', 'total_rows', 'total_columns', 'uploaded_at']
    list_filter = ['uploaded_at']
    search_fields = ['original_filename']


@admin.register(ColumnMapping)
class ColumnMappingAdmin(admin.ModelAdmin):
    list_display = ['id', 'upload', 'template', 'data_start_row', 'created_at']
    list_filter = ['created_at', 'template']
    autocomplete_fields = ['template']


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ['id', 'description', 'upload', 'created_at']
    list_filter = ['created_at', 'upload']
    search_fields = ['description']


@admin.register(ProductVariant)
class ProductVariantAdmin(admin.ModelAdmin):
    list_display = ['id', 'code', 'product', 'dimensions', 'cubic', 'weight', 'row_number']
    list_filter = ['upload', 'product']
    search_fields = ['code', 'dimensions']
