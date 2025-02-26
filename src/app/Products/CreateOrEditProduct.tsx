import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Combobox } from '@headlessui/react'
import { CheckIcon, ChevronUpDownIcon } from '@heroicons/react/20/solid'
import { Input } from '../../components/Input'
import { Textarea } from '../../components/Textarea'
import { Button } from '../../components/Button'
import { slugify } from '../../helpers'
import { ProductDto, TagDto, ProductTagDto, ProductPayload } from '../../types'
import { productService } from '../../services/api/Product'
import { tagService } from '../../services/api/Tag'

export function CreateOrEditProduct() {
  const navigate = useNavigate()
  const { productId } = useParams<{ productId?: string }>()
  const [product, setProduct] = useState<ProductDto>()
  const [tagOptions, setTagOptions] = useState<Record<string, { id: string; values: string[] }>>({})
  const [initialTags, setInitialTags] = useState<ProductTagDto[]>([])
  const [deletedTags, setDeletedTags] = useState<string[]>([])
  const [selectedTags, setSelectedTags] = useState<ProductTagDto[]>([])
  const [updatedTags, setUpdatedTags] = useState<ProductTagDto[]>([])
  const [tag, setTag] = useState<Record<string, string>>({})

  useEffect(() => {
    if (productId) {
      fetchProduct()
    }
    fetchTagOptions()
  }, [productId])

  const fetchProduct = async () => {
    try {
      const fetchedProduct = await productService.get(`${productId}?include=productTags.tag`)
      const initialTagsFromProduct: ProductTagDto[] = fetchedProduct.productTags || []
      setInitialTags(initialTagsFromProduct)
      setSelectedTags(initialTagsFromProduct)
      setProduct(fetchedProduct)
    } catch (error) {
      console.error('Error fetching product details:', error)
    }
  }

  const fetchTagOptions = async () => {
    try {
      const tags: TagDto[] = await tagService.list('?include=supportedTagValues')
      const options: Record<string, { id: string; values: string[] }> = {}
      tags.forEach((tag) => {
        if (tag.displayName) {
          options[tag.displayName] = {
            id: tag.id!,
            values: tag.supportedTagValues?.map((value) => value.displayName || '') || [],
          }
        }
      })
      setTagOptions(options)
    } catch (error) {
      console.error('Error fetching tag options:', error)
    }
  }

  const handleSave = async () => {
    try {
      const createTags = selectedTags.filter(
        (tag) =>
          !initialTags.some(
            (initialTag) =>
              initialTag.tagId === tag.tagId && initialTag.tagValue === tag.tagValue
          )
      )

      const payload: ProductPayload = {
        ...product,
        brandCategoryId: 'cm12ukr4b0004rylerclr9gto',
        productTags: {
          create: createTags,
          delete: deletedTags,
          update: updatedTags,
        },
      }

      if (product && productId) {
        await productService.update(product.id!, payload)
      } else {
        await productService.create(payload)
      }

      await fetchProduct()
      navigate('/products')
    } catch (error) {
      console.error(`Error ${productId ? 'updating' : 'creating'} product:`, error)
    }
  }

  const handleAddTagValue = (tagName: string, value: string) => {
    const tagId = tagOptions[tagName]?.id
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

  const handleRemoveTagValue = (tagName: string, value: string) => {
    const tagId = tagOptions[tagName]?.id
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

  const renderProductTags = () => {
    return Object.entries(tagOptions).map(([tagDisplayName, { id, values }]) => (
      <div className="mb-4" key={id}>
        <label className="block text-sm font-bold mb-1">{tagDisplayName}</label>
        {values.length === 0 ? (
          <input
            type="text"
            className="w-full px-3 py-2 border rounded-md placeholder-gray-400"
            placeholder={`Enter ${tagDisplayName}`}
            value={tag[tagDisplayName] || selectedTags.find(selectedTag => selectedTag.tagId === id)?.tagValue || ''}
            onChange={(event) => setTag((prev) => ({ ...prev, [tagDisplayName]: event.target.value }))}
            onBlur={() => {
              if (tag[tagDisplayName]) {
                console.log('is it trye', selectedTags.some((tag) => tag.tagId === id))
                if (selectedTags.some((tag) => tag.tagId === id)) {
                  updateTagValue(tagDisplayName, tag[tagDisplayName])
                } else {
                  handleAddTagValue(tagDisplayName, tag[tagDisplayName])
                }
              }
            }}
          />
        ) : (
          <Combobox
            as="div"
            value=""
            onChange={(value: string) => handleAddTagValue(tagDisplayName, value)}
          >
            <div className="relative mt-2">
              <div className="flex flex-wrap items-center gap-2 px-2 py-1.5 border rounded-md bg-white">
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
                <Combobox.Input
                  className="flex-grow bg-transparent outline-none placeholder-gray-400"
                  onChange={(event) =>
                    setTag((prev) => ({ ...prev, [tagDisplayName]: event.target.value }))
                  }
                  placeholder="Search or add..."
                />
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
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">{productId ? `Edit '${product?.displayName || ''}'` : `Create ${product?.displayName ? `'${product.displayName}'`: ''}`}</h1>
        <div className="flex gap-x-2">
          <Button
            onClick={() => navigate('/products')}
            className="text-white hover:text-gray-200"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            color="green"
            className="text-white px-4 py-2"
          >
            {productId ? 'Update' : 'Add Product'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 lg:gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white shadow-md ring-1 ring-gray-200 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Product Details</h2>
            <div className="space-y-4">
              <div>
                <Input
                  type="text"
                  value={product?.displayName || ''}
                  onChange={(e) =>
                    setProduct({
                      ...product,
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
                  value={product?.description || ''}
                  onChange={(e) => setProduct({ ...product, description: e.target.value })}
                  placeholder="Enter product description"
                  resizable={false}
                  rows={3}
                  className="resize-none"
                />
              </div>
            </div>
          </div>

          <div className="bg-white shadow-md ring-1 ring-gray-200 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Product Tags</h2>
            {renderProductTags()}
          </div>
        </div>
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white shadow-md ring-1 ring-gray-200 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Visibility</h2>
            <p className="text-gray-600">[visibility field]</p>
          </div>
          <div className="bg-white shadow-md ring-1 ring-gray-200 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Product Image</h2>
            <div>
              <label className="block text-sm font-bold mb-1">Image URL</label>
              <Input
                type="text"
                value={product?.image || ''}
                onChange={(e) => setProduct({ ...product, image: e.target.value })}
                placeholder="Enter image URL"
              />
            </div>
          </div>
          <div className="bg-white shadow-md ring-1 ring-gray-200 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Price</h2>
            <div>
              <Input
                type="number"
                value={product?.price || 0}
                onChange={(e) => setProduct({ ...product, price: parseFloat(e.target.value) || 0 })}
                label="Price"
                placeholder="Enter product price"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
