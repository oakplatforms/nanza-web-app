import React from 'react'
import { Button } from './Tailwind'

type PaginationControlsProps = {
  currentPage: number
  total: number
  onPrev: () => void
  onNext: () => void
}

export const PaginationControls: React.FC<PaginationControlsProps> = ({
  currentPage,
  total,
  onPrev,
  onNext,
}) => {
  const isFirstPage = currentPage === 0
  const isLastPage = (currentPage + 1) * 10 >= total

  if (total <= 10) return null

  return (
    <div className="flex justify-end items-center mt-4 space-x-2">
      <Button
        color="zinc"
        disabled={isFirstPage}
        onClick={onPrev}
      >
        Prev
      </Button>
      <span className="text-sm px-2">Page {currentPage + 1}</span>
      <Button
        color="zinc"
        disabled={isLastPage}
        onClick={onNext}
      >
        Next
      </Button>
    </div>
  )
}
