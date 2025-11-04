/**
 * Botão "Ver mais" para paginação
 */

import { Button } from '@/components/ui'

export interface LoadMoreButtonProps {
  remainingCount: number
  onClick: () => void
}

export function LoadMoreButton({ remainingCount, onClick }: LoadMoreButtonProps) {
  return (
    <div className="flex justify-center pt-6">
      <Button variant="outline" onClick={onClick} className="min-w-[200px]">
        Ver mais ({remainingCount} restantes)
      </Button>
    </div>
  )
}
