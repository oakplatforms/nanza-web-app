import { Combobox } from '@headlessui/react'
import { ChevronUpDownIcon, CheckIcon } from '@heroicons/react/20/solid'
import { Input } from '../../components/Tailwind'
import { slugify } from '../../helpers'
import { BrandDto, CategoryDto } from '../../types'
import { useEffect, useState } from 'react'
import { categoryService } from '../../services/api/Category'

type CreateOrEditBrandProps = {
  selectedBrand: BrandDto | null
  setSelectedBrand: React.Dispatch<React.SetStateAction<BrandDto | null>>
  setDeletedBrandCategories: React.Dispatch<React.SetStateAction<string[]>>
}

export function CreateOrEditBrand({
  selectedBrand,
  setSelectedBrand,
  setDeletedBrandCategories
}: CreateOrEditBrandProps) {
  const [categories, setCategories] = useState<CategoryDto[]>([])

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      const categoriesData = await categoryService.list()
      setCategories(categoriesData)
    } catch (error) {
      console.log('Error fetching categories.', error)
    }
  }

  const handleAddCategory = (categoryName: string) => {
    if (!selectedBrand) return

    setSelectedBrand((prev) => {
      if (!prev) return null

      const exists = prev.brandCategories?.some(cat => cat.categoryName === categoryName)
      if (exists) return prev

      return {
        ...prev,
        brandCategories: [
          ...(prev.brandCategories || []),
          { categoryName }
        ]
      }
    })
  }

  const handleRemoveCategory = (categoryId: string) => {
    if (!selectedBrand) return

    setSelectedBrand((prev) => {
      if (!prev) return null

      return {
        ...prev,
        brandCategories: prev.brandCategories?.filter(cat => cat.id !== categoryId) || []
      }
    })

    setDeletedBrandCategories((prev) => [...prev, categoryId])
  }

  return (
    <div className="mb-4">
      <label className="block text-sm font-bold mb-1">Name</label>
      <Input
        type="text"
        value={selectedBrand?.displayName || ''}
        onChange={(e) =>
          setSelectedBrand({
            ...selectedBrand!,
            displayName: e.target.value,
            name: slugify(e.target.value),
          })
        }
        placeholder="Enter brand name"
      />

      <label className="block text-sm font-bold mb-1 mt-4">Categories</label>
      <Combobox as="div" value="" onChange={handleAddCategory}>
        <div className="relative mt-2">
          <div className="flex flex-wrap items-center gap-2 px-2 py-1.5 border rounded-md bg-white min-h-[40px]">
            {selectedBrand?.brandCategories?.map((category) => (
              <span
                key={category.categoryName}
                className="inline-flex items-center px-2 py-1 text-sm text-neutral-700 bg-gray-200 rounded-full"
              >
                {category.categoryName}
                <button
                  type="button"
                  onClick={() => handleRemoveCategory(category.id!)}
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
          {categories.length > 0 && (
            <Combobox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black/5 focus:outline-none sm:text-sm">
              {categories.map((category) => (
                <Combobox.Option
                  key={category.name}
                  value={category.name}
                  className="group relative cursor-default select-none py-2 pl-3 pr-9 text-gray-900 data-[focus]:bg-indigo-600 data-[focus]:text-white data-[focus]:outline-none"
                >
                  <span className="block truncate group-data-[selected]:font-semibold">
                    {category.name}
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
    </div>
  )
}
