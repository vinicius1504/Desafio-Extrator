from rest_framework import serializers
from .models import SpreadsheetUpload, ColumnMapping, Product, ProductVariant


class SpreadsheetUploadSerializer(serializers.ModelSerializer):
    """Serializer para upload de planilhas (arquivo ou URL)"""
    google_sheets_url = serializers.URLField(
        write_only=True,
        required=False,
        allow_blank=True,
        help_text='URL do Google Sheets (alternativa ao upload de arquivo)'
    )

    class Meta:
        model = SpreadsheetUpload
        fields = ['id', 'file', 'google_sheets_url', 'uploaded_at', 'original_filename', 'total_rows', 'total_columns', 'company_name', 'processed', 'processed_at']
        read_only_fields = ['id', 'uploaded_at', 'original_filename', 'total_rows', 'total_columns', 'processed', 'processed_at']
        extra_kwargs = {
            'file': {'required': False}
        }

    def validate(self, data):
        """Validar que ou file ou google_sheets_url foi fornecido"""
        file = data.get('file')
        url = data.get('google_sheets_url')

        # Se ambos foram fornecidos, priorizar o arquivo
        if file and url:
            # Remove URL se arquivo foi fornecido
            data.pop('google_sheets_url', None)
            return data

        # Se nenhum foi fornecido, erro
        if not file and not url:
            raise serializers.ValidationError(
                'Você deve fornecer um arquivo ou uma URL do Google Sheets'
            )

        return data


class ColumnMappingSerializer(serializers.ModelSerializer):
    """
    Serializer para mapeamento 100% DINÂMICO
    Apenas valida dynamic_fields detectados pela IA
    """
    class Meta:
        model = ColumnMapping
        fields = ['id', 'upload', 'data_start_row', 'dynamic_fields', 'sheet_index', 'created_at']
        read_only_fields = ['id', 'created_at']

    def validate(self, data):
        """Validação do mapeamento dinâmico"""
        upload = data.get('upload')
        dynamic_fields = data.get('dynamic_fields', [])

        # Dynamic fields deve ser uma lista
        if not isinstance(dynamic_fields, list):
            raise serializers.ValidationError({
                'dynamic_fields': 'dynamic_fields deve ser uma lista'
            })

        # Validar estrutura de cada campo dinâmico
        if upload and dynamic_fields:
            max_col = upload.total_columns - 1

            for idx, field in enumerate(dynamic_fields):
                if not isinstance(field, dict):
                    raise serializers.ValidationError({
                        'dynamic_fields': f'Item {idx} deve ser um objeto'
                    })

                # Verificar campos obrigatórios
                if 'index' not in field or 'name' not in field:
                    raise serializers.ValidationError({
                        'dynamic_fields': f'Item {idx} deve conter "index" e "name"'
                    })

                # Validar índice
                if field['index'] > max_col:
                    raise serializers.ValidationError({
                        'dynamic_fields': f'Índice {field["index"]} do campo "{field["name"]}" excede o número de colunas ({max_col})'
                    })

        # Validar data_start_row
        if upload:
            data_start_row = data.get('data_start_row', 0)
            if data_start_row < 0 or data_start_row >= upload.total_rows:
                raise serializers.ValidationError({
                    'data_start_row': f'Linha inicial deve estar entre 0 e {upload.total_rows - 1}'
                })

        return data


class ProductVariantSerializer(serializers.ModelSerializer):
    """
    Serializer para variante 100% DINÂMICA
    Todos os dados estão em 'fields'
    """
    class Meta:
        model = ProductVariant
        fields = ['id', 'fields', 'raw_data', 'row_number', 'created_at']
        read_only_fields = ['id', 'created_at']


class ProductSerializer(serializers.ModelSerializer):
    """
    Serializer para produto com variantes dinâmicas
    """
    variants = ProductVariantSerializer(many=True, read_only=True)
    image_url = serializers.SerializerMethodField()
    company_name = serializers.SerializerMethodField()
    upload_id = serializers.IntegerField(source='upload.id', read_only=True)

    class Meta:
        model = Product
        fields = ['id', 'description', 'code', 'cubic', 'weight', 'ncm', 'image', 'image_url', 'variants', 'company_name', 'upload_id', 'created_at']
        read_only_fields = ['id', 'created_at', 'image_url', 'company_name', 'upload_id']

    def get_image_url(self, obj):
        """Retorna URL completa da imagem"""
        if obj.image:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.image.url)
            return obj.image.url
        return None

    def get_company_name(self, obj):
        """Retorna nome da empresa vinculada ao upload"""
        return obj.upload.company_name if obj.upload else None


class ProductVariantExportSerializer(serializers.ModelSerializer):
    """
    Serializer para exportação dinâmica
    Retorna apenas 'fields' com todos os dados
    """
    class Meta:
        model = ProductVariant
        fields = ['fields', 'row_number']


class ExportHistorySerializer(serializers.Serializer):
    """Serializer para histórico de exportações"""
    id = serializers.IntegerField()
    upload = serializers.SerializerMethodField()
    exported_at = serializers.DateTimeField(source='processed_at')
    products_count = serializers.IntegerField()
    variants_count = serializers.IntegerField()
    company_name = serializers.CharField(allow_null=True, allow_blank=True, required=False)

    def get_upload(self, obj):
        return {
            'id': obj.id,
            'filename': obj.original_filename,
            'uploaded_at': obj.uploaded_at
        }
