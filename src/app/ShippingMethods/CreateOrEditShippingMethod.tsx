import { Input, Textarea, Button } from '../../components/Tailwind'
import { ShippingMethodDto, ShippingOptionDto } from '../../types'
import cuid from 'cuid'

type ShippingOptionWithState = ShippingOptionDto & {
  isNew?: boolean;
};

type CreateOrEditShippingMethodProps = {
  selectedShippingMethod: ShippingMethodDto | null
  setSelectedShippingMethod: React.Dispatch<React.SetStateAction<ShippingMethodDto | null>>
  setDeletedShippingOptions: React.Dispatch<React.SetStateAction<string[]>>
  setUpdatedShippingOptions: React.Dispatch<React.SetStateAction<ShippingOptionWithState[] | []>>
  setNewShippingOptions: React.Dispatch<React.SetStateAction<ShippingOptionWithState[] | []>>
}

export function CreateOrEditShippingMethod({
  selectedShippingMethod,
  setSelectedShippingMethod,
  setDeletedShippingOptions,
  setUpdatedShippingOptions,
  setNewShippingOptions
}: CreateOrEditShippingMethodProps) {

  const handleAddShippingOption = () => {
    setSelectedShippingMethod((prev) => ({
      ...prev!,
      shippingOptions: [...(prev?.shippingOptions || []), {
        id: cuid(),
        name: '',
        displayName: '',
        description: '',
        maxQuantity: 0,
        maxWeight: 0,
        rate: 0,
        isRequired: false,
        isNew: true,
        isStandalone: false
      }]
    }))
  }

  const handleShippingOptionChange = (index: number, field: keyof ShippingOptionDto, value: string | number | boolean, isExistingOption: boolean) => {
    setSelectedShippingMethod((prev) => {
      if (!prev) return null
      const updatedOptions = [...(prev.shippingOptions || [])]
      updatedOptions[index] = { ...updatedOptions[index], [field]: value }
      return { ...prev, shippingOptions: updatedOptions }
    })

    if (isExistingOption) {
      setUpdatedShippingOptions((prev) => {
        const existingOption = prev.find((opt) => opt.id === selectedShippingMethod?.shippingOptions?.[index]?.id)
        if (existingOption) {
          return prev.map((opt) =>
            opt.id === selectedShippingMethod?.shippingOptions?.[index]?.id
              ? { ...opt, [field]: value }
              : opt
          )
        } else {
          return [
            ...prev,
            { ...selectedShippingMethod?.shippingOptions?.[index], isStandalone: false, [field]: value },
          ]
        }
      })
    } else {
      setNewShippingOptions((prev) => {
        const existingOption = prev.find((opt) => opt.id === selectedShippingMethod?.shippingOptions?.[index]?.id)
        if (existingOption) {
          return prev.map((opt) =>
            opt.id === selectedShippingMethod?.shippingOptions?.[index]?.id
              ? { ...opt, [field]: value }
              : opt
          )
        } else {
          return [
            ...prev,
            { ...selectedShippingMethod?.shippingOptions?.[index], isStandalone: false, [field]: value },
          ]
        }
      })
    }
  }

  const handleRemoveShippingOption = (index: number) => {
    setSelectedShippingMethod((prev) => {
      if (!prev) return null

      const optionToRemove = prev.shippingOptions?.[index]
      if (optionToRemove?.id) {
        setDeletedShippingOptions((prev) => [...prev, optionToRemove.id!])
      }

      return {
        ...prev,
        shippingOptions: prev.shippingOptions?.filter((_, i) => i !== index) || [],
      }
    })
  }

  return (
    <div className="mb-4">
      <label className="block text-sm font-bold mb-1">Name</label>
      <Input
        type="text"
        value={selectedShippingMethod?.displayName || ''}
        onChange={(e) =>
          setSelectedShippingMethod({ ...selectedShippingMethod!, displayName: e.target.value })
        }
        placeholder="Enter category name"
      />
      <label className="block text-sm font-bold mb-1">Description</label>
      <Input
        type="text"
        value={selectedShippingMethod?.description || ''}
        onChange={(e) =>
          setSelectedShippingMethod({ ...selectedShippingMethod!, description: e.target.value })
        }
        placeholder="Enter description"
      />

      <label className="block text-sm font-bold mb-1 mt-4">Shipping Options</label>

      {selectedShippingMethod?.shippingOptions?.map((option, index) => {
        const optionWithState = option as ShippingOptionWithState
        return (
          <div key={index} className="mb-4 border p-3 rounded-md">
            <label className="block text-sm font-bold mb-1 mt-2">Display Name</label>
            <Input
              type="text"
              value={option.displayName || option.name || ''}
              onChange={(e) => handleShippingOptionChange(index, 'displayName', e.target.value, !optionWithState.isNew)}
              placeholder="Display Name"
            />
            <label className="block text-sm font-bold mb-1 mt-4">Description</label>
            <Textarea
              value={option.description || ''}
              onChange={(e) => handleShippingOptionChange(index, 'description', e.target.value, !optionWithState.isNew)}
              placeholder="Description"
            />
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="block text-sm font-bold mb-1 mt-4">Max Quantity</label>
                <Input
                  type="number"
                  value={option.maxQuantity || 0}
                  onChange={(e) => handleShippingOptionChange(index, 'maxQuantity', Number(e.target.value), !optionWithState.isNew)}
                  placeholder="Max Quantity"
                />
              </div>
              <div>
                <label className="block text-sm font-bold mb-1 mt-4">Max Weight</label>
                <Input
                  type="number"
                  value={option.maxWeight || 0}
                  onChange={(e) => handleShippingOptionChange(index, 'maxWeight', Number(e.target.value), !optionWithState.isNew)}
                  placeholder="Max Weight"
                />
              </div>
              <div>
                <label className="block text-sm font-bold mb-1 mt-4">Rate</label>
                <Input
                  type="number"
                  value={option.rate || 0}
                  onChange={(e) => handleShippingOptionChange(index, 'rate', Number(e.target.value), !optionWithState.isNew)}
                  placeholder="Rate"
                />
              </div>
            </div>

            <div className="mt-2 flex items-center">
              <div className="ml-auto flex items-center space-x-2">
                <Button
                  type="button"
                  className="text-red-600 hover:text-red-800 text-sm"
                  onClick={() => handleRemoveShippingOption(index)}
                  plain
                >
                Remove
                </Button>
              </div>
            </div>
          </div>
        )})}

      <Button
        className="mt-2"
        onClick={handleAddShippingOption}
      >
        + Add a New Shipping Option
      </Button>
    </div>
  )
}
