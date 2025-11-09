#!/usr/bin/env python
"""
Script de teste para verificar integração com Gemini AI
Execute: python test_gemini.py
"""

import os
import sys
import django

# Setup Django
sys.path.insert(0, os.path.dirname(__file__))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings.development')
django.setup()

from extractor.services.gemini_analyzer_service import get_gemini_analyzer


def test_gemini_basic():
    """Teste básico de configuração"""
    print("\n" + "="*60)
    print("🧪 TESTE 1: Verificando Configuração")
    print("="*60)

    analyzer = get_gemini_analyzer()

    if analyzer.is_enabled():
        print("✅ Gemini AI está HABILITADO!")
        print(f"   API Key configurada: {os.environ.get('GEMINI_API_KEY', 'N/A')[:20]}...")
    else:
        print("❌ Gemini AI NÃO está habilitado")
        print("   Verifique se GEMINI_API_KEY está no .env")
        return False

    return True


def test_gemini_analysis():
    """Teste de análise de colunas"""
    print("\n" + "="*60)
    print("🧪 TESTE 2: Análise de Colunas Simples")
    print("="*60)

    analyzer = get_gemini_analyzer()

    if not analyzer.is_enabled():
        print("❌ Pulando teste - IA não habilitada")
        return False

    # Dados de teste
    headers = ['COD', 'PRODUTO', 'PREÇO ATACADO', 'PREÇO VAREJO', 'PESO KG']
    sample_data = [
        ['CAM001', 'Camiseta Básica Branca', 25.90, 39.90, 0.25],
        ['CAM002', 'Camiseta Preta Premium', 27.50, 42.00, 0.28],
        ['CALCA01', 'Calça Jeans Azul', 89.90, 129.90, 0.65],
    ]

    print("\n📊 Cabeçalhos:")
    for i, h in enumerate(headers):
        print(f"   Col {i}: {h}")

    print("\n📋 Amostra de dados (3 linhas):")
    for row in sample_data:
        print(f"   {row}")

    print("\n🤖 Enviando para Gemini AI...")

    try:
        result = analyzer.analyze_columns(headers, sample_data, use_cache=False)

        if not result:
            print("❌ Análise retornou None")
            return False

        print("\n✅ Análise concluída com sucesso!")
        print("\n📈 Resultados:")

        # Mostra summary
        summary = result.get('summary', {})
        print(f"\n   Código identificado na coluna: {summary.get('code_column')}")
        print(f"   Descrição identificada na coluna: {summary.get('description_column')}")
        print(f"   Peso identificado na coluna: {summary.get('weight_column')}")

        # Mostra preços
        price_cols = summary.get('price_columns', [])
        print(f"\n   Colunas de preço encontradas: {len(price_cols)}")
        for price in price_cols:
            print(f"      - Col {price['index']}: {price['name']} (confiança: {price['confidence']})")

        # Mostra detalhes das colunas
        print("\n🔍 Detalhes das colunas analisadas:")
        for col in result.get('columns', []):
            tipo = col.get('type')
            conf = col.get('confidence')
            reasoning = col.get('reasoning', 'N/A')
            print(f"\n   Col {col['index']}: {col['header']}")
            print(f"      Tipo: {tipo}")
            print(f"      Confiança: {conf}")
            print(f"      Motivo: {reasoning[:80]}...")

        return True

    except Exception as e:
        print(f"\n❌ Erro durante análise: {type(e).__name__}")
        print(f"   Mensagem: {str(e)}")
        import traceback
        print(f"\n{traceback.format_exc()}")
        return False


