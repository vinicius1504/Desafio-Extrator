/**
 * Sistema de seleção de produtos
 */

export interface ProductSelectionProps {
  visibleCount: number
  selectedCount: number
  allVisibleSelected: boolean
  onToggleSelectAll: () => void
  onClearSelection: () => void
}

export function ProductSelection({
  visibleCount,
  selectedCount,
  allVisibleSelected,
  onToggleSelectAll,
  onClearSelection,
}: ProductSelectionProps) {
  return (
    <div className="flex items-center gap-3">
      <label className="flex items-center gap-2 cursor-pointer">
        <input
          type="checkbox"
          checked={allVisibleSelected && visibleCount > 0}
          onChange={onToggleSelectAll}
          className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
        />
        <span className="text-sm text-gray-700">
          Selecionar visíveis ({visibleCount})
        </span>
      </label>
      {selectedCount > 0 && (
        <button
          onClick={onClearSelection}
          className="text-sm text-primary-600 hover:text-primary-700"
        >
          Limpar seleção
        </button>
      )}
    </div>
  )
}
