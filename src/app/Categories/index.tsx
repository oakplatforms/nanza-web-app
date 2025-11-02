import { useState, useEffect } from 'react'
import { CategoryDto } from '../../types'
import { categoryService } from '../../services/api/Category'
import { SimpleTable } from '../../components/SimpleTable'
import { Header, Button } from '../../components/Tailwind'
import { SimpleDialog } from '../../components/SimpleDialog'
import { ConfirmDialog } from '../../components/ConfirmDialog'
import { CreateOrEditCategory } from './CreateOrEditCategory'
import { useSession } from '../../context/SessionContext'
import { PaginationControls } from '../../components/PaginationControls'
import { fetchCategories } from './data/fetchCategories'
import { useSearchParams } from 'react-router-dom'

export function Categories() {
  const { currentUser } = useSession()
  const [searchParams, setSearchParams] = useSearchParams()
  const [currentPage, setCurrentPage] = useState(0)
  const [isCreateOrEditModalOpen, setIsCreateOrEditModalOpen] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<CategoryDto | null>(null)
  const [isDeleteCategoryDialogOpen, setIsDeleteCategoryDialogOpen] = useState(false)

  const { categories, refetchCategories } = fetchCategories(currentPage)

  //Check for create query parameter and open dialog
  useEffect(() => {
    if (searchParams.get('create') === 'true') {
      setSelectedCategory(null)
      setIsCreateOrEditModalOpen(true)
      searchParams.delete('create')
      setSearchParams(searchParams, { replace: true })
    }
  }, [searchParams, setSearchParams])

  const handleNextPage = () => {
    if (categories && categories.total !== null && (currentPage + 1) * 10 < categories.total) {
      setCurrentPage((prev) => prev + 1)
    }
  }

  const handlePrevPage = () => {
    if (currentPage > 0) {
      setCurrentPage((prev) => prev - 1)
    }
  }

  const onSaveCategory = async () => {
    try {
      if (selectedCategory) {
        if (selectedCategory.id) {
          await categoryService.update(selectedCategory.id, {
            name: selectedCategory.name,
            displayName: selectedCategory.displayName,
            description: selectedCategory.description,
            lastModifiedById: currentUser?.admin?.id,
          })
        } else {
          await categoryService.create({
            name: selectedCategory.name,
            displayName: selectedCategory.displayName,
            description: selectedCategory.description,
            createdById: currentUser?.admin?.id,
          })
        }
        await refetchCategories()
        setCurrentPage(0)
        setIsCreateOrEditModalOpen(false)
        setSelectedCategory(null)
      }
    } catch (error) {
      console.log('Error saving category.', error)
    }
  }

  const onDeleteCategory = async () => {
    try {
      if (selectedCategory?.id) {
        await categoryService.delete(selectedCategory.id)
        await refetchCategories()
        setCurrentPage(0)
        setIsDeleteCategoryDialogOpen(false)
        setSelectedCategory(null)
      }
    } catch (error) {
      console.log('Error deleting category.', error)
    }
  }

  const onSelectCategory = (categoryIdx: number) => {
    const selected = categories?.data?.[categoryIdx]
    if (selected) {
      setSelectedCategory(selected)
      setIsCreateOrEditModalOpen(true)
    }
  }

  const onConfirmDeleteCategory = (categoryIdx: number) => {
    const selected = categories?.data?.[categoryIdx]
    if (selected) {
      setSelectedCategory(selected)
      setIsDeleteCategoryDialogOpen(true)
    }
  }

  const headers = ['Name', 'Description', '']
  const tableRows = categories?.data.map((category) => ({
    displayName: { value: category.displayName || category.name || '', width: '250px' },
    description: { value: category.description || 'No description', width: '800px' },
  })) || []

  return (
    <>
      <div className="top-0 left-0 right-0 bottom-0 flex gap-0">
        {/*Main content column*/}
        <div className="flex-1 flex flex-col min-w-0 h-full">
          <div className="bg-[#e5e8eb] flex-shrink-0 flex items-center justify-between mb-0 pl-6 lg:pl-6 pr-4 lg:pr-3 py-2 lg:py-2">
            <div className="flex items-center gap-4">
              <Header>Categories</Header>
            </div>
          </div>
          <div className="flex-1 overflow-x-auto overflow-y-auto p-6">
            <div className="h-20 flex items-center justify-between gap-3">
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
              <div className="flex items-center gap-4 mb-5">
                {categories && categories.total !== null && categories.total > 10 && (
                  <PaginationControls
                    currentPage={currentPage}
                    total={categories.total}
                    onPrev={handlePrevPage}
                    onNext={handleNextPage}
                  />
                )}
              </div>
            </div>
            <SimpleTable
              headers={headers}
              rows={tableRows}
              onEdit={onSelectCategory}
              onDelete={onConfirmDeleteCategory}
            />
          </div>
        </div>
      </div>
      <SimpleDialog
        isOpen={isCreateOrEditModalOpen}
        size="3xl"
        title={selectedCategory?.id ? 'Edit Category' : 'Create Category'}
        onClose={() => {
          setSelectedCategory(null)
          setIsCreateOrEditModalOpen(false)
        }}
        onSubmit={onSaveCategory}
        submitBtnTxt={selectedCategory?.id ? 'Update Category' : 'Add Category'}
      >
        <CreateOrEditCategory
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
        />
      </SimpleDialog>
      <ConfirmDialog
        isOpen={isDeleteCategoryDialogOpen}
        onClose={() => {
          setSelectedCategory(null)
          setIsDeleteCategoryDialogOpen(false)
        }}
        title="Delete Category"
        description={`Are you sure you want to delete the category "${selectedCategory?.displayName}"?`}
        onConfirm={onDeleteCategory}
        confirmBtnTxt="Delete"
      />
    </>
  )
}
