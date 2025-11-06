from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from rest_framework.renderers import JSONRenderer
from django.http import HttpResponse
import pandas as pd
import json
import csv
import traceback
from xml.etree.ElementTree import Element, SubElement, tostring
from xml.dom import minidom

from .models import SpreadsheetUpload, ColumnMapping, Product, ProductVariant, MappingTemplate
from .serializers import (
    SpreadsheetUploadSerializer, ColumnMappingSerializer,
    ProductSerializer, ProductVariantSerializer,
    ProductVariantExportSerializer, MappingTemplateSerializer
)
from .services.column_mapper_service import ColumnMapperService
from .utils.spreadsheet_detector import detect_spreadsheet_structure, remove_hidden_columns
from .utils.google_sheets_importer import GoogleSheetsImporter


class SpreadsheetUploadViewSet(viewsets.ModelViewSet):
    queryset = SpreadsheetUpload.objects.all()
    serializer_class = SpreadsheetUploadSerializer
    parser_classes = (MultiPartParser, FormParser, JSONParser)

    def create(self, request, *args, **kwargs):
        """Upload de planilha (arquivo ou URL do Google Sheets)"""
        file = request.FILES.get('file')
        google_sheets_url = request.data.get('google_sheets_url')

        # Caso 1: Upload de arquivo tradicional
        if file:
            return self._create_from_file(file)

        # Caso 2: Importar do Google Sheets
        elif google_sheets_url:
            return self._create_from_google_sheets(google_sheets_url)

        # Caso 3: Nenhum dos dois foi fornecido
        else:
            return Response(
                {'error': 'Você deve fornecer um arquivo ou uma URL do Google Sheets'},
                status=status.HTTP_400_BAD_REQUEST
            )

    def _create_from_file(self, file):
        """Cria upload a partir de arquivo enviado"""
        try:
            df = pd.read_excel(file, header=None)
            total_rows, total_columns = df.shape

            upload = SpreadsheetUpload.objects.create(
                file=file,
                original_filename=file.name,
                total_rows=total_rows,
                total_columns=total_columns
            )

            serializer = self.get_serializer(upload)
            return Response(serializer.data, status=status.HTTP_201_CREATED)

        except Exception as e:
            return Response(
                {'error': f'Erro ao processar arquivo: {str(e)}'},
                status=status.HTTP_400_BAD_REQUEST
            )

    def _create_from_google_sheets(self, url):
        """Cria upload a partir de URL do Google Sheets"""
        try:
            # Validar URL
            is_valid, error = GoogleSheetsImporter.validate_google_sheets_url(url)
            if not is_valid:
                return Response(
                    {'error': error},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Importar planilha
            content_file, filename, info = GoogleSheetsImporter.import_from_url(url)

            if 'error' in info:
                return Response(
                    {'error': info['error']},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Criar o upload
            upload = SpreadsheetUpload.objects.create(
                file=content_file,
                original_filename=filename,
                total_rows=info['total_rows'],
                total_columns=info['total_columns']
            )

            serializer = self.get_serializer(upload)
            response_data = serializer.data
            response_data['source'] = 'google_sheets'
            response_data['spreadsheet_id'] = info['spreadsheet_id']
            response_data['message'] = 'Planilha importada do Google Sheets com sucesso'

            return Response(response_data, status=status.HTTP_201_CREATED)

        except Exception as e:
            return Response(
                {'error': f'Erro ao importar do Google Sheets: {str(e)}'},
                status=status.HTTP_400_BAD_REQUEST
            )

    @action(detail=True, methods=['get'])
    def preview(self, request, pk=None):
        """Retorna preview da planilha com detecção automática de estrutura"""
        upload = self.get_object()

        try:
            df = pd.read_excel(upload.file.path, header=None)

            # REMOVER COLUNAS OCULTAS primeiro
            df, column_mapping = remove_hidden_columns(df, upload.file.path)

            # Detectar estrutura automaticamente
            structure = detect_spreadsheet_structure(df)
            header_row = structure['header_row']
            data_start_row = structure['data_start_row']

            # Verificar se deve remover colunas vazias
            remove_empty = request.query_params.get('remove_empty_columns', 'true').lower() == 'true'

            # Guardar o número original de colunas
            original_columns = len(df.columns)
            column_mapping_index = {}  # Mapeia índice original -> índice após remoção

            if remove_empty:
                # Identificar colunas completamente vazias
                non_empty_columns = []
                for col_idx in range(len(df.columns)):
                    has_data = df.iloc[:, col_idx].notna().any()
                    if has_data:
                        column_mapping_index[col_idx] = len(non_empty_columns)
                        non_empty_columns.append(col_idx)

                if len(non_empty_columns) < original_columns:
                    df = df.iloc[:, non_empty_columns]

            # Verificar se tem parâmetro start_row na query string
            start_row_param = request.query_params.get('start_row')

            # Determinar linha inicial
            if start_row_param is not None:
                start_row = int(start_row_param)
            else:
                # Usar detecção automática
                start_row = header_row

            # Validar start_row
            if start_row < 0 or start_row >= len(df):
                start_row = 0

            # Headers baseados na linha detectada
            headers = []
            if header_row < len(df):
                for i, val in enumerate(df.iloc[header_row]):
                    headers.append(str(val) if pd.notna(val) else f'Coluna {i}')
            else:
                headers = [f'Coluna {i}' for i in range(len(df.columns))]

            # Pegar 50 linhas a partir de start_row
            end_row = min(start_row + 50, len(df))
            rows = []

            for idx in range(start_row, end_row):
                row_data = {
                    'row_number': idx,
                    'data': [str(val) if pd.notna(val) else None for val in df.iloc[idx]]
                }
                rows.append(row_data)

            return Response({
                'headers': headers,
                'rows': rows,
                'start_row': start_row,
                'end_row': end_row - 1,
                'total_rows': len(df),
                'total_columns': len(df.columns),
                'original_columns': original_columns,
                'empty_columns_removed': remove_empty and (original_columns > len(df.columns)),
                'column_mapping': column_mapping_index if remove_empty else None,
                'has_mapping': hasattr(upload, 'column_mapping'),
                'detected_structure': {
                    'header_row': header_row,
                    'data_start_row': data_start_row,
                    'total_data_rows': structure['total_data_rows']
                }
            })

        except Exception as e:
            return Response(
                {'error': f'Erro ao ler arquivo: {str(e)}'},
                status=status.HTTP_400_BAD_REQUEST
            )

    @action(detail=True, methods=['get'])
    def preview_with_mapping(self, request, pk=None):
        """Preview da planilha com o mapeamento aplicado"""
        upload = self.get_object()

        try:
            # Verificar se existe mapeamento
            if not hasattr(upload, 'column_mapping'):
                return Response(
                    {'error': 'Nenhum mapeamento de colunas definido. Configure o mapeamento primeiro.'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            mapping = upload.column_mapping
            df = pd.read_excel(upload.file.path, header=None)

            # Verificar se tem parâmetro start_row na query string
            start_row_param = request.query_params.get('start_row')
            if start_row_param is not None:
                start_row = int(start_row_param)
            else:
                start_row = mapping.data_start_row

            # Validar start_row
            if start_row < 0 or start_row >= len(df):
                start_row = mapping.data_start_row

            # Limitar preview a 50 linhas
            preview_rows = []
            end_row = min(start_row + 50, len(df))

            for idx in range(start_row, end_row):
                row = df.iloc[idx]

                # Extrair dados mapeados
                row_data = {
                    'row_number': int(idx),
                    'code': str(row.iloc[mapping.code_column]) if mapping.code_column is not None and pd.notna(row.iloc[mapping.code_column]) else None,
                    'description': str(row.iloc[mapping.description_column]) if mapping.description_column is not None and pd.notna(row.iloc[mapping.description_column]) else None,
                    'dimensions': str(row.iloc[mapping.dimensions_column]) if mapping.dimensions_column is not None and pd.notna(row.iloc[mapping.dimensions_column]) else None,
                    'cubic': float(row.iloc[mapping.cubic_column]) if mapping.cubic_column is not None and pd.notna(row.iloc[mapping.cubic_column]) else None,
                    'weight': float(row.iloc[mapping.weight_column]) if mapping.weight_column is not None and pd.notna(row.iloc[mapping.weight_column]) else None,
                    'ncm': str(row.iloc[mapping.ncm_column]) if mapping.ncm_column is not None and pd.notna(row.iloc[mapping.ncm_column]) else None,
                    'prices': {}
                }

                # Extrair preços
                for price_col in mapping.price_columns:
                    col_idx = price_col['index']
                    col_name = price_col['name']
                    if col_idx < len(row) and pd.notna(row.iloc[col_idx]):
                        try:
                            row_data['prices'][col_name] = float(row.iloc[col_idx])
                        except (ValueError, TypeError):
                            row_data['prices'][col_name] = str(row.iloc[col_idx])

                preview_rows.append(row_data)

            return Response({
                'mapping': ColumnMappingSerializer(mapping).data,
                'preview': preview_rows,
                'start_row': start_row,
                'end_row': end_row - 1,
                'total_rows': len(df),
                'total_rows_to_process': len(df) - mapping.data_start_row,
                'message': 'Preview dos dados com mapeamento aplicado'
            })

        except Exception as e:
            return Response(
                {'error': f'Erro ao gerar preview: {str(e)}', 'traceback': traceback.format_exc()},
                status=status.HTTP_400_BAD_REQUEST
            )

    @action(detail=True, methods=['get'])
    def suggest_mapping(self, request, pk=None):
        """
        Sugere mapeamento automático de colunas usando IA
        Analisa nomes de colunas e conteúdo para identificar os campos automaticamente
        """
        upload = self.get_object()

        try:
            # Carregar planilha
            df = pd.read_excel(upload.file.path, header=None)

            # REMOVER COLUNAS OCULTAS primeiro
            df, column_mapping = remove_hidden_columns(df, upload.file.path)

            # Detectar estrutura automaticamente
            structure = detect_spreadsheet_structure(df)

            # Parâmetros opcionais (usar detecção se não fornecidos)
            header_row = int(request.query_params.get('header_row', structure['header_row']))
            sample_rows = int(request.query_params.get('sample_rows', 10))
            min_confidence = float(request.query_params.get('min_confidence', 0.5))

            # Criar serviço de mapeamento
            mapper = ColumnMapperService(df, header_row=header_row, sample_rows=sample_rows)

            # Obter sugestões
            suggestions = mapper.suggest_mapping(min_confidence=min_confidence)

            return Response({
                'success': True,
                'message': 'Mapeamento sugerido com sucesso',
                'suggestions': suggestions['suggested_mapping'],
                'confidence_scores': suggestions['confidence_scores'],
                'headers': suggestions['headers'],
                'analysis': {
                    'total_columns': len(suggestions['headers']),
                    'columns_mapped': sum(1 for v in suggestions['suggested_mapping'].values() if v is not None),
                    'price_columns_found': len(suggestions['suggested_mapping'].get('price_columns', []))
                },
                'detected_structure': {
                    'header_row': structure['header_row'],
                    'data_start_row': structure['data_start_row']
                },
                'debug': {
                    'all_columns_analysis': suggestions['all_columns_analysis']
                } if request.query_params.get('debug') == 'true' else None
            })

        except Exception as e:
            return Response(
                {
                    'error': f'Erro ao sugerir mapeamento: {str(e)}',
                    'traceback': traceback.format_exc()
                },
                status=status.HTTP_400_BAD_REQUEST
            )

    @action(detail=True, methods=['post'])
    def apply_suggested_mapping(self, request, pk=None):
        """
        Aplica automaticamente o mapeamento sugerido pelo sistema
        Pode receber sugestões no body ou gerar novas automaticamente
        """
        upload = self.get_object()

        try:
            # Verificar se as sugestões foram enviadas no body
            suggestions = request.data.get('suggested_mapping')

            # Se não foram enviadas, gerar automaticamente
            if not suggestions:
                df = pd.read_excel(upload.file.path, header=None)

                # REMOVER COLUNAS OCULTAS primeiro
                df, column_mapping = remove_hidden_columns(df, upload.file.path)

                # Detectar estrutura automaticamente
                structure = detect_spreadsheet_structure(df)

                header_row = int(request.data.get('header_row', structure['header_row']))
                sample_rows = int(request.data.get('sample_rows', 10))
                min_confidence = float(request.data.get('min_confidence', 0.5))

                mapper = ColumnMapperService(df, header_row=header_row, sample_rows=sample_rows)
                suggestions_data = mapper.suggest_mapping(min_confidence=min_confidence)
                suggestions = suggestions_data['suggested_mapping']

            # Criar ou atualizar mapeamento
            mapping, created = ColumnMapping.objects.get_or_create(upload=upload)

            # Aplicar sugestões
            mapping.code_column = suggestions.get('code_column')
            mapping.description_column = suggestions.get('description_column')
            mapping.dimensions_column = suggestions.get('dimensions_column')
            mapping.cubic_column = suggestions.get('cubic_column')
            mapping.weight_column = suggestions.get('weight_column')
            mapping.ncm_column = suggestions.get('ncm_column')
            mapping.price_columns = suggestions.get('price_columns', [])
            mapping.data_start_row = suggestions.get('data_start_row', 0)

            mapping.save()

            serializer = ColumnMappingSerializer(mapping)

            return Response({
                'success': True,
                'message': 'Mapeamento automático aplicado com sucesso',
                'mapping': serializer.data,
                'action': 'created' if created else 'updated'
            }, status=status.HTTP_200_OK)

        except Exception as e:
            return Response(
                {
                    'error': f'Erro ao aplicar mapeamento: {str(e)}',
                    'traceback': traceback.format_exc()
                },
                status=status.HTTP_400_BAD_REQUEST
            )

    @action(detail=True, methods=['post'])
    def process(self, request, pk=None):
        """Processa a planilha com base no mapeamento de colunas"""
        upload = self.get_object()

        try:
            # Verificar se existe mapeamento
            if not hasattr(upload, 'column_mapping'):
                return Response({
                    'error': 'Mapeamento não configurado',
                    'message': 'Configure o mapeamento de colunas antes de processar a planilha.',
                    'next_step': 'Use o endpoint /api/mappings/create_or_update/ para configurar o mapeamento'
                }, status=status.HTTP_400_BAD_REQUEST)

            mapping = upload.column_mapping

            # Validar mapeamento
            if mapping.code_column is None:
                return Response({
                    'error': 'Mapeamento incompleto',
                    'message': 'A coluna de Código é obrigatória para processar a planilha.',
                    'missing_fields': ['code_column']
                }, status=status.HTTP_400_BAD_REQUEST)

            # Ler a planilha sem usar a primeira linha como header
            df = pd.read_excel(upload.file.path, header=None)

            # REMOVER COLUNAS OCULTAS primeiro
            df, column_mapping_hidden = remove_hidden_columns(df, upload.file.path)

            # Limpar produtos e variantes anteriores
            upload.products.all().delete()
            upload.variants.all().delete()

            # Processar dados
            current_product = None
            variants_created = 0
            rows_processed = 0
            rows_skipped = 0
            errors = []

            total_rows = len(df) - mapping.data_start_row

            for idx, row in df.iloc[mapping.data_start_row:].iterrows():
                rows_processed += 1

                try:
                    # Extrair código
                    code = str(row.iloc[mapping.code_column]) if pd.notna(row.iloc[mapping.code_column]) else None
                    if not code or code == 'nan':
                        rows_skipped += 1
                        continue

                    # Extrair descrição
                    description = None
                    if mapping.description_column is not None:
                        description = str(row.iloc[mapping.description_column]) if pd.notna(row.iloc[mapping.description_column]) else None

                    # Se tem descrição, é um novo produto
                    if description and description != 'nan':
                        current_product = Product.objects.create(
                            upload=upload,
                            description=description
                        )

                    # Extrair outros dados
                    dimensions = str(row.iloc[mapping.dimensions_column]) if mapping.dimensions_column is not None and pd.notna(row.iloc[mapping.dimensions_column]) else None

                    # Extrair cubic com tratamento de erro
                    cubic = None
                    if mapping.cubic_column is not None and pd.notna(row.iloc[mapping.cubic_column]):
                        try:
                            cubic = float(row.iloc[mapping.cubic_column])
                        except (ValueError, TypeError):
                            cubic = None

                    # Extrair weight com tratamento de erro
                    weight = None
                    if mapping.weight_column is not None and pd.notna(row.iloc[mapping.weight_column]):
                        try:
                            weight = float(row.iloc[mapping.weight_column])
                        except (ValueError, TypeError):
                            weight = None

                    ncm = str(row.iloc[mapping.ncm_column]) if mapping.ncm_column is not None and pd.notna(row.iloc[mapping.ncm_column]) else None

                    # Extrair preços
                    prices = {}
                    for price_col in mapping.price_columns:
                        col_idx = price_col['index']
                        col_name = price_col['name']
                        if col_idx < len(row) and pd.notna(row.iloc[col_idx]):
                            try:
                                prices[col_name] = float(row.iloc[col_idx])
                            except (ValueError, TypeError):
                                prices[col_name] = str(row.iloc[col_idx])

                    # Criar variante
                    ProductVariant.objects.create(
                        product=current_product,
                        upload=upload,
                        code=code,
                        dimensions=dimensions,
                        cubic=cubic,
                        weight=weight,
                        ncm=ncm,
                        prices=prices,
                        raw_data={str(i): str(val) if pd.notna(val) else None for i, val in enumerate(row)},
                        row_number=int(idx)
                    )
                    variants_created += 1

                except Exception as e:
                    error_msg = f"Linha {idx}: {str(e)}"
                    errors.append(error_msg)
                    if len(errors) > 10:  # Limitar a 10 erros
                        errors.append(f"... e mais {rows_processed - variants_created - rows_skipped - len(errors)} erros")
                        break

            response_data = {
                'success': True,
                'message': 'Processamento concluído com sucesso',
                'statistics': {
                    'total_rows': total_rows,
                    'rows_processed': rows_processed,
                    'products_created': upload.products.count(),
                    'variants_created': variants_created,
                    'rows_skipped': rows_skipped,
                    'errors_count': len(errors)
                }
            }

            if errors:
                response_data['warnings'] = errors

            return Response(response_data)

        except Exception as e:
            import traceback
            return Response(
                {'error': f'Erro ao processar dados: {str(e)}', 'traceback': traceback.format_exc()},
                status=status.HTTP_400_BAD_REQUEST
            )

    @action(detail=True, methods=['get'], url_path='export')
    def export_data(self, request, pk=None):
        """Exporta os dados processados em diferentes formatos"""
        try:
            upload = self.get_object()
            format_type = request.query_params.get('format', 'json').lower()

            # Buscar todas as variantes
            variants = ProductVariant.objects.filter(upload=upload).select_related('product')

            if not variants.exists():
                return Response(
                    {'error': 'Nenhuma variante encontrada para exportação'},
                    status=status.HTTP_404_NOT_FOUND
                )

            if format_type == 'csv':
                return self._export_csv(variants, upload.original_filename)
            elif format_type == 'xml':
                return self._export_xml(variants, upload.original_filename)
            elif format_type == 'json':
                # Para JSON, usar Response normal
                return Response(self._export_json_data(variants))
            else:
                return HttpResponse(
                    json.dumps({'error': 'Formato não suportado. Use: csv, xml ou json'}),
                    content_type='application/json',
                    status=400
                )
        except Exception as e:
            import traceback
            return Response(
                {
                    'error': f'Erro ao exportar dados: {str(e)}',
                    'traceback': traceback.format_exc()
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def _export_csv(self, variants, filename):
        """Exporta para CSV"""
        try:
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
                    try:
                        row = [
                            variant.code or '',
                            variant.product.description if variant.product else '',
                            variant.dimensions or '',
                            str(variant.cubic) if variant.cubic is not None else '',
                            str(variant.weight) if variant.weight is not None else '',
                            variant.ncm or '',
                        ]
                        # Adicionar preços
                        for key in price_keys:
                            value = variant.prices.get(key, '') if variant.prices else ''
                            row.append(str(value) if value != '' else '')

                        writer.writerow(row)
                    except Exception as e:
                        print(f"Erro ao processar variante {variant.id}: {str(e)}")
                        continue

            return response
        except Exception as e:
            print(f"Erro geral no _export_csv: {str(e)}")
            raise

    def _export_xml(self, variants, filename):
        """Exporta para XML"""
        try:
            root = Element('products')

            for variant in variants:
                try:
                    product_elem = SubElement(root, 'product')

                    SubElement(product_elem, 'code').text = variant.code or ''
                    SubElement(product_elem, 'description').text = variant.product.description if variant.product else ''
                    SubElement(product_elem, 'dimensions').text = variant.dimensions or ''
                    SubElement(product_elem, 'cubic').text = str(variant.cubic) if variant.cubic is not None else ''
                    SubElement(product_elem, 'weight').text = str(variant.weight) if variant.weight is not None else ''
                    SubElement(product_elem, 'ncm').text = variant.ncm or ''

                    # Preços
                    if variant.prices:
                        prices_elem = SubElement(product_elem, 'prices')
                        for key, value in variant.prices.items():
                            price_elem = SubElement(prices_elem, 'price')
                            price_elem.set('type', key)
                            price_elem.text = str(value) if value is not None else ''
                except Exception as e:
                    print(f"Erro ao processar variante {variant.id} no XML: {str(e)}")
                    continue

            # Formatar XML
            xml_str = minidom.parseString(tostring(root)).toprettyxml(indent="  ")

            response = HttpResponse(xml_str, content_type='application/xml')
            response['Content-Disposition'] = f'attachment; filename="{filename}_export.xml"'
            return response
        except Exception as e:
            print(f"Erro geral no _export_xml: {str(e)}")
            raise

    def _export_json_data(self, variants):
        """Exporta para JSON"""
        serializer = ProductVariantExportSerializer(variants, many=True)
        return serializer.data


class MappingTemplateViewSet(viewsets.ModelViewSet):
    """ViewSet para gerenciar templates de mapeamento"""
    queryset = MappingTemplate.objects.all()
    serializer_class = MappingTemplateSerializer


class ColumnMappingViewSet(viewsets.ModelViewSet):
    queryset = ColumnMapping.objects.all()
    serializer_class = ColumnMappingSerializer

    @action(detail=False, methods=['post'])
    def create_or_update(self, request):
        """Cria ou atualiza o mapeamento de colunas para um upload"""
        upload_id = request.data.get('upload')

        if not upload_id:
            return Response(
                {'error': 'upload_id é obrigatório'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            upload = SpreadsheetUpload.objects.get(id=upload_id)
        except SpreadsheetUpload.DoesNotExist:
            return Response(
                {'error': 'Upload não encontrado'},
                status=status.HTTP_404_NOT_FOUND
            )

        # Criar ou atualizar
        mapping, created = ColumnMapping.objects.get_or_create(upload=upload)

        serializer = self.get_serializer(mapping, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['post'])
    def apply_template(self, request):
        """Aplica um template a um mapeamento"""
        upload_id = request.data.get('upload_id')
        template_id = request.data.get('template_id')

        if not upload_id or not template_id:
            return Response(
                {'error': 'upload_id e template_id são obrigatórios'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            upload = SpreadsheetUpload.objects.get(id=upload_id)
            template = MappingTemplate.objects.get(id=template_id)
        except SpreadsheetUpload.DoesNotExist:
            return Response(
                {'error': 'Upload não encontrado'},
                status=status.HTTP_404_NOT_FOUND
            )
        except MappingTemplate.DoesNotExist:
            return Response(
                {'error': 'Template não encontrado'},
                status=status.HTTP_404_NOT_FOUND
            )

        # Criar ou atualizar mapeamento com o template
        mapping, created = ColumnMapping.objects.get_or_create(upload=upload)
        mapping = template.apply_to_mapping(mapping)
        mapping.template = template
        mapping.save()

        serializer = self.get_serializer(mapping)
        return Response({
            'message': f'Template "{template.name}" aplicado com sucesso',
            'mapping': serializer.data
        }, status=status.HTTP_200_OK)


class ProductViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer
    pagination_class = None  # Desabilitar paginação

    def get_queryset(self):
        queryset = super().get_queryset()
        upload_id = self.request.query_params.get('upload_id')
        if upload_id:
            queryset = queryset.filter(upload_id=upload_id)
        return queryset.prefetch_related('variants')
