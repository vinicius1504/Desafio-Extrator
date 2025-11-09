"""
Serviço de Análise Inteligente de Colunas usando Google Gemini AI
Identifica automaticamente o tipo de cada coluna (preço, descrição, código, etc.)
"""

import logging
import json
from typing import Dict, List, Optional, Any
from django.conf import settings
from django.core.cache import cache
import google.generativeai as genai
import hashlib

logger = logging.getLogger(__name__)


class GeminiColumnAnalyzerService:
    """
    Service para análise inteligente de colunas de planilhas usando Gemini AI
    """

    def __init__(self, api_key: Optional[str] = None):
        """
        Inicializa o serviço com a API key do Gemini

        Args:
            api_key: API key do Google Gemini (opcional, usa settings se não fornecido)
        """
        self.api_key = api_key or getattr(settings, 'GEMINI_API_KEY', None)

        if not self.api_key:
            logger.warning("GEMINI_API_KEY não configurada. Análise por IA desabilitada.")
            self.enabled = False
        else:
            genai.configure(api_key=self.api_key)
            self.model = genai.GenerativeModel('gemini-2.0-flash-lite')
            self.enabled = True
            logger.info("Gemini AI inicializado com sucesso")

    def _generate_cache_key(self, headers: List[str], sample_data: List[List[Any]]) -> str:
        """
        Gera chave única para cache baseada nos headers e amostra de dados

        Args:
            headers: Lista de nomes das colunas
            sample_data: Amostra de dados (primeiras linhas)

        Returns:
            Hash MD5 como chave de cache
        """
        # Serializa os dados para criar hash
        data_str = json.dumps({
            'headers': headers,
            'sample': [row[:10] for row in sample_data[:5]]  # Limita tamanho
        }, sort_keys=True)

        hash_obj = hashlib.md5(data_str.encode())
        return f"gemini_analysis_{hash_obj.hexdigest()}"

    def _build_analysis_prompt(self, headers: List[str], sample_data: List[List[Any]]) -> str:
        """
        Constrói o prompt para o Gemini analisar as colunas

        Args:
            headers: Lista de nomes das colunas
            sample_data: Amostra de dados (primeiras linhas)

        Returns:
            Prompt formatado para enviar ao Gemini
        """
        # Formata os dados de amostra para análise
        sample_rows_formatted = []
        for i, row in enumerate(sample_data[:10], 1):  # Até 10 linhas de amostra
            row_str = " | ".join([str(cell) if cell is not None else "" for cell in row])
            sample_rows_formatted.append(f"Linha {i}: {row_str}")

        prompt = f"""
Você é um especialista em análise de planilhas de produtos. Analise os cabeçalhos e dados de amostra abaixo e identifique o tipo de cada coluna.

**CABEÇALHOS DA PLANILHA:**
{" | ".join([f"Col {i}: {h}" for i, h in enumerate(headers)])}

**DADOS DE AMOSTRA (primeiras linhas):**
{chr(10).join(sample_rows_formatted)}

**TIPOS DE COLUNAS POSSÍVEIS:**
1. **code** - Código do produto, SKU, referência (ex: "CAM001", "REF-123")
2. **description** - Descrição, nome do produto (ex: "Camiseta Premium", "Calça Jeans")
3. **dimensions** - Dimensões físicas (ex: "A15*L45*P45", "15x45x45")
4. **cubic** - Cubagem, volume, metragem cúbica (ex: 0.00375, valores decimais pequenos)
5. **weight** - Peso em kg ou gramas (ex: 0.25, 250)
6. **ncm** - NCM fiscal (código de 8 dígitos, ex: "61091000")
7. **price** - Preço, valor (pode haver múltiplos tipos de preço: atacado, varejo, etc)
8. **other** - Outros tipos não identificados

**REGRAS IMPORTANTES:**
- Uma coluna de PREÇO pode ter nomes variados: "Preço", "Valor", "Atacado", "Varejo", "Tabela 1", "VL UNIT", etc
- IDENTIFIQUE TODAS as colunas de preço, não apenas uma
- O campo **description** geralmente contém texto longo com nome do produto
- O campo **code** geralmente é alfanumérico e único, MAS NEM SEMPRE EXISTE
- **ATENÇÃO:** Algumas planilhas NÃO têm coluna de código! Neste caso, retorne code_column: null
- Se não houver código, a DESCRIÇÃO será usada como identificador principal
- NCM sempre tem 8 dígitos numéricos
- Dimensões geralmente têm formato: "A*L*P" ou "altura x largura x profundidade"
- Se houver dúvida entre price e outro tipo, priorize identificar como price se tiver valores numéricos positivos
- NÃO invente colunas que não existem! Se não tiver código, retorne null

**RETORNE APENAS UM JSON válido neste formato exato:**
{{
  "columns": [
    {{
      "index": 0,
      "header": "nome do cabeçalho",
      "type": "code|description|dimensions|cubic|weight|ncm|price|other",
      "confidence": 0.95,
      "reasoning": "breve explicação do por que identificou assim",
      "price_name": "nome específico do preço (apenas se type=price)"
    }},
    ...
  ],
  "summary": {{
    "code_column": índice da coluna de código ou null,
    "description_column": índice da coluna de descrição ou null,
    "dimensions_column": índice da coluna de dimensões ou null,
    "cubic_column": índice da coluna de cúbico ou null,
    "weight_column": índice da coluna de peso ou null,
    "ncm_column": índice da coluna de NCM ou null,
    "price_columns": [
      {{"index": índice, "name": "nome do preço", "confidence": 0.95}},
      ...
    ]
  }}
}}

**IMPORTANTE:** Retorne APENAS o JSON, sem nenhum texto adicional antes ou depois.
"""
        return prompt

    def analyze_columns(
        self,
        headers: List[str],
        sample_data: List[List[Any]],
        use_cache: bool = True
    ) -> Optional[Dict]:
        """
        Analisa as colunas da planilha usando Gemini AI

        Args:
            headers: Lista de nomes das colunas
            sample_data: Amostra de dados (primeiras linhas)
            use_cache: Se True, usa cache para evitar chamadas repetidas

        Returns:
            Dicionário com análise das colunas ou None se houver erro
        """
        if not self.enabled:
            logger.warning("Gemini AI não está habilitado. Retornando None.")
            return None

        # Verifica cache primeiro
        if use_cache:
            cache_key = self._generate_cache_key(headers, sample_data)
            cached_result = cache.get(cache_key)
            if cached_result:
                logger.info(f"Resultado encontrado no cache: {cache_key}")
                return cached_result

        try:
            # Constrói o prompt
            prompt = self._build_analysis_prompt(headers, sample_data)

            # Chama a API do Gemini
            logger.info("Enviando requisição para Gemini AI...")
            response = self.model.generate_content(prompt)

            # Extrai o texto da resposta
            response_text = response.text.strip()
            logger.debug(f"Resposta do Gemini: {response_text[:500]}...")

            # Remove possíveis markdown code blocks
            if response_text.startswith("```json"):
                response_text = response_text[7:]
            if response_text.startswith("```"):
                response_text = response_text[3:]
            if response_text.endswith("```"):
                response_text = response_text[:-3]

            response_text = response_text.strip()

            # Parse JSON
            analysis_result = json.loads(response_text)

            # Valida estrutura básica
            if 'columns' not in analysis_result or 'summary' not in analysis_result:
                logger.error("Resposta do Gemini com estrutura inválida")
                return None

            # Armazena no cache (24 horas)
            if use_cache:
                cache.set(cache_key, analysis_result, 60 * 60 * 24)
                logger.info(f"Resultado armazenado no cache: {cache_key}")

            logger.info(f"Análise do Gemini concluída com sucesso. {len(analysis_result['columns'])} colunas analisadas.")
            return analysis_result

        except json.JSONDecodeError as e:
            logger.error(f"Erro ao fazer parse do JSON retornado pelo Gemini: {e}")
            logger.error(f"Resposta recebida: {response_text}")
            return None

        except Exception as e:
            logger.error(f"Erro ao chamar Gemini API: {type(e).__name__} - {str(e)}")
            return None

    def convert_to_mapping_format(self, analysis_result: Dict) -> Dict:
        """
        Converte o resultado da análise do Gemini para o formato usado pelo ColumnMapping

        Args:
            analysis_result: Resultado retornado por analyze_columns()

        Returns:
            Dicionário no formato esperado pelo sistema de mapeamento
        """
        if not analysis_result or 'summary' not in analysis_result:
            return {}

        summary = analysis_result['summary']

        mapping = {
            'code_column': summary.get('code_column'),
            'description_column': summary.get('description_column'),
            'dimensions_column': summary.get('dimensions_column'),
            'cubic_column': summary.get('cubic_column'),
            'weight_column': summary.get('weight_column'),
            'ncm_column': summary.get('ncm_column'),
            'price_columns': summary.get('price_columns', [])
        }

        # Calcula confiança geral (média das colunas identificadas)
        columns = analysis_result.get('columns', [])
        identified_columns = [c for c in columns if c.get('type') != 'other']

        if identified_columns:
            avg_confidence = sum(c.get('confidence', 0) for c in identified_columns) / len(identified_columns)
            mapping['overall_confidence'] = round(avg_confidence, 2)
        else:
            mapping['overall_confidence'] = 0.0

        # Adiciona detalhes das colunas para referência
        mapping['columns_detail'] = columns

        return mapping

    def is_enabled(self) -> bool:
        """Retorna se o serviço está habilitado"""
        return self.enabled


# Instância singleton do serviço
_gemini_service_instance = None


def get_gemini_analyzer() -> GeminiColumnAnalyzerService:
    """
    Retorna instância singleton do GeminiColumnAnalyzerService

    Returns:
        Instância do serviço de análise
    """
    global _gemini_service_instance

    if _gemini_service_instance is None:
        _gemini_service_instance = GeminiColumnAnalyzerService()

    return _gemini_service_instance
