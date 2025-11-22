import { useState, useEffect } from 'react'
import { EntityDto, EntityTagDto } from '../../types'
import { Button, Badge, Header } from '../../components/Tailwind'
import { ConfirmDialog } from '../../components/ConfirmDialog'
import { SimpleTable } from '../../components/SimpleTable'
import { SimpleDialog } from '../../components/SimpleDialog'
import { CreateOrEditProduct } from './CreateOrEditProduct'
import { useSession } from '../../context/SessionContext'
import { PaginationControls } from '../../components/PaginationControls'
import { SearchInput } from '../../components/SearchInput'
import { useSearchParams, useNavigate } from 'react-router-dom'

import { fetchProductEntities } from './data/fetchProductEntities'
import { slugify } from '../../helpers'
import { fetchTags } from './data/fetchTags'
import { fetchCategories } from './data/fetchCategories'
import { fetchBrands } from './data/fetchBrands'
import { fetchSets } from './data/fetchSets'
import { entityService } from '../../services/api/Entity'

export function Products({ readOnly = false }: { readOnly?: boolean }) {
  const { currentUser } = useSession()
  const [searchParams, setSearchParams] = useSearchParams()
  const navigate = useNavigate()

  const [currentPage, setCurrentPage] = useState(0)
  const [searchText, setSearchText] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const [searchResults, setSearchResults] = useState<{ data: EntityDto[]; total: number } | null>(null)
  const [selectedProductEntity, setSelectedProductEntity] = useState<EntityDto>()
  const [selectedTags, setSelectedTags] = useState<EntityTagDto[]>([])
  const [deletedTags, setDeletedTags] = useState<string[]>([])
  const [updatedTags, setUpdatedTags] = useState<EntityTagDto[]>([])
  const [isCreateOrEditProductDialogOpen, setIsCreateOrEditProductDialogOpen] = useState(false)
  const [isDeleteProductDialogOpen, setIsDeleteProductDialogOpen] = useState(false)

  const { productEntities, refetchProductEntities, isLoadingProductEntities, errorProductEntities } = fetchProductEntities(currentPage)
  const { tags } = fetchTags()
  const { categories } = fetchCategories()
  const { brands } = fetchBrands()
  const { sets } = fetchSets()

  //Check for create query parameter and open dialog
  useEffect(() => {
    if (!readOnly && searchParams.get('create') === 'true') {
      setSelectedProductEntity(undefined)
      setSelectedTags([])
      setIsCreateOrEditProductDialogOpen(true)
      //Remove the query parameter from URL
      searchParams.delete('create')
      setSearchParams(searchParams, { replace: true })
    }
  }, [searchParams, setSearchParams, readOnly])

  //Search functionality
  const performSearch = async (query: string) => {
    if (!query.trim()) {
      setSearchResults(null)
      setIsSearching(false)
      return
    }

    setIsSearching(true)
    try {
      const productEntitiesQueryParams = new URLSearchParams({
        search: query,
        page: '0',
        limit: '20',
      })

      productEntitiesQueryParams.append('include', 'product')
      productEntitiesQueryParams.append('include', 'brand')
      productEntitiesQueryParams.append('include', 'entityTags.tag')
      productEntitiesQueryParams.append('include', 'set')

      const queryString = `?${productEntitiesQueryParams.toString()}`
      const results = await entityService.list(queryString)
      setSearchResults(results)
    } catch (error) {
      console.error('Error searching products:', error)
      setSearchResults(null)
    } finally {
      setIsSearching(false)
    }
  }

  const handleSearch = (query: string) => {
    setSearchText(query)
    setCurrentPage(0)
    performSearch(query)
  }

  //Use search results if searching, otherwise use regular product entities
  const displayData = searchText ? searchResults : productEntities

  const onEditProduct = (productIdx: number) => {
    const selected = displayData?.data?.[productIdx]
    if (selected) {
      setSelectedProductEntity(selected)
      setSelectedTags(selected.entityTags || [])
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
          product: {
            type: 'CARD',
            number: selectedProductEntity?.product?.number,
          },
          type: 'PRODUCT',
          setId: selectedProductEntity.setId,
          lastModifiedById: currentUser?.admin?.id,
          entityTags: {
            create: createTags,
            delete: deletedTags,
            update: updatedTags,
          },
        })
      } else {
        await entityService.create({
          ...selectedProductEntity!,
          product: {
            type: 'CARD',
            number: selectedProductEntity?.product?.number,
          },
          type: 'PRODUCT',
          setId: selectedProductEntity?.setId,
          createdById: currentUser?.admin?.id,
          entityTags: {
            create: createTags,
          },
        })
      }

      await refetchProductEntities()
      //If we're in search mode, refetch search results
      if (searchText) {
        await performSearch(searchText)
      }
      setCurrentPage(0)
      setSelectedProductEntity(undefined)
      setSelectedTags([])
      setDeletedTags([])
      setUpdatedTags([])
      setIsCreateOrEditProductDialogOpen(false)
    } catch (error) {
      console.error(`Error ${existingProductEntity ? 'updating' : 'creating'} product:`, error)
    }
  }

  const onConfirmDeleteProduct = (productIdx: number) => {
    const selected = displayData?.data?.[productIdx]
    if (selected) {
      setSelectedProductEntity(selected)
      setSelectedTags(selected.entityTags || [])
      setIsDeleteProductDialogOpen(true)
    }
  }

  const onDeleteProduct = async () => {
    try {
      if (selectedProductEntity) {
        await entityService.delete(selectedProductEntity.id!)
        await refetchProductEntities()
        //If we're in search mode, refetch search results
        if (searchText) {
          await performSearch(searchText)
        }
        setCurrentPage(0)
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
          className="mr-3 mt-1 relative whitespace-nowrap align-middle"
          key={idx}
        >
          {entityTag.tag?.displayName} | {entityTag.tagValue}
        </Badge>
      ))}
    </>
  )

  const handleNextPage = () => {
    if (productEntities && (currentPage + 1) * 10 < productEntities.total!) {
      setCurrentPage((prev) => prev + 1)
    }
  }

  const handlePrevPage = () => {
    if (currentPage > 0) {
      setCurrentPage((prev) => prev - 1)
    }
  }

  const handleRowClick = (productIdx: number) => {
    const entity = displayData?.data?.[productIdx]
    if (entity && entity.id) {
      const brandName = entity.brand?.displayName || entity.brand?.name || ''
      if (brandName) {
        const brandSlug = slugify(brandName)
        navigate(`/${brandSlug}/${entity.id}`)
      }
    }
  }

  const headers = ['Image', 'Name', 'Product Number', 'Description', 'Tags', '']
  const tableRows = displayData?.data?.map((productEntity) => ({
    primaryImage: {
      value: productEntity.image ? (
        <img
          src={`${process.env.REACT_APP_S3_IMAGE_BASE_URL}${productEntity.image}`}
          alt={productEntity.displayName || 'Product'}
          className="object-contain"
          style={{ height: '60px', maxHeight: '60px', width: 'auto', maxWidth: 'none' }}
        />
      ) : (
        <div className="flex items-center justify-center bg-gray-100 rounded text-gray-400 text-xs" style={{ height: '60px', maxHeight: '60px', width: 'auto' }}>
          No image
        </div>
      ),
      width: 'auto',
    },
    displayName: { value: productEntity.displayName || '', width: '20%' },
    productNumber: { value: productEntity.product?.number || '', width: '150px' },
    //brand: { value: productEntity.brand?.displayName || productEntity.brand?.name || '', width: '200px' },
    //set: { value: productEntity.set?.displayName || productEntity.set?.name || '', width: '200px' },
    description: { value: productEntity.description || '', width: '400px' },
    tags: { value: generateTagBadges(productEntity), width: '400px' },
  }))

  return (
    <>
      <div className="top-0 left-0 right-0 bottom-0 flex gap-0">
        {/*Main content column*/}
        <div className="flex-1 flex flex-col min-w-0 h-full">
          <div className="bg-[#e5e8eb] flex-shrink-0 flex items-center justify-between mb-0 pl-6 lg:pl-6 pr-4 lg:pr-3 py-2 lg:py-2">
            <div className="flex items-center gap-4">
              <Header>Products</Header>
            </div>
          </div>
          <div className="flex-1 overflow-x-auto overflow-y-auto p-6">
            <div className="h-20 flex items-center justify-between gap-3">
              {!readOnly && (
                <Button
                  className="text-white mb-5 px-4 py-2 cursor-pointer"
                  color="sky"
                  onClick={() => setIsCreateOrEditProductDialogOpen(true)}
                >
                  <svg width="10" height="10" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-white dark:text-white">
                    <path fillRule="evenodd" clipRule="evenodd" d="M0 48.031H31.969V80H48.031V48.031H80V31.969H48.031V0H31.969V31.969H0V48.031Z" fill="currentColor" />
                  </svg>
                  Add New
                </Button>
              )}
              <div className="flex items-center gap-4 mb-5">
                {!searchText && productEntities && productEntities.total! > 10 && (
                  <PaginationControls
                    currentPage={currentPage}
                    total={productEntities.total!}
                    onPrev={handlePrevPage}
                    onNext={handleNextPage}
                  />
                )}
                <SearchInput
                  value={searchText}
                  onSearch={handleSearch}
                  placeholder="Search products..."
                  className="w-80"
                />
              </div>
            </div>
            {isLoadingProductEntities && !searchText && (
              <div className="text-center py-4 text-gray-500">
                Loading products...
              </div>
            )}
            {errorProductEntities && !searchText && (
              <div className="text-center py-4 px-4">
                <div className="inline-block bg-red-50 border border-red-200 rounded-lg p-4 max-w-md">
                  <p className="text-red-800 font-semibold mb-2">Unable to load products</p>
                  {(errorProductEntities as any)?.status === 403 ? (
                    <div>
                      <p className="text-red-700 text-sm mb-3">
                        Authentication is required to view products. The API requires authentication even for read-only access.
                      </p>
                      <a 
                        href="/login" 
                        className="text-sky-600 hover:text-sky-700 underline text-sm font-medium"
                      >
                        Log in to view products
                      </a>
                    </div>
                  ) : (errorProductEntities as any)?.isNetworkError || (errorProductEntities as any)?.status === 0 ? (
                    <div>
                      <p className="text-red-700 text-sm mb-2">
                        {(errorProductEntities as any)?.isCorsError 
                          ? 'CORS Error: API server is blocking requests'
                          : 'Network error: Unable to connect to the API server.'}
                      </p>
                      <p className="text-red-600 text-xs mb-2">
                        {errorProductEntities instanceof Error ? errorProductEntities.message : 'Failed to fetch'}
                      </p>
                      {(errorProductEntities as any)?.isCorsError ? (
                        <div className="text-gray-600 text-xs mt-2 space-y-1">
                          <p>This is a CORS (Cross-Origin Resource Sharing) issue. The API server needs to allow requests from your Vercel domain.</p>
                          <p className="font-semibold mt-2">To fix this:</p>
                          <ol className="list-decimal list-inside ml-2 space-y-1">
                            <li>Configure your API Gateway to allow CORS from your Vercel domain</li>
                            <li>Add your Vercel domain to the allowed origins in your API CORS settings</li>
                            <li>Ensure the API returns proper CORS headers (Access-Control-Allow-Origin, etc.)</li>
                          </ol>
                        </div>
                      ) : (
                        <p className="text-gray-600 text-xs mt-2">
                          Please check that REACT_APP_API_BASE_URL is configured correctly in your Vercel environment variables.
                        </p>
                      )}
                    </div>
                  ) : (
                    <p className="text-red-700 text-sm">
                      {errorProductEntities instanceof Error ? errorProductEntities.message : 'Unknown error occurred'}
                    </p>
                  )}
                </div>
              </div>
            )}
            {!isLoadingProductEntities && !errorProductEntities && (!displayData || !displayData.data || displayData.data.length === 0) && !searchText && (
              <div className="text-center py-4 text-gray-500">
                No products found
              </div>
            )}
            {(!isLoadingProductEntities && !errorProductEntities && displayData && displayData.data && displayData.data.length > 0) && (
              <SimpleTable
                headers={headers}
                rows={tableRows || []}
                onEdit={readOnly ? undefined : onEditProduct}
                onDelete={readOnly ? undefined : onConfirmDeleteProduct}
                onRowClick={handleRowClick}
                readOnly={readOnly}
              />
            )}
            {searchText && isSearching && (
              <div className="text-center py-4 text-gray-500">
                Searching...
              </div>
            )}
            {searchText && !isSearching && searchResults && searchResults.data.length === 0 && (
              <div className="text-center py-4 text-gray-500">
                No products found for &quot;{searchText}&quot;
              </div>
            )}
          </div>
        </div>

        {/*Preview column*/}
        {/*<div
          className="flex-shrink-0 flex flex-col bg-white dark:bg-gray-900 border-l border-gray-200 overflow-y-auto h-full"
          style={{
            width: 'calc((100vh - 56px) * 430 / 852)',
            minWidth: 'calc((100vh - 56px) * 430 / 852)',
          }}
        >
          <div className="flex-1 flex items-center justify-center">
            <p className="text-gray-500 dark:text-gray-400 text-lg">Preview coming soon</p>
          </div>
        </div> */}
      </div>

      <SimpleDialog
        isOpen={isCreateOrEditProductDialogOpen}
        size="2xl"
        onClose={() => {
          setSelectedProductEntity(undefined)
          setSelectedTags([])
          setDeletedTags([])
          setUpdatedTags([])
          setIsCreateOrEditProductDialogOpen(false)
        }}
        title={selectedProductEntity ? `Edit '${selectedProductEntity?.displayName || ''}'` : 'Add New Product'}
        onSubmit={onSaveProduct}
        submitBtnTxt={selectedProductEntity?.id ? 'Update Product' : 'Add Product'}
        submitBtnColor="green"
      >
        <CreateOrEditProduct
          selectedProductEntity={selectedProductEntity}
          setSelectedProductEntity={setSelectedProductEntity}
          tags={tags?.data || []}
          selectedTags={selectedTags}
          setSelectedTags={setSelectedTags}
          setDeletedTags={setDeletedTags}
          setUpdatedTags={setUpdatedTags}
          categories={categories?.data || []}
          brands={brands?.data || []}
          sets={sets?.data || []}
          refetchProductEntities={refetchProductEntities}
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
