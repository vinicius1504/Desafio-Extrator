"""
Testes unitários para os serializers do extractor
"""
from django.test import TestCase
from django.core.files.uploadedfile import SimpleUploadedFile
from extractor.models import SpreadsheetUpload, ColumnMapping, Product, ProductVariant
from extractor.serializers import (
    SpreadsheetUploadSerializer,
    ColumnMappingSerializer,
    ProductSerializer,
    ProductVariantSerializer,
    ProductVariantExportSerializer
)


class SpreadsheetUploadSerializerTest(TestCase):
    """Testes para SpreadsheetUploadSerializer"""

    def setUp(self):
        """Setup executado antes de cada teste"""
        self.uploaded_file = SimpleUploadedFile("test.xlsx", b"fake content")
        self.upload = SpreadsheetUpload.objects.create(
            file=self.uploaded_file,
            original_filename="test.xlsx",
            total_rows=100,
            total_columns=10
        )

    def test_serializer_with_valid_data(self):
        """Testa serialização com dados válidos"""
        serializer = SpreadsheetUploadSerializer(instance=self.upload)
        data = serializer.data

        self.assertEqual(data['original_filename'], "test.xlsx")
        self.assertEqual(data['total_rows'], 100)
        self.assertEqual(data['total_columns'], 10)
        self.assertIn('id', data)
        self.assertIn('uploaded_at', data)
        self.assertIn('file', data)

    def test_serializer_contains_expected_fields(self):
        """Testa se o serializer contém todos os campos esperados"""
        serializer = SpreadsheetUploadSerializer(instance=self.upload)
        data = serializer.data

        expected_fields = {'id', 'file', 'uploaded_at', 'original_filename', 'total_rows', 'total_columns'}
        self.assertEqual(set(data.keys()), expected_fields)

    def test_serializer_read_only_fields(self):
        """Testa se campos read-only não podem ser atualizados"""
        serializer = SpreadsheetUploadSerializer(instance=self.upload)

        self.assertIn('id', serializer.Meta.read_only_fields)
        self.assertIn('uploaded_at', serializer.Meta.read_only_fields)


class ColumnMappingSerializerTest(TestCase):
    """Testes para ColumnMappingSerializer"""

    def setUp(self):
        """Setup executado antes de cada teste"""
        self.uploaded_file = SimpleUploadedFile("test.xlsx", b"fake content")
        self.upload = SpreadsheetUpload.objects.create(
            file=self.uploaded_file,
            original_filename="test.xlsx"
        )

        self.price_columns = [
            {"index": 8, "name": "Preço Fornecido"},
            {"index": 10, "name": "Tecido Fornecido"}
        ]

        self.mapping = ColumnMapping.objects.create(
            upload=self.upload,
            code_column=2,
            description_column=3,
            dimensions_column=4,
            cubic_column=5,
            weight_column=6,
            ncm_column=7,
            data_start_row=12,
            price_columns=self.price_columns
        )

    def test_serializer_with_valid_data(self):
        """Testa serialização com dados válidos"""
        serializer = ColumnMappingSerializer(instance=self.mapping)
        data = serializer.data

        self.assertEqual(data['code_column'], 2)
        self.assertEqual(data['description_column'], 3)
        self.assertEqual(data['dimensions_column'], 4)
        self.assertEqual(data['cubic_column'], 5)
        self.assertEqual(data['weight_column'], 6)
        self.assertEqual(data['ncm_column'], 7)
        self.assertEqual(data['data_start_row'], 12)
        self.assertEqual(len(data['price_columns']), 2)

    def test_serializer_price_columns(self):
        """Testa serialização de colunas de preço"""
        serializer = ColumnMappingSerializer(instance=self.mapping)
        data = serializer.data

        self.assertEqual(data['price_columns'][0]['name'], "Preço Fornecido")
        self.assertEqual(data['price_columns'][1]['index'], 10)

    def test_serializer_contains_expected_fields(self):
        """Testa se o serializer contém todos os campos esperados"""
        serializer = ColumnMappingSerializer(instance=self.mapping)
        data = serializer.data

        expected_fields = {
            'id', 'upload', 'code_column', 'description_column',
            'dimensions_column', 'cubic_column', 'weight_column',
            'ncm_column', 'price_columns', 'data_start_row', 'created_at'
        }
        self.assertEqual(set(data.keys()), expected_fields)

    def test_create_mapping_with_serializer(self):
        """Testa criação de mapping através do serializer"""
        new_upload = SpreadsheetUpload.objects.create(
            file=SimpleUploadedFile("new.xlsx", b"content"),
            original_filename="new.xlsx"
        )

        data = {
            'upload': new_upload.id,
            'code_column': 3,
            'description_column': 4,
            'data_start_row': 15,
            'price_columns': [{"index": 10, "name": "Preço"}]
        }

        serializer = ColumnMappingSerializer(data=data)
        self.assertTrue(serializer.is_valid())

        mapping = serializer.save()
        self.assertEqual(mapping.code_column, 3)
        self.assertEqual(mapping.description_column, 4)
        self.assertEqual(mapping.data_start_row, 15)


