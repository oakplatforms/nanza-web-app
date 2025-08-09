import { Input, Textarea, Button } from '../../components/Tailwind'
import { PARCEL_TEMPLATES_BY_CARRIER, ParcelDto, ParcelTemplate, ShippingCarrier, ShippingMethodDto, ShippingOptionDto } from '../../types'
import cuid from 'cuid'
import { useState } from 'react'

export type ShippingOptionWithState = ShippingOptionDto & { isNew?: boolean }

type CreateOrEditShippingMethodProps = {
  selectedShippingMethod: ShippingMethodDto | null
  setSelectedShippingMethod: React.Dispatch<React.SetStateAction<ShippingMethodDto | null>>
  setDeletedShippingOptions: React.Dispatch<React.SetStateAction<string[]>>
  setUpdatedShippingOptions: React.Dispatch<React.SetStateAction<ShippingOptionWithState[]>>
  setNewShippingOptions: React.Dispatch<React.SetStateAction<ShippingOptionWithState[]>>
  setNewParcels: React.Dispatch<React.SetStateAction<{ carrier?: ShippingCarrier; type?: ParcelTemplate }[]>>
  setDeletedParcels: React.Dispatch<React.SetStateAction<string[]>>
 }

export function CreateOrEditShippingMethod({
  selectedShippingMethod,
  setSelectedShippingMethod,
  setDeletedShippingOptions,
  setUpdatedShippingOptions,
  setNewShippingOptions,
  setNewParcels,
  setDeletedParcels
}: CreateOrEditShippingMethodProps) {
  const [selectedParcel, setSelectedParcel] = useState<{ id: string; carrier: ParcelDto['carrier']; type: ParcelTemplate }>({
    id: cuid(),
    carrier: undefined as ParcelDto['carrier'],
    type: '' as ParcelTemplate,
  })
  const [parcels, setParcels] = useState<{ id: string; carrier: ParcelDto['carrier']; type: ParcelTemplate }[]>(selectedShippingMethod?.parcels?.map(p => ({
    id: p.id!,
    carrier: p.carrier,
    type: p.type!,
  })) || [])

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

  const handleParcelChange = (field: 'carrier' | 'type', value: string) => {
    setSelectedParcel(prev => ({ ...prev, [field]: value }))
  }

  const handleAddParcel = () => {
    if (!selectedParcel.carrier || !selectedParcel.type) return
    const newParcel = {
      id: cuid(),
      carrier: selectedParcel.carrier,
      type: selectedParcel.type
    }
    setParcels(prev => [...prev, newParcel])
    setNewParcels(prev => [...prev, { carrier: newParcel.carrier as ShippingCarrier, type: newParcel.type as ParcelTemplate }])
    setSelectedParcel({ id: cuid(), carrier: undefined, type: '' as ParcelTemplate })
  }

  const handleDeleteParcel = (parcel: ParcelDto) => {
    setParcels(prev => prev.filter(p => p.id !== parcel.id))
    const isExisting = selectedShippingMethod?.parcels?.some(p => p.id === parcel.id)
    if (isExisting) {
      setDeletedParcels(prev => [...prev, parcel.id!])
    } else {
      setNewParcels(prev =>
        prev.filter(p => !(p.type === parcel.type && p.carrier === parcel.carrier))
      )
    }
  }

  return (
    <>
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

        <label className="block text-sm font-bold mb-1 mt-4">Description</label>
        <Input
          type="text"
          value={selectedShippingMethod?.description || ''}
          onChange={(e) =>
            setSelectedShippingMethod({ ...selectedShippingMethod!, description: e.target.value })
          }
          placeholder="Enter description"
        />

        <label className="block text-sm font-bold mb-1 mt-4">Parcels</label>
        <div className="border rounded-md p-3 mb-2">
          <div className="grid grid-cols-12 px-3 gap-4">
            <div className="col-span-5">
              <label className="text-sm font-medium">Carrier</label>
              <select
                className="w-full border rounded px-2 py-1"
                value={selectedParcel.carrier}
                onChange={(e) => handleParcelChange('carrier', e.target.value)}
              >
                <option value="">Select Carrier</option>
                {Object.keys(PARCEL_TEMPLATES_BY_CARRIER).map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div className="col-span-5">
              <label className="text-sm font-medium">Parcel Template</label>
              <select
                className="w-full border rounded px-2 py-1"
                value={selectedParcel.type}
                onChange={(e) => handleParcelChange('type', e.target.value)}
                disabled={!selectedParcel.carrier}
              >
                <option value="">Select Template</option>
                {(PARCEL_TEMPLATES_BY_CARRIER[selectedParcel.carrier as ShippingCarrier] || []).map(template => (
                  <option key={template} value={template}>{template}</option>
                ))}
              </select>
            </div>
            <div className="col-span-2 flex items-end justify-end ml-auto">
              <Button
                disabled={!selectedParcel.carrier || !selectedParcel.type}
                onClick={handleAddParcel}
              >
                Add
              </Button>
            </div>
          </div>
          <div className="border-t pt-2 mt-4 text-sm">
            {parcels.map(parcel => (
              <div key={parcel.id} className="py-1 px-3 mb-2 flex items-center justify-between">
                <div className="text-gray-800">{parcel.carrier} - {parcel.type}</div>
                <Button color="red" onClick={() => handleDeleteParcel(parcel as ParcelDto)}>Delete</Button>
              </div>
            ))}
          </div>
        </div>
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
                    value={option.weight || 0}
                    onChange={(e) => handleShippingOptionChange(index, 'weight', Number(e.target.value), !optionWithState.isNew)}
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
    </>
  )
}
