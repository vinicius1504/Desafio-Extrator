"""
Testes unitários para os models do extractor
"""
from django.test import TestCase
from django.core.files.uploadedfile import SimpleUploadedFile
from extractor.models import SpreadsheetUpload, ColumnMapping, Product, ProductVariant
import json


class SpreadsheetUploadModelTest(TestCase):
    """Testes para o modelo SpreadsheetUpload"""

    def setUp(self):
        """Setup executado antes de cada teste"""
        self.file_content = b"fake excel content"
        self.uploaded_file = SimpleUploadedFile(
            "test.xlsx",
            self.file_content,
            content_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        )

    def test_create_spreadsheet_upload(self):
        """Testa criação de um upload"""
        upload = SpreadsheetUpload.objects.create(
            file=self.uploaded_file,
            original_filename="test.xlsx",
            total_rows=100,
            total_columns=10
        )

        self.assertIsNotNone(upload.id)
        self.assertEqual(upload.original_filename, "test.xlsx")
        self.assertEqual(upload.total_rows, 100)
        self.assertEqual(upload.total_columns, 10)
        self.assertIsNotNone(upload.uploaded_at)

    def test_spreadsheet_upload_str_representation(self):
        """Testa representação em string do upload"""
        upload = SpreadsheetUpload.objects.create(
            file=self.uploaded_file,
            original_filename="test.xlsx",
            total_rows=100,
            total_columns=10
        )

        str_repr = str(upload)
        self.assertIn("test.xlsx", str_repr)
        self.assertIn(upload.uploaded_at.strftime("%Y-%m-%d"), str_repr)

    def test_spreadsheet_upload_defaults(self):
        """Testa valores padrão do modelo"""
        upload = SpreadsheetUpload.objects.create(
            file=self.uploaded_file,
            original_filename="test.xlsx"
        )

        self.assertEqual(upload.total_rows, 0)
        self.assertEqual(upload.total_columns, 0)


class ColumnMappingModelTest(TestCase):
    """Testes para o modelo ColumnMapping"""

    def setUp(self):
        """Setup executado antes de cada teste"""
        self.file_content = b"fake excel content"
        self.uploaded_file = SimpleUploadedFile("test.xlsx", self.file_content)
        self.upload = SpreadsheetUpload.objects.create(
            file=self.uploaded_file,
            original_filename="test.xlsx",
            total_rows=100,
            total_columns=10
        )

    def test_create_column_mapping(self):
        """Testa criação de um mapeamento de colunas"""
        mapping = ColumnMapping.objects.create(
            upload=self.upload,
            code_column=2,
            description_column=3,
            dimensions_column=4,
            cubic_column=5,
            weight_column=6,
            ncm_column=7,
            data_start_row=12
        )

        self.assertIsNotNone(mapping.id)
        self.assertEqual(mapping.upload, self.upload)
        self.assertEqual(mapping.code_column, 2)
        self.assertEqual(mapping.description_column, 3)
        self.assertEqual(mapping.data_start_row, 12)

    def test_column_mapping_with_price_columns(self):
        """Testa mapeamento com colunas de preço"""
        price_columns = [
            {"index": 8, "name": "Preço Fornecido"},
            {"index": 10, "name": "Tecido Fornecido"}
        ]

        mapping = ColumnMapping.objects.create(
            upload=self.upload,
            code_column=2,
            data_start_row=12,
            price_columns=price_columns
        )

        self.assertEqual(len(mapping.price_columns), 2)
        self.assertEqual(mapping.price_columns[0]["name"], "Preço Fornecido")
        self.assertEqual(mapping.price_columns[1]["index"], 10)

    def test_column_mapping_one_to_one_relationship(self):
        """Testa relação OneToOne com SpreadsheetUpload"""
        mapping1 = ColumnMapping.objects.create(
            upload=self.upload,
            code_column=2
        )

        # Tentar criar outro mapping para o mesmo upload deve sobrescrever
        self.assertEqual(self.upload.column_mapping, mapping1)

        # Acessar através do related_name
        self.assertEqual(ColumnMapping.objects.filter(upload=self.upload).count(), 1)

    def test_column_mapping_str_representation(self):
        """Testa representação em string do mapping"""
        mapping = ColumnMapping.objects.create(
            upload=self.upload,
            code_column=2
        )

        str_repr = str(mapping)
        self.assertIn("test.xlsx", str_repr)

    def test_column_mapping_defaults(self):
        """Testa valores padrão do modelo"""
        mapping = ColumnMapping.objects.create(upload=self.upload)

        self.assertEqual(mapping.data_start_row, 0)
        self.assertEqual(mapping.price_columns, [])
        self.assertIsNone(mapping.code_column)
        self.assertIsNone(mapping.description_column)


class ProductModelTest(TestCase):
    """Testes para o modelo Product"""

    def setUp(self):
        """Setup executado antes de cada teste"""
        self.uploaded_file = SimpleUploadedFile("test.xlsx", b"fake content")
        self.upload = SpreadsheetUpload.objects.create(
            file=self.uploaded_file,
            original_filename="test.xlsx"
        )

    def test_create_product(self):
        """Testa criação de um produto"""
        product = Product.objects.create(
            upload=self.upload,
            description="Almofada Decorativa"
        )

        self.assertIsNotNone(product.id)
        self.assertEqual(product.description, "Almofada Decorativa")
        self.assertEqual(product.upload, self.upload)
        self.assertIsNotNone(product.created_at)

    def test_product_without_description(self):
        """Testa produto sem descrição"""
        product = Product.objects.create(upload=self.upload)

        self.assertIsNone(product.description)

    def test_product_str_representation(self):
        """Testa representação em string do produto"""
        product = Product.objects.create(
            upload=self.upload,
            description="Almofada Decorativa"
        )

        self.assertEqual(str(product), "Almofada Decorativa")

    def test_product_str_without_description(self):
        """Testa string de produto sem descrição"""
        product = Product.objects.create(upload=self.upload)

        str_repr = str(product)
        self.assertIn("Product", str_repr)
        self.assertIn(str(product.id), str_repr)

    def test_product_cascade_delete(self):
        """Testa deleção em cascata quando upload é deletado"""
        product = Product.objects.create(
            upload=self.upload,
            description="Test Product"
        )

        product_id = product.id
        self.upload.delete()

        # Produto deve ser deletado em cascata
        self.assertFalse(Product.objects.filter(id=product_id).exists())


