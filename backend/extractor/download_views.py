"""
Views para download de arquivos (CSV, XML)
Separadas do DRF para evitar problemas com content negotiation
"""
from django.http import HttpResponse, Http404
from django.views import View
import csv
from xml.etree.ElementTree import Element, SubElement, tostring
from xml.dom import minidom

from .models import SpreadsheetUpload, ProductVariant
from .serializers import ProductVariantExportSerializer
from .utils.formatters import DataFormatter


class ExportDownloadView(View):
    """View para download de exports em CSV/XML"""

    def get(self, request, pk):
        # Buscar upload
        try:
            upload = SpreadsheetUpload.objects.get(pk=pk)
        except SpreadsheetUpload.DoesNotExist:
            raise Http404("Upload não encontrado")

        # Parâmetros
        format_type = request.GET.get('format', 'json').lower()
        formatted = request.GET.get('formatted', 'false').lower() == 'true'

        # Buscar variantes
        variants = ProductVariant.objects.filter(upload=upload).select_related('product')

        if format_type == 'csv':
            if formatted:
                return self._export_csv_formatted(variants, upload.original_filename)
            else:
                return self._export_csv(variants, upload.original_filename)
        elif format_type == 'xml':
            if formatted:
                return self._export_xml_formatted(variants, upload.original_filename)
            else:
                return self._export_xml(variants, upload.original_filename)
        elif format_type == 'json':
            # Para JSON, redirecionar para API DRF
            from django.shortcuts import redirect
            return redirect(f'/api/uploads/{pk}/export_json/')
        else:
            return HttpResponse(
                '{"error": "Formato não suportado. Use: csv, xml ou json"}',
                content_type='application/json',
                status=400
            )

    def _export_csv(self, variants, filename):
        """Exporta para CSV"""
        response = HttpResponse(content_type='text/csv; charset=utf-8')
        response['Content-Disposition'] = f'attachment; filename="{filename}_export.csv"'

        writer = csv.writer(response)

        # Header
        if variants.exists():
            first_variant = variants.first()
            price_keys = list(first_variant.prices.keys()) if first_variant.prices else []
            headers = ['Código', 'Descrição', 'Dimensões', 'Cúbico', 'Peso', 'NCM'] + price_keys
            writer.writerow(headers)

            # Dados
            for variant in variants:
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

    def _export_xml(self, variants, filename):
        """Exporta para XML"""
        root = Element('products')

        for variant in variants:
            product_elem = SubElement(root, 'product')

            # Elementos básicos
            SubElement(product_elem, 'code').text = str(variant.code)
            SubElement(product_elem, 'description').text = str(variant.product.description if variant.product else '')
            SubElement(product_elem, 'dimensions').text = str(variant.dimensions or '')
            SubElement(product_elem, 'cubic').text = str(variant.cubic or '')
            SubElement(product_elem, 'weight').text = str(variant.weight or '')
            SubElement(product_elem, 'ncm').text = str(variant.ncm or '')

            # Preços
            if variant.prices:
                prices_elem = SubElement(product_elem, 'prices')
                for key, value in variant.prices.items():
                    price_elem = SubElement(prices_elem, 'price')
                    price_elem.set('type', key)
                    price_elem.text = str(value)

        # Formatar XML
        xml_str = minidom.parseString(tostring(root, encoding='utf-8')).toprettyxml(indent="  ", encoding='utf-8')

        response = HttpResponse(xml_str, content_type='application/xml')
        response['Content-Disposition'] = f'attachment; filename="{filename}_export.xml"'
        return response

    def _export_csv_formatted(self, variants, filename):
        """Exporta para CSV com dados formatados"""
        response = HttpResponse(content_type='text/csv; charset=utf-8-sig')  # BOM para Excel
        response['Content-Disposition'] = f'attachment; filename="{filename}_formatado.csv"'

        writer = csv.writer(response)

        # Header formatado
        if variants.exists():
            first_variant = variants.first()
            price_keys = list(first_variant.prices.keys()) if first_variant.prices else []

            headers = [
                'Código',
                'Descrição',
                'Altura (cm)',
                'Largura (cm)',
                'Profundidade (cm)',
                'Diâmetro (cm)',
                'Cúbico (m³)',
                'Peso',
                'NCM'
            ] + price_keys

            writer.writerow(headers)

            # Dados formatados
            for variant in variants:
                # Parse dimensões
                dims = DataFormatter.parse_dimensions(variant.dimensions or '')

                # Formatar descrição
                description = DataFormatter.clean_description(
                    variant.product.description if variant.product else ''
                )

                row = [
                    variant.code,
                    description,
                    dims['altura'] if dims['altura'] else '',
                    dims['largura'] if dims['largura'] else '',
                    dims['profundidade'] if dims['profundidade'] else '',
                    dims['diametro'] if dims['diametro'] else '',
                    DataFormatter.format_cubic(variant.cubic),
                    DataFormatter.format_weight(variant.weight),
                    DataFormatter.format_ncm(variant.ncm),
                ]

                # Adicionar preços formatados
                for key in price_keys:
                    price_value = variant.prices.get(key, '')
                    row.append(DataFormatter.format_price(price_value))

                writer.writerow(row)

        return response

    def _export_xml_formatted(self, variants, filename):
        """Exporta para XML com dados formatados"""
        root = Element('produtos')

        for variant in variants:
            product_elem = SubElement(root, 'produto')

            # Parse dimensões
            dims = DataFormatter.parse_dimensions(variant.dimensions or '')
            description = DataFormatter.clean_description(
                variant.product.description if variant.product else ''
            )

            # Elementos básicos
            SubElement(product_elem, 'codigo').text = str(variant.code)
            SubElement(product_elem, 'descricao').text = description

            # Dimensões separadas
            dimensoes_elem = SubElement(product_elem, 'dimensoes')
            if dims['altura']:
                SubElement(dimensoes_elem, 'altura', unidade='cm').text = str(dims['altura'])
            if dims['largura']:
                SubElement(dimensoes_elem, 'largura', unidade='cm').text = str(dims['largura'])
            if dims['profundidade']:
                SubElement(dimensoes_elem, 'profundidade', unidade='cm').text = str(dims['profundidade'])
            if dims['diametro']:
                SubElement(dimensoes_elem, 'diametro', unidade='cm').text = str(dims['diametro'])

            SubElement(product_elem, 'cubico').text = DataFormatter.format_cubic(variant.cubic)
            SubElement(product_elem, 'peso').text = DataFormatter.format_weight(variant.weight)
            SubElement(product_elem, 'ncm').text = DataFormatter.format_ncm(variant.ncm)

            # Preços formatados
            if variant.prices:
                precos_elem = SubElement(product_elem, 'precos')
                for key, value in variant.prices.items():
                    preco_elem = SubElement(precos_elem, 'preco')
                    preco_elem.set('tipo', key)
                    preco_elem.text = DataFormatter.format_price(value)

        # Formatar XML
        xml_str = minidom.parseString(tostring(root, encoding='utf-8')).toprettyxml(indent="  ", encoding='utf-8')

        response = HttpResponse(xml_str, content_type='application/xml')
        response['Content-Disposition'] = f'attachment; filename="{filename}_formatado.xml"'
        return response
