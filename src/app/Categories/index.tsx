import { useEffect, useState } from 'react'
import { CategoryDto } from '../../types'
import { categoryService } from '../../services/api/Category'
import { SimpleTable } from '../../components/SimpleTable'
import { Header, Button } from '../../components/Tailwind'
import { SimpleDialog } from '../../components/SimpleDialog'
import { ConfirmDialog } from '../../components/ConfirmDialog'
import { CreateOrEditCategory } from './CreateOrEditCategory'
import { useSession } from '../../context/SessionContext'

export function Categories() {
  const { currentUser } = useSession()
  const [categories, setCategories] = useState<CategoryDto[]>([])
  const [isCreateOrEditModalOpen, setIsCreateOrEditModalOpen] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<CategoryDto | null>(null)
  const [isDeleteCategoryDialogOpen, setIsDeleteCategoryDialogOpen] = useState(false)

  useEffect(() => {
    getCategories()
  }, [])

  const getCategories = async () => {
    try {
      const categoriesData = await categoryService.list()
      setCategories(categoriesData)
    } catch (error) {
      console.log('Error fetching categories.', error)
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

        await getCategories()
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
        await getCategories()
        setIsDeleteCategoryDialogOpen(false)
        setSelectedCategory(null)
      }
    } catch (error) {
      console.log('Error deleting category.', error)
    }
  }

  const onSelectCategory = (categoryIdx: number) => {
    setSelectedCategory(categories[categoryIdx])
    setIsCreateOrEditModalOpen(true)
  }

  const onConfirmDeleteCategory = (categoryIdx: number) => {
    setSelectedCategory(categories[categoryIdx])
    setIsDeleteCategoryDialogOpen(true)
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
        rows={categories.map((category) => ({
          displayName: { value: category.displayName || category.name || '', width: '250px' },
          description: { value: category.description || 'No description', width: '800px' },
        }))}
        onEdit={onSelectCategory}
        onDelete={onConfirmDeleteCategory}
      />

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
        description={`Are you sure you want to delete the category "${
          selectedCategory?.displayName
        }"?`}
        onConfirm={onDeleteCategory}
        confirmBtnTxt="Delete"
      />
    </>
  )
}
