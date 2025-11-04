"""
Script para testar o fluxo completo:
1. Upload
2. Detecção automática de estrutura
3. Mapeamento automático
4. Processamento
5. Exportação JSON
"""

import os
import sys
import django

# Setup Django
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

import pandas as pd
from extractor.models import SpreadsheetUpload, ColumnMapping, Product, ProductVariant
from extractor.utils.spreadsheet_detector import detect_spreadsheet_structure
from extractor.services.column_mapper_service import ColumnMapperService
from extractor.serializers import ProductVariantExportSerializer

def test_complete_flow():
    print("=" * 80)
    print("TESTE DO FLUXO COMPLETO")
    print("=" * 80)

    # 1. PEGAR ÚLTIMO UPLOAD
    print("\n1. Buscando último upload...")
    upload = SpreadsheetUpload.objects.latest('uploaded_at')
    print(f"   ✅ Upload ID: {upload.id}")
    print(f"   Arquivo: {upload.original_filename}")
    print(f"   Linhas: {upload.total_rows}, Colunas: {upload.total_columns}")

    # 2. DETECTAR ESTRUTURA
    print("\n2. Detectando estrutura...")
    df = pd.read_excel(upload.file.path, header=None)
    structure = detect_spreadsheet_structure(df)
    print(f"   ✅ Header na linha: {structure['header_row']}")
    print(f"   ✅ Dados começam na linha: {structure['data_start_row']}")
    print(f"   ✅ Total de linhas de dados: {structure['total_data_rows']}")

    # 3. SUGERIR MAPEAMENTO
    print("\n3. Sugerindo mapeamento automático...")
    mapper = ColumnMapperService(df, header_row=structure['header_row'], sample_rows=10)
    suggestions = mapper.suggest_mapping(min_confidence=0.5)
    suggested_mapping = suggestions['suggested_mapping']

    print(f"   ✅ Código: coluna {suggested_mapping['code_column']}")
    print(f"   ✅ Descrição: coluna {suggested_mapping['description_column']}")
    print(f"   ✅ Dimensões: coluna {suggested_mapping['dimensions_column']}")
    print(f"   ✅ Cúbico: coluna {suggested_mapping['cubic_column']}")
    print(f"   ✅ Peso: coluna {suggested_mapping['weight_column']}")
    print(f"   ✅ NCM: coluna {suggested_mapping['ncm_column']}")
    print(f"   ✅ Colunas de preços: {len(suggested_mapping['price_columns'])}")

    # 4. APLICAR MAPEAMENTO
    print("\n4. Aplicando mapeamento...")
    mapping, created = ColumnMapping.objects.get_or_create(upload=upload)
    mapping.code_column = suggested_mapping['code_column']
    mapping.description_column = suggested_mapping['description_column']
    mapping.dimensions_column = suggested_mapping['dimensions_column']
    mapping.cubic_column = suggested_mapping['cubic_column']
    mapping.weight_column = suggested_mapping['weight_column']
    mapping.ncm_column = suggested_mapping['ncm_column']
    mapping.price_columns = suggested_mapping['price_columns']
    mapping.data_start_row = suggested_mapping['data_start_row']
    mapping.save()
    print(f"   ✅ Mapeamento {'criado' if created else 'atualizado'}")

    # 5. PROCESSAR PLANILHA
    print("\n5. Processando planilha...")

    # Limpar dados anteriores
    upload.products.all().delete()
    upload.variants.all().delete()

    current_product = None
    variants_created = 0
    products_created = 0

    # Processar linhas
    for idx, row in df.iloc[mapping.data_start_row:].iterrows():
        # Limitar teste a 10 produtos
        if products_created >= 10:
            break

        # Extrair código
        code = str(row.iloc[mapping.code_column]) if pd.notna(row.iloc[mapping.code_column]) else None
        if not code or code == 'nan':
            continue

        # Extrair descrição
        description = None
        if mapping.description_column is not None:
            description = str(row.iloc[mapping.description_column]) if pd.notna(row.iloc[mapping.description_column]) else None

        # Se tem descrição, criar novo produto
        if description and description != 'nan':
            current_product = Product.objects.create(
                upload=upload,
                description=description
            )
            products_created += 1

        # Extrair outros dados
        dimensions = str(row.iloc[mapping.dimensions_column]) if mapping.dimensions_column is not None and pd.notna(row.iloc[mapping.dimensions_column]) else None

        cubic = None
        if mapping.cubic_column is not None and pd.notna(row.iloc[mapping.cubic_column]):
            try:
                cubic = float(row.iloc[mapping.cubic_column])
            except (ValueError, TypeError):
                pass

        weight = None
        if mapping.weight_column is not None and pd.notna(row.iloc[mapping.weight_column]):
            try:
                weight = float(row.iloc[mapping.weight_column])
            except (ValueError, TypeError):
                pass

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

    print(f"   ✅ Produtos criados: {products_created}")
    print(f"   ✅ Variantes criadas: {variants_created}")

    # 6. EXPORTAR JSON
    print("\n6. Exportando para JSON...")
    variants = ProductVariant.objects.filter(upload=upload)[:5]  # Primeiras 5
    serializer = ProductVariantExportSerializer(variants, many=True)

    print(f"   ✅ Exemplo de 5 variantes exportadas:")
    import json
    print(json.dumps(serializer.data, indent=2, ensure_ascii=False))

    print("\n" + "=" * 80)
    print("✅ TESTE COMPLETO COM SUCESSO!")
    print("=" * 80)

if __name__ == "__main__":
    test_complete_flow()
