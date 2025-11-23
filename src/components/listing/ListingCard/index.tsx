import { EntityCard } from '../../entity/EntityCard'
import { ListingDto } from '../../../types'

export function ListingCard({ listing, username, onNavigate }: { listing: ListingDto; username: string; onNavigate: (path: string) => void }) {
  // Ensure listing has an entity
  if (!listing.entity) {
    return null
  }

  return (
    <EntityCard
      entity={listing.entity}
      listing={listing}
      username={username}
      onNavigate={onNavigate}
    />
  )
}

