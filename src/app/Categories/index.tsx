import { useState } from 'react'
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

export function Categories() {
  const { currentUser } = useSession()
  const [currentPage, setCurrentPage] = useState(0)
  const [isCreateOrEditModalOpen, setIsCreateOrEditModalOpen] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<CategoryDto | null>(null)
  const [isDeleteCategoryDialogOpen, setIsDeleteCategoryDialogOpen] = useState(false)

  const { categories, refetchCategories } = fetchCategories(currentPage)

  const handleNextPage = () => {
    if (categories?.total !== null && (currentPage + 1) * 10 < categories!.total) {
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

  return (
    <>
      <div className="flex">
        <Header>Categories</Header>
        <Button
          className="text-white px-4 py-2 ml-auto cursor-pointer"
          onClick={() => setIsCreateOrEditModalOpen(true)}
          color="green"
        >
          Create New Category
        </Button>
      </div>
      <br />
      <SimpleTable
        headers={['Name', 'Description', '']}
        rows={categories?.data.map((category) => ({
          displayName: { value: category.displayName || category.name || '', width: '250px' },
          description: { value: category.description || 'No description', width: '800px' },
        })) || []}
        onEdit={onSelectCategory}
        onDelete={onConfirmDeleteCategory}
      />
      {categories && categories.total !== null && categories.total > 10 && (
        <PaginationControls
          currentPage={currentPage}
          total={categories.total}
          onPrev={handlePrevPage}
          onNext={handleNextPage}
        />
      )}
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
