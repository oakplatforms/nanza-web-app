import { useEffect, useState } from 'react'
import { ProductDto, ProductTagDto, TagDto } from '../../types'
import { productService } from '../../services/api/Product'
import { SimpleTable } from '../../components/Table'
import { Header } from '../../components/Header'
import { PanelDrawer } from '../../components/PanelDrawer'
import { Button } from '../../components/Button'
import { ConfirmDialog, SimpleDialog } from '../../components/Dialog'
import { Input } from '../../components/Input'
import { slugify } from '../../helpers'
import { Badge } from '../../components/Badge'
import { PlusIcon, XCircleIcon } from '@heroicons/react/16/solid'
import { productTagService } from '../../services/api/ProductTag'
import { tagService } from '../../services/api/Tag'
import { Select } from '../../components/Select'

export function ProductsDashboard () {
  const [products, setProducts] = useState<ProductDto[]>([])
  const [tags, setTags] = useState<TagDto[]>([])
  const [selectedTag, setSelectedTag] = useState<TagDto | null | undefined>(null)
  const [selectedTagValue, setSelectedTagValue] = useState<string | null>(null)
  const [isCreateProductDrawerOpen, setIsCreateProductDrawerOpen] = useState(false)
  const [isEditProductDrawerOpen, setIsEditProductDrawerOpen] = useState(false)
  const defaultSelectProduct = { type: 'CARD', brandCategoryId: "cm12ukr4b0004rylerclr9gto" } as ProductDto
  const [selectedProduct, setSelectedProduct] = useState<ProductDto | null>(defaultSelectProduct)
  const [isDeleteProductDialogOpen, setIsDeleteProductDialogOpen] = useState(false)
  const [isProductTagDialogOpen, setProductTagDialogOpen] = useState(false)

  useEffect(() => {
    initProducts();
  }, []);

  const initProducts = async () => {
    try {
      const productsData = await productService.list('?category=tcg&include=productTags.tag')
      const tagsData = await tagService.list('?include=supportedTagValues')
      setTags(tagsData)
      setSelectedTag(tagsData[0])
      setProducts(productsData)
    } catch (error) {
      console.log('Error fetching products.', error)
    }
  }

  const onCreateProduct = async () => {
    try {
      await productService.create(selectedProduct as ProductDto);
      await initProducts()
      setSelectedProduct(defaultSelectProduct)
      setIsCreateProductDrawerOpen(false)
    } catch (error) {
      console.log('Error creating products.', error)
    }
  }

  const onUpdateProduct = async () => {
    try {
      if (selectedProduct) {
        const { name, displayName, price, description, image, ...rest } = selectedProduct
        await productService.update(selectedProduct.id!, {
          name,
          displayName,
          price,
          description,
          image
        } as ProductDto)
        await initProducts()
        setSelectedProduct(defaultSelectProduct)
        setIsEditProductDrawerOpen(false)
      }
    } catch (error) {
      console.log('Error updating products.', error)
    }
  }

  const onSelectProduct = async (productIdx: number) => {
    const selectedProduct = products[productIdx]

    if (selectedProduct) {
      setSelectedProduct(selectedProduct)
      setIsEditProductDrawerOpen(true)
    }
  }

  const onConfirmDeleteProduct = async (productIdx: number) => {
    const selectedProduct = products[productIdx]

    try {
      if (selectedProduct) {
        setSelectedProduct(selectedProduct)
        setIsDeleteProductDialogOpen(true)
      }
    } catch (error) {
      console.log('Error confirming deleting products.', error)
    }
  }

  const onDeleteProduct = async () => {
    try {
      if (selectedProduct) {
        await productService.delete(selectedProduct.id!)
        await initProducts()
        setSelectedProduct(defaultSelectProduct)
        setIsDeleteProductDialogOpen(false)
      }
    } catch (error) {
      console.log('Error deleting products.', error)
    }
  }

  const onDeleteProductTag = async (id?: string) => {
    try {
      if (id) {
        await productTagService.delete(id)
        await initProducts()
      }
    } catch (error) {
      console.log('Error deleting supported tag value.', error)
    }
  }

  const onCreateProductTag = async () => {
    try {
      if (selectedProduct && selectedTag && selectedTagValue) {
        await productTagService.create({
          tagId: selectedTag.id,
          tagValue: selectedTagValue,
          productId: selectedProduct.id
        })
        setSelectedProduct(defaultSelectProduct)
        setSelectedTag(tags[0])
        setSelectedTagValue(null)
        setProductTagDialogOpen(false)
        await initProducts()
      }
    } catch (error) {
      console.log('Error deleting supported tag value.', error)
    }
  }

  const generateTagBadges = (product: ProductDto) => (
    <>
    {product?.productTags?.map((productTag, idx) => (
      <Badge
        color="zinc"
        className="ml-3 mt-1 relative whitespace-nowrap align-middle"
        key={idx}
      >
        {productTag.tag?.displayName} | {productTag.tagValue}
        <div className="absolute right-[-7px] top-[-7px] w-3 h-3 bg-white rounded-full z-[1]" />
        <XCircleIcon onClick={() => onDeleteProductTag(productTag?.id)} className="absolute right-[-7px] top-[-7px] w-[.9rem] z-[2] cursor-pointer" />
      </Badge>
      )
    )}
      <Button
        onClick={() => {
          setSelectedProduct(product)
          setProductTagDialogOpen(true)
        }}
        plain
        className="gap-x-0 ml-2 text-[12px] cursor-pointer align-middle"
      >
        <PlusIcon />
        <span className="text-[12px]"> Add</span>
      </Button>
    </>
  )

  const headers = ['Name',  'Price', 'Description', 'Tags', '']
  const tableRows = products?.map((product) => (
    {
      displayName: { value: product.displayName || '', width: '200px' },
      price: { value: `$${product.price}` || '', width: 'auto' },
      description: { value: product.description || '', width: '400px' },
      tags: { value: generateTagBadges(product), width: '400px' }
    }))

  return (
    <>
      <div className="flex">
        <Header>Products</Header>
        <Button className="text-white px-4 py-2 ml-auto  cursor-pointer" onClick={() => setIsCreateProductDrawerOpen(true)} color='green'>Create New</Button>
      </div>
      <br></br>
      <SimpleTable
        headers={headers}
        rows={tableRows}
        onEdit={onSelectProduct}
        onDelete={onConfirmDeleteProduct}
      />
      {isCreateProductDrawerOpen && (
        <PanelDrawer
          title="Create Product"
          onCancel={() => {
            setSelectedProduct(defaultSelectProduct)
            setIsCreateProductDrawerOpen(false)
          }}
          onSubmit={onCreateProduct}
          submitButtonTxt="Add Product"
          isSubmitDisabled={!(selectedProduct?.displayName && selectedProduct?.price)}
        >
          <div className="mb-4">
            <label className="block text-sm font-bold mb-1">Name</label>
            <Input
              type="text"
              value={selectedProduct?.displayName || ''}
              onChange={(e) => setSelectedProduct({ ...selectedProduct, displayName: e.target.value, name: slugify(e.target.value) })}
              placeholder="Enter product name"
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-bold mb-1">Image Url</label>
            <Input
              type="text"
              value={selectedProduct?.image || ''}
              onChange={(e) => setSelectedProduct({ ...selectedProduct, image: e.target.value })}
              placeholder="Enter image url"
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-bold mb-1">Description</label>
            <Input
              type="text"
              value={selectedProduct?.description || ''}
              onChange={(e) => setSelectedProduct({ ...selectedProduct, description: e.target.value })}
              placeholder="Enter description name"
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-bold mb-1">Price</label>
            <Input
              type="text"
              value={selectedProduct?.price || ''}
              onChange={(e) => setSelectedProduct({ ...selectedProduct, price: e.target.value })}
              placeholder="Enter product price"
            />
          </div>
        </PanelDrawer>
      )}
       {isEditProductDrawerOpen && (
        <PanelDrawer
          title="Edit Product"
          onCancel={() => {
            setSelectedProduct(defaultSelectProduct)
            setIsEditProductDrawerOpen(false)
          }}
          onSubmit={onUpdateProduct}
          submitButtonTxt="Update Product"
        >
          <div className="mb-4">
            <label className="block text-sm font-bold mb-1">Name</label>
            <Input
              type="text"
              value={selectedProduct?.displayName || ''}
              onChange={(e) => setSelectedProduct({ ...selectedProduct, displayName: e.target.value, name: slugify(e.target.value) })}
              placeholder="Enter product name"
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-bold mb-1">Image Url</label>
            <Input
              type="text"
              value={selectedProduct?.image || ''}
              onChange={(e) => setSelectedProduct({ ...selectedProduct, image: e.target.value })}
              placeholder="Enter image url"
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-bold mb-1">Description</label>
            <Input
              type="text"
              value={selectedProduct?.description || ''}
              onChange={(e) => setSelectedProduct({ ...selectedProduct, description: e.target.value })}
              placeholder="Enter description name"
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-bold mb-1">Price</label>
            <Input
              type="text"
              value={selectedProduct?.price || ''}
              onChange={(e) => setSelectedProduct({ ...selectedProduct, price: e.target.value })}
              placeholder="Enter product price"
            />
          </div>
        </PanelDrawer>
      )}
      <ConfirmDialog
        isOpen={isDeleteProductDialogOpen}
        onClose={() => {
          setSelectedProduct(null)
          setIsDeleteProductDialogOpen(false)
        }}
        title="Delete Product"
        description={`Are you sure you want to delete your product ${selectedProduct?.displayName}?`}
        onConfirm={onDeleteProduct}
        confirmBtnTxt="Delete"
      />
      <SimpleDialog
        isOpen={isProductTagDialogOpen}
        onClose={() => {
          setSelectedProduct(null)
          setSelectedTag(tags[0])
          setSelectedTagValue(null)
          setProductTagDialogOpen(false)
        }}
        title="Product Tag"
        onSubmit={onCreateProductTag}
        submitBtnTxt="Add"
        submitBtnColor='green'
      >
      <div className="flex items-center gap-1">
        <div className="flex flex-col w-28">
          <label className="block text-sm font-bold mb-1">Tag</label>
          <Select
            name="tags"
            className="max-w-[150px]"
            onChange={(e) => setSelectedTag(tags.find(tag => tag.id === e.target.value))}>
            {tags?.map((tag, idx) => (
              <option key={idx} value={tag?.id}>{tag?.displayName || tag?.name}</option>
            ))}
          </Select>
        </div>
        <div className="flex flex-1 flex-col">
          <label className="block text-sm font-bold mb-1">Value</label>
          {selectedTag?.supportedTagValues?.length ? (
            <Select
              name="tags"
              onChange={(e) => setSelectedTagValue(e.target.value)}>
              {selectedTag?.supportedTagValues?.map((supportedTagValue, idx) => (
                <option key={idx} value={supportedTagValue?.displayName || supportedTagValue?.name}>{supportedTagValue?.displayName || supportedTagValue?.name}</option>
              ))}
            </Select>
          ) : (
            <Input
              type="text"
              value={selectedTagValue || ''}
              onChange={(e) =>
                setSelectedTagValue(e.target.value)
              }
              placeholder="Add tag value"
            />
          )}
        </div>
      </div>
      </SimpleDialog>
    </>
  )
}