def test_gemini_custom_headers():
    """Teste com headers customizados (não-padrão)"""
    print("\n" + "="*60)
    print("🧪 TESTE 3: Headers Customizados (Desafio Real)")
    print("="*60)

    analyzer = get_gemini_analyzer()

    if not analyzer.is_enabled():
        print("❌ Pulando teste - IA não habilitada")
        return False

    # Headers não-padrão que método tradicional teria dificuldade
    headers = ['REF', 'DESCR_ITEM', 'VL_UNIT_ATK', 'VL_UNIT_VRJ', 'PESAGEM_G', 'NCM_FISCAL']
    sample_data = [
        ['AC2G', 'ARMÁRIO CANTO 2 GAVETAS', 156.50, 239.90, 8500, '94036000'],
        ['BC10', 'BALCÃO COZINHA 10 PORTAS', 289.90, 449.00, 15200, '94036000'],
        ['MC4P', 'MESA CENTRO 4 PÉS', 99.90, 159.90, 6800, '94036000'],
    ]

    print("\n📊 Cabeçalhos customizados:")
    for i, h in enumerate(headers):
        print(f"   Col {i}: {h}")

    print("\n🎯 Desafio:")
    print("   - 'REF' deve ser identificado como CÓDIGO")
    print("   - 'DESCR_ITEM' deve ser DESCRIÇÃO")
    print("   - 'VL_UNIT_ATK' deve ser PREÇO (Atacado)")
    print("   - 'VL_UNIT_VRJ' deve ser PREÇO (Varejo)")
    print("   - 'PESAGEM_G' deve ser PESO")
    print("   - 'NCM_FISCAL' deve ser NCM")

    print("\n🤖 Enviando para Gemini AI...")

    try:
        result = analyzer.analyze_columns(headers, sample_data, use_cache=False)

        if not result:
            print("❌ Análise retornou None")
            return False

        print("\n✅ Análise concluída!")
        print("\n📊 Verificando resultados:")

        summary = result.get('summary', {})

        # Verificações
        checks = [
            ("Código (REF)", summary.get('code_column'), 0),
            ("Descrição (DESCR_ITEM)", summary.get('description_column'), 1),
            ("Peso (PESAGEM_G)", summary.get('weight_column'), 4),
            ("NCM (NCM_FISCAL)", summary.get('ncm_column'), 5),
        ]

        correct = 0
        total = len(checks)

        for name, detected, expected in checks:
            status = "✅" if detected == expected else "❌"
            print(f"   {status} {name}: coluna {detected} (esperado: {expected})")
            if detected == expected:
                correct += 1

        # Verificar preços
        price_cols = summary.get('price_columns', [])
        price_indices = [p['index'] for p in price_cols]

        if 2 in price_indices and 3 in price_indices:
            print(f"   ✅ Preços identificados corretamente:")
            for p in price_cols:
                print(f"      - Col {p['index']}: {p['name']}")
            correct += 1
            total += 1
        else:
            print(f"   ❌ Preços não identificados corretamente")
            print(f"      Esperado: colunas 2 e 3")
            print(f"      Recebido: {price_indices}")
            total += 1

        # Score final
        score = (correct / total) * 100
        print(f"\n🎯 Score: {correct}/{total} ({score:.1f}%)")

        if score >= 80:
            print("   🏆 EXCELENTE! IA está funcionando perfeitamente!")
            return True
        elif score >= 60:
            print("   ⚠️  BOM, mas pode melhorar o prompt")
            return True
        else:
            print("   ❌ PRECISA AJUSTES no prompt da IA")
            return False

    except Exception as e:
        print(f"\n❌ Erro durante análise: {type(e).__name__}")
        print(f"   Mensagem: {str(e)}")
        return False


def main():
    """Executa todos os testes"""
    print("\n" + "="*60)
    print("🚀 TESTE DE INTEGRAÇÃO GEMINI AI")
    print("="*60)

    results = []

    # Teste 1: Configuração
    results.append(("Configuração", test_gemini_basic()))

    # Teste 2: Análise básica
    if results[0][1]:  # Só testa se configuração passou
        results.append(("Análise Básica", test_gemini_analysis()))

        # Teste 3: Headers customizados
        results.append(("Headers Customizados", test_gemini_custom_headers()))

    # Resumo
    print("\n" + "="*60)
    print("📊 RESUMO DOS TESTES")
    print("="*60)

    for name, passed in results:
        status = "✅ PASSOU" if passed else "❌ FALHOU"
        print(f"   {status} - {name}")

    total = len(results)
    passed = sum(1 for _, p in results if p)

    print(f"\n   Total: {passed}/{total} testes passaram")

    if passed == total:
        print("\n   🎉 TODOS OS TESTES PASSARAM!")
        print("   ✅ Gemini AI está funcionando perfeitamente!")
    elif passed > 0:
        print("\n   ⚠️  ALGUNS TESTES FALHARAM")
        print("   Verifique os logs acima para detalhes")
    else:
        print("\n   ❌ TODOS OS TESTES FALHARAM")
        print("   Verifique a configuração da API Key")

    print("\n" + "="*60)


if __name__ == '__main__':
    main()
