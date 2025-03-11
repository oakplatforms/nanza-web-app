import { Input } from '../../components/Tailwind'
import { slugify } from '../../helpers'
import { CategoryDto } from '../../types'

type CreateOrEditCategoryProps = {
  selectedCategory: CategoryDto | null
  setSelectedCategory: React.Dispatch<React.SetStateAction<CategoryDto | null>>
}

export function CreateOrEditCategory({
  selectedCategory,
  setSelectedCategory
}: CreateOrEditCategoryProps) {
  return (
    <div className="mb-4">
      <label className="block text-sm font-bold mb-1">Name</label>
      <Input
        type="text"
        value={selectedCategory?.displayName || selectedCategory?.name || ''}
        onChange={(e) =>
          setSelectedCategory({
            ...selectedCategory!,
            displayName: e.target.value,
            name: slugify(e.target.value),
          })
        }
        placeholder="Enter category name"
      />

      <label className="block text-sm font-bold mb-1 mt-4">Description</label>
      <Input
        type="text"
        value={selectedCategory?.description || ''}
        onChange={(e) =>
          setSelectedCategory({
            ...selectedCategory!,
            description: e.target.value,
          })
        }
        placeholder="Enter category description"
      />
    </div>
  )
}