class ProductVariantSerializerTest(TestCase):
    """Testes para ProductVariantSerializer"""

    def setUp(self):
        """Setup executado antes de cada teste"""
        self.uploaded_file = SimpleUploadedFile("test.xlsx", b"fake content")
        self.upload = SpreadsheetUpload.objects.create(
            file=self.uploaded_file,
            original_filename="test.xlsx"
        )
        self.product = Product.objects.create(
            upload=self.upload,
            description="Almofada Decorativa"
        )

        self.prices = {
            "Preço Fornecido": 123.12,
            "Tecido Fornecido": 136.0
        }

        self.raw_data = {
            "0": None,
            "1": "AC2",
            "2": "Almofada"
        }

        self.variant = ProductVariant.objects.create(
            product=self.product,
            upload=self.upload,
            code="AC2",
            dimensions="A15 * L45 * P45",
            cubic=0.037553,
            weight=0.55,
            ncm="94049000",
            prices=self.prices,
            raw_data=self.raw_data,
            row_number=12
        )

    def test_serializer_with_valid_data(self):
        """Testa serialização com dados válidos"""
        serializer = ProductVariantSerializer(instance=self.variant)
        data = serializer.data

        self.assertEqual(data['code'], "AC2")
        self.assertEqual(data['dimensions'], "A15 * L45 * P45")
        self.assertEqual(float(data['cubic']), 0.037553)
        self.assertEqual(float(data['weight']), 0.55)
        self.assertEqual(data['ncm'], "94049000")
        self.assertEqual(data['row_number'], 12)

    def test_serializer_prices_field(self):
        """Testa serialização do campo prices"""
        serializer = ProductVariantSerializer(instance=self.variant)
        data = serializer.data

        self.assertEqual(data['prices']['Preço Fornecido'], 123.12)
        self.assertEqual(data['prices']['Tecido Fornecido'], 136.0)

    def test_serializer_raw_data_field(self):
        """Testa serialização do campo raw_data"""
        serializer = ProductVariantSerializer(instance=self.variant)
        data = serializer.data

        self.assertIsNone(data['raw_data']['0'])
        self.assertEqual(data['raw_data']['1'], "AC2")
        self.assertEqual(data['raw_data']['2'], "Almofada")

    def test_serializer_contains_expected_fields(self):
        """Testa se o serializer contém todos os campos esperados"""
        serializer = ProductVariantSerializer(instance=self.variant)
        data = serializer.data

        expected_fields = {
            'id', 'code', 'dimensions', 'cubic', 'weight',
            'ncm', 'prices', 'raw_data', 'row_number', 'created_at'
        }
        self.assertEqual(set(data.keys()), expected_fields)


