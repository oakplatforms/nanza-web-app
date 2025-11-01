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
    <div className="flex justify-end items-center space-x-2">
      <Button
        color="zinc"
        disabled={isFirstPage}
        onClick={onPrev}
      >
        <svg width="8" height="12" viewBox="0 0 52 80" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ transform: 'scaleX(-1)' }}>
          <path d="M5.51659 74.4826L0 68.9653L14.509 54.456L29.018 39.9467L14.5883 25.5172C6.65199 17.5811 0.158624 11.0398 0.158624 10.9812C0.158624 10.8423 11.0017 0 11.1405 0C11.1987 0 20.2463 9 31.2462 20L51.2459 40L31.2462 60C20.2463 71 11.1984 80 11.1398 80C11.0812 80 8.55072 77.5172 5.51659 74.4826Z" fill="currentColor" />
        </svg>
      </Button>
      <span className="font-figtree font-medium text-zinc-800 text-sm px-2">Page {currentPage + 1}</span>
      <Button
        color="zinc"
        disabled={isLastPage}
        onClick={onNext}
      >
        <svg width="8" height="12" viewBox="0 0 52 80" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M5.51659 74.4826L0 68.9653L14.509 54.456L29.018 39.9467L14.5883 25.5172C6.65199 17.5811 0.158624 11.0398 0.158624 10.9812C0.158624 10.8423 11.0017 0 11.1405 0C11.1987 0 20.2463 9 31.2462 20L51.2459 40L31.2462 60C20.2463 71 11.1984 80 11.1398 80C11.0812 80 8.55072 77.5172 5.51659 74.4826Z" fill="currentColor" />
        </svg>
      </Button>
    </div>
  )
}
