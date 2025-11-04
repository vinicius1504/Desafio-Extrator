"""
Serviço para exportação de dados em diferentes formatos
"""
from django.http import HttpResponse
from rest_framework.response import Response
from xml.etree.ElementTree import Element, SubElement, tostring
from xml.dom import minidom
import csv
from typing import List
from extractor.models import ProductVariant
from extractor.serializers import ProductVariantExportSerializer


class ExportService:
    """Serviço responsável pela exportação de dados"""

    def __init__(self, variants: List[ProductVariant]):
        self.variants = variants

    def export_json(self) -> Response:
        """Exporta dados em formato JSON"""
        serializer = ProductVariantExportSerializer(self.variants, many=True)
        return Response(serializer.data)

    def export_csv(self, filename: str) -> HttpResponse:
        """
        Exporta dados em formato CSV

        Args:
            filename: Nome do arquivo original

        Returns:
            HttpResponse com arquivo CSV
        """
        response = HttpResponse(content_type='text/csv; charset=utf-8')
        response['Content-Disposition'] = f'attachment; filename="{filename}_export.csv"'

        writer = csv.writer(response)

        # Header
        if self.variants.exists():
            first_variant = self.variants.first()
            price_keys = list(first_variant.prices.keys()) if first_variant.prices else []
            headers = ['Código', 'Descrição', 'Dimensões', 'Cúbico', 'Peso', 'NCM'] + price_keys
            writer.writerow(headers)

            # Dados
            for variant in self.variants:
                row = [
                    variant.code,
                    variant.product.description if variant.product else '',
                    variant.dimensions or '',
                    variant.cubic or '',
                    variant.weight or '',
                    variant.ncm or '',
                ]
                # Adicionar preços
                for key in price_keys:
                    row.append(variant.prices.get(key, ''))

                writer.writerow(row)

        return response

    def export_xml(self, filename: str) -> HttpResponse:
        """
        Exporta dados em formato XML

        Args:
            filename: Nome do arquivo original

        Returns:
            HttpResponse com arquivo XML
        """
        root = Element('products')

        for variant in self.variants:
            product_elem = SubElement(root, 'product')

            SubElement(product_elem, 'code').text = variant.code or ''
            SubElement(product_elem, 'description').text = variant.product.description if variant.product else ''
            SubElement(product_elem, 'dimensions').text = variant.dimensions or ''
            SubElement(product_elem, 'cubic').text = str(variant.cubic) if variant.cubic else ''
            SubElement(product_elem, 'weight').text = str(variant.weight) if variant.weight else ''
            SubElement(product_elem, 'ncm').text = variant.ncm or ''

            # Preços
            if variant.prices:
                prices_elem = SubElement(product_elem, 'prices')
                for key, value in variant.prices.items():
                    price_elem = SubElement(prices_elem, 'price')
                    price_elem.set('type', key)
                    price_elem.text = str(value)

        # Formatar XML
        xml_str = minidom.parseString(tostring(root)).toprettyxml(indent="  ")

        response = HttpResponse(xml_str, content_type='application/xml')
        response['Content-Disposition'] = f'attachment; filename="{filename}_export.xml"'
        return response
