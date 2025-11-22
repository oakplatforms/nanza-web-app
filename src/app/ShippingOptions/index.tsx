import { useState, useEffect } from 'react'
import { ShippingOptionDto } from '../../types'
import { shippingOptionService } from '../../services/api/ShippingOption'
import { SimpleTable } from '../../components/SimpleTable'
import { Header, Button } from '../../components/Tailwind'
import { SimpleDialog } from '../../components/SimpleDialog'
import { ConfirmDialog } from '../../components/ConfirmDialog'
import { CreateOrEditShippingOption } from './CreateOrEditShippingOptions'
import { useSession } from '../../context/SessionContext'
import { slugify } from '../../helpers'
import { fetchShippingOptions } from './data/fetchShippingOptions'
import { PaginationControls } from '../../components/PaginationControls'
import { useSearchParams } from 'react-router-dom'

export function ShippingOptions({ readOnly = false }: { readOnly?: boolean }) {
  const { currentUser } = useSession()
  const [searchParams, setSearchParams] = useSearchParams()
  const [currentPage, setCurrentPage] = useState(0)
  const [isCreateOrEditModalOpen, setIsCreateOrEditModalOpen] = useState(false)
  const [selectedShippingOption, setSelectedShippingOption] = useState<ShippingOptionDto | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

  const { shippingOptions, refetchShippingOptions } = fetchShippingOptions(currentPage)

  //Check for create query parameter and open dialog
  useEffect(() => {
    if (!readOnly && searchParams.get('create') === 'true') {
      setSelectedShippingOption(null)
      setIsCreateOrEditModalOpen(true)
      searchParams.delete('create')
      setSearchParams(searchParams, { replace: true })
    }
  }, [searchParams, setSearchParams, readOnly])

  const handleNextPage = () => {
    if (shippingOptions && shippingOptions.total !== null && (currentPage + 1) * 10 < shippingOptions.total) {
      setCurrentPage((prev) => prev + 1)
    }
  }

  const handlePrevPage = () => {
    if (currentPage > 0) {
      setCurrentPage((prev) => prev - 1)
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
        await refetchShippingOptions()
        setCurrentPage(0)
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
        await refetchShippingOptions()
        setCurrentPage(0)
        setSelectedShippingOption(null)
        setIsDeleteDialogOpen(false)
      }
    } catch (error) {
      console.error('Error deleting shipping option.', error)
    }
  }

  const headers = ['Name', 'Rate', 'Max Quantity', 'Max Weight', '']
  const tableRows = shippingOptions?.data.map((option) => ({
    displayName: { value: option.displayName || '', width: '450px' },
    rate: { value: `$${option.rate}`, width: '200px' },
    maxQuantity: { value: option.maxQuantity || '-', width: '200px' },
    weight: { value: option.weight || '-', width: '200px' },
  })) || []

  return (
    <>
      <div className="top-0 left-0 right-0 bottom-0 flex gap-0">
        {/*Main content column*/}
        <div className="flex-1 flex flex-col min-w-0 h-full">
          <div className="bg-[#e5e8eb] flex-shrink-0 flex items-center justify-between mb-0 pl-6 lg:pl-6 pr-4 lg:pr-3 py-2 lg:py-2">
            <div className="flex items-center gap-4">
              <Header>Shipping Options</Header>
            </div>
          </div>
          <div className="flex-1 overflow-x-auto overflow-y-auto p-6">
            <div className="h-20 flex items-center justify-between gap-3">
              {!readOnly && (
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
              )}
              <div className="flex items-center gap-4 mb-5">
                {shippingOptions && shippingOptions.total !== null && shippingOptions.total > 10 && (
                  <PaginationControls
                    currentPage={currentPage}
                    total={shippingOptions.total}
                    onPrev={handlePrevPage}
                    onNext={handleNextPage}
                  />
                )}
              </div>
            </div>
            <SimpleTable
              headers={headers}
              rows={tableRows}
              onEdit={readOnly ? undefined : (idx) => {
                setSelectedShippingOption(shippingOptions!.data[idx])
                setIsCreateOrEditModalOpen(true)
              }}
              onDelete={readOnly ? undefined : (idx) => {
                setSelectedShippingOption(shippingOptions!.data[idx])
                setIsDeleteDialogOpen(true)
              }}
              readOnly={readOnly}
            />
          </div>
        </div>
      </div>

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