import { useEffect, useState } from 'react'
import { ShippingCategoryDto, ShippingOptionDto } from '../../types'
import { shippingCategoryService } from '../../services/api/ShippingCategory'
import { SimpleTable } from '../../components/SimpleTable'
import { Header, Badge, Button } from '../../components/Tailwind'
import { SimpleDialog } from '../../components/SimpleDialog'
import { ConfirmDialog } from '../../components/ConfirmDialog'
import { CreateOrEditShippingCategory } from './CreateOrEditShippingCategory'
import { useSession } from '../../context/SessionContext'
import { slugify } from '../../helpers'

export function ShippingCategories() {
  const { currentUser } = useSession()
  const [shippingCategories, setShippingCategories] = useState<ShippingCategoryDto[]>([])
  const [isCreateOrEditModalOpen, setIsCreateOrEditModalOpen] = useState(false)
  const [selectedShippingCategory, setSelectedShippingCategory] = useState<ShippingCategoryDto | null>(null)
  const [isDeleteCategoryDialogOpen, setIsDeleteCategoryDialogOpen] = useState(false)
  const [deletedShippingOptions, setDeletedShippingOptions] = useState<string[]>([])
  const [newShippingOptions, setNewShippingOptions] = useState<ShippingOptionDto[]>([])
  const [updatedShippingOptions, setUpdatedShippingOptions] = useState<ShippingOptionDto[]>([])

  useEffect(() => {
    getShippingCategories()
  }, [])

  const getShippingCategories = async () => {
    try {
      const categoriesData = await shippingCategoryService.list('?include=shippingOptions')
      setShippingCategories(categoriesData)
    } catch (error) {
      console.log('Error fetching shipping categories.', error)
    }
  }

  const onSaveCategory = async () => {
    try {
      if (selectedShippingCategory) {
        const existingCategory = !!selectedShippingCategory.id

        const newOptions = newShippingOptions.map(opt => ({
          name: slugify(opt.displayName || ''),
          displayName: opt.displayName,
          description: opt.description,
          maxQuantity: opt.maxQuantity,
          maxWeight: opt.maxWeight,
          rate: opt.rate,
          isRequired: opt.isRequired,
        }))

        const updatedOptions = updatedShippingOptions.map(opt => ({
          id: opt.id,
          name: slugify(opt.displayName || ''),
          displayName: opt.displayName,
          description: opt.description,
          maxQuantity: opt.maxQuantity,
          maxWeight: opt.maxWeight,
          rate: opt.rate,
          isRequired: opt.isRequired,
        }))

        if (existingCategory) {
          await shippingCategoryService.update(selectedShippingCategory.id!, {
            name: selectedShippingCategory.name || slugify(selectedShippingCategory.displayName!),
            displayName: selectedShippingCategory.displayName,
            description: selectedShippingCategory.description,
            shippingPackageType: selectedShippingCategory.shippingPackageType,
            shippingServiceType: selectedShippingCategory.shippingServiceType,
            size: selectedShippingCategory.size,
            lastModifiedById: currentUser?.account?.id,
            shippingOptions: {
              create: newOptions,
              update: updatedOptions,
              delete: deletedShippingOptions,
            },
          })
        } else {
          await shippingCategoryService.create({
            name: selectedShippingCategory.name || slugify(selectedShippingCategory.displayName!),
            displayName: selectedShippingCategory.displayName,
            description: selectedShippingCategory.description,
            shippingPackageType: selectedShippingCategory.shippingPackageType,
            shippingServiceType: selectedShippingCategory.shippingServiceType,
            size: selectedShippingCategory.size,
            createdById: currentUser?.account?.id,
            shippingOptions: {
              create: newOptions,
            },
          })
        }

        await getShippingCategories()
        setIsCreateOrEditModalOpen(false)
        setSelectedShippingCategory(null)
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
      if (selectedShippingCategory?.id) {
        await shippingCategoryService.delete(selectedShippingCategory.id)
        await getShippingCategories()
        setIsDeleteCategoryDialogOpen(false)
        setSelectedShippingCategory(null)
      }
    } catch (error) {
      console.log('Error deleting shipping category.', error)
    }
  }

  const onSelectCategory = (categoryIdx: number) => {
    setSelectedShippingCategory(shippingCategories[categoryIdx])
    setDeletedShippingOptions([])
    setIsCreateOrEditModalOpen(true)
  }

  const onConfirmDeleteCategory = (categoryIdx: number) => {
    setSelectedShippingCategory(shippingCategories[categoryIdx])
    setIsDeleteCategoryDialogOpen(true)
  }

  return (
    <>
      <div className="flex">
        <Header>Shipping</Header>
        <Button
          className="text-white px-4 py-2 ml-auto cursor-pointer"
          onClick={() => setIsCreateOrEditModalOpen(true)}
          color="green"
        >
          Create New Shipping Category
        </Button>
      </div>
      <br />
      <SimpleTable
        headers={['Name', 'Description', 'Package Type', 'Service Type', 'Shipping Options', '']}
        rows={shippingCategories.map((category) => ({
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
        title={selectedShippingCategory?.id ? 'Edit Shipping Category' : 'Create Shipping Category'}
        onClose={() => {
          setSelectedShippingCategory(null)
          setIsCreateOrEditModalOpen(false)
        }}
        onSubmit={onSaveCategory}
        submitBtnTxt={selectedShippingCategory?.id ? 'Update' : 'Add'}
      >
        <CreateOrEditShippingCategory
          selectedShippingCategory={selectedShippingCategory}
          setNewShippingOptions={setNewShippingOptions}
          setSelectedShippingCategory={setSelectedShippingCategory}
          setDeletedShippingOptions={setDeletedShippingOptions}
          setUpdatedShippingOptions={setUpdatedShippingOptions}
        />
      </SimpleDialog>

      <ConfirmDialog
        isOpen={isDeleteCategoryDialogOpen}
        onClose={() => {
          setSelectedShippingCategory(null)
          setIsDeleteCategoryDialogOpen(false)
        }}
        title="Delete Shipping Category"
        description={`Are you sure you want to delete the category "${
          selectedShippingCategory?.displayName
        }"?`}
        onConfirm={onDeleteCategory}
        confirmBtnTxt="Delete"
      />
    </>
  )
}
