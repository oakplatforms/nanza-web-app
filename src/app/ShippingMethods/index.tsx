import { useState } from 'react'
import {
  ParcelDto,
  ParcelTemplate,
  ShippingCarrier,
  ShippingMethodDto,
  ShippingOptionDto,
} from '../../types'
import { shippingMethodService } from '../../services/api/ShippingMethod'
import { SimpleTable } from '../../components/SimpleTable'
import { Header, Badge, Button } from '../../components/Tailwind'
import { SimpleDialog } from '../../components/SimpleDialog'
import { ConfirmDialog } from '../../components/ConfirmDialog'
import { CreateOrEditShippingMethod } from './CreateOrEditShippingMethod'
import { useSession } from '../../context/SessionContext'
import { slugify } from '../../helpers'
import { fetchShippingMethods } from './data/fetchShippingMethods'
import { PaginationControls } from '../../components/PaginationControls'

export function ShippingMethods() {
  const { currentUser } = useSession()
  const [currentPage, setCurrentPage] = useState(0)
  const [isCreateOrEditModalOpen, setIsCreateOrEditModalOpen] = useState(false)
  const [selectedShippingMethod, setSelectedShippingMethod] = useState<ShippingMethodDto | null>(null)
  const [isDeleteCategoryDialogOpen, setIsDeleteCategoryDialogOpen] = useState(false)
  const [deletedShippingOptions, setDeletedShippingOptions] = useState<string[]>([])
  const [newShippingOptions, setNewShippingOptions] = useState<ShippingOptionDto[]>([])
  const [updatedShippingOptions, setUpdatedShippingOptions] = useState<ShippingOptionDto[]>([])
  const [newParcels, setNewParcels] = useState<ParcelDto[]>([])
  const [deletedParcels, setDeletedParcels] = useState<string[]>([])
  const { shippingMethods, refetchShippingMethods } = fetchShippingMethods(currentPage)

  const handleNextPage = () => {
    if (shippingMethods?.total !== null && (currentPage + 1) * 10 < shippingMethods!.total) {
      setCurrentPage(currentPage + 1)
    }
  }

  const handlePrevPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1)
    }
  }

  const onSaveCategory = async () => {
    try {
      if (selectedShippingMethod) {
        const existingShippingMethod = !!selectedShippingMethod.id

        const newOptions = newShippingOptions.map(opt => ({
          name: slugify(opt.displayName || ''),
          displayName: opt.displayName,
          description: opt.description,
          maxQuantity: opt.maxQuantity === 0 ? undefined : opt.maxQuantity,
          weight: opt.weight === 0 ? undefined : opt.weight,
          rate: opt.rate,
          isStandalone: false,
        }))

        const updatedOptions = updatedShippingOptions.map(opt => ({
          id: opt.id,
          name: slugify(opt.displayName || ''),
          displayName: opt.displayName,
          description: opt.description,
          maxQuantity: opt.maxQuantity === 0 ? undefined : opt.maxQuantity,
          weight: opt.weight === 0 ? undefined : opt.weight,
          rate: opt.rate,
          isStandalone: false,
        }))

        if (existingShippingMethod) {
          await shippingMethodService.update(selectedShippingMethod.id!, {
            name: selectedShippingMethod.name || slugify(selectedShippingMethod.displayName!),
            displayName: selectedShippingMethod.displayName,
            description: selectedShippingMethod.description,
            lastModifiedById: currentUser?.admin?.id,
            shippingOptions: {
              create: newOptions,
              update: updatedOptions,
              delete: deletedShippingOptions,
            },
            parcels: {
              create: newParcels.map(p => ({
                carrier: p.carrier,
                type: p.type,
              })),
              delete: deletedParcels,
            },
          })
        } else {
          await shippingMethodService.create({
            name: selectedShippingMethod.name || slugify(selectedShippingMethod.displayName!),
            displayName: selectedShippingMethod.displayName,
            description: selectedShippingMethod.description,
            parcels: {
              create: newParcels.map(p => ({
                carrier: p.carrier as ShippingCarrier,
                type: p.type as ParcelTemplate,
              })),
            },
            createdById: currentUser?.admin?.id,
            shippingOptions: {
              create: newOptions,
            },
          })
        }

        await refetchShippingMethods()
        setCurrentPage(0)
        setSelectedShippingMethod(null)
        setIsCreateOrEditModalOpen(false)
        setDeletedShippingOptions([])
        setNewShippingOptions([])
        setUpdatedShippingOptions([])
        setNewParcels([])
        setDeletedParcels([])
      }
    } catch (error) {
      console.log('Error saving shipping category.', error)
    }
  }

  const onDeleteCategory = async () => {
    try {
      if (selectedShippingMethod?.id) {
        await shippingMethodService.delete(selectedShippingMethod.id)
        await refetchShippingMethods()
        setIsDeleteCategoryDialogOpen(false)
        setSelectedShippingMethod(null)
        setCurrentPage(0)
      }
    } catch (error) {
      console.log('Error deleting shipping category.', error)
    }
  }

  const onSelectCategory = (categoryIdx: number) => {
    setSelectedShippingMethod(shippingMethods!.data[categoryIdx])
    setDeletedShippingOptions([])
    setIsCreateOrEditModalOpen(true)
  }

  const onConfirmDeleteCategory = (categoryIdx: number) => {
    setSelectedShippingMethod(shippingMethods!.data[categoryIdx])
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
        headers={['Name', 'Shipping Parcels', 'Shipping Options', '']}
        rows={shippingMethods?.data.map((shippingMethod) => ({
          displayName: { value: shippingMethod.displayName || '', width: '200px' },
          shippingParcelTypes: {
            value: shippingMethod.parcels?.map((parcel, index) => (
              <Badge key={index} color="zinc" className="ml-3 mt-1 relative whitespace-nowrap align-middle">
                {parcel.carrier} - {parcel.type}
              </Badge>
            )),
            width: '500px',
          },
          shippingOptions: {
            value: shippingMethod.shippingOptions?.map((option, index) => (
              <Badge key={index} color="zinc" className="ml-3 mt-1 relative whitespace-nowrap align-middle">
                {option.displayName}
              </Badge>
            )),
            width: '500px',
          },
        })) || []}
        onEdit={onSelectCategory}
        onDelete={onConfirmDeleteCategory}
      />

      {shippingMethods && shippingMethods.total !== null && shippingMethods.total > 10 && (
        <PaginationControls
          currentPage={currentPage}
          total={shippingMethods.total}
          onPrev={handlePrevPage}
          onNext={handleNextPage}
        />
      )}

      <SimpleDialog
        isOpen={isCreateOrEditModalOpen}
        size="3xl"
        title={selectedShippingMethod?.id ? 'Edit Shipping Method' : 'Create Shipping Method'}
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
          setNewParcels={setNewParcels}
          setDeletedParcels={setDeletedParcels}
        />
      </SimpleDialog>

      <ConfirmDialog
        isOpen={isDeleteCategoryDialogOpen}
        onClose={() => {
          setSelectedShippingMethod(null)
          setIsDeleteCategoryDialogOpen(false)
        }}
        title="Delete Shipping Category"
        description={`Are you sure you want to delete the category "${selectedShippingMethod?.displayName}"?`}
        onConfirm={onDeleteCategory}
        confirmBtnTxt="Delete"
      />
    </>
  )
}
