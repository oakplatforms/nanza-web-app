import { EntityCard } from '../../entity/EntityCard'
import { BidDto } from '../../../types'

export function BidCard({ bid, username, onNavigate }: { bid: BidDto; username: string; onNavigate: (path: string) => void }) {
  // Ensure bid has an entity
  if (!bid.entity) {
    return null
  }

  return (
    <EntityCard
      entity={bid.entity}
      bid={bid}
      onNavigate={onNavigate}
    />
  )
}

