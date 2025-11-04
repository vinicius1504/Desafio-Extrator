"""
Fixtures para criar instâncias de models de teste
"""
from django.core.files.uploadedfile import SimpleUploadedFile
from extractor.models import SpreadsheetUpload, ColumnMapping, Product, ProductVariant


class ModelFixtures:
    """Classe para gerar instâncias de models de teste"""

    @staticmethod
    def create_upload(filename="test.xlsx", total_rows=100, total_columns=10):
        """Cria um SpreadsheetUpload de teste"""
        file = SimpleUploadedFile(filename, b"fake excel content")
        return SpreadsheetUpload.objects.create(
            file=file,
            original_filename=filename,
            total_rows=total_rows,
            total_columns=total_columns
        )

    @staticmethod
    def create_mapping(upload, **kwargs):
        """Cria um ColumnMapping de teste"""
        defaults = {
            'code_column': 2,
            'description_column': 3,
            'dimensions_column': 4,
            'cubic_column': 5,
            'weight_column': 6,
            'ncm_column': 7,
            'data_start_row': 12,
            'price_columns': [
                {'index': 8, 'name': 'Preço Fornecido'},
                {'index': 10, 'name': 'Tecido Fornecido'}
            ]
        }
        defaults.update(kwargs)
        return ColumnMapping.objects.create(upload=upload, **defaults)

    @staticmethod
    def create_product(upload, description="Produto Teste"):
        """Cria um Product de teste"""
        return Product.objects.create(
            upload=upload,
            description=description
        )

    @staticmethod
    def create_variant(upload, product=None, code="TEST001", **kwargs):
        """Cria um ProductVariant de teste"""
        defaults = {
            'code': code,
            'dimensions': '45x45',
            'cubic': 0.037,
            'weight': 0.55,
            'ncm': '94049000',
            'prices': {'Preço Fornecido': 123.12},
            'row_number': 12
        }
        defaults.update(kwargs)
        return ProductVariant.objects.create(
            upload=upload,
            product=product,
            **defaults
        )

    @staticmethod
    def create_complete_dataset(upload):
        """
        Cria um dataset completo com produtos e variantes

        Returns:
            Dict com {products: [], variants: []}
        """
        products = []
        variants = []

        # Produto 1 com 3 variantes
        p1 = Product.objects.create(upload=upload, description="Almofada Decorativa")
        products.append(p1)

        v1 = ProductVariant.objects.create(
            upload=upload, product=p1, code="AC2",
            dimensions="45x45", cubic=0.037, weight=0.55,
            ncm="94049000", prices={'Preço': 123.12}, row_number=12
        )
        variants.append(v1)

        v2 = ProductVariant.objects.create(
            upload=upload, product=p1, code="AC3",
            dimensions="55x55", cubic=0.055, weight=0.85,
            ncm="94049000", prices={'Preço': 157.15}, row_number=13
        )
        variants.append(v2)

        v3 = ProductVariant.objects.create(
            upload=upload, product=p1, code="AC33",
            dimensions="60x60", cubic=0.066, weight=1.20,
            ncm="94049000", prices={'Preço': 189.00}, row_number=14
        )
        variants.append(v3)

        # Produto 2 com 1 variante
        p2 = Product.objects.create(upload=upload, description="Banqueta Alta")
        products.append(p2)

        v4 = ProductVariant.objects.create(
            upload=upload, product=p2, code="BC1",
            dimensions="30x30", cubic=0.027, weight=2.50,
            ncm="94036000", prices={'Preço': 250.00}, row_number=15
        )
        variants.append(v4)

        return {
            'products': products,
            'variants': variants
        }
