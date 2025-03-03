import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { EntityDto } from '../../types'
import { entityService } from '../../services/api/Entity'
import { Button, Badge, Header } from '../../components/Tailwind'
import { ConfirmDialog } from '../../components/ConfirmDialog'
import { SimpleTable } from '../../components/SimpleTable'

export function Products() {
  const navigate = useNavigate()
  const [productEntities, setProductEntities] = useState<EntityDto[]>([])
  const [isDeleteProductDialogOpen, setIsDeleteProductDialogOpen] = useState(false)
  const [selectedProductEntity, setSelectedProductEntity] = useState<EntityDto | null>(null)

  useEffect(() => {
    initProducts()
  }, [])

  const initProducts = async () => {
    try {
      const productEntitiesData = await entityService.list('?category=tcg&include=entityTags.tag')
      setProductEntities(productEntitiesData)
    } catch (error) {
      console.error('Error fetching products:', error)
    }
  }

  const onConfirmDeleteProduct = async (productIdx: number) => {
    const selectedProductEntity = productEntities[productIdx]

    if (selectedProductEntity) {
      setSelectedProductEntity(selectedProductEntity)
      setIsDeleteProductDialogOpen(true)
    }
  }

  const onDeleteProduct = async () => {
    try {
      if (selectedProductEntity) {
        await entityService.delete(selectedProductEntity.id!)
        await initProducts()
        setSelectedProductEntity(null)
        setIsDeleteProductDialogOpen(false)
      }
    } catch (error) {
      console.error('Error deleting product:', error)
    }
  }

  const generateTagBadges = (productEntity: EntityDto) => (
    <>
      {productEntity?.entityTags?.map((entityTag, idx) => (
        <Badge
          color="zinc"
          className="ml-3 mt-1 relative whitespace-nowrap align-middle"
          key={idx}
        >
          {entityTag.tag?.displayName} | {entityTag.tagValue}
        </Badge>
      ))}
    </>
  )

  const headers = ['Name', 'Description', 'Tags', '']
  const tableRows = productEntities?.map((productEntity) => ({
    displayName: { value: productEntity.displayName || '', width: '200px' },
    description: { value: productEntity.description || '', width: '400px' },
    tags: { value: generateTagBadges(productEntity), width: '400px' },
  }))

  return (
    <>
      <div className="flex">
        <Header>Products</Header>
        <Button
          className="text-white px-4 py-2 ml-auto cursor-pointer"
          onClick={() => navigate('/products/new')}
          color="green"
        >
          Create New
        </Button>
      </div>
      <br />
      <SimpleTable
        headers={headers}
        rows={tableRows}
        onEdit={(productIdx: number) => navigate(`/products/edit/${productEntities[productIdx].id}`)}
        onDelete={onConfirmDeleteProduct}
      />
      <ConfirmDialog
        isOpen={isDeleteProductDialogOpen}
        onClose={() => {
          setSelectedProductEntity(null)
          setIsDeleteProductDialogOpen(false)
        }}
        title="Delete Product"
        description={`Are you sure you want to delete your product ${selectedProductEntity?.displayName}?`}
        onConfirm={onDeleteProduct}
        confirmBtnTxt="Delete"
      />
    </>
  )
}
