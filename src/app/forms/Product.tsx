import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Combobox } from '@headlessui/react';
import { CheckIcon, ChevronUpDownIcon } from '@heroicons/react/20/solid';
import { Input } from '../../components/Input';
import { Textarea } from '../../components/Textarea';
import { Button } from '../../components/Button';
import { slugify } from '../../helpers';
import { ProductDto, TagDto, ProductTagDto } from '../../types';
import { productService } from '../../services/api/Product';
import { tagService } from '../../services/api/Tag';

export function ProductForm() {
  const navigate = useNavigate();
  const { productId } = useParams<{ productId?: string }>();
  const [product, setProduct] = useState<ProductDto>({
    type: 'CARD',
    brandCategoryId: 'cm12ukr4b0004rylerclr9gto',
    displayName: '',
    price: '',
    description: '',
    image: '',
    productTags: [],
  });
  const [isEditing, setIsEditing] = useState(false);
  const [tagOptions, setTagOptions] = useState<Record<string, string[]>>({});
  const [selectedTags, setSelectedTags] = useState<Record<string, string[]>>({});
  const [query, setQuery] = useState<Record<string, string>>({});
  const [dynamicTitle, setDynamicTitle] = useState('Create New');

  useEffect(() => {
    if (productId) {
      fetchProduct();
      setIsEditing(true);
    }
    fetchTagOptions();
  }, [productId]);

  useEffect(() => {
    const title = isEditing ? `Edit '${product.displayName || ''}'` : `Create '${product.displayName || ''}'`;
    setDynamicTitle(title);
  }, [product.displayName, isEditing]);

  const fetchProduct = async () => {
    try {
      const fetchedProduct = await productService.get(`${productId}?include=productTags.tag`);
      setProduct(fetchedProduct);

      // Initialize selected tags with arrays
      const initialTags: Record<string, string[]> = {};
      fetchedProduct.productTags?.forEach((productTag: ProductTagDto) => {
        if (productTag.tag?.displayName) {
          if (!initialTags[productTag.tag.displayName]) {
            initialTags[productTag.tag.displayName] = [];
          }
          initialTags[productTag.tag.displayName].push(productTag.tagValue || '');
        }
      });
      setSelectedTags(initialTags);
    } catch (error) {
      console.error('Error fetching product details:', error);
    }
  };

  const fetchTagOptions = async () => {
    try {
      const tags: TagDto[] = await tagService.list('?include=supportedTagValues');
      const options: Record<string, string[]> = {};
      tags.forEach((tag) => {
        if (tag.displayName) {
          options[tag.displayName] = tag.supportedTagValues?.map((value) => value.displayName || '') || [];
        }
      });
      setTagOptions(options);
    } catch (error) {
      console.error('Error fetching tag options:', error);
    }
  };

  const handleSave = async () => {
    try {
      const { productTags, ...productWithoutTags } = product;

      if (isEditing) {
        await productService.update(product.id!, productWithoutTags);
      } else {
        await productService.create(productWithoutTags);
      }
      navigate('/products');
    } catch (error) {
      console.error(`Error ${isEditing ? 'updating' : 'creating'} product:`, error);
    }
  };

  const handleAddTagValue = (tagName: string, value: string) => {
    setSelectedTags((prev) => ({
      ...prev,
      [tagName]: [...(prev[tagName] || []), value],
    }));
  };

  const handleRemoveTagValue = (tagName: string, value: string) => {
    setSelectedTags((prev) => ({
      ...prev,
      [tagName]: prev[tagName]?.filter((v) => v !== value),
    }));
  };

  const renderProductTags = () => {
    return Object.entries(tagOptions).map(([tagName, options]) => (
      <div className="mb-4" key={tagName}>
        <label className="block text-sm font-bold mb-1">{tagName}</label>
        <Combobox
          as="div"
          value=""
          onChange={(value: string) => handleAddTagValue(tagName, value)}
        >
          <div className="relative mt-2">
            <div className="flex flex-wrap items-center gap-2 px-2 py-1.5 border rounded-md bg-white">
              {selectedTags[tagName]?.map((value) => (
                <span
                  key={value}
                  className="inline-flex items-center px-2 py-1 text-sm text-neutral-700 bg-gray-200 rounded-full"
                >
                  {value}
                  <button
                    type="button"
                    onClick={() => handleRemoveTagValue(tagName, value)}
                    className="ml-2 text-xs text-neutral-700 hover:text-neutral-900"
                  >
                    ×
                  </button>
                </span>
              ))}
              <Combobox.Input
                className="flex-grow bg-transparent outline-none placeholder-gray-400"
                onChange={(event) =>
                  setQuery((prev) => ({ ...prev, [tagName]: event.target.value }))
                }
                placeholder="Search or add..."
              />
            </div>
            <Combobox.Button className="absolute inset-y-0 right-0 flex items-center rounded-r-md px-2 focus:outline-none">
              <ChevronUpDownIcon className="size-5 text-gray-400" aria-hidden="true" />
            </Combobox.Button>
            {options.length > 0 && (
              <Combobox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black/5 focus:outline-none sm:text-sm">
                {options
                  .filter((option) =>
                    option.toLowerCase().includes(query[tagName]?.toLowerCase() || '')
                  )
                  .map((option) => (
                    <Combobox.Option
                      key={option}
                      value={option}
                      className="group relative cursor-default select-none py-2 pl-3 pr-9 text-gray-900 data-[focus]:bg-indigo-600 data-[focus]:text-white data-[focus]:outline-none"
                    >
                      <span className="block truncate group-data-[selected]:font-semibold">
                        {option}
                      </span>
                      <span className="absolute inset-y-0 right-0 hidden items-center pr-4 text-indigo-600 group-data-[selected]:flex group-data-[focus]:text-white">
                        <CheckIcon className="size-5" aria-hidden="true" />
                      </span>
                    </Combobox.Option>
                  ))}
              </Combobox.Options>
            )}
          </div>
        </Combobox>
      </div>
    ));
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">{dynamicTitle}</h1>
        <div className="flex gap-x-2">
          <Button
            onClick={() => navigate('/products')}
            className="text-white hover:text-gray-200"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            color="green"
            className="text-white px-4 py-2"
          >
            {isEditing ? 'Update' : 'Add Product'}
          </Button>
        </div>
      </div>
  
      <div className="grid grid-cols-1 lg:grid-cols-3 lg:gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white shadow-md ring-1 ring-gray-200 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Product Details</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold mb-1">Name</label>
                <Input
                  type="text"
                  value={product.displayName || ''}
                  onChange={(e) => setProduct({ ...product, displayName: e.target.value, name: slugify(e.target.value) })}
                  placeholder="Enter product name"
                />
              </div>
              <div>
                <label className="block text-sm font-bold mb-1">Description</label>
                <Textarea
                  value={product.description || ''}
                  onChange={(e) => setProduct({ ...product, description: e.target.value })}
                  placeholder="Enter product description"
                  resizable={false} // Optional: disables resizing if desired
                  rows={3} // Sets the number of visible lines to 3
                  className="resize-none"
                />
              </div>
            </div>
          </div>
  
          <div className="bg-white shadow-md ring-1 ring-gray-200 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Product Tags</h2>
            {renderProductTags()}
          </div>
        </div>
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white shadow-md ring-1 ring-gray-200 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Visibility</h2>
            <p className="text-gray-600">[visibility field]</p>
          </div>
          <div className="bg-white shadow-md ring-1 ring-gray-200 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Product Image</h2>
            <div>
              <label className="block text-sm font-bold mb-1">Image URL</label>
              <Input
                type="text"
                value={product.image || ''}
                onChange={(e) => setProduct({ ...product, image: e.target.value })}
                placeholder="Enter image URL"
              />
            </div>
          </div>
          <div className="bg-white shadow-md ring-1 ring-gray-200 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Price</h2>
            <div>
              <label className="block text-sm font-bold mb-1">Price</label>
              <Input
                type="text"
                value={product.price || ''}
                onChange={(e) => setProduct({ ...product, price: e.target.value })}
                placeholder="Enter product price"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
