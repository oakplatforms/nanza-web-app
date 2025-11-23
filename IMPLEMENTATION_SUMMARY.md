# Listing and Bid Detail Pages - Implementation Summary

## Overview
Created separate detail page components for listings and bids, cloned from EntityDetail but without the bid/ask table. Added routes that support listing IDs, bid IDs, and usernames through a unified routing system.

## Files Created

### 1. ListingDetail Component
- **File**: `src/app/ListingDetail/index.tsx`
- **Purpose**: Displays listing detail page with entity information and listing-specific fields
- **Features**:
  - Shows entity image, description, tags, product number
  - Displays listing-specific fields: condition, price, quantity, multi-transaction badge
  - No bid/ask table (removed from EntityDetail)
  - Supports both `:listingId` and `:id` route parameters

### 2. BidDetail Component
- **File**: `src/app/BidDetail/index.tsx`
- **Purpose**: Displays bid detail page with entity information and bid-specific fields
- **Features**:
  - Shows entity image, description, tags, product number
  - Displays bid-specific fields: conditions (array), price, quantity, multi-transaction badge
  - No bid/ask table (removed from EntityDetail)
  - Supports both `:bidId` and `:id` route parameters

### 3. Bid Fetch Hook
- **File**: `src/app/BidDetail/data/fetchBid.ts`
- **Purpose**: Fetches bid data with all necessary entity relations
- **Includes**:
  - `account.profile`
  - `entity.brand`
  - `entity.product`
  - `entity.entityTags.tag`
  - `entity.set`
  - `conditions`

### 4. UniversalDetail Component
- **File**: `src/app/UniversalDetail/index.tsx`
- **Purpose**: Unified route handler that determines if an ID is a listing, bid, or username
- **Logic**:
  - Fetches all three types in parallel (listing, bid, profile)
  - Renders the first match found (listing > bid > profile)
  - Shows loading state only if no match found and queries are still loading
  - Handles all three cases: `/:id` works for listing IDs, bid IDs, and usernames

### 5. ListingOrBidDetail Component (Legacy)
- **File**: `src/app/ListingOrBidDetail/index.tsx`
- **Status**: Created but replaced by UniversalDetail
- **Note**: Kept for reference but not used in routes

## Files Modified

### 1. AppLayout.tsx
- **Changes**:
  - Removed separate `/:username` route that was conflicting
  - Updated `/:id` route to use `UniversalDetail` component
  - Single route now handles: listing IDs, bid IDs, and usernames
  - Route order: specific routes → two-segment routes → single-segment catch-all

### 2. Listing Data Fetch Hook
- **File**: `src/app/Listing/data/fetchListing.ts`
- **Changes**: Enhanced includes to fetch all entity relations:
  - `entity.brand`
  - `entity.product`
  - `entity.entityTags.tag`
  - `entity.set`
  - `condition`

### 3. EntityCard Component
- **File**: `src/components/entity/EntityCard/index.tsx`
- **Changes**:
  - Updated navigation to route listings to `/${listing.id}`
  - Updated navigation to route bids to `/${bid.id}`
  - Removed unused `username` prop

### 4. ListingCard Component
- **File**: `src/components/listing/ListingCard/index.tsx`
- **Changes**: Removed `username` prop from EntityCard call (no longer needed)

### 5. BidCard Component
- **File**: `src/components/bid/BidCard/index.tsx`
- **Changes**: Removed `username` prop from EntityCard call (no longer needed)

### 6. UserProfile Component
- **File**: `src/app/UserProfile/index.tsx`
- **Changes**:
  - Updated to accept both `username` and `id` route parameters
  - Uses profile username from API response when available
  - Falls back to route parameter for display purposes
  - Works with both `/:username` and `/:id` routes

## Route Structure

### Final Route Configuration
```
/:id → UniversalDetail (handles listing IDs, bid IDs, and usernames)
/:brandSlug/:entityId → EntityDetail
/:username/:listingId → Listing (legacy route, still supported)
```

### Route Matching Priority
1. Specific routes (dashboard, products, tags, etc.)
2. Two-segment routes (`/:brandSlug/:entityId`, `/:username/:listingId`)
3. Single-segment catch-all (`/:id`) - handles listings, bids, and profiles

## Key Implementation Details

### UniversalDetail Logic
- Fetches listing, bid, and profile in parallel using React Query
- Determines type by checking which query returns data first
- Priority: Listing → Bid → Profile
- Only shows loading if no match found and queries are still loading
- Shows "Not found" only after all queries complete with no matches

### Navigation Updates
- EntityCard now navigates to:
  - `/${listing.id}` for listings
  - `/${bid.id}` for bids
  - `/${brandSlug}/${entity.id}` for entities (unchanged)

### Data Fetching
- All detail pages fetch with full entity relations
- Listing includes: entity with brand, product, tags, set, and condition
- Bid includes: entity with brand, product, tags, set, and conditions array
- Profile includes: account with listings, bids, and lists

## Bug Fixes

1. **Import Error**: Fixed `useEffect` import in ListingOrBidDetail (should be from 'react', not 'react-router-dom')
2. **Route Conflict**: Resolved conflict between `/:username` and `/:id` routes by using UniversalDetail
3. **UserProfile Loading**: Fixed UserProfile to accept both `username` and `id` params
4. **Loading Logic**: Fixed UniversalDetail to render immediately when match found, not wait for all queries

## Testing Considerations

- Test routes with:
  - Valid listing ID: `/:listingId`
  - Valid bid ID: `/:bidId`
  - Valid username: `/:username`
  - Invalid IDs should show "Not found"
- Verify EntityCard navigation works for all three types
- Confirm UserProfile loads correctly via `/:id` route
- Ensure listing and bid detail pages show all required fields

