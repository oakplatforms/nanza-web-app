import { useState, useEffect } from 'react'
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
import { useSearchParams } from 'react-router-dom'

export function ShippingMethods() {
  const { currentUser } = useSession()
  const [searchParams, setSearchParams] = useSearchParams()
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

  //Check for create query parameter and open dialog
  useEffect(() => {
    if (searchParams.get('create') === 'true') {
      setSelectedShippingMethod(null)
      setIsCreateOrEditModalOpen(true)
      searchParams.delete('create')
      setSearchParams(searchParams, { replace: true })
    }
  }, [searchParams, setSearchParams])

  const handleNextPage = () => {
    if (shippingMethods && shippingMethods.total !== null && (currentPage + 1) * 10 < shippingMethods.total) {
      setCurrentPage((prev) => prev + 1)
    }
  }

  const handlePrevPage = () => {
    if (currentPage > 0) {
      setCurrentPage((prev) => prev - 1)
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

  const headers = ['Name', 'Shipping Parcels', 'Shipping Options', '']
  const tableRows = shippingMethods?.data.map((shippingMethod) => ({
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
  })) || []

  return (
    <>
      <div className="top-0 left-0 right-0 bottom-0 flex gap-0">
        {/*Main content column*/}
        <div className="flex-1 flex flex-col min-w-0 h-full">
          <div className="bg-[#e5e8eb] flex-shrink-0 flex items-center justify-between mb-0 pl-6 lg:pl-6 pr-4 lg:pr-3 py-2 lg:py-2">
            <div className="flex items-center gap-4">
              <Header>Shipping Methods</Header>
            </div>
          </div>
          <div className="flex-1 overflow-x-auto overflow-y-auto p-6">
            <div className="h-20 flex items-center justify-between gap-3">
              <Button
                className="text-white mb-5 px-4 py-2 cursor-pointer"
                color="sky"
                onClick={() => setIsCreateOrEditModalOpen(true)}
              >
                <svg width="10" height="10" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-white dark:text-white">
                  <path fillRule="evenodd" clipRule="evenodd" d="M0 48.031H31.969V80H48.031V48.031H80V31.969H48.031V0H31.969V31.969H0V48.031Z" fill="currentColor" />
                </svg>
                Add New
              </Button>
              <div className="flex items-center gap-4 mb-5">
                {shippingMethods && shippingMethods.total !== null && shippingMethods.total > 10 && (
                  <PaginationControls
                    currentPage={currentPage}
                    total={shippingMethods.total}
                    onPrev={handlePrevPage}
                    onNext={handleNextPage}
                  />
                )}
              </div>
            </div>
            <SimpleTable
              headers={headers}
              rows={tableRows}
              onEdit={onSelectCategory}
              onDelete={onConfirmDeleteCategory}
            />
          </div>
        </div>
      </div>

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
