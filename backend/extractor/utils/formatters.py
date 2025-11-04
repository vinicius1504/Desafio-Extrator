"""
Formatadores de dados para exportação
"""
import re
from decimal import Decimal


class DataFormatter:
    """Formata dados de produtos para exportação"""

    @staticmethod
    def format_price(value):
        """
        Formata preço para Real brasileiro
        Entrada: 123.45 ou "123.45"
        Saída: "R$ 123,45"
        """
        if value is None or value == '':
            return ''

        try:
            # Converter para float se for string
            if isinstance(value, str):
                # Remover possíveis caracteres não numéricos
                value = re.sub(r'[^\d.]', '', value)
                if not value:
                    return ''
                value = float(value)

            # Formatar em BRL
            return f"R$ {value:,.2f}".replace(',', 'X').replace('.', ',').replace('X', '.')
        except (ValueError, TypeError):
            return str(value)

    @staticmethod
    def parse_dimensions(dimensions_str):
        """
        Analisa string de dimensões e retorna dicionário
        Entrada: "A15 * L45 * P45" ou "A40 * Ø50"
        Saída: {
            'altura': 15,
            'largura': 45,
            'profundidade': 45,
            'diametro': None,
            'formatted': 'Altura: 15cm, Largura: 45cm, Profundidade: 45cm'
        }
        """
        if not dimensions_str or dimensions_str == 'nan':
            return {
                'altura': None,
                'largura': None,
                'profundidade': None,
                'diametro': None,
                'formatted': ''
            }

        result = {
            'altura': None,
            'largura': None,
            'profundidade': None,
            'diametro': None,
            'formatted': ''
        }

        # Patterns para extrair valores
        altura_pattern = r'A\s*(\d+(?:\.\d+)?)'
        largura_pattern = r'L\s*(\d+(?:\.\d+)?)'
        profundidade_pattern = r'P\s*(\d+(?:\.\d+)?)'
        diametro_pattern = r'[ØO]\s*(\d+(?:\.\d+)?)'

        # Extrair valores
        altura_match = re.search(altura_pattern, dimensions_str, re.IGNORECASE)
        largura_match = re.search(largura_pattern, dimensions_str, re.IGNORECASE)
        profundidade_match = re.search(profundidade_pattern, dimensions_str, re.IGNORECASE)
        diametro_match = re.search(diametro_pattern, dimensions_str)

        if altura_match:
            result['altura'] = float(altura_match.group(1))
        if largura_match:
            result['largura'] = float(largura_match.group(1))
        if profundidade_match:
            result['profundidade'] = float(profundidade_match.group(1))
        if diametro_match:
            result['diametro'] = float(diametro_match.group(1))

        # Formatar para string legível
        parts = []
        if result['altura']:
            parts.append(f"Altura: {result['altura']:.0f}cm")
        if result['largura']:
            parts.append(f"Largura: {result['largura']:.0f}cm")
        if result['profundidade']:
            parts.append(f"Profundidade: {result['profundidade']:.0f}cm")
        if result['diametro']:
            parts.append(f"Diâmetro: {result['diametro']:.0f}cm")

        result['formatted'] = ', '.join(parts)

        return result

    @staticmethod
    def format_weight(weight_value):
        """
        Formata peso com unidade apropriada
        Entrada: 0.55 ou 1.25 (em kg)
        Saída: "550g" ou "1,25kg"
        """
        if weight_value is None or weight_value == '':
            return ''

        try:
            weight = float(weight_value)

            # Se menor que 1kg, mostrar em gramas
            if weight < 1:
                grams = weight * 1000
                return f"{grams:.0f}g"
            else:
                # Se >= 1kg, mostrar em kg
                return f"{weight:.2f}kg".replace('.', ',')
        except (ValueError, TypeError):
            return str(weight_value)

    @staticmethod
    def format_cubic(cubic_value):
        """
        Formata valor cúbico
        Entrada: 0.037553
        Saída: "0,037553 m³"
        """
        if cubic_value is None or cubic_value == '':
            return ''

        try:
            cubic = float(cubic_value)
            return f"{cubic:.6f} m³".replace('.', ',')
        except (ValueError, TypeError):
            return str(cubic_value)

    @staticmethod
    def format_ncm(ncm_value):
        """
        Formata NCM (mantém como está, apenas garante string)
        Entrada: "94049000" ou 94049000
        Saída: "94049000"
        """
        if ncm_value is None or ncm_value == '':
            return ''

        return str(ncm_value).strip()

    @staticmethod
    def clean_description(description):
        """
        Limpa descrição removendo espaços excessivos
        """
        if not description:
            return ''

        # Remover múltiplos espaços
        cleaned = re.sub(r'\s+', ' ', str(description))
        return cleaned.strip()
