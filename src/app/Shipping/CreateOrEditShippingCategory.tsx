import { Input, Textarea, Checkbox, Button } from '../../components/Tailwind'
import { ShippingCategoryDto, ShippingOptionDto } from '../../types'
import cuid from 'cuid'

type ShippingOptionWithState = ShippingOptionDto & {
  isNew?: boolean;
};

type CreateOrEditShippingCategoryProps = {
  selectedShippingCategory: ShippingCategoryDto | null
  setSelectedShippingCategory: React.Dispatch<React.SetStateAction<ShippingCategoryDto | null>>
  setDeletedShippingOptions: React.Dispatch<React.SetStateAction<string[]>>
  setUpdatedShippingOptions: React.Dispatch<React.SetStateAction<ShippingOptionWithState[] | []>>
  setNewShippingOptions: React.Dispatch<React.SetStateAction<ShippingOptionWithState[] | []>>
}

export function CreateOrEditShippingCategory({
  selectedShippingCategory,
  setSelectedShippingCategory,
  setDeletedShippingOptions,
  setUpdatedShippingOptions,
  setNewShippingOptions
}: CreateOrEditShippingCategoryProps) {

  const handleAddShippingOption = () => {
    setSelectedShippingCategory((prev) => ({
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
        isNew: true
      }]
    }))
  }

  const handleShippingOptionChange = (index: number, field: keyof ShippingOptionDto, value: string | number | boolean, isExistingOption: boolean) => {
    setSelectedShippingCategory((prev) => {
      if (!prev) return null
      const updatedOptions = [...(prev.shippingOptions || [])]
      updatedOptions[index] = { ...updatedOptions[index], [field]: value }
      return { ...prev, shippingOptions: updatedOptions }
    })

    if (isExistingOption) {
      setUpdatedShippingOptions((prev) => {
        const existingOption = prev.find((opt) => opt.id === selectedShippingCategory?.shippingOptions?.[index]?.id)
        if (existingOption) {
          return prev.map((opt) =>
            opt.id === selectedShippingCategory?.shippingOptions?.[index]?.id
              ? { ...opt, [field]: value }
              : opt
          )
        } else {
          return [
            ...prev,
            { ...selectedShippingCategory?.shippingOptions?.[index], [field]: value },
          ]
        }
      })
    } else {
      setNewShippingOptions((prev) => {
        const existingOption = prev.find((opt) => opt.id === selectedShippingCategory?.shippingOptions?.[index]?.id)
        if (existingOption) {
          return prev.map((opt) =>
            opt.id === selectedShippingCategory?.shippingOptions?.[index]?.id
              ? { ...opt, [field]: value }
              : opt
          )
        } else {
          return [
            ...prev,
            { ...selectedShippingCategory?.shippingOptions?.[index], [field]: value },
          ]
        }
      })
    }
  }

  const handleRemoveShippingOption = (index: number) => {
    setSelectedShippingCategory((prev) => {
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
        value={selectedShippingCategory?.displayName || ''}
        onChange={(e) =>
          setSelectedShippingCategory({ ...selectedShippingCategory!, displayName: e.target.value })
        }
        placeholder="Enter category name"
      />
      <label className="block text-sm font-bold mb-1">Description</label>
      <Input
        type="text"
        value={selectedShippingCategory?.description || ''}
        onChange={(e) =>
          setSelectedShippingCategory({ ...selectedShippingCategory!, description: e.target.value })
        }
        placeholder="Enter description"
      />

      <label className="block text-sm font-bold mb-1 mt-4">Shipping Options</label>

      {selectedShippingCategory?.shippingOptions?.map((option, index) => {
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
              <Checkbox
                checked={option.isRequired || false}
                onChange={(checked) => handleShippingOptionChange(index, 'isRequired', checked, !optionWithState.isNew)}
              />
              <span className="ml-2 text-sm">Is Required</span>

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
