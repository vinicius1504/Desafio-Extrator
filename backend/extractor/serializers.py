from rest_framework import serializers
from .models import SpreadsheetUpload, ColumnMapping, Product, ProductVariant, MappingTemplate


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
        fields = ['id', 'file', 'google_sheets_url', 'uploaded_at', 'original_filename', 'total_rows', 'total_columns']
        read_only_fields = ['id', 'uploaded_at', 'original_filename', 'total_rows', 'total_columns']
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


class MappingTemplateSerializer(serializers.ModelSerializer):
    class Meta:
        model = MappingTemplate
        fields = [
            'id', 'name', 'description', 'code_column', 'description_column',
            'dimensions_column', 'cubic_column', 'weight_column', 'ncm_column',
            'price_columns', 'data_start_row', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class ColumnMappingSerializer(serializers.ModelSerializer):
    template_name = serializers.CharField(source='template.name', read_only=True)

    class Meta:
        model = ColumnMapping
        fields = [
            'id', 'upload', 'template', 'template_name', 'code_column', 'description_column',
            'dimensions_column', 'cubic_column', 'weight_column',
            'ncm_column', 'price_columns', 'data_start_row', 'created_at'
        ]
        read_only_fields = ['id', 'created_at', 'template_name']

    def validate(self, data):
        """Validação completa do mapeamento"""
        upload = data.get('upload')

        # Campos obrigatórios
        if data.get('code_column') is None:
            raise serializers.ValidationError({
                'code_column': 'O campo Código é obrigatório para o mapeamento'
            })

        # Validar se os índices estão dentro do range da planilha
        if upload:
            max_col = upload.total_columns - 1
            columns_to_check = {
                'code_column': data.get('code_column'),
                'description_column': data.get('description_column'),
                'dimensions_column': data.get('dimensions_column'),
                'cubic_column': data.get('cubic_column'),
                'weight_column': data.get('weight_column'),
                'ncm_column': data.get('ncm_column'),
            }

            for field_name, col_index in columns_to_check.items():
                if col_index is not None and col_index > max_col:
                    raise serializers.ValidationError({
                        field_name: f'Índice {col_index} excede o número de colunas da planilha ({max_col})'
                    })

            # Validar price_columns
            price_columns = data.get('price_columns', [])

            if price_columns:
                for idx, price_col in enumerate(price_columns):
                    if not isinstance(price_col, dict):
                        raise serializers.ValidationError({
                            'price_columns': f'Item {idx} deve ser um objeto com "index" e "name"'
                        })

                    if 'index' not in price_col or 'name' not in price_col:
                        raise serializers.ValidationError({
                            'price_columns': f'Item {idx} deve conter "index" e "name"'
                        })

                    if price_col['index'] > max_col:
                        raise serializers.ValidationError({
                            'price_columns': f'Índice {price_col["index"]} em "{price_col["name"]}" excede o número de colunas'
                        })

            # Validar data_start_row
            data_start_row = data.get('data_start_row', 0)
            if data_start_row < 0 or data_start_row >= upload.total_rows:
                raise serializers.ValidationError({
                    'data_start_row': f'Linha inicial deve estar entre 0 e {upload.total_rows - 1}'
                })

        return data


class ProductVariantSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductVariant
        fields = [
            'id', 'code', 'dimensions', 'cubic', 'weight',
            'ncm', 'prices', 'raw_data', 'row_number', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']


class ProductSerializer(serializers.ModelSerializer):
    variants = ProductVariantSerializer(many=True, read_only=True)

    class Meta:
        model = Product
        fields = ['id', 'description', 'variants', 'created_at']
        read_only_fields = ['id', 'created_at']


class ProductVariantExportSerializer(serializers.ModelSerializer):
    """Serializer para exportação flat (sem aninhamento)"""
    product_description = serializers.SerializerMethodField()

    class Meta:
        model = ProductVariant
        fields = [
            'code', 'product_description', 'dimensions', 'cubic',
            'weight', 'ncm', 'prices', 'row_number'
        ]

    def get_product_description(self, obj):
        """Retorna descrição do produto ou None se produto não existir"""
        return obj.product.description if obj.product else None
