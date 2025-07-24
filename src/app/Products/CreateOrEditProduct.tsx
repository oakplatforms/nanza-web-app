import { useState } from 'react'
import { Combobox } from '@headlessui/react'
import { Input, Select, Textarea } from '../../components/Tailwind'
import { slugify } from '../../helpers'
import { EntityDto, TagDto, EntityTagDto, CategoryDto, BrandDto } from '../../types'
import { CheckIcon, ChevronUpDownIcon } from '@heroicons/react/16/solid'
import { entityService } from '../../services/api/Entity'

type CreateOrEditProductProps = {
  selectedProductEntity?: EntityDto
  setSelectedProductEntity: React.Dispatch<React.SetStateAction<EntityDto | undefined>>
  tags?: TagDto[]
  selectedTags: EntityTagDto[] | []
  setSelectedTags: React.Dispatch<React.SetStateAction<EntityTagDto[]>>
  setDeletedTags: React.Dispatch<React.SetStateAction<string[]>>
  setUpdatedTags: React.Dispatch<React.SetStateAction<EntityTagDto[]>>
  categories: CategoryDto[]
  brands: BrandDto[]
  refetchProductEntities: () => void
}

export function CreateOrEditProduct({
  selectedProductEntity,
  setSelectedProductEntity,
  tags,
  selectedTags,
  setSelectedTags,
  setDeletedTags,
  setUpdatedTags,
  categories,
  brands,
  refetchProductEntities
} : CreateOrEditProductProps) {
  const [tag, setTag] = useState<Record<string, string>>({})
  console.log('selectedProductEntity', selectedProductEntity)
  const generateTagOptions = () => {
    const options: Record<string, { id: string; values: string[] }> = {}
    tags?.forEach((tag) => {
      if (tag.displayName) {
        options[tag.displayName] = {
          id: tag.id!,
          values: tag.supportedTagValues?.map((value) => value.displayName || '') || [],
        }
      }
    })
    return options
  }
  const tagOptions = generateTagOptions()

  const handleAddTagValue = (tagName: string, value: string) => {
    const tagId = tagOptions?.[tagName]?.id
    if (!tagId) return

    setSelectedTags((prev) => {
      if (!prev.some((tag) => tag.tagId === tagId && tag.tagValue === value)) {
        return [...prev, { tagId, tagValue: value }]
      }
      return prev
    })

    setDeletedTags((prev) => prev.filter((id) => id !== tagId))
  }

  const updateTagValue = (tagName: string, newValue: string) => {
    const tagId = tagOptions[tagName]?.id
    if (!tagId) return

    setUpdatedTags((prev) => {
      const tagExists = prev.some((tag) => tag.tagId === tagId)

      if (tagExists) {
        return prev.map((tag) =>
          tag.tagId === tagId ? { ...tag, tagValue: newValue } : tag
        )
      } else {
        const existingTag = selectedTags.find((tag) => tag.tagId === tagId)
        if (existingTag) {
          return [...prev, { ...existingTag, tagValue: newValue }]
        }
      }

      return prev
    })
  }

  const handleTagInputChange = (tagDisplayName: string, value: string) => {
    setTag((prev) => ({ ...prev, [tagDisplayName]: value }))
  }

  const handleTagInputBlur = (tagDisplayName: string) => {
    const tagId = tagOptions[tagDisplayName]?.id
    if (!tagId || !tag[tagDisplayName]) return

    if (selectedTags.some((tag) => tag.tagId === tagId)) {
      updateTagValue(tagDisplayName, tag[tagDisplayName])
    } else {
      handleAddTagValue(tagDisplayName, tag[tagDisplayName])
    }
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, imageField: 'image' | 'secondaryImage') => {
    const file = e.target.files?.[0]
    if (!file || !selectedProductEntity?.id) return

    const formData = new FormData()
    formData.append('file', file)
    formData.append('marketId', 'tcgx')

    try {
      const response = await entityService.uploadImage(selectedProductEntity.id, formData, imageField)
      setSelectedProductEntity((prev) => prev && { ...prev, [imageField]: imageField === 'image' ? response?.image : response?.secondaryImage })
      refetchProductEntities()
    } catch (err) {
      console.error('Image upload failed:', err)
    }
  }

  const handlePrimaryImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleImageUpload(e, 'image')
  }

  const handleSecondaryImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleImageUpload(e, 'secondaryImage')
  }

  const handleRemoveImage = async (imageField: 'image' | 'secondaryImage') => {
    if (!selectedProductEntity?.id) return

    try {
      await entityService.deleteImage(selectedProductEntity.id, imageField)
      setSelectedProductEntity((prev) => prev && { ...prev, [imageField]: null })
      refetchProductEntities()
    } catch (err) {
      console.error('Image deletion failed:', err)
    }
  }

  const handleRemoveTagValue = (tagName: string, value: string) => {
    const tagId = tagOptions?.[tagName]?.id
    if (!tagId) return

    const existingTag = selectedTags.find(
      (tag) => tag.tagId === tagId && tag.tagValue === value
    )

    if (existingTag?.id) {
      setDeletedTags((prev) => {
        if (!prev.includes(existingTag.id!)) {
          return [...prev, existingTag.id!]
        }
        return prev
      })
    }

    setSelectedTags((prev) =>
      prev.filter((tag) => !(tag.tagId === tagId && tag.tagValue === value))
    )
  }

  const renderEntityTags = () => {
    return Object.entries(tagOptions).map(([tagDisplayName, { id, values }]) => (
      <div className="mb-4" key={id}>
        <label className="block text-sm font-bold mb-1">{tagDisplayName}</label>
        {values.length === 0 ? (
          <input
            type="text"
            className="w-full px-3 py-2 border rounded-md placeholder-gray-400"
            placeholder={`Enter ${tagDisplayName}`}
            value={tag[tagDisplayName] || selectedTags.find(selectedTag => selectedTag.tagId === id)?.tagValue || ''}
            onChange={(event) => handleTagInputChange(tagDisplayName, event.target.value)}
            onBlur={() => handleTagInputBlur(tagDisplayName)}
          />
        ) : (
          <Combobox
            as="div"
            value=""
            onChange={(value: string) => handleAddTagValue(tagDisplayName, value)}
          >
            <div className="relative mt-2">
              <div className="flex flex-wrap items-center gap-2 px-2 py-1.5 border rounded-md bg-white h-[40px]">
                {selectedTags
                  .filter((tag) => tag.tagId === tagOptions[tagDisplayName]?.id)
                  .map((tag) => tag.tagValue)
                  .filter((value): value is string => value !== undefined)
                  .map((value) => (
                    <span
                      key={value}
                      className="inline-flex items-center px-2 py-1 text-sm text-neutral-700 bg-gray-200 rounded-full"
                    >
                      {value}
                      <button
                        type="button"
                        onClick={() => handleRemoveTagValue(tagDisplayName, value)}
                        className="ml-2 text-xs text-neutral-700 hover:text-neutral-900"
                      >
                        ×
                      </button>
                    </span>
                  ))}
              </div>
              <Combobox.Button className="absolute inset-y-0 right-0 flex items-center rounded-r-md px-2 focus:outline-none">
                <ChevronUpDownIcon className="size-5 text-gray-400" aria-hidden="true" />
              </Combobox.Button>
              {values.length > 0 && (
                <Combobox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black/5 focus:outline-none sm:text-sm">
                  {values
                    .filter((option) =>
                      option.toLowerCase().includes(tag[tagDisplayName]?.toLowerCase() || '')
                    )
                    .map((option) => (
                      <Combobox.Option
                        key={option}
                        value={option}
                        className="group relative cursor-default select-none py-2 pl-3 pr-9 text-gray-900 data-[focus]:bg-indigo-600 data-[focus]:text-white data-[focus]:outline-none"
                      >
                        <span className="block truncate group-data-[selected]:font-semibold">
                          {option}
                        </span>
                        <span className="absolute inset-y-0 right-0 hidden items-center pr-4 text-indigo-600 group-data-[selected]:flex group-data-[focus]:text-white">
                          <CheckIcon className="size-5" aria-hidden="true" />
                        </span>
                      </Combobox.Option>
                    ))}
                </Combobox.Options>
              )}
            </div>
          </Combobox>
        )}
      </div>
    ))

  }

  return (
    <div>
      <div>
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white shadow-md ring-1 ring-gray-200 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Product Details</h2>
            <div className="space-y-4">
              <div>
                <Input
                  type="text"
                  value={selectedProductEntity?.displayName || ''}
                  onChange={(e) =>
                    setSelectedProductEntity({
                      ...selectedProductEntity,
                      type: 'PRODUCT',
                      displayName: e.target.value,
                      name: slugify(e.target.value),
                    })
                  }
                  label="Product Name"
                  placeholder="Enter product name"
                />
              </div>
              <div>
                <Textarea
                  label="Description"
                  value={selectedProductEntity?.description || ''}
                  onChange={(e) => setSelectedProductEntity({ ...selectedProductEntity, type: 'PRODUCT', description: e.target.value })}
                  placeholder="Enter product description"
                  resizable={false}
                  rows={3}
                  className="resize-none"
                />
              </div>
              <div>
                <Input
                  type="text"
                  value={selectedProductEntity?.product?.number || ''}
                  onChange={(e) =>
                    setSelectedProductEntity({
                      ...selectedProductEntity,
                      type: 'PRODUCT',
                      product: {
                        type: 'CARD',
                        number: e.target.value,
                      }
                    })
                  }
                  label="Product Number"
                  placeholder="Enter product number"
                />
              </div>
              <div>
                <label className="block text-sm font-bold mb-1">Category</label>
                <Select
                  value={selectedProductEntity?.categoryId || ''}
                  onChange={(e) =>
                    setSelectedProductEntity((prev) => ({
                      ...prev!,
                      categoryId: e.target.value,
                    }))
                  }
                >
                  <option value="">Select a category</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.displayName || category.name}
                    </option>
                  ))}
                </Select>
              </div>
              <div>
                <label className="block text-sm font-bold mb-1">Brand</label>
                <Select
                  value={selectedProductEntity?.brandId || ''}
                  onChange={(e) =>
                    setSelectedProductEntity((prev) => ({
                      ...prev!,
                      brandId: e.target.value,
                    }))
                  }
                >
                  <option value="">Select a brand</option>
                  {brands.map((brand) => (
                    <option key={brand.id} value={brand.id}>
                      {brand.displayName || brand.name}
                    </option>
                  ))}
                </Select>
              </div>
            </div>
          </div>
          <div className="bg-white shadow-md ring-1 ring-gray-200 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Product Images</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-sm font-bold mb-2">Primary Image</label>
                {selectedProductEntity?.image ? (
                  <img
                    src={`${process.env.REACT_APP_S3_IMAGE_BASE_URL}/${selectedProductEntity.image}`}
                    alt="Product Primary"
                    className="w-full max-w-48 h-auto rounded border"
                  />
                ) : (
                  <div className="w-full max-w-48 h-32 bg-gray-100 rounded border-2 border-dashed border-gray-300 flex items-center justify-center">
                    <span className="text-gray-500 text-sm">No primary image</span>
                  </div>
                )}
              </div>
              <div>
                <label className="block text-sm font-bold mb-2">Secondary Image</label>
                {selectedProductEntity?.secondaryImage ? (
                  <img
                    src={`${process.env.REACT_APP_S3_IMAGE_BASE_URL}/${selectedProductEntity.secondaryImage}`}
                    alt="Product Secondary"
                    className="w-full max-w-48 h-auto rounded border"
                  />
                ) : (
                  <div className="w-full max-w-48 h-32 bg-gray-100 rounded border-2 border-dashed border-gray-300 flex items-center justify-center">
                    <span className="text-gray-500 text-sm">No secondary image</span>
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                {!selectedProductEntity?.image && (
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePrimaryImageUpload}
                    className="block w-full text-sm text-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  />
                )}
                {selectedProductEntity?.image && (
                  <button
                    type="button"
                    onClick={() => handleRemoveImage('image')}
                    className="px-3 py-2 text-sm text-red-600 border border-red-300 rounded-md hover:bg-red-50 hover:border-red-400 transition-colors"
                  >
                    Remove Image
                  </button>
                )}
              </div>
              <div>
                {!selectedProductEntity?.secondaryImage && (
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleSecondaryImageUpload}
                    className="block w-full text-sm text-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  />
                )}
                {selectedProductEntity?.secondaryImage && (
                  <button
                    type="button"
                    onClick={() => handleRemoveImage('secondaryImage')}
                    className="px-3 py-2 text-sm text-red-600 border border-red-300 rounded-md hover:bg-red-50 hover:border-red-400 transition-colors"
                  >
                    Remove Image
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="bg-white shadow-md ring-1 ring-gray-200 rounded-lg p-6">
            <div className="bg-white shadow-md ring-1 ring-gray-200 rounded-lg p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Product Tags</h2>
              {renderEntityTags()}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
