import { useEffect, useState } from 'react'
import { ShippingMethodDto, ShippingOptionDto } from '../../types'
import { shippingMethodService } from '../../services/api/ShippingMethod'
import { SimpleTable } from '../../components/SimpleTable'
import { Header, Badge, Button } from '../../components/Tailwind'
import { SimpleDialog } from '../../components/SimpleDialog'
import { ConfirmDialog } from '../../components/ConfirmDialog'
import { CreateOrEditShippingMethod } from './CreateOrEditShippingMethod'
import { useSession } from '../../context/SessionContext'
import { slugify } from '../../helpers'

export function ShippingMethods() {
  const { currentUser } = useSession()
  const [shippingMethods, setShippingMethods] = useState<ShippingMethodDto[]>([])
  const [isCreateOrEditModalOpen, setIsCreateOrEditModalOpen] = useState(false)
  const [selectedShippingMethod, setSelectedShippingMethod] = useState<ShippingMethodDto | null>(null)
  const [isDeleteCategoryDialogOpen, setIsDeleteCategoryDialogOpen] = useState(false)
  const [deletedShippingOptions, setDeletedShippingOptions] = useState<string[]>([])
  const [newShippingOptions, setNewShippingOptions] = useState<ShippingOptionDto[]>([])
  const [updatedShippingOptions, setUpdatedShippingOptions] = useState<ShippingOptionDto[]>([])

  useEffect(() => {
    getShippingMethods()
  }, [])

  const getShippingMethods = async () => {
    try {
      const categoriesData = await shippingMethodService.list('?include=shippingOptions')
      setShippingMethods(categoriesData)
    } catch (error) {
      console.log('Error fetching shipping categories.', error)
    }
  }

  const onSaveCategory = async () => {
    try {
      if (selectedShippingMethod) {
        const existingCategory = !!selectedShippingMethod.id

        const newOptions = newShippingOptions.map(opt => ({
          name: slugify(opt.displayName || ''),
          displayName: opt.displayName,
          description: opt.description,
          maxQuantity: opt.maxQuantity === 0 ? undefined : opt.maxQuantity,
          maxWeight: opt.maxWeight === 0 ? undefined : opt.maxWeight,
          rate: opt.rate,
          isStandalone: false
        }))

        const updatedOptions = updatedShippingOptions.map(opt => ({
          id: opt.id,
          name: slugify(opt.displayName || ''),
          displayName: opt.displayName,
          description: opt.description,
          maxQuantity: opt.maxQuantity === 0 ? undefined : opt.maxQuantity,
          maxWeight: opt.maxWeight === 0 ? undefined : opt.maxWeight,
          rate: opt.rate,
          isStandalone: false
        }))

        if (existingCategory) {
          await shippingMethodService.update(selectedShippingMethod.id!, {
            name: selectedShippingMethod.name || slugify(selectedShippingMethod.displayName!),
            displayName: selectedShippingMethod.displayName,
            description: selectedShippingMethod.description,
            shippingPackageType: selectedShippingMethod.shippingPackageType,
            shippingServiceType: selectedShippingMethod.shippingServiceType,
            size: selectedShippingMethod.size,
            lastModifiedById: currentUser?.admin?.id,
            shippingOptions: {
              create: newOptions,
              update: updatedOptions,
              delete: deletedShippingOptions,
            },
          })
        } else {
          await shippingMethodService.create({
            name: selectedShippingMethod.name || slugify(selectedShippingMethod.displayName!),
            displayName: selectedShippingMethod.displayName,
            description: selectedShippingMethod.description,
            shippingPackageType: selectedShippingMethod.shippingPackageType,
            shippingServiceType: selectedShippingMethod.shippingServiceType,
            size: selectedShippingMethod.size,
            createdById: currentUser?.admin?.id,
            shippingOptions: {
              create: newOptions,
            },
          })
        }

        await getShippingMethods()
        setSelectedShippingMethod(null)
        setIsCreateOrEditModalOpen(false)
        setDeletedShippingOptions([])
        setNewShippingOptions([])
        setUpdatedShippingOptions([])
      }
    } catch (error) {
      console.log('Error saving shipping category.', error)
    }
  }

  const onDeleteCategory = async () => {
    try {
      if (selectedShippingMethod?.id) {
        await shippingMethodService.delete(selectedShippingMethod.id)
        await getShippingMethods()
        setIsDeleteCategoryDialogOpen(false)
        setSelectedShippingMethod(null)
      }
    } catch (error) {
      console.log('Error deleting shipping category.', error)
    }
  }

  const onSelectCategory = (categoryIdx: number) => {
    setSelectedShippingMethod(shippingMethods[categoryIdx])
    setDeletedShippingOptions([])
    setIsCreateOrEditModalOpen(true)
  }

  const onConfirmDeleteCategory = (categoryIdx: number) => {
    setSelectedShippingMethod(shippingMethods[categoryIdx])
    setIsDeleteCategoryDialogOpen(true)
  }

  return (
    <>
      <div className="flex">
        <Header>Shipping Methods</Header>
        <Button
          className="text-white px-4 py-2 ml-auto cursor-pointer"
          onClick={() => setIsCreateOrEditModalOpen(true)}
          color="green"
        >
          Create Shipping Method
        </Button>
      </div>
      <br />
      <SimpleTable
        headers={['Name', 'Description', 'Package Type', 'Service Type', 'Shipping Options', '']}
        rows={shippingMethods.map((category) => ({
          displayName: { value: category.displayName || '', width: '200px' },
          description: { value: category.description || 'No description', width: '500px' },
          shippingPackageType: { value: category.shippingPackageType, width: '50px' },
          shippingServiceType: { value: category.shippingServiceType, width: '50px' },
          shippingOptions: {
            value: category.shippingOptions?.map((option, index) => (
              <Badge key={index} color="zinc" className="ml-3 mt-1 relative whitespace-nowrap align-middle">
                {option.displayName}
              </Badge>
            )),
            width: '500px',
          },
        }))}
        onEdit={onSelectCategory}
        onDelete={onConfirmDeleteCategory}
      />

      <SimpleDialog
        isOpen={isCreateOrEditModalOpen}
        size="3xl"
        title={selectedShippingMethod?.id ? 'Edit Shipping Category' : 'Create Shipping Category'}
        onClose={() => {
          setSelectedShippingMethod(null)
          setIsCreateOrEditModalOpen(false)
        }}
        onSubmit={onSaveCategory}
        submitBtnTxt={selectedShippingMethod?.id ? 'Update' : 'Add'}
      >
        <CreateOrEditShippingMethod
          selectedShippingMethod={selectedShippingMethod}
          setNewShippingOptions={setNewShippingOptions}
          setSelectedShippingMethod={setSelectedShippingMethod}
          setDeletedShippingOptions={setDeletedShippingOptions}
          setUpdatedShippingOptions={setUpdatedShippingOptions}
        />
      </SimpleDialog>

      <ConfirmDialog
        isOpen={isDeleteCategoryDialogOpen}
        onClose={() => {
          setSelectedShippingMethod(null)
          setIsDeleteCategoryDialogOpen(false)
        }}
        title="Delete Shipping Category"
        description={`Are you sure you want to delete the category "${
          selectedShippingMethod?.displayName
        }"?`}
        onConfirm={onDeleteCategory}
        confirmBtnTxt="Delete"
      />
    </>
  )
}
