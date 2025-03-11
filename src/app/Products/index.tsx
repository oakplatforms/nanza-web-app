import { useEffect, useState } from 'react'
import { EntityDto, EntityTagDto, TagDto } from '../../types'
import { entityService } from '../../services/api/Entity'
import { Button, Badge, Header } from '../../components/Tailwind'
import { ConfirmDialog } from '../../components/ConfirmDialog'
import { SimpleTable } from '../../components/SimpleTable'
import { SimpleDialog } from '../../components/SimpleDialog'
import { CreateOrEditProduct } from './CreateOrEditProduct'
import { tagService } from '../../services/api/Tag'
import { useSession } from '../../context/SessionContext'

export function Products() {
  const { currentUser } = useSession()
  const [productEntities, setProductEntities] = useState<EntityDto[]>([])
  const [tags, setTags] = useState<TagDto[]>([])
  const [isCreateOrEditProductDialogOpen, setIsCreateOrEditProductDialogOpen] = useState(false)
  const [isDeleteProductDialogOpen, setIsDeleteProductDialogOpen] = useState(false)
  const [selectedProductEntity, setSelectedProductEntity] = useState<EntityDto>()
  const [deletedTags, setDeletedTags] = useState<string[]>([])
  const [selectedTags, setSelectedTags] = useState<EntityTagDto[]>([])
  const [updatedTags, setUpdatedTags] = useState<EntityTagDto[]>([])

  useEffect(() => {
    getProductEntities()
    getTagsWithSupportedValues()
  }, [])

  const getTagsWithSupportedValues = async () => {
    try {
      const tags: TagDto[] = await tagService.list('?include=supportedTagValues')
      setTags(tags)
    } catch (error) {
      console.error('Error fetching tag options:', error)
    }
  }

  const getProductEntities = async () => {
    try {
      const productEntitiesData = await entityService.list('?category=tcg&include=entityTags.tag')
      setProductEntities(productEntitiesData)
    } catch (error) {
      console.error('Error fetching products:', error)
    }
  }

  const onEditProduct = async (productIdx: number) => {
    const selectedProductEntity = productEntities[productIdx]

    if (selectedProductEntity) {
      setSelectedProductEntity(selectedProductEntity)
      setSelectedTags(selectedProductEntity?.entityTags || [])
      setIsCreateOrEditProductDialogOpen(true)
    }
  }

  const onSaveProduct = async () => {
    const existingProductEntity = selectedProductEntity?.id
    try {
      const createTags = selectedTags.filter(
        (tag) =>
          !selectedProductEntity?.entityTags?.some(
            (initialTag) =>
              initialTag.tagId === tag.tagId && initialTag.tagValue === tag.tagValue
          )
      )

      if (existingProductEntity) {
        await entityService.update(selectedProductEntity.id!, {
          ...selectedProductEntity,
          type: 'PRODUCT',
          lastModifiedById: currentUser?.account?.id,
          brandCategoryId: 'cm7rluppj0009fxv47hmryuqe',
          entityTags: {
            create: createTags,
            delete: deletedTags,
            update: updatedTags,
          },
        })
      } else {
        await entityService.create({
          ...selectedProductEntity!,
          type: 'PRODUCT',
          createdById: currentUser?.account?.id,
          brandCategoryId: 'cm7rluppj0009fxv47hmryuqe',
          entityTags: {
            create: createTags,
          },
        })
      }
      await getProductEntities()
      setIsCreateOrEditProductDialogOpen(false)
    } catch (error) {
      console.error(`Error ${existingProductEntity ? 'updating' : 'creating'} product:`, error)
    }
  }

  const onConfirmDeleteProduct = async (productIdx: number) => {
    const selectedProductEntity = productEntities[productIdx]

    if (selectedProductEntity) {
      setSelectedProductEntity(selectedProductEntity)
      setSelectedTags(selectedProductEntity?.entityTags || [])
      setIsDeleteProductDialogOpen(true)
    }
  }

  const onDeleteProduct = async () => {
    try {
      if (selectedProductEntity) {
        await entityService.delete(selectedProductEntity.id!)
        await getProductEntities()
        setSelectedProductEntity(undefined)
        setSelectedTags([])
        setDeletedTags([])
        setUpdatedTags([])
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
          color="green"
          onClick={() => setIsCreateOrEditProductDialogOpen(true)}
        >
          Add New Product
        </Button>
      </div>
      <br />
      <SimpleTable
        headers={headers}
        rows={tableRows}
        onEdit={onEditProduct}
        onDelete={onConfirmDeleteProduct}
      />
      <SimpleDialog
        isOpen={isCreateOrEditProductDialogOpen}
        size='3xl'
        onClose={() => {
          setSelectedProductEntity(undefined)
          setSelectedTags([])
          setDeletedTags([])
          setUpdatedTags([])
          setIsCreateOrEditProductDialogOpen(false)
        }}
        title={selectedProductEntity ? `Edit '${selectedProductEntity?.displayName || ''}'` : 'Add New Product'}
        onSubmit={() => onSaveProduct()}
        submitBtnTxt={selectedProductEntity?.id ? 'Update Product' : 'Add Product'}
        submitBtnColor='green'
      >
        <CreateOrEditProduct
          selectedProductEntity={selectedProductEntity}
          setSelectedProductEntity={setSelectedProductEntity}
          tags={tags}
          selectedTags={selectedTags}
          setSelectedTags={setSelectedTags}
          setDeletedTags={setDeletedTags}
          setUpdatedTags={setUpdatedTags}
        />
      </SimpleDialog>
      <ConfirmDialog
        isOpen={isDeleteProductDialogOpen}
        onClose={() => {
          setSelectedProductEntity(undefined)
          setSelectedTags([])
          setDeletedTags([])
          setUpdatedTags([])
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
