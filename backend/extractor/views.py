from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from rest_framework.renderers import JSONRenderer
from django.http import HttpResponse
import pandas as pd
import json
import csv
import logging
import traceback
from xml.etree.ElementTree import Element, SubElement, tostring
from xml.dom import minidom

logger = logging.getLogger(__name__)

from .models import SpreadsheetUpload, ColumnMapping, Product, ProductVariant
from .serializers import (
    SpreadsheetUploadSerializer, ColumnMappingSerializer,
    ProductSerializer, ProductVariantSerializer,
    ProductVariantExportSerializer
)
from .services.column_mapper_service import ColumnMapperService
from .utils.spreadsheet_detector import detect_spreadsheet_structure, remove_hidden_columns, get_sheet_names, read_specific_sheet
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
            # Salvar arquivo temporariamente para detectar colunas ocultas
            from django.core.files.uploadedfile import InMemoryUploadedFile
            import tempfile
            import os

            # Se for arquivo em memória, salvar temporariamente
            if isinstance(file, InMemoryUploadedFile):
                with tempfile.NamedTemporaryFile(delete=False, suffix='.xlsx') as tmp_file:
                    for chunk in file.chunks():
                        tmp_file.write(chunk)
                    tmp_path = tmp_file.name

                # Resetar ponteiro do arquivo
                file.seek(0)

                # Carregar e filtrar colunas ocultas
                df_full = pd.read_excel(tmp_path, header=None)
                df, column_mapping = remove_hidden_columns(df_full, tmp_path)

                # Remover arquivo temporário
                os.unlink(tmp_path)
            else:
                # Arquivo já salvo em disco
                df_full = pd.read_excel(file, header=None)
                df, column_mapping = remove_hidden_columns(df_full, file.temporary_file_path())

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
    def sheets(self, request, pk=None):
        """Retorna lista de abas/sheets disponíveis na planilha"""
        upload = self.get_object()

        try:
            sheets = get_sheet_names(upload.file.path)

            return Response({
                'success': True,
                'sheets': sheets,
                'total_sheets': len(sheets)
            })

        except Exception as e:
            return Response(
                {'error': f'Erro ao listar abas: {str(e)}'},
                status=status.HTTP_400_BAD_REQUEST
            )

    @action(detail=True, methods=['get'])
    def preview(self, request, pk=None):
        """Retorna preview da planilha com detecção automática de estrutura"""
        upload = self.get_object()
        sheet_index = request.query_params.get('sheet', 0)

        try:
            # Ler aba específica se fornecida
            if sheet_index:
                try:
                    sheet_index = int(sheet_index)
                    df = read_specific_sheet(upload.file.path, sheet_index)
                except (ValueError, IndexError):
                    df = pd.read_excel(upload.file.path, header=None)
            else:
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
            # Verificar se foi especificada uma aba
            sheet_index = request.query_params.get('sheet', 0)

            # Carregar planilha (aba específica se fornecida)
            if sheet_index:
                try:
                    sheet_index = int(sheet_index)
                    df = read_specific_sheet(upload.file.path, sheet_index)
                except (ValueError, IndexError):
                    df = pd.read_excel(upload.file.path, header=None)
            else:
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

            # Obter sugestões 100% DINÂMICAS da IA
            suggestions = mapper.suggest_mapping(min_confidence=min_confidence)

            headers = suggestions['headers']
            analysis_method = suggestions.get('analysis_method', 'traditional')

            # Preparar dynamic_fields - TODOS os campos detectados pela IA
            dynamic_fields = []
            if 'all_columns_analysis' in suggestions:
                for col_analysis in suggestions['all_columns_analysis']:
                    # Estrutura diferente dependendo do método de análise
                    if analysis_method == 'gemini_ai':
                        # Gemini retorna: {index, header, type, confidence, reasoning}
                        dynamic_fields.append({
                            'index': col_analysis['index'],
                            'name': col_analysis['header'],
                            'type': col_analysis.get('type', 'other'),
                            'confidence': col_analysis.get('confidence', 0.0)
                        })
                    else:
                        # Tradicional retorna: {index, header, content_analysis, scores}
                        # Precisamos inferir o tipo baseado nos scores
                        best_type = 'other'
                        best_score = 0.0
                        for field_type, score_data in col_analysis.get('scores', {}).items():
                            if score_data['total'] > best_score:
                                best_score = score_data['total']
                                best_type = field_type

                        dynamic_fields.append({
                            'index': col_analysis['index'],
                            'name': col_analysis['header'],
                            'type': best_type,
                            'confidence': best_score
                        })

            logger.info(f"IA detectou {len(dynamic_fields)} campos dinâmicos (método: {analysis_method})")

            return Response({
                'success': True,
                'message': f'IA detectou {len(dynamic_fields)} campos automaticamente',
                'dynamic_fields': dynamic_fields,  # ÚNICO retorno - todos os campos detectados
                'data_start_row': header_row + 1,  # Próxima linha após header
                'analysis_method': analysis_method,  # gemini_ai ou traditional
                'total_columns_detected': len(dynamic_fields)
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

    @action(detail=True, methods=['post'], url_path='link-company')
    def link_company(self, request, pk=None):
        """Vincula uma empresa a uma exportação"""
        upload = self.get_object()
        company_name = request.data.get('company_name')

        if not company_name:
            return Response(
                {'error': 'Nome da empresa é obrigatório'},
                status=status.HTTP_400_BAD_REQUEST
            )

        upload.company_name = company_name
        upload.save()

        return Response({
            'success': True,
            'message': f'Empresa "{company_name}" vinculada com sucesso'
        })

    @action(detail=True, methods=['post'], url_path='update-products', parser_classes=[MultiPartParser, FormParser])
    def update_products(self, request, pk=None):
        """
        Atualiza produtos existentes com base em uma nova planilha
        - Se o produto (código) já existe: atualiza apenas campos diferentes
        - Se o produto não existe: cria novo produto
        - Mantém produtos existentes que não estão na nova planilha
        """
        upload = self.get_object()
        file = request.FILES.get('file')

        if not file:
            return Response(
                {'error': 'Arquivo não fornecido'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            # Verificar se existe mapeamento
            if not hasattr(upload, 'column_mapping'):
                return Response({
                    'error': 'Mapeamento não configurado para este upload',
                    'message': 'Configure o mapeamento primeiro antes de atualizar produtos'
                }, status=status.HTTP_400_BAD_REQUEST)

            mapping = upload.column_mapping

            # Ler a nova planilha
            import tempfile
            import os

            # Salvar arquivo temporariamente
            with tempfile.NamedTemporaryFile(delete=False, suffix='.xlsx') as tmp_file:
                for chunk in file.chunks():
                    tmp_file.write(chunk)
                tmp_path = tmp_file.name

            # Carregar e processar planilha
            df_full = pd.read_excel(tmp_path, header=None)
            df, _ = remove_hidden_columns(df_full, tmp_path)

            # Remover arquivo temporário
            os.unlink(tmp_path)

            # Contadores
            updated_count = 0
            unchanged_count = 0
            new_count = 0

            # Processar linhas
            for idx, row in df.iloc[mapping.data_start_row:].iterrows():
                try:
                    # Extrair dados da linha
                    fields_data = {}
                    product_data = {
                        'code': None,
                        'description': None,
                        'cubic': None,
                        'weight': None,
                        'ncm': None
                    }

                    for field_config in mapping.dynamic_fields:
                        field_index = field_config.get('index')
                        field_name = field_config.get('name')
                        field_type = field_config.get('type', 'other')

                        if field_index is not None and field_index < len(row):
                            value = row.iloc[field_index]

                            if pd.isna(value) or str(value) == 'nan' or str(value).strip() == '':
                                continue

                            # Mapear campos especiais
                            if field_type == 'code' or 'codigo' in field_name.lower() or 'código' in field_name.lower():
                                product_data['code'] = str(value).strip()
                            elif field_type == 'description' or 'descri' in field_name.lower():
                                product_data['description'] = str(value).strip()
                            elif field_type == 'cubic' or 'cubagem' in field_name.lower():
                                product_data['cubic'] = str(value).strip()
                            elif field_type == 'weight' or 'peso' in field_name.lower():
                                product_data['weight'] = str(value).strip()
                            elif field_type == 'ncm' in field_name.lower():
                                product_data['ncm'] = str(value).strip()
                            else:
                                # Campo dinâmico da variante
                                fields_data[field_name] = str(value).strip()

                    # Pular linhas sem código
                    if not product_data['code']:
                        continue

                    # Verificar se produto já existe
                    existing_product = Product.objects.filter(
                        upload=upload,
                        code=product_data['code']
                    ).first()

                    if existing_product:
                        # Atualizar apenas se houver diferença
                        has_changes = False

                        if product_data['description'] and existing_product.description != product_data['description']:
                            existing_product.description = product_data['description']
                            has_changes = True

                        if product_data['cubic'] and existing_product.cubic != product_data['cubic']:
                            existing_product.cubic = product_data['cubic']
                            has_changes = True

                        if product_data['weight'] and existing_product.weight != product_data['weight']:
                            existing_product.weight = product_data['weight']
                            has_changes = True

                        if product_data['ncm'] and existing_product.ncm != product_data['ncm']:
                            existing_product.ncm = product_data['ncm']
                            has_changes = True

                        if has_changes:
                            existing_product.save()
                            updated_count += 1
                        else:
                            unchanged_count += 1

                        # Atualizar ou criar variante se houver campos dinâmicos
                        if fields_data:
                            # Verificar se variante com mesmos campos já existe
                            existing_variant = ProductVariant.objects.filter(
                                product=existing_product,
                                fields=fields_data
                            ).first()

                            if not existing_variant:
                                ProductVariant.objects.create(
                                    upload=upload,
                                    product=existing_product,
                                    fields=fields_data,
                                    raw_data=row.to_dict(),
                                    row_number=int(idx)
                                )

                    else:
                        # Criar novo produto
                        new_product = Product.objects.create(
                            upload=upload,
                            code=product_data['code'],
                            description=product_data['description'],
                            cubic=product_data['cubic'],
                            weight=product_data['weight'],
                            ncm=product_data['ncm']
                        )

                        # Criar variante se houver campos dinâmicos
                        if fields_data:
                            ProductVariant.objects.create(
                                upload=upload,
                                product=new_product,
                                fields=fields_data,
                                raw_data=row.to_dict(),
                                row_number=int(idx)
                            )

                        new_count += 1

                except Exception as e:
                    logger.error(f"Erro ao processar linha {idx}: {str(e)}")
                    continue

            return Response({
                'success': True,
                'message': f'Atualização concluída: {updated_count} atualizados, {new_count} novos, {unchanged_count} inalterados',
                'updated': updated_count,
                'new': new_count,
                'unchanged': unchanged_count
            })

        except Exception as e:
            logger.error(f"Erro ao atualizar produtos: {str(e)}")
            logger.error(traceback.format_exc())
            return Response(
                {'error': f'Erro ao atualizar produtos: {str(e)}'},
                status=status.HTTP_400_BAD_REQUEST
            )

    @action(detail=False, methods=['get'], url_path='export-history')
    def export_history(self, request):
        """Lista histórico de exportações processadas"""
        from django.db.models import Count
        from .serializers import ExportHistorySerializer

        # Buscar uploads processados com contagem de produtos e variantes
        history = SpreadsheetUpload.objects.filter(
            processed=True
        ).annotate(
            products_count=Count('products', distinct=True),
            variants_count=Count('variants', distinct=True)
        ).order_by('-processed_at')

        serializer = ExportHistorySerializer(history, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'], url_path='global-catalog')
    def global_catalog(self, request):
        """
        Retorna todos os produtos de todas as planilhas processadas
        Suporta filtros: company, start_date, end_date, search
        """
        from django.db.models import Q
        from datetime import datetime

        # Iniciar queryset com todos os produtos
        products = Product.objects.all()

        # Filtro por empresa
        company = request.query_params.get('company')
        if company:
            products = products.filter(upload__company_name__icontains=company)

        # Filtro por data inicial
        start_date = request.query_params.get('start_date')
        if start_date:
            try:
                start = datetime.fromisoformat(start_date.replace('Z', '+00:00'))
                products = products.filter(upload__processed_at__gte=start)
            except ValueError:
                pass

        # Filtro por data final
        end_date = request.query_params.get('end_date')
        if end_date:
            try:
                end = datetime.fromisoformat(end_date.replace('Z', '+00:00'))
                products = products.filter(upload__processed_at__lte=end)
            except ValueError:
                pass

        # Filtro por pesquisa (código, descrição, NCM)
        search = request.query_params.get('search')
        if search:
            products = products.filter(
                Q(code__icontains=search) |
                Q(description__icontains=search) |
                Q(ncm__icontains=search)
            )

        # Ordenar por data de processamento (mais recente primeiro)
        products = products.select_related('upload').prefetch_related('variants').order_by('-upload__processed_at')

        # Paginação
        page = int(request.query_params.get('page', 1))
        page_size = int(request.query_params.get('page_size', 20))

        start_idx = (page - 1) * page_size
        end_idx = start_idx + page_size

        paginated_products = products[start_idx:end_idx]
        total_count = products.count()

        serializer = ProductSerializer(paginated_products, many=True, context={'request': request})

        return Response({
            'results': serializer.data,
            'count': total_count,
            'page': page,
            'page_size': page_size,
            'total_pages': (total_count + page_size - 1) // page_size
        })

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

            # Validar que temos dynamic_fields configurados
            if not mapping.dynamic_fields:
                return Response({
                    'error': 'Mapeamento incompleto',
                    'message': 'Nenhum campo dinâmico configurado. Execute a sugestão de mapeamento com IA primeiro.',
                    'missing_fields': ['dynamic_fields']
                }, status=status.HTTP_400_BAD_REQUEST)

            # Ler a planilha sem usar a primeira linha como header
            # Usar a aba especificada no mapeamento
            sheet_index = mapping.sheet_index
            if sheet_index:
                try:
                    df = read_specific_sheet(upload.file.path, sheet_index)
                except (ValueError, IndexError):
                    df = pd.read_excel(upload.file.path, header=None)
            else:
                df = pd.read_excel(upload.file.path, header=None)

            # REMOVER COLUNAS OCULTAS primeiro
            df, column_mapping_hidden = remove_hidden_columns(df, upload.file.path)

            # Limpar produtos e variantes anteriores
            upload.products.all().delete()
            upload.variants.all().delete()

            # Processar dados 100% DINÂMICOS baseado em dynamic_fields detectados pela IA
            current_product = None
            variants_created = 0
            rows_processed = 0
            rows_skipped = 0
            errors = []

            total_rows = len(df) - mapping.data_start_row

            logger.info(f"Processando {total_rows} linhas com {len(mapping.dynamic_fields)} campos dinâmicos")

            for idx, row in df.iloc[mapping.data_start_row:].iterrows():
                rows_processed += 1

                try:
                    # Extrair TODOS os campos dinamicamente baseado em dynamic_fields
                    fields_data = {}
                    description_for_product = None  # Para agrupamento de produtos se houver
                    product_data = {
                        'code': None,
                        'cubic': None,
                        'weight': None,
                        'ncm': None
                    }

                    for field_config in mapping.dynamic_fields:
                        field_index = field_config.get('index')
                        field_name = field_config.get('name')
                        field_type = field_config.get('type', 'other')

                        if field_index is not None and field_index < len(row):
                            value = row.iloc[field_index]

                            # Pular valores vazios
                            if pd.isna(value) or str(value) == 'nan' or str(value).strip() == '':
                                continue

                            # Converter valor baseado no tipo
                            try:
                                if field_type in ['price', 'cubic', 'weight']:
                                    # Campos numéricos
                                    fields_data[field_name] = float(value)
                                else:
                                    # Campos de texto
                                    fields_data[field_name] = str(value).strip()

                                # Salvar campos específicos do produto
                                if field_type == 'description':
                                    description_for_product = str(value).strip()
                                elif field_type == 'code':
                                    product_data['code'] = str(value).strip()
                                elif field_type == 'cubic':
                                    product_data['cubic'] = str(value).strip()
                                elif field_type == 'weight':
                                    product_data['weight'] = str(value).strip()
                                elif field_type == 'ncm':
                                    product_data['ncm'] = str(value).strip()

                            except (ValueError, TypeError):
                                # Se falhar conversão, salvar como string
                                fields_data[field_name] = str(value).strip()

                    # Verificar se linha tem algum dado
                    if not fields_data:
                        rows_skipped += 1
                        continue

                    # Se tem descrição, criar novo produto
                    if description_for_product:
                        current_product = Product.objects.create(
                            upload=upload,
                            description=description_for_product,
                            code=product_data['code'],
                            cubic=product_data['cubic'],
                            weight=product_data['weight'],
                            ncm=product_data['ncm']
                        )

                    # Criar variante com TODOS os campos dinâmicos
                    ProductVariant.objects.create(
                        product=current_product,
                        upload=upload,
                        fields=fields_data,  # ÚNICO campo de dados - tudo dinâmico!
                        raw_data={str(i): str(val) if pd.notna(val) else None for i, val in enumerate(row)},
                        row_number=int(idx)
                    )
                    variants_created += 1

                except Exception as e:
                    error_msg = f"Linha {idx}: {str(e)}"
                    errors.append(error_msg)
                    logger.error(error_msg)
                    if len(errors) > 10:  # Limitar a 10 erros
                        errors.append(f"... e mais {rows_processed - variants_created - rows_skipped - len(errors)} erros")
                        break

            # Marcar como processado
            from django.utils import timezone
            upload.processed = True
            upload.processed_at = timezone.now()
            upload.save()

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
        """
        Exporta para CSV com campos 100% DINÂMICOS detectados pela IA
        Usa os nomes ORIGINAIS das colunas da planilha
        """
        try:
            response = HttpResponse(content_type='text/csv; charset=utf-8')
            response['Content-Disposition'] = f'attachment; filename="{filename}_export.csv"'

            writer = csv.writer(response)

            if variants.exists():
                logger.info(f"Exportando {variants.count()} variantes com campos dinâmicos")

                # Coletar TODAS as chaves únicas de todos os variants
                all_keys = set()
                for v in variants:
                    if v.fields:
                        all_keys.update(v.fields.keys())

                # Ordenar headers para manter consistência
                headers = sorted(list(all_keys))

                # Escrever header (nomes ORIGINAIS da planilha)
                writer.writerow(headers)

                # Escrever dados
                for variant in variants:
                    row = [variant.fields.get(key, '') if variant.fields else '' for key in headers]
                    writer.writerow(row)

            return response
        except Exception as e:
            logger.error(f"Erro ao exportar CSV: {e}")
            raise

    def _export_xml(self, variants, filename):
        """
        Exporta para XML com campos 100% DINÂMICOS detectados pela IA
        Usa os nomes ORIGINAIS das colunas da planilha
        """
        try:
            root = Element('products')

            for variant in variants:
                try:
                    product_elem = SubElement(root, 'product')

                    # Adicionar TODOS os campos dinâmicos
                    if variant.fields:
                        for field_name, field_value in variant.fields.items():
                            # Sanitizar nome do campo para ser tag XML válida
                            tag_name = self._sanitize_xml_tag(field_name)
                            SubElement(product_elem, tag_name).text = str(field_value) if field_value is not None else ''

                except Exception as e:
                    logger.error(f"Erro ao exportar variante {variant.id} para XML: {e}")
                    continue

            # Formatar XML
            xml_str = minidom.parseString(tostring(root)).toprettyxml(indent="  ")

            response = HttpResponse(xml_str, content_type='application/xml')
            response['Content-Disposition'] = f'attachment; filename="{filename}_export.xml"'
            return response
        except Exception as e:
            logger.error(f"Erro ao exportar XML: {e}")
            raise

    def _sanitize_xml_tag(self, tag_name):
        """Sanitiza nome para ser uma tag XML válida"""
        # Remove caracteres inválidos e espaços
        import re
        tag = re.sub(r'[^\w\-_.]', '_', tag_name)
        # XML tags não podem começar com número
        if tag and tag[0].isdigit():
            tag = f'col_{tag}'
        return tag.lower() if tag else 'field'

    def _export_json_data(self, variants):
        """
        Exporta para JSON com campos 100% DINÂMICOS detectados pela IA
        Usa os nomes ORIGINAIS das colunas da planilha
        """
        try:
            if not variants:
                return []

            logger.info(f"Exportando {len(variants)} variantes para JSON com campos dinâmicos")

            result = []
            for variant in variants:
                # Usa o campo 'fields' que tem TODOS os dados da linha com nomes originais
                if variant.fields:
                    item = dict(variant.fields)  # Copia todos os campos dinâmicos
                    result.append(item)

            return result

        except Exception as e:
            logger.error(f"Erro na exportação JSON: {e}")
            # Fallback: retornar vazio em vez de crashar
            return []


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

        # Criar ou atualizar mapeamento dinâmico
        mapping, created = ColumnMapping.objects.get_or_create(upload=upload)

        serializer = self.get_serializer(mapping, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            logger.info(f"Mapeamento dinâmico salvo: {len(mapping.dynamic_fields)} campos")
            return Response(serializer.data, status=status.HTTP_200_OK)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer
    pagination_class = None  # Desabilitar paginação
    parser_classes = (MultiPartParser, FormParser, JSONParser)

    def get_queryset(self):
        queryset = super().get_queryset()
        upload_id = self.request.query_params.get('upload_id')
        if upload_id:
            queryset = queryset.filter(upload_id=upload_id)
        return queryset.prefetch_related('variants')

    def get_serializer_context(self):
        """Adiciona request ao contexto para construir URLs absolutas"""
        context = super().get_serializer_context()
        context['request'] = self.request
        return context

    def partial_update(self, request, *args, **kwargs):
        """Permite edição parcial de produtos"""
        return super().partial_update(request, *args, **kwargs)
