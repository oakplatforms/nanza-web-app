import { ListingCard } from './index'
import { ListingDto } from '../../../types'

export function Listing({ listing, username, onNavigate }: { listing: ListingDto; username: string; onNavigate: (path: string) => void }) {
  return <ListingCard listing={listing} username={username} onNavigate={onNavigate} />
}