class ProductSerializerTest(TestCase):
    """Testes para ProductSerializer"""

    def setUp(self):
        """Setup executado antes de cada teste"""
        self.uploaded_file = SimpleUploadedFile("test.xlsx", b"fake content")
        self.upload = SpreadsheetUpload.objects.create(
            file=self.uploaded_file,
            original_filename="test.xlsx"
        )
        self.product = Product.objects.create(
            upload=self.upload,
            description="Almofada Decorativa"
        )

        # Criar variantes para o produto
        self.variant1 = ProductVariant.objects.create(
            product=self.product,
            upload=self.upload,
            code="AC2",
            dimensions="45x45",
            row_number=12
        )
        self.variant2 = ProductVariant.objects.create(
            product=self.product,
            upload=self.upload,
            code="AC3",
            dimensions="55x55",
            row_number=13
        )

    def test_serializer_with_valid_data(self):
        """Testa serialização com dados válidos"""
        serializer = ProductSerializer(instance=self.product)
        data = serializer.data

        self.assertEqual(data['description'], "Almofada Decorativa")
        self.assertIn('id', data)
        self.assertIn('created_at', data)

    def test_serializer_includes_variants(self):
        """Testa se o serializer inclui as variantes"""
        serializer = ProductSerializer(instance=self.product)
        data = serializer.data

        self.assertIn('variants', data)
        self.assertEqual(len(data['variants']), 2)

    def test_serializer_variants_data(self):
        """Testa dados das variantes aninhadas"""
        serializer = ProductSerializer(instance=self.product)
        data = serializer.data

        variant_codes = [v['code'] for v in data['variants']]
        self.assertIn('AC2', variant_codes)
        self.assertIn('AC3', variant_codes)

    def test_serializer_contains_expected_fields(self):
        """Testa se o serializer contém todos os campos esperados"""
        serializer = ProductSerializer(instance=self.product)
        data = serializer.data

        expected_fields = {'id', 'description', 'variants', 'created_at'}
        self.assertEqual(set(data.keys()), expected_fields)

    def test_serializer_variants_ordering(self):
        """Testa se variantes estão ordenadas por row_number"""
        serializer = ProductSerializer(instance=self.product)
        data = serializer.data

        self.assertEqual(data['variants'][0]['code'], 'AC2')  # row 12
        self.assertEqual(data['variants'][1]['code'], 'AC3')  # row 13


class ProductVariantExportSerializerTest(TestCase):
    """Testes para ProductVariantExportSerializer"""

    def setUp(self):
        """Setup executado antes de cada teste"""
        self.uploaded_file = SimpleUploadedFile("test.xlsx", b"fake content")
        self.upload = SpreadsheetUpload.objects.create(
            file=self.uploaded_file,
            original_filename="test.xlsx"
        )
        self.product = Product.objects.create(
            upload=self.upload,
            description="Almofada Decorativa"
        )

        self.prices = {
            "Preço Fornecido": 123.12,
            "Tecido Fornecido": 136.0
        }

        self.variant = ProductVariant.objects.create(
            product=self.product,
            upload=self.upload,
            code="AC2",
            dimensions="A15 * L45 * P45",
            cubic=0.037553,
            weight=0.55,
            ncm="94049000",
            prices=self.prices,
            row_number=12
        )

    def test_serializer_flat_structure(self):
        """Testa estrutura flat (sem aninhamento)"""
        serializer = ProductVariantExportSerializer(instance=self.variant)
        data = serializer.data

        # Deve ter product_description diretamente
        self.assertEqual(data['product_description'], "Almofada Decorativa")
        self.assertEqual(data['code'], "AC2")

    def test_serializer_contains_expected_fields(self):
        """Testa se o serializer contém todos os campos esperados"""
        serializer = ProductVariantExportSerializer(instance=self.variant)
        data = serializer.data

        expected_fields = {
            'code', 'product_description', 'dimensions', 'cubic',
            'weight', 'ncm', 'prices', 'row_number'
        }
        self.assertEqual(set(data.keys()), expected_fields)

    def test_serializer_with_variant_without_product(self):
        """Testa serialização de variante órfã"""
        orphan_variant = ProductVariant.objects.create(
            upload=self.upload,
            code="ORPHAN",
            row_number=99
        )

        serializer = ProductVariantExportSerializer(instance=orphan_variant)
        data = serializer.data

        # product_description deve ser None ou não existir
        self.assertIn('product_description', data)
        self.assertIsNone(data.get('product_description'))

    def test_serializer_multiple_variants(self):
        """Testa serialização de múltiplas variantes"""
        variant2 = ProductVariant.objects.create(
            product=self.product,
            upload=self.upload,
            code="AC3",
            dimensions="55x55",
            cubic=0.055,
            weight=0.85,
            ncm="94049000",
            prices={"Preço Fornecido": 157.15},
            row_number=13
        )

        variants = ProductVariant.objects.all()
        serializer = ProductVariantExportSerializer(variants, many=True)
        data = serializer.data

        self.assertEqual(len(data), 2)
        self.assertEqual(data[0]['code'], 'AC2')
        self.assertEqual(data[1]['code'], 'AC3')
        # Ambas devem ter a mesma descrição de produto
        self.assertEqual(data[0]['product_description'], "Almofada Decorativa")
        self.assertEqual(data[1]['product_description'], "Almofada Decorativa")
