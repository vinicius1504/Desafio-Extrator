"""
Exemplo de uso da API de Extração de Planilhas

Este script demonstra como usar a API para:
1. Fazer upload de uma planilha
2. Ver preview dos dados
3. Configurar mapeamento de colunas
4. Processar os dados
5. Exportar em diferentes formatos
"""

import requests
import json

BASE_URL = "http://localhost:8000/api"

def upload_planilha(arquivo_path):
    """1. Upload da planilha"""
    print("1. Fazendo upload da planilha...")

    with open(arquivo_path, 'rb') as f:
        files = {'file': f}
        response = requests.post(f"{BASE_URL}/uploads/", files=files)

    if response.status_code == 201:
        upload_data = response.json()
        print(f"✓ Upload realizado com sucesso!")
        print(f"  ID: {upload_data['id']}")
        print(f"  Arquivo: {upload_data['original_filename']}")
        print(f"  Linhas: {upload_data['total_rows']}")
        print(f"  Colunas: {upload_data['total_columns']}")
        return upload_data['id']
    else:
        print(f"✗ Erro no upload: {response.text}")
        return None


def preview_planilha(upload_id):
    """2. Preview da planilha"""
    print(f"\n2. Visualizando preview da planilha...")

    response = requests.get(f"{BASE_URL}/uploads/{upload_id}/preview/")

    if response.status_code == 200:
        preview = response.json()
        print(f"✓ Preview obtido com sucesso!")
        print(f"  Total de linhas: {preview['total_rows']}")
        print(f"  Total de colunas: {preview['total_columns']}")
        print(f"\n  Primeiras 5 linhas:")

        for row in preview['preview'][:5]:
            print(f"    Linha {row['row_number']}: {row['data'][:3]}...")

        return preview
    else:
        print(f"✗ Erro ao obter preview: {response.text}")
        return None


def configurar_mapeamento(upload_id):
    """3. Configurar mapeamento de colunas (baseado na planilha Dona Flor)"""
    print(f"\n3. Configurando mapeamento de colunas...")

    # Mapeamento específico para a planilha Dona Flor
    # Baseado na análise da estrutura:
    # Col 2: Código
    # Col 3: Descrição
    # Col 4: Dimensões
    # Col 5: Cúbico
    # Col 6: Peso
    # Col 7: NCM
    # Dados começam na linha 12

    mapping_data = {
        "upload": upload_id,
        "code_column": 2,
        "description_column": 3,
        "dimensions_column": 4,
        "cubic_column": 5,
        "weight_column": 6,
        "ncm_column": 7,
        "data_start_row": 12,
        "price_columns": [
            {"index": 8, "name": "Fornecido 1"},
            {"index": 9, "name": "Fornecido 2"},
            {"index": 10, "name": "Tecido Fornecido"},
            {"index": 11, "name": "Tecido Grupo 1 - 1"},
            {"index": 12, "name": "Tecido Grupo 1 - 2"},
            {"index": 13, "name": "Tecido Grupo 4 - 1"},
            {"index": 14, "name": "Tecido Grupo 4 - 2"},
            {"index": 15, "name": "Tecido PO/Plus"},
            {"index": 16, "name": "Tecido ACN - 1"},
            {"index": 17, "name": "Tecido ACN - 2"},
            {"index": 18, "name": "Tecido ACN - 3"},
        ]
    }

    response = requests.post(
        f"{BASE_URL}/mappings/create_or_update/",
        json=mapping_data,
        headers={'Content-Type': 'application/json'}
    )

    if response.status_code == 200:
        mapping = response.json()
        print(f"✓ Mapeamento configurado com sucesso!")
        print(f"  ID: {mapping['id']}")
        print(f"  Coluna de código: {mapping['code_column']}")
        print(f"  Coluna de descrição: {mapping['description_column']}")
        print(f"  Linha inicial dos dados: {mapping['data_start_row']}")
        print(f"  Colunas de preço configuradas: {len(mapping['price_columns'])}")
        return mapping
    else:
        print(f"✗ Erro ao configurar mapeamento: {response.text}")
        return None


def processar_planilha(upload_id):
    """4. Processar a planilha"""
    print(f"\n4. Processando a planilha...")

    response = requests.post(f"{BASE_URL}/uploads/{upload_id}/process/")

    if response.status_code == 200:
        result = response.json()
        print(f"✓ Processamento concluído!")
        print(f"  Produtos criados: {result['products_created']}")
        print(f"  Variantes criadas: {result['variants_created']}")
        return result
    else:
        print(f"✗ Erro ao processar: {response.text}")
        return None


def listar_produtos(upload_id):
    """5. Listar produtos processados"""
    print(f"\n5. Listando produtos processados...")

    response = requests.get(f"{BASE_URL}/products/?upload_id={upload_id}")

    if response.status_code == 200:
        products = response.json()
        print(f"✓ {len(products)} produtos encontrados!")

        # Mostrar os primeiros 3 produtos
        for i, product in enumerate(products[:3], 1):
            print(f"\n  Produto {i}: {product['description']}")
            print(f"  Variantes: {len(product['variants'])}")

            for variant in product['variants'][:2]:  # Mostrar 2 primeiras variantes
                print(f"    - Código: {variant['code']}")
                print(f"      Dimensões: {variant['dimensions']}")
                print(f"      Preços: {list(variant['prices'].keys())[:3]}...")

        return products
    else:
        print(f"✗ Erro ao listar produtos: {response.text}")
        return None


def exportar_dados(upload_id, formato='json'):
    """6. Exportar dados"""
    print(f"\n6. Exportando dados em formato {formato.upper()}...")

    response = requests.get(f"{BASE_URL}/uploads/{upload_id}/export/?format={formato}")

    if response.status_code == 200:
        if formato == 'json':
            data = response.json()
            print(f"✓ Dados exportados com sucesso!")
            print(f"  Total de registros: {len(data)}")
            print(f"\n  Exemplo (primeiro registro):")
            print(f"  {json.dumps(data[0], indent=2, ensure_ascii=False)[:500]}...")

            # Salvar em arquivo
            filename = f'export_{upload_id}.json'
            with open(filename, 'w', encoding='utf-8') as f:
                json.dump(data, f, indent=2, ensure_ascii=False)
            print(f"\n  Salvo em: {filename}")

        else:  # CSV ou XML
            filename = f'export_{upload_id}.{formato}'
            with open(filename, 'wb') as f:
                f.write(response.content)
            print(f"✓ Dados exportados com sucesso!")
            print(f"  Salvo em: {filename}")

        return True
    else:
        print(f"✗ Erro ao exportar: {response.text}")
        return False


def main():
    """Executa o fluxo completo"""
    print("=" * 60)
    print("EXEMPLO DE USO DA API DE EXTRAÇÃO DE PLANILHAS")
    print("=" * 60)

    # Caminho da planilha
    arquivo = "Dona_Flor_Primeira_Pag.xlsx"

    # 1. Upload
    upload_id = upload_planilha(arquivo)
    if not upload_id:
        return

    # 2. Preview
    preview_planilha(upload_id)

    # 3. Configurar mapeamento
    configurar_mapeamento(upload_id)

    # 4. Processar
    processar_planilha(upload_id)

    # 5. Listar produtos
    listar_produtos(upload_id)

    # 6. Exportar
    exportar_dados(upload_id, 'json')
    exportar_dados(upload_id, 'csv')
    exportar_dados(upload_id, 'xml')

    print("\n" + "=" * 60)
    print("PROCESSO CONCLUÍDO COM SUCESSO!")
    print("=" * 60)


if __name__ == "__main__":
    main()
