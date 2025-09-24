import { useState, useEffect } from 'react'
import { Input, Textarea, Button, Header } from '../../components/Tailwind'
import { slugify } from '../../helpers'
import { ListDto, EntityDto } from '../../types'
import { SearchInput } from '../../components/SearchInput'
import { entityService } from '../../services/api/Entity'
import { listService } from '../../services/api/List'
import { useSession } from '../../context/SessionContext'

type CreateOrEditHomepageProps = {
  selectedList: ListDto | null
  setSelectedList: React.Dispatch<React.SetStateAction<ListDto | null>>
  onSaveProductsToList?: (entityList: { create?: Array<{ entityId: string; quantity?: number }>; update?: Array<{ id: string; quantity?: number }>; delete?: string[] }) => void
}

export function CreateOrEditHomepage({
  selectedList,
  setSelectedList,
  onSaveProductsToList,
}: CreateOrEditHomepageProps) {
  const { currentUser } = useSession()
  const [searchText, setSearchText] = useState('')
  const [searchResults, setSearchResults] = useState<EntityDto[]>([])
  const [selectedEntities, setSelectedEntities] = useState<Array<{ entityId: string; entity: EntityDto; quantity?: number }>>([])

  useEffect(() => {
    if (selectedList?.entityList && selectedList.entityList.length > 0) {
      const existingEntities = selectedList.entityList.map(entityListItem => ({
        entityId: entityListItem.entityId!,
        entity: entityListItem.entity!,
        quantity: entityListItem.quantity || 1
      }))
      setSelectedEntities(existingEntities)
    } else {
      setSelectedEntities([])
    }
  }, [selectedList])

  //Auto-save product changes whenever selectedEntities change
  useEffect(() => {
    if (onSaveProductsToList && selectedList?.id) {
      const existingEntityIds = selectedList?.entityList?.map(item => item.entityId).filter((id): id is string => Boolean(id)) || []
      const newEntities = selectedEntities.filter(item => !existingEntityIds.includes(item.entityId))
      const updatedEntities = selectedEntities.filter(item => existingEntityIds.includes(item.entityId))
      const removedEntities = existingEntityIds.filter(id => !selectedEntities.some(item => item.entityId === id))

      const entityList = {
        create: newEntities.map(item => ({
          entityId: item.entityId,
          quantity: item.quantity
        })),
        update: updatedEntities.map(item => {
          const entityListItem = selectedList?.entityList?.find(el => el.entityId === item.entityId)
          return {
            id: entityListItem?.id || '',
            quantity: item.quantity
          }
        }),
        delete: removedEntities
      }

      onSaveProductsToList(entityList)
    }
  }, [selectedEntities, selectedList, onSaveProductsToList])

  const performSearch = async (query: string) => {
    setSearchText(query)
    if (!query.trim()) {
      setSearchResults([])
      return
    }

    try {
      const productEntitiesQueryParams = new URLSearchParams({
        search: query,
        page: '0',
        limit: '20',
      })

      const response = await entityService.list(`?${productEntitiesQueryParams.toString()}`)
      setSearchResults(response.data || [])
    } catch (error) {
      console.log('Error searching entities.', error)
      setSearchResults([])
    }
  }

  const handleAddEntity = (entity: EntityDto) => {
    const isAlreadySelected = selectedEntities.some(item => item.entityId === entity.id)
    if (!isAlreadySelected) {
      setSelectedEntities(prev => [...prev, { entityId: entity.id!, entity, quantity: 1 }])
    }
  }

  const handleRemoveEntity = (entityId: string) => {
    setSelectedEntities(prev => prev.filter(item => item.entityId !== entityId))
  }

  const handleQuantityChange = (entityId: string, quantity: number) => {
    setSelectedEntities(prev =>
      prev.map(item =>
        item.entityId === entityId
          ? { ...item, quantity: quantity > 0 ? quantity : 1 }
          : item
      )
    )
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, imageField: 'banner' | 'logo') => {
    const file = e.target.files?.[0]
    if (!file || !selectedList?.id) return

    const formData = new FormData()
    formData.append('file', file)
    formData.append('marketId', 'tcgx')

    try {
      const response = await listService.uploadImage(selectedList.id, formData, imageField)
      setSelectedList((prev) => prev && {
        ...prev,
        [imageField]: imageField === 'banner' ? response?.banner : response?.logo
      })
    } catch (err) {
      console.log('Image upload failed.', err)
    }
  }

  const handleBannerUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleImageUpload(e, 'banner')
  }

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleImageUpload(e, 'logo')
  }

  const handleRemoveImage = async (imageField: 'banner' | 'logo') => {
    if (!selectedList?.id || !currentUser?.admin?.id) return

    try {
      await listService.deleteImage(selectedList.id, currentUser.admin.id, imageField)
      setSelectedList((prev) => prev && { ...prev, [imageField]: null })
    } catch (err) {
      console.log('Image deletion failed.', err)
    }
  }

  //Navigation handlers
  const handleNavigationTypeChange = (type: string) => {
    setSelectedList((prev) => prev ? {
      ...prev,
      navigation: {
        type,
        id: prev.navigation && typeof prev.navigation === 'object' && 'id' in prev.navigation
        //eslint-disable-next-line @typescript-eslint/no-explicit-any
          ? (prev.navigation as any).id
          : '',
        text: prev.navigation && typeof prev.navigation === 'object' && 'text' in prev.navigation
        //eslint-disable-next-line @typescript-eslint/no-explicit-any
          ? (prev.navigation as any).text
          : ''
      }
      //eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any : null)
  }

  const handleNavigationIdChange = (id: string) => {
    setSelectedList((prev) => prev ? {
      ...prev,
      navigation: {
        type: prev.navigation && typeof prev.navigation === 'object' && 'type' in prev.navigation
        //eslint-disable-next-line @typescript-eslint/no-explicit-any
          ? (prev.navigation as any).type
          : '',
        id,
        text: prev.navigation && typeof prev.navigation === 'object' && 'text' in prev.navigation
        //eslint-disable-next-line @typescript-eslint/no-explicit-any
          ? (prev.navigation as any).text
          : ''
      }
    //eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any : null)
  }

  const handleNavigationTextChange = (text: string) => {
    setSelectedList((prev) => prev ? {
      ...prev,
      navigation: {
        type: prev.navigation && typeof prev.navigation === 'object' && 'type' in prev.navigation
        //eslint-disable-next-line @typescript-eslint/no-explicit-any
          ? (prev.navigation as any).type
          : '',
        id: prev.navigation && typeof prev.navigation === 'object' && 'id' in prev.navigation
        //eslint-disable-next-line @typescript-eslint/no-explicit-any
          ? (prev.navigation as any).id
          : '',
        text
      }
    //eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any : null)
  }

  const handleClearNavigation = () => {
    setSelectedList((prev) => prev && { ...prev, navigation: null })
  }

  return (
    <div className="space-y-6">
      {/*Basic List Information */}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-bold mb-1">Display Name</label>
          <Input
            type="text"
            value={selectedList?.displayName || ''}
            onChange={(e) =>
              setSelectedList({
                ...selectedList!,
                displayName: e.target.value,
                name: slugify(e.target.value),
              })
            }
            placeholder="Enter homepage list display name"
          />
        </div>
        <div>
          <label className="block text-sm font-bold mb-1">Description</label>
          <Textarea
            value={selectedList?.description || ''}
            onChange={(e) =>
              setSelectedList({
                ...selectedList!,
                description: e.target.value,
              })
            }
            placeholder="Enter homepage list description"
            rows={3}
          />
        </div>
        <div>
          <label className="block text-sm font-bold mb-1">Index</label>
          <Input
            type="number"
            value={selectedList?.index || ''}
            onChange={(e) =>
              setSelectedList({
                ...selectedList!,
                index: e.target.value ? parseInt(e.target.value) : null,
              })
            }
            placeholder="Enter list index (for ordering)"
          />
        </div>
      </div>

      {/*Image Upload Section */}
      <div className="space-y-4">
        <Header level={4}>Images</Header>

        {/*Banner Upload */}
        <div>
          <label className="block text-sm font-bold mb-1">Banner Image</label>
          <div className="space-y-2">
            {selectedList?.banner && (
              <div className="flex items-center space-x-2">
                <img
                  src={`${process.env.REACT_APP_S3_IMAGE_BASE_URL}${selectedList.banner}`}
                  alt="Banner preview"
                  className="w-64 h-40 object-cover rounded border"
                />
                <Button
                  color="red"
                  onClick={() => handleRemoveImage('banner')}
                >
                  Remove Banner
                </Button>
              </div>
            )}
            <input
              type="file"
              accept="image/*"
              onChange={handleBannerUpload}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
          </div>
        </div>

        {/*Logo Upload */}
        <div>
          <label className="block text-sm font-bold mb-1">Logo Image</label>
          <div className="space-y-2">
            {selectedList?.logo && (
              <div className="flex items-center space-x-2">
                <img
                  src={`${process.env.REACT_APP_S3_IMAGE_BASE_URL}${selectedList.logo}`}
                  alt="Logo preview"
                  className="w-16 h-16 object-cover rounded border"
                />
                <Button
                  color="red"
                  onClick={() => handleRemoveImage('logo')}
                >
                  Remove Logo
                </Button>
              </div>
            )}
            <input
              type="file"
              accept="image/*"
              onChange={handleLogoUpload}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
          </div>
        </div>
      </div>

      {/*Navigation Section */}
      <div className="space-y-4">
        <Header level={4}>Navigation</Header>
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <label className="block text-sm font-bold">Type:</label>
            <select
              value={selectedList?.navigation && typeof selectedList.navigation === 'object' && 'type' in selectedList.navigation
              //eslint-disable-next-line @typescript-eslint/no-explicit-any
                ? (selectedList.navigation as any).type
                : ''}
              onChange={(e) => handleNavigationTypeChange(e.target.value)}
              className="px-3 py-1 border rounded text-sm"
            >
              <option value="">Select type...</option>
              <option value='Set'>Set</option>
              <option value='Category'>Category</option>
              <option value='Brand'>Brand</option>
              <option value='Product'>Product</option>
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <label className="block text-sm font-bold">ID:</label>
            <Input
              type="text"
              value={selectedList?.navigation && typeof selectedList.navigation === 'object' && 'id' in selectedList.navigation
              //eslint-disable-next-line @typescript-eslint/no-explicit-any
                ? (selectedList.navigation as any).id
                : ''}
              onChange={(e) => handleNavigationIdChange(e.target.value)}
              placeholder="Enter navigation ID"
              className="flex-1"
            />
          </div>

          <div className="flex items-center space-x-2">
            <label className="block text-sm font-bold">Text:</label>
            <Input
              type="text"
              value={selectedList?.navigation && typeof selectedList.navigation === 'object' && 'text' in selectedList.navigation
              //eslint-disable-next-line @typescript-eslint/no-explicit-any
                ? (selectedList.navigation as any).text
                : ''}
              onChange={(e) => handleNavigationTextChange(e.target.value)}
              placeholder="Enter navigation text"
              className="flex-1"
            />
          </div>

          {(selectedList?.navigation && typeof selectedList.navigation === 'object' &&
            ('type' in selectedList.navigation || 'id' in selectedList.navigation || 'text' in selectedList.navigation)) && (
            <div className="flex items-center space-x-2">
              <Button
                color="red"
                onClick={handleClearNavigation}
              >
                Clear Navigation
              </Button>
            </div>
          )}
        </div>
      </div>

      {/*Product Management Section - Only show for existing lists */}
      {selectedList?.id && (
        <div className="space-y-4">

          {/*Search Section */}
          <div>
            <Header level={4}>Search Products</Header>
            <SearchInput
              value={searchText}
              onSearch={performSearch}
              placeholder="Search for products..."
            />
          </div>

          {/*Search Results */}
          {searchResults.length > 0 && (
            <div>
              <Header level={4}>Search Results</Header>
              <div className="max-h-60 overflow-y-auto border rounded-lg">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-900">Name</th>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-900">Product Number</th>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-900">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {searchResults.map((entity) => {
                      const isSelected = selectedEntities.some(item => item.entityId === entity.id)
                      return (
                        <tr key={entity.id}>
                          <td className="px-4 py-2 text-sm text-gray-900">
                            {entity.displayName}
                          </td>
                          <td className="px-4 py-2 text-sm text-gray-900">
                            {entity.product?.number || 'N/A'}
                          </td>
                          <td className="px-4 py-2 text-sm text-gray-900">
                            <Button
                              color={isSelected ? 'zinc' : 'blue'}
                              onClick={() => handleAddEntity(entity)}
                              disabled={isSelected}
                            >
                              {isSelected ? 'Added' : 'Add'}
                            </Button>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/*Selected Entities Section */}
          <div>
            <Header level={4}>Selected Products ({selectedEntities.length})</Header>

            {selectedEntities.length > 0 && (
              <div className="max-h-60 overflow-y-auto border rounded-lg">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-900">Name</th>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-900">Product Number</th>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-900">Quantity</th>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-900">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {selectedEntities.map((item) => (
                      <tr key={item.entityId}>
                        <td className="px-4 py-2 text-sm text-gray-900">
                          {item.entity.displayName}
                        </td>
                        <td className="px-4 py-2 text-sm text-gray-900">
                          {item.entity.product?.number || 'N/A'}
                        </td>
                        <td className="px-4 py-2 text-sm text-gray-900">
                          <input
                            type="number"
                            min="1"
                            value={item.quantity || 1}
                            onChange={(e) => handleQuantityChange(item.entityId, parseInt(e.target.value) || 1)}
                            className="w-20 px-2 py-1 border rounded text-sm"
                          />
                        </td>
                        <td className="px-4 py-2 text-sm text-gray-900">
                          <Button
                            color="red"
                            onClick={() => handleRemoveEntity(item.entityId)}
                          >
                            Remove
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {selectedEntities.length === 0 && (
              <p className="text-gray-500 text-sm">No products selected yet.</p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}