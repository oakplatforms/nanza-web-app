import { useState } from 'react'
import { BrandDto } from '../../types'
import { brandService } from '../../services/api/Brand'
import { SimpleTable } from '../../components/SimpleTable'
import { Header, Button } from '../../components/Tailwind'
import { SimpleDialog } from '../../components/SimpleDialog'
import { ConfirmDialog } from '../../components/ConfirmDialog'
import { CreateOrEditBrand } from './CreateOrEditBrand'
import { useSession } from '../../context/SessionContext'
import { PaginationControls } from '../../components/PaginationControls'
import { fetchBrands } from './data/fetchBrands'

export function Brands() {
  const { currentUser } = useSession()
  const [currentPage, setCurrentPage] = useState(0)
  const [isCreateOrEditModalOpen, setIsCreateOrEditModalOpen] = useState(false)
  const [selectedBrand, setSelectedBrand] = useState<BrandDto | null>(null)
  const [isDeleteBrandDialogOpen, setIsDeleteBrandDialogOpen] = useState(false)

  const { brands, refetchBrands } = fetchBrands(currentPage)

  const handleNextPage = () => {
    if (brands?.total !== null && (currentPage + 1) * 10 < brands!.total) {
      const nextPage = currentPage + 1
      setCurrentPage(nextPage)
    }
  }

  const handlePrevPage = () => {
    if (currentPage > 0) {
      const prevPage = currentPage - 1
      setCurrentPage(prevPage)
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

  return (
    <>
      <div className="flex">
        <Header>Brands</Header>
        <Button
          className="text-white px-4 py-2 ml-auto cursor-pointer"
          onClick={() => setIsCreateOrEditModalOpen(true)}
          color="green"
        >
          Create New Brand
        </Button>
      </div>
      <br />
      <SimpleTable
        headers={['Name', '']}
        rows={brands?.data.map((brand) => ({
          displayName: { value: brand.displayName || '', width: '1050px' },
        })) || []}
        onEdit={onSelectBrand}
        onDelete={onConfirmDeleteBrand}
      />
      {brands && brands.total !== null && brands.total > 10 && (
        <PaginationControls
          currentPage={currentPage}
          total={brands.total}
          onPrev={handlePrevPage}
          onNext={handleNextPage}
        />
      )}
      <SimpleDialog
        isOpen={isCreateOrEditModalOpen}
        size="3xl"
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
