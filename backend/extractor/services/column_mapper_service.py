"""
Serviço para mapeamento inteligente de colunas em planilhas
Identifica automaticamente colunas usando fuzzy matching e análise de conteúdo
Agora com integração de IA do Google Gemini para análise avançada
"""
import pandas as pd
import re
import logging
from difflib import SequenceMatcher
from typing import Dict, List, Any, Optional, Tuple

# Importa Gemini service (lazy import para evitar erro se não configurado)
try:
    from .gemini_analyzer_service import get_gemini_analyzer
    GEMINI_AVAILABLE = True
except ImportError:
    GEMINI_AVAILABLE = False

logger = logging.getLogger(__name__)


class ColumnMapperService:
    """
    Serviço que analisa planilhas e sugere mapeamento automático de colunas
    baseado em nomes de colunas e conteúdo das células
    """

    # Sinônimos/variações de nomes de colunas
    FIELD_SYNONYMS = {
        'code': [
            'codigo', 'código', 'cod', 'cod.', 'code', 'item', 'sku',
            'referencia', 'referência', 'ref', 'ref.', 'produto', 'product'
        ],
        'description': [
            'descricao', 'descrição', 'description', 'desc', 'desc.',
            'produto', 'product', 'nome', 'name', 'item', 'denominacao'
        ],
        'dimensions': [
            'dimensoes', 'dimensões', 'dimensions', 'dim', 'medidas',
            'tamanho', 'size', 'altura', 'height', 'largura', 'width',
            'comprimento', 'length', 'tam', 'tam.'
        ],
        'cubic': [
            'cubagem', 'cubico', 'cúbico', 'cubic', 'volume', 'm3', 'm³',
            'metro cubico', 'metros cúbicos', 'vol', 'vol.'
        ],
        'weight': [
            'peso', 'weight', 'kg', 'kilos', 'quilos', 'massa', 'mass',
            'peso liquido', 'peso líquido', 'peso bruto'
        ],
        'ncm': [
            'ncm', 'n.c.m', 'n.c.m.', 'nomenclatura', 'classificacao',
            'classificação fiscal', 'codigo ncm', 'código ncm'
        ],
        'price': [
            'preco', 'preço', 'price', 'valor', 'value', 'custo', 'cost',
            'tabela', 'table', 'grupo', 'group', 'fornecido', 'supplied',
            'varejo', 'atacado', 'wholesale', 'retail', 'fabric', 'tecido',
            'po/plus', 'acn'
        ]
    }

    # Padrões regex para identificar tipos de dados
    PATTERNS = {
        'ncm': r'^\d{4}\.?\d{2}\.?\d{2}$',  # Padrão NCM: 0000.00.00 ou 00000000
        'numeric': r'^[\d\.,]+$',  # Números (inteiros ou decimais)
        'code': r'^[A-Z]{1,3}\d+[A-Z]?$',  # Códigos como AC2, BC10, etc
        'dimensions': r'\d+\s*[xX×]\s*\d+',  # Dimensões: 45x45, 30 X 40, etc
    }

    def __init__(self, df: pd.DataFrame, header_row: int = 0, sample_rows: int = 10, use_ai: bool = True):
        """
        Inicializa o mapper com um DataFrame

        Args:
            df: DataFrame da planilha
            header_row: Linha que contém os headers (padrão: 0)
            sample_rows: Número de linhas a analisar para identificar padrões
            use_ai: Se True, tenta usar Gemini AI para análise avançada (padrão: True)
        """
        self.df = df
        self.header_row = header_row
        self.sample_rows = sample_rows
        self.use_ai = use_ai and GEMINI_AVAILABLE
        self.headers = self._extract_headers()

        # Inicializa Gemini se disponível e habilitado
        if self.use_ai:
            self.gemini_analyzer = get_gemini_analyzer()
            if not self.gemini_analyzer.is_enabled():
                logger.warning("Gemini AI configurado para uso mas API Key não encontrada")
                self.use_ai = False
        else:
            self.gemini_analyzer = None

    def _extract_headers(self) -> List[str]:
        """Extrai os headers da linha especificada"""
        if self.header_row >= len(self.df):
            return [f'Coluna {i}' for i in range(len(self.df.columns))]

        headers = []
        for val in self.df.iloc[self.header_row]:
            if pd.notna(val):
                headers.append(str(val).strip().lower())
            else:
                headers.append(f'coluna_{len(headers)}')

        return headers

    def similarity_score(self, str1: str, str2: str) -> float:
        """
        Calcula similaridade entre duas strings (0.0 a 1.0)

        Args:
            str1: Primeira string
            str2: Segunda string

        Returns:
            Score de similaridade (0.0 = completamente diferente, 1.0 = idêntico)
        """
        str1 = str1.lower().strip()
        str2 = str2.lower().strip()

        # Match exato
        if str1 == str2:
            return 1.0

        # Verificar se uma string contém a outra
        if str1 in str2 or str2 in str1:
            return 0.9

        # Usar SequenceMatcher para calcular similaridade
        return SequenceMatcher(None, str1, str2).ratio()

    def find_best_match(self, header: str, field_name: str) -> float:
        """
        Encontra a melhor similaridade entre um header e um campo

        Args:
            header: Nome da coluna na planilha
            field_name: Nome do campo a buscar (code, description, etc)

        Returns:
            Melhor score de similaridade encontrado
        """
        synonyms = self.FIELD_SYNONYMS.get(field_name, [])
        best_score = 0.0

        for synonym in synonyms:
            score = self.similarity_score(header, synonym)
            if score > best_score:
                best_score = score

        return best_score

    def analyze_column_content(self, col_index: int) -> Dict[str, Any]:
        """
        Analisa o conteúdo de uma coluna para identificar padrões

        Args:
            col_index: Índice da coluna

        Returns:
            Dicionário com estatísticas e padrões encontrados
        """
        # Pegar dados após o header_row
        start_row = self.header_row + 1
        end_row = min(start_row + self.sample_rows, len(self.df))

        column_data = self.df.iloc[start_row:end_row, col_index]

        # Remover valores vazios
        non_empty = [str(val).strip() for val in column_data if pd.notna(val) and str(val).strip() != '']

        if not non_empty:
            return {
                'empty': True,
                'sample_size': 0
            }

        analysis = {
            'empty': False,
            'sample_size': len(non_empty),
            'avg_length': sum(len(s) for s in non_empty) / len(non_empty),
            'has_numeric': False,
            'has_alpha': False,
            'has_dimensions': False,
            'has_ncm_pattern': False,
            'has_code_pattern': False,
            'sample_values': non_empty[:3]  # Primeiros 3 valores para análise
        }

        # Analisar padrões
        numeric_count = 0
        alpha_count = 0
        dimensions_count = 0
        ncm_count = 0
        code_count = 0

        for value in non_empty:
            # Verificar se é numérico
            try:
                float(value.replace(',', '.'))
                numeric_count += 1
            except ValueError:
                pass

            # Verificar se tem caracteres alfabéticos
            if re.search(r'[a-zA-Z]', value):
                alpha_count += 1

            # Verificar padrões específicos
            if re.match(self.PATTERNS['dimensions'], value):
                dimensions_count += 1

            if re.match(self.PATTERNS['ncm'], value.replace('.', '')):
                ncm_count += 1

            if re.match(self.PATTERNS['code'], value):
                code_count += 1

        total = len(non_empty)
        analysis['has_numeric'] = numeric_count / total > 0.7  # 70% ou mais são numéricos
        analysis['has_alpha'] = alpha_count / total > 0.5  # 50% ou mais têm letras
        analysis['has_dimensions'] = dimensions_count / total > 0.5
        analysis['has_ncm_pattern'] = ncm_count / total > 0.5
        analysis['has_code_pattern'] = code_count / total > 0.5

        return analysis

    def suggest_mapping(self, min_confidence: float = 0.5) -> Dict[str, Any]:
        """
        Sugere mapeamento automático de colunas
        Tenta usar Gemini AI primeiro, faz fallback para método tradicional

        Args:
            min_confidence: Confiança mínima para sugerir um mapeamento (0.0 a 1.0)

        Returns:
            Dicionário com sugestões de mapeamento e scores de confiança
        """
        # TENTATIVA 1: Usar Gemini AI se disponível
        if self.use_ai and self.gemini_analyzer:
            logger.info("Tentando análise com Gemini AI...")
            ai_result = self._suggest_mapping_with_ai()

            if ai_result:
                logger.info("Análise com Gemini AI bem-sucedida!")
                return ai_result

            logger.warning("Análise com Gemini AI falhou. Usando método tradicional...")

        # TENTATIVA 2: Método tradicional (fuzzy matching + análise de conteúdo)
        logger.info("Usando método tradicional de análise...")
        return self._suggest_mapping_traditional(min_confidence)

    def _suggest_mapping_with_ai(self) -> Optional[Dict[str, Any]]:
        """
        Tenta sugerir mapeamento usando Gemini AI

        Returns:
            Dicionário com sugestões ou None se falhar
        """
        try:
            # Prepara dados para análise
            headers = [str(h) for h in self.headers]

            # Extrai amostra de dados (linhas após o header)
            data_start = self.header_row + 1
            data_end = min(data_start + self.sample_rows, len(self.df))

            sample_data = []
            for idx in range(data_start, data_end):
                if idx < len(self.df):
                    row = self.df.iloc[idx].tolist()
                    sample_data.append(row)

            # Chama Gemini para análise
            analysis_result = self.gemini_analyzer.analyze_columns(headers, sample_data)

            if not analysis_result:
                return None

            # Converte resultado do Gemini para formato do sistema
            mapping = self.gemini_analyzer.convert_to_mapping_format(analysis_result)

            # Adiciona informações extras
            mapping['headers'] = headers
            mapping['analysis_method'] = 'gemini_ai'
            mapping['all_columns_analysis'] = analysis_result.get('columns', [])

            # Formata scores de confiança para compatibilidade
            confidence_scores = {}
            for field in ['code', 'description', 'dimensions', 'cubic', 'weight', 'ncm']:
                col_idx = mapping.get(f'{field}_column')
                if col_idx is not None:
                    # Busca confiança nas colunas analisadas
                    for col_detail in analysis_result.get('columns', []):
                        if col_detail.get('index') == col_idx:
                            confidence = col_detail.get('confidence', 0.0)
                            confidence_scores[field] = {
                                'score': round(confidence, 2),
                                'confidence': self._score_to_confidence_label(confidence)
                            }
                            break

            mapping['confidence_scores'] = confidence_scores
            mapping['suggested_mapping'] = {
                'code_column': mapping.get('code_column'),
                'description_column': mapping.get('description_column'),
                'dimensions_column': mapping.get('dimensions_column'),
                'cubic_column': mapping.get('cubic_column'),
                'weight_column': mapping.get('weight_column'),
                'ncm_column': mapping.get('ncm_column'),
                'price_columns': mapping.get('price_columns', []),
                'data_start_row': self.header_row + 1
            }

            return mapping

        except Exception as e:
            logger.error(f"Erro ao usar Gemini AI para sugestão de mapeamento: {e}")
            return None

    def _suggest_mapping_traditional(self, min_confidence: float = 0.5) -> Dict[str, Any]:
        """
        Sugere mapeamento usando método tradicional (fuzzy matching + análise de conteúdo)

        Args:
            min_confidence: Confiança mínima para sugerir um mapeamento (0.0 a 1.0)

        Returns:
            Dicionário com sugestões de mapeamento e scores de confiança
        """
        suggestions = {}
        confidence_scores = {}
        all_column_analysis = []

        # Campos obrigatórios e opcionais (price não é mapeado como campo único)
        fields_to_map = ['code', 'description', 'dimensions', 'cubic', 'weight', 'ncm', 'price']

        # Analisar cada coluna
        for col_idx, header in enumerate(self.headers):
            column_info = {
                'index': col_idx,
                'header': header,
                'content_analysis': self.analyze_column_content(col_idx)
            }

            # Calcular scores para cada campo
            scores = {}
            for field in fields_to_map:
                # Score baseado no nome da coluna
                name_score = self.find_best_match(header, field)

                # Score baseado no conteúdo
                content_score = self._calculate_content_score(
                    field,
                    column_info['content_analysis']
                )

                # Score final = média ponderada (60% nome, 40% conteúdo)
                final_score = (name_score * 0.6) + (content_score * 0.4)
                scores[field] = {
                    'total': final_score,
                    'name': name_score,
                    'content': content_score
                }

            column_info['scores'] = scores
            all_column_analysis.append(column_info)

        # Encontrar melhor coluna para cada campo (exceto price, que é tratado separadamente)
        for field in ['code', 'description', 'dimensions', 'cubic', 'weight', 'ncm']:
            best_col = None
            best_score = 0.0

            for col_info in all_column_analysis:
                score = col_info['scores'][field]['total']
                if score > best_score:
                    best_score = score
                    best_col = col_info['index']

            # Apenas sugerir se a confiança for maior que o mínimo
            if best_score >= min_confidence and best_col is not None:
                suggestions[field] = best_col
                confidence_scores[field] = {
                    'score': round(best_score, 2),
                    'confidence': self._score_to_confidence_label(best_score)
                }

        # Identificar colunas de preço (excluindo as já mapeadas)
        price_columns = self._identify_price_columns(all_column_analysis, min_confidence, suggestions)

        # Sugerir linha inicial de dados (próxima após o header)
        suggested_data_start_row = self.header_row + 1

        return {
            'suggested_mapping': {
                'code_column': suggestions.get('code'),
                'description_column': suggestions.get('description'),
                'dimensions_column': suggestions.get('dimensions'),
                'cubic_column': suggestions.get('cubic'),
                'weight_column': suggestions.get('weight'),
                'ncm_column': suggestions.get('ncm'),
                'price_columns': price_columns,
                'data_start_row': suggested_data_start_row
            },
            'confidence_scores': confidence_scores,
            'all_columns_analysis': all_column_analysis,
            'headers': self.headers,
            'analysis_method': 'traditional'
        }

    def _calculate_content_score(self, field: str, content_analysis: Dict) -> float:
        """
        Calcula score baseado no conteúdo da coluna

        Args:
            field: Nome do campo
            content_analysis: Análise do conteúdo da coluna

        Returns:
            Score de 0.0 a 1.0
        """
        if content_analysis.get('empty', True):
            return 0.0

        score = 0.0

        if field == 'code':
            if content_analysis.get('has_code_pattern'):
                score = 0.9
            elif content_analysis.get('has_alpha') and content_analysis.get('avg_length', 0) < 15:
                score = 0.6

        elif field == 'description':
            # Descrições geralmente são textos mais longos
            if content_analysis.get('has_alpha') and content_analysis.get('avg_length', 0) > 10:
                score = 0.8

        elif field == 'dimensions':
            if content_analysis.get('has_dimensions'):
                score = 0.95
            elif content_analysis.get('has_alpha') and content_analysis.get('has_numeric'):
                score = 0.5

        elif field in ['cubic', 'weight']:
            # Cubagem e peso são sempre numéricos
            if content_analysis.get('has_numeric'):
                score = 0.8

        elif field == 'ncm':
            if content_analysis.get('has_ncm_pattern'):
                score = 0.95
            elif content_analysis.get('has_numeric') and content_analysis.get('avg_length', 0) == 8:
                score = 0.7

        return score

    def _identify_price_columns(self, all_column_analysis: List[Dict], min_confidence: float, mapped_columns: Dict) -> List[Dict]:
        """
        Identifica todas as colunas que podem ser preços
        Remove duplicatas mantendo apenas a última ocorrência de cada tipo

        Args:
            all_column_analysis: Análise de todas as colunas
            min_confidence: Confiança mínima
            mapped_columns: Dict com colunas já mapeadas para outros campos

        Returns:
            Lista de dicionários com índice e nome das colunas de preço (sem duplicatas)
        """
        price_columns = []

        # Colunas já mapeadas para outros campos (não devem ser consideradas preços)
        excluded_indices = set([v for v in mapped_columns.values() if v is not None])

        for col_info in all_column_analysis:
            col_idx = col_info['index']

            # Pular colunas já mapeadas
            if col_idx in excluded_indices:
                continue

            score = col_info['scores'].get('price', {}).get('total', 0)

            # Verificar se parece ser uma coluna de preço
            is_numeric = col_info['content_analysis'].get('has_numeric', False)
            name_score = col_info['scores'].get('price', {}).get('name', 0)

            # Preço precisa ser numérico E ter nome relacionado a preço
            if is_numeric and name_score >= min_confidence:
                price_columns.append({
                    'index': col_info['index'],
                    'name': col_info['header'].title(),
                    'confidence': round(name_score, 2)
                })

        # REMOVER DUPLICATAS - manter apenas a última ocorrência de cada nome
        price_columns = self._remove_duplicate_price_columns(price_columns)

        # LIMITAR A 3 COLUNAS DE PREÇO
        return price_columns[:3]

    def _remove_duplicate_price_columns(self, price_columns: List[Dict]) -> List[Dict]:
        """
        Remove colunas de preço duplicadas, mantendo apenas a última ocorrência
        Remove também colunas com "GRUPO" no nome (geralmente duplicatas)

        Args:
            price_columns: Lista de colunas de preço

        Returns:
            Lista filtrada sem duplicatas
        """
        if not price_columns:
            return []

        # 1. FILTRAR: Remover colunas com "GRUPO" no nome
        # Essas geralmente são duplicatas de outras colunas
        filtered_columns = []
        for col in price_columns:
            # Verificar se tem "GRUPO" no nome
            if 'grupo' not in col['name'].lower():
                filtered_columns.append(col)

        # 2. REMOVER DUPLICATAS: normalizar nomes para comparação
        def normalize_name(name: str) -> str:
            return ' '.join(name.lower().split())

        # Dicionário para rastrear: nome_normalizado -> última ocorrência
        seen = {}

        for col in filtered_columns:
            normalized = normalize_name(col['name'])
            # Sempre sobrescreve com a última ocorrência
            seen[normalized] = col

        # Retornar apenas as últimas ocorrências, ordenadas por índice
        unique_columns = list(seen.values())
        unique_columns.sort(key=lambda x: x['index'])

        return unique_columns

    def _score_to_confidence_label(self, score: float) -> str:
        """
        Converte score numérico em label de confiança

        Args:
            score: Score de 0.0 a 1.0

        Returns:
            Label: 'high', 'medium' ou 'low'
        """
        if score >= 0.8:
            return 'high'
        elif score >= 0.6:
            return 'medium'
        else:
            return 'low'


def suggest_column_mapping(file_path: str, header_row: int = 0, sample_rows: int = 10) -> Dict[str, Any]:
    """
    Função auxiliar para sugerir mapeamento de colunas a partir de um arquivo

    Args:
        file_path: Caminho do arquivo Excel
        header_row: Linha que contém os headers
        sample_rows: Número de linhas para análise

    Returns:
        Dicionário com sugestões de mapeamento
    """
    df = pd.read_excel(file_path, header=None)
    mapper = ColumnMapperService(df, header_row=header_row, sample_rows=sample_rows)
    return mapper.suggest_mapping()
