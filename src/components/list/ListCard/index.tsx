import { useState } from 'react'

export function ListCard({ list, username, onNavigate }: { list: any; username: string; onNavigate: (path: string) => void }) {
  const [imageError, setImageError] = useState(false)
  const imageUrl = list.banner || list.logo
    ? `${process.env.REACT_APP_S3_IMAGE_BASE_URL}${list.banner || list.logo}`
    : null
  const displayName = list.displayName || list.name || 'Untitled List'

  return (
    <div
      onClick={() => {
        if (list.id) {
          onNavigate(`/${username}/list/${list.id}`)
        }
      }}
      className="bg-white overflow-hidden cursor-pointer"
    >
      {/*Image Section*/}
      <div className="aspect-video bg-gray-100 border-x-[16px] border-white flex items-center justify-center">
        {imageUrl && !imageError ? (
          <img
            src={imageUrl}
            alt={displayName}
            className="w-full h-full object-cover"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="text-gray-400 text-sm">No image</div>
        )}
      </div>

      {/*Details Section*/}
      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-1 line-clamp-2">
          {displayName}
        </h3>
        {list.description && (
          <p className="text-sm text-gray-600 line-clamp-2 mt-1">
            {list.description}
          </p>
        )}
        {list.entityList && (
          <p className="text-xs text-gray-500 mt-2">
            {list.entityList.length} {list.entityList.length === 1 ? 'item' : 'items'}
          </p>
        )}
      </div>
    </div>
  )
}

