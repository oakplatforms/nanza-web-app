import React, { useEffect, useState } from 'react';
import { ProductDto } from '../../types';
import { productService } from '../../services/api/Product';
import { SimpleTable } from '../../components/Table';
import { Header } from '../../components/Header';
import { PanelDrawer } from '../../components/PanelDrawer';
import { Button } from '../../components/Button';
import { ConfirmDialog } from '../../components/Dialog';
import { Input } from '../../components/Input';
import { slugify } from '../../helpers';
import { Badge } from '../../components/Badge';

export function ProductsDashboard () {
  const [products, setProducts] = useState<ProductDto[]>([]);
  const [isCreateProductDrawerOpen, setIsCreateProductDrawerOpen] = useState(false)
  const [isEditProductDrawerOpen, setIsEditProductDrawerOpen] = useState(false)
  const defaultSelectProduct = { type: 'CARD', brandCategoryId: "cm12ukr4b0004rylerclr9gto" } as ProductDto
  const [selectedProduct, setSelectedProduct] = useState<ProductDto | null>(defaultSelectProduct);
  const [isDeleteProductDialogOpen, setIsDeleteProductDialogOpen] = useState(false)

  useEffect(() => {
    initProducts();
  }, []);

  const initProducts = async () => {
    try {
      const productsData = await productService.list('?category=tcg&include=productTags.tag');
      setProducts(productsData);
    } catch (error) {
      console.log('Error fetching products.', error);
    }
  }

  const onCreateProduct = async () => {
    try {
      await productService.create(selectedProduct as ProductDto);
      await initProducts()
      setSelectedProduct(defaultSelectProduct)
      setIsCreateProductDrawerOpen(false)
    } catch (error) {
      console.log('Error creating products.', error);
    }
  }

  const onUpdateProduct = async () => {
    try {
      if (selectedProduct) {
        await productService.update(selectedProduct.id!, selectedProduct as ProductDto);
        await initProducts()
        setSelectedProduct(defaultSelectProduct)
        setIsEditProductDrawerOpen(false)
      }
    } catch (error) {
      console.log('Error updating products.', error);
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
      console.log('Error confirming deleting products.', error);
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
      console.log('Error deleting products.', error);
    }
  }

  const generateTagBadges = (product: ProductDto) => {
    return product?.productTags?.map(productTag => {
      return (
        <Badge color="zinc" className="ml-2 mt-1">
          {productTag.tag?.displayName}: {productTag.tagValue}
        </Badge>
      )
    })
  }
  const headers = ['Name', 'Description', 'Price', 'Tags', '']
  const tableRows = products.map((product) => (
    {
      displayName: { value: product.displayName || '', width: 'auto' },
      description: { value: product.description || '', width: '400px' },
      price: { value: `$${product.price}` || '', width: 'auto' },
      tags: { value: generateTagBadges(product), width: '400px' }
    }))

  return (
    <>
      <div className="flex">
        <Header>Products</Header>
        <Button className="text-white px-4 py-2 ml-auto" onClick={() => setIsCreateProductDrawerOpen(true)} color='green'>Create New</Button>
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
              onChange={(e) => setSelectedProduct({ ...selectedProduct, displayName: e.target.value })}
              placeholder="Enter product name"
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
    </>
  );
};
