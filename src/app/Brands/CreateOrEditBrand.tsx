import { Input } from '../../components/Tailwind'
import { slugify } from '../../helpers'
import { BrandDto } from '../../types'

type CreateOrEditBrandProps = {
  selectedBrand: BrandDto | null
  setSelectedBrand: React.Dispatch<React.SetStateAction<BrandDto | null>>
}

export function CreateOrEditBrand({
  selectedBrand,
  setSelectedBrand,
}: CreateOrEditBrandProps) {

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
    </div>
  )
}
