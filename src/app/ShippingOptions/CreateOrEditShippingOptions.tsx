import { Input, Textarea } from '../../components/Tailwind'
import { ShippingOptionDto } from '../../types'

type CreateOrEditShippingOptionProps = {
  selectedShippingOption: ShippingOptionDto | null
  setSelectedShippingOption: React.Dispatch<React.SetStateAction<ShippingOptionDto | null>>
}

export function CreateOrEditShippingOption({
  selectedShippingOption,
  setSelectedShippingOption,
}: CreateOrEditShippingOptionProps) {
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-bold mb-1">Display Name</label>
        <Input
          type="text"
          value={selectedShippingOption?.displayName || ''}
          onChange={(e) =>
            setSelectedShippingOption((prev) => ({
              ...prev!,
              displayName: e.target.value,
            }))
          }
          placeholder="Enter display name"
        />
      </div>

      <div>
        <label className="block text-sm font-bold mb-1">Description</label>
        <Textarea
          value={selectedShippingOption?.description || ''}
          onChange={(e) =>
            setSelectedShippingOption((prev) => ({
              ...prev!,
              description: e.target.value,
            }))
          }
          placeholder="Enter description"
        />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-bold mb-1">Max Quantity</label>
          <Input
            type="number"
            value={selectedShippingOption?.maxQuantity || ''}
            onChange={(e) =>
              setSelectedShippingOption((prev) => ({
                ...prev!,
                maxQuantity: Number(e.target.value),
              }))
            }
            placeholder="Max Quantity"
          />
        </div>
        <div>
          <label className="block text-sm font-bold mb-1">Max Weight</label>
          <Input
            type="number"
            value={selectedShippingOption?.weight || ''}
            onChange={(e) =>
              setSelectedShippingOption((prev) => ({
                ...prev!,
                maxWeight: Number(e.target.value),
              }))
            }
            placeholder="Max Weight"
          />
        </div>
        <div>
          <label className="block text-sm font-bold mb-1">Rate</label>
          <Input
            type="number"
            value={selectedShippingOption?.rate || ''}
            onChange={(e) =>
              setSelectedShippingOption((prev) => ({
                ...prev!,
                rate: Number(e.target.value),
              }))
            }
            placeholder="Rate ($)"
          />
        </div>
      </div>
    </div>
  )
}
