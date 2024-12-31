import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ProductDto, TagDto } from '../../types';
import { productService } from '../../services/api/Product';
import { SimpleTable } from '../../components/Table';
import { Header } from '../../components/Header';
import { Button } from '../../components/Button';
import { ConfirmDialog } from '../../components/Dialog';
import { Badge } from '../../components/Badge';
import { PlusIcon, XCircleIcon } from '@heroicons/react/16/solid';
import { productTagService } from '../../services/api/ProductTag';
import { tagService } from '../../services/api/Tag';

export function ProductsDashboard() {
  const navigate = useNavigate();
  const [products, setProducts] = useState<ProductDto[]>([]);
  const [tags, setTags] = useState<TagDto[]>([]);
  const [selectedTag, setSelectedTag] = useState<TagDto | null | undefined>(null);
  const [selectedTagValue, setSelectedTagValue] = useState<string | null>(null);
  const [isDeleteProductDialogOpen, setIsDeleteProductDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<ProductDto | null>(null);

  useEffect(() => {
    initProducts();
  }, []);

  const initProducts = async () => {
    try {
      const productsData = await productService.list('?category=tcg&include=productTags.tag');
      const tagsData = await tagService.list('?include=supportedTagValues');
      setTags(tagsData);
      setSelectedTag(tagsData[0]);
      setProducts(productsData);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const onConfirmDeleteProduct = async (productIdx: number) => {
    const selectedProduct = products[productIdx];

    if (selectedProduct) {
      setSelectedProduct(selectedProduct);
      setIsDeleteProductDialogOpen(true);
    }
  };

  const onDeleteProduct = async () => {
    try {
      if (selectedProduct) {
        await productService.delete(selectedProduct.id!);
        await initProducts();
        setSelectedProduct(null);
        setIsDeleteProductDialogOpen(false);
      }
    } catch (error) {
      console.error('Error deleting product:', error);
    }
  };

  const onDeleteProductTag = async (id?: string) => {
    try {
      if (id) {
        await productTagService.delete(id);
        await initProducts();
      }
    } catch (error) {
      console.error('Error deleting product tag:', error);
    }
  };

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
          <XCircleIcon
            onClick={() => onDeleteProductTag(productTag?.id)}
            className="absolute right-[-7px] top-[-7px] w-[.9rem] z-[2] cursor-pointer"
          />
        </Badge>
      ))}
      <Button
        onClick={() => {
          setSelectedProduct(product);
          // Logic for opening tag dialog
        }}
        plain
        className="gap-x-0 ml-2 text-[12px] cursor-pointer align-middle"
      >
        <PlusIcon />
        <span className="text-[12px]"> Add</span>
      </Button>
    </>
  );

  const headers = ['Name', 'Price', 'Description', 'Tags', ''];
  const tableRows = products?.map((product) => ({
    displayName: { value: product.displayName || '', width: '200px' },
    price: { value: `$${product.price}` || '', width: 'auto' },
    description: { value: product.description || '', width: '400px' },
    tags: { value: generateTagBadges(product), width: '400px' },
  }));

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
        onEdit={(productIdx: number) => navigate(`/products/edit/${products[productIdx].id}`)}
        onDelete={onConfirmDeleteProduct}
      />
      <ConfirmDialog
        isOpen={isDeleteProductDialogOpen}
        onClose={() => {
          setSelectedProduct(null);
          setIsDeleteProductDialogOpen(false);
        }}
        title="Delete Product"
        description={`Are you sure you want to delete your product ${selectedProduct?.displayName}?`}
        onConfirm={onDeleteProduct}
        confirmBtnTxt="Delete"
      />
    </>
  );
}
