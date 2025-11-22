import { useState, useEffect } from 'react'
import { BrandDto } from '../../types'
import { brandService } from '../../services/api/Brand'
import { SimpleTable } from '../../components/SimpleTable'
import { Button, Header } from '../../components/Tailwind'
import { SimpleDialog } from '../../components/SimpleDialog'
import { ConfirmDialog } from '../../components/ConfirmDialog'
import { CreateOrEditBrand } from './CreateOrEditBrand'
import { useSession } from '../../context/SessionContext'
import { PaginationControls } from '../../components/PaginationControls'
import { fetchBrands } from './data/fetchBrands'
import { useSearchParams } from 'react-router-dom'

export function Brands({ readOnly = false }: { readOnly?: boolean }) {
  const { currentUser } = useSession()
  const [searchParams, setSearchParams] = useSearchParams()
  const [currentPage, setCurrentPage] = useState(0)
  const [isCreateOrEditModalOpen, setIsCreateOrEditModalOpen] = useState(false)
  const [selectedBrand, setSelectedBrand] = useState<BrandDto | null>(null)
  const [isDeleteBrandDialogOpen, setIsDeleteBrandDialogOpen] = useState(false)

  const { brands, refetchBrands } = fetchBrands(currentPage)

  //Check for create query parameter and open dialog
  useEffect(() => {
    if (!readOnly && searchParams.get('create') === 'true') {
      setSelectedBrand(null)
      setIsCreateOrEditModalOpen(true)
      searchParams.delete('create')
      setSearchParams(searchParams, { replace: true })
    }
  }, [searchParams, setSearchParams, readOnly])

  const handleNextPage = () => {
    if (brands && brands.total !== null && (currentPage + 1) * 10 < brands.total) {
      setCurrentPage((prev) => prev + 1)
    }
  }

  const handlePrevPage = () => {
    if (currentPage > 0) {
      setCurrentPage((prev) => prev - 1)
    }
  }

  const onSaveBrand = async () => {
    try {
      if (selectedBrand) {
        const existingBrand = !!selectedBrand.id

        if (existingBrand) {
          await brandService.update(selectedBrand.id!, {
            name: selectedBrand.name,
            displayName: selectedBrand.displayName,
            lastModifiedById: currentUser?.admin?.id
          })
        } else {
          await brandService.create({
            name: selectedBrand.name,
            displayName: selectedBrand.displayName,
            createdById: currentUser?.admin?.id,
          })
        }
        await refetchBrands()
        setCurrentPage(0)
        setIsCreateOrEditModalOpen(false)
        setSelectedBrand(null)
      }
    } catch (error) {
      console.log('Error saving brand.', error)
    }
  }

  const onDeleteBrand = async () => {
    try {
      if (selectedBrand?.id) {
        await brandService.delete(selectedBrand.id)
        await refetchBrands()
        setCurrentPage(0)
        setIsDeleteBrandDialogOpen(false)
        setSelectedBrand(null)
      }
    } catch (error) {
      console.log('Error deleting brand.', error)
    }
  }

  const onSelectBrand = (brandIdx: number) => {
    const selected = brands?.data?.[brandIdx]
    if (selected) {
      setSelectedBrand(selected)
      setIsCreateOrEditModalOpen(true)
    }
  }

  const onConfirmDeleteBrand = (brandIdx: number) => {
    const selected = brands?.data?.[brandIdx]
    if (selected) {
      setSelectedBrand(selected)
      setIsDeleteBrandDialogOpen(true)
    }
  }

  const headers = ['Name', '']
  const tableRows = brands?.data.map((brand) => ({
    displayName: { value: brand.displayName || '', width: '1050px' },
  })) || []

  return (
    <>
      <div className="top-0 left-0 right-0 bottom-0 flex gap-0">
        {/*Main content column*/}
        <div className="flex-1 flex flex-col min-w-0 h-full">
          <div className="bg-[#e5e8eb] flex-shrink-0 flex items-center justify-between mb-0 pl-6 lg:pl-6 pr-4 lg:pr-3 py-2 lg:py-2">
            <div className="flex items-center gap-4">
              <Header>Brands</Header>
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
                {brands && brands.total !== null && brands.total > 10 && (
                  <PaginationControls
                    currentPage={currentPage}
                    total={brands.total}
                    onPrev={handlePrevPage}
                    onNext={handleNextPage}
                  />
                )}
              </div>
            </div>
            <SimpleTable
              headers={headers}
              rows={tableRows}
              onEdit={readOnly ? undefined : onSelectBrand}
              onDelete={readOnly ? undefined : onConfirmDeleteBrand}
              readOnly={readOnly}
            />
          </div>
        </div>
      </div>
      <SimpleDialog
        isOpen={isCreateOrEditModalOpen}
        size="2xl"
        title={selectedBrand?.id ? 'Edit Brand' : 'Create Brand'}
        onClose={() => {
          setSelectedBrand(null)
          setIsCreateOrEditModalOpen(false)
        }}
        onSubmit={onSaveBrand}
        submitBtnTxt={selectedBrand?.id ? 'Update Brand' : 'Add Brand'}
      >
        <CreateOrEditBrand
          selectedBrand={selectedBrand}
          setSelectedBrand={setSelectedBrand}
        />
      </SimpleDialog>
      <ConfirmDialog
        isOpen={isDeleteBrandDialogOpen}
        onClose={() => {
          setSelectedBrand(null)
          setIsDeleteBrandDialogOpen(false)
        }}
        title="Delete Brand"
        description={`Are you sure you want to delete the brand "${selectedBrand?.displayName}"?`}
        onConfirm={onDeleteBrand}
        confirmBtnTxt="Delete"
      />
    </>
  )
}