class ProductVariantModelTest(TestCase):
    """Testes para o modelo ProductVariant"""

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

    def test_create_product_variant(self):
        """Testa criação de uma variante"""
        variant = ProductVariant.objects.create(
            product=self.product,
            upload=self.upload,
            code="AC2",
            dimensions="A15 * L45 * P45",
            cubic=0.037553,
            weight=0.55,
            ncm="94049000",
            row_number=12
        )

        self.assertIsNotNone(variant.id)
        self.assertEqual(variant.code, "AC2")
        self.assertEqual(variant.product, self.product)
        self.assertEqual(variant.upload, self.upload)
        self.assertEqual(variant.dimensions, "A15 * L45 * P45")
        self.assertEqual(variant.cubic, 0.037553)
        self.assertEqual(variant.weight, 0.55)
        self.assertEqual(variant.ncm, "94049000")
        self.assertEqual(variant.row_number, 12)

    def test_product_variant_with_prices(self):
        """Testa variante com múltiplos preços"""
        prices = {
            "Preço Fornecido": 123.12,
            "Tecido Fornecido": 136.0,
            "Grupo 1": 150.557
        }

        variant = ProductVariant.objects.create(
            product=self.product,
            upload=self.upload,
            code="AC2",
            row_number=12,
            prices=prices
        )

        self.assertEqual(len(variant.prices), 3)
        self.assertEqual(variant.prices["Preço Fornecido"], 123.12)
        self.assertEqual(variant.prices["Tecido Fornecido"], 136.0)
        self.assertEqual(variant.prices["Grupo 1"], 150.557)

    def test_product_variant_with_raw_data(self):
        """Testa variante com dados brutos"""
        raw_data = {
            "0": None,
            "1": "AC2",
            "2": "Almofada",
            "3": "45x45"
        }

        variant = ProductVariant.objects.create(
            product=self.product,
            upload=self.upload,
            code="AC2",
            row_number=12,
            raw_data=raw_data
        )

        self.assertEqual(variant.raw_data["1"], "AC2")
        self.assertEqual(variant.raw_data["2"], "Almofada")

    def test_product_variant_without_product(self):
        """Testa variante órfã (sem produto associado)"""
        variant = ProductVariant.objects.create(
            upload=self.upload,
            code="AC2",
            row_number=12
        )

        self.assertIsNone(variant.product)
        self.assertEqual(variant.upload, self.upload)

    def test_product_variant_str_representation(self):
        """Testa representação em string da variante"""
        variant = ProductVariant.objects.create(
            product=self.product,
            upload=self.upload,
            code="AC2",
            dimensions="45x45",
            row_number=12
        )

        str_repr = str(variant)
        self.assertIn("AC2", str_repr)
        self.assertIn("45x45", str_repr)

    def test_product_variant_ordering(self):
        """Testa ordenação por row_number"""
        variant1 = ProductVariant.objects.create(
            product=self.product,
            upload=self.upload,
            code="AC2",
            row_number=15
        )
        variant2 = ProductVariant.objects.create(
            product=self.product,
            upload=self.upload,
            code="AC3",
            row_number=12
        )
        variant3 = ProductVariant.objects.create(
            product=self.product,
            upload=self.upload,
            code="AC4",
            row_number=20
        )

        variants = list(ProductVariant.objects.all())
        self.assertEqual(variants[0].code, "AC3")  # row 12
        self.assertEqual(variants[1].code, "AC2")  # row 15
        self.assertEqual(variants[2].code, "AC4")  # row 20

    def test_product_variant_defaults(self):
        """Testa valores padrão do modelo"""
        variant = ProductVariant.objects.create(
            upload=self.upload,
            code="TEST",
            row_number=1
        )

        self.assertEqual(variant.prices, {})
        self.assertEqual(variant.raw_data, {})
        self.assertIsNone(variant.dimensions)
        self.assertIsNone(variant.cubic)
        self.assertIsNone(variant.weight)
        self.assertIsNone(variant.ncm)

    def test_cascade_delete_from_product(self):
        """Testa deleção em cascata quando produto é deletado"""
        variant = ProductVariant.objects.create(
            product=self.product,
            upload=self.upload,
            code="AC2",
            row_number=12
        )

        variant_id = variant.id
        self.product.delete()

        # Variante deve ser deletada em cascata
        self.assertFalse(ProductVariant.objects.filter(id=variant_id).exists())

    def test_cascade_delete_from_upload(self):
        """Testa deleção em cascata quando upload é deletado"""
        variant = ProductVariant.objects.create(
            product=self.product,
            upload=self.upload,
            code="AC2",
            row_number=12
        )

        variant_id = variant.id
        self.upload.delete()

        # Variante deve ser deletada em cascata
        self.assertFalse(ProductVariant.objects.filter(id=variant_id).exists())
