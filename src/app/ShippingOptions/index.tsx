import { useEffect, useState } from 'react'
import { ShippingOptionDto } from '../../types'
import { shippingOptionService } from '../../services/api/ShippingOption'
import { SimpleTable } from '../../components/SimpleTable'
import { Header, Button } from '../../components/Tailwind'
import { SimpleDialog } from '../../components/SimpleDialog'
import { ConfirmDialog } from '../../components/ConfirmDialog'
import { CreateOrEditShippingOption } from './CreateOrEditShippingOptions'
import { useSession } from '../../context/SessionContext'
import { slugify } from '../../helpers'

export function ShippingOptions() {
  const { currentUser } = useSession()
  const [shippingOptions, setShippingOptions] = useState<ShippingOptionDto[]>([])
  const [isCreateOrEditModalOpen, setIsCreateOrEditModalOpen] = useState(false)
  const [selectedShippingOption, setSelectedShippingOption] = useState<ShippingOptionDto | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

  useEffect(() => {
    getShippingOptions()
  }, [])

  const getShippingOptions = async () => {
    try {
      const options = await shippingOptionService.list('?isStandalone=true')
      setShippingOptions(options)
    } catch (error) {
      console.error('Error fetching shipping options:', error)
    }
  }

  const onSaveOption = async () => {
    try {
      if (selectedShippingOption) {
        const existingOption = !!selectedShippingOption.id

        if (existingOption) {
          await shippingOptionService.update(selectedShippingOption.id!, {
            name: slugify(selectedShippingOption.displayName!),
            ...selectedShippingOption,
            lastModifiedById: currentUser?.admin?.id,
          })
        } else {
          await shippingOptionService.create({
            ...selectedShippingOption,
            name: slugify(selectedShippingOption.displayName!),
            isStandalone: true,
            createdById: currentUser?.admin?.id,
          })
        }
        await getShippingOptions()
        setSelectedShippingOption(null)
        setIsCreateOrEditModalOpen(false)
      }
    } catch (error) {
      console.error('Error saving shipping option.', error)
    }
  }

  const onDeleteOption = async () => {
    try {
      if (selectedShippingOption?.id) {
        await shippingOptionService.delete(selectedShippingOption.id)
        await getShippingOptions()
        setSelectedShippingOption(null)
        setIsDeleteDialogOpen(false)
      }
    } catch (error) {
      console.error('Error deleting shipping option.', error)
    }
  }

  return (
    <>
      <div className="flex">
        <Header>Shipping Options</Header>
        <Button
          className="text-white px-4 py-2 ml-auto cursor-pointer"
          onClick={() => setIsCreateOrEditModalOpen(true)}
          color="green"
        >
          Create Shipping Option
        </Button>
      </div>
      <br />
      <SimpleTable
        headers={['Name', 'Rate', 'Max Quantity', 'Max Weight', '']}
        rows={shippingOptions.map((option) => ({
          displayName: { value: option.displayName || '', width: '450px' },
          rate: { value: `$${option.rate}`, width: '200px' },
          maxQuantity: { value: option.maxQuantity || '-', width: '200px' },
          maxWeight: { value: option.maxWeight || '-', width: '200px' },
        }))}
        onEdit={(idx) => {
          setSelectedShippingOption(shippingOptions[idx])
          setIsCreateOrEditModalOpen(true)
        }}
        onDelete={(idx) => {
          setSelectedShippingOption(shippingOptions[idx])
          setIsDeleteDialogOpen(true)
        }}
      />

      <SimpleDialog
        isOpen={isCreateOrEditModalOpen}
        size="2xl"
        title={selectedShippingOption?.id ? 'Edit Shipping Option' : 'Create Shipping Option'}
        onClose={() => {
          setSelectedShippingOption(null)
          setIsCreateOrEditModalOpen(false)
        }}
        onSubmit={onSaveOption}
        submitBtnTxt={selectedShippingOption?.id ? 'Update' : 'Add'}
      >
        <CreateOrEditShippingOption
          selectedShippingOption={selectedShippingOption}
          setSelectedShippingOption={setSelectedShippingOption}
        />
      </SimpleDialog>

      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => {
          setSelectedShippingOption(null)
          setIsDeleteDialogOpen(false)
        }}
        title="Delete Shipping Option"
        description={`Are you sure you want to delete "${selectedShippingOption?.displayName}"?`}
        onConfirm={onDeleteOption}
        confirmBtnTxt="Delete"
      />
    </>
  )
}
