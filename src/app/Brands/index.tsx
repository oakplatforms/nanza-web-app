import { useEffect, useState } from 'react'
import { BrandDto } from '../../types'
import { brandService } from '../../services/api/Brand'
import { SimpleTable } from '../../components/SimpleTable'
import { Header, Badge, Button } from '../../components/Tailwind'
import { SimpleDialog } from '../../components/SimpleDialog'
import { ConfirmDialog } from '../../components/ConfirmDialog'
import { CreateOrEditBrand } from './CreateOrEditBrand'
import { useSession } from '../../context/SessionContext'

export function Brands() {
  const { currentUser } = useSession()
  const [brands, setBrands] = useState<BrandDto[]>([])
  const [isCreateOrEditModalOpen, setIsCreateOrEditModalOpen] = useState(false)
  const [selectedBrand, setSelectedBrand] = useState<BrandDto | null>(null)
  const [isDeleteBrandDialogOpen, setIsDeleteBrandDialogOpen] = useState(false)
  const [deletedBrandCategories, setDeletedBrandCategories] = useState<string[]>([])

  useEffect(() => {
    getBrands()
  }, [])

  const getBrands = async () => {
    try {
      const brandsData = await brandService.list('?include=brandCategories')
      setBrands(brandsData)
    } catch (error) {
      console.log('Error fetching brands.', error)
    }
  }

  const onSaveBrand = async () => {
    try {
      if (selectedBrand) {
        const existingBrand = !!selectedBrand.id

        const newCategories = (selectedBrand.brandCategories || [])
          .filter(cat => !cat.id)
          .map(cat => ({ categoryName: cat.categoryName }))

        if (existingBrand) {
          await brandService.update(selectedBrand.id!, {
            name: selectedBrand.name,
            displayName: selectedBrand.displayName,
            lastModifiedById: currentUser?.account?.id,
            brandCategories: {
              create: newCategories,
              delete: deletedBrandCategories,
            }
          })
        } else {
          await brandService.create({
            name: selectedBrand.name,
            displayName: selectedBrand.displayName,
            createdById: currentUser?.account?.id,
            brandCategories: {
              create: newCategories,
            }
          })
        }

        await getBrands()
        setIsCreateOrEditModalOpen(false)
        setSelectedBrand(null)
        setDeletedBrandCategories([])
      }
    } catch (error) {
      console.log('Error saving brand.', error)
    }
  }

  const onDeleteBrand = async () => {
    try {
      if (selectedBrand?.id) {
        await brandService.delete(selectedBrand.id)
        await getBrands()
        setIsDeleteBrandDialogOpen(false)
        setSelectedBrand(null)
      }
    } catch (error) {
      console.log('Error deleting brand.', error)
    }
  }

  const onSelectBrand = (brandIdx: number) => {
    setSelectedBrand(brands[brandIdx])
    setDeletedBrandCategories([])
    setIsCreateOrEditModalOpen(true)
  }

  const onConfirmDeleteBrand = (brandIdx: number) => {
    setSelectedBrand(brands[brandIdx])
    setIsDeleteBrandDialogOpen(true)
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
        headers={['Name', 'Categories', '']}
        rows={brands.map((brand) => ({
          displayName: { value: brand.displayName || '', width: '250px' },
          brandCategories: {
            value: brand.brandCategories?.map((category, index) => (
              <Badge key={index} color="zinc" className="ml-3 mt-1 relative whitespace-nowrap align-middle">
                {category.categoryName}
              </Badge>
            )),
            width: '800px',
          },
        }))}
        onEdit={onSelectBrand}
        onDelete={onConfirmDeleteBrand}
      />
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
          setDeletedBrandCategories={setDeletedBrandCategories}
        />
      </SimpleDialog>
      <ConfirmDialog
        isOpen={isDeleteBrandDialogOpen}
        onClose={() => {
          setSelectedBrand(null)
          setIsDeleteBrandDialogOpen(false)
        }}
        title="Delete Brand"
        description={`Are you sure you want to delete the brand "${
          selectedBrand?.displayName
        }"?`}
        onConfirm={onDeleteBrand}
        confirmBtnTxt="Delete"
      />
    </>
  )
}
