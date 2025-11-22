import { ListingCard } from './index'

export function Listing({ listing, username, onNavigate }: { listing: any; username: string; onNavigate: (path: string) => void }) {
  return <ListingCard listing={listing} username={username} onNavigate={onNavigate} />
}

