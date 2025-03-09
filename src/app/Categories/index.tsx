import { useEffect, useState } from 'react'
import { CategoryDto } from '../../types'
import { SimpleTable } from '../../components/SimpleTable'
import { Header, Button } from '../../components/Tailwind'
import { categoryService } from '../../services/api/Category'

export function Categories() {
  const [categories, setCategories] = useState<CategoryDto[]>([])

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

  const headers = ['Name', 'Description', '']
  const tableRows = categories?.map((category) => ({
    displayName: { value: category.displayName || category.name || '', width: '250px' },
    description: { value: '', width: '800px' },

  }))

  return (
    <>
      <div className="flex">
        <Header>Categories</Header>
        <Button
          className="text-white px-4 py-2 ml-auto cursor-pointer"
          onClick={() => console.log('Create New Category')}
          color="green"
        >
          Create New
        </Button>
      </div>
      <br />
      <SimpleTable
        headers={headers}
        rows={tableRows}
        onEdit={() => console.log('Edit Category')}
        onDelete={() => console.log('Delete Category')}
      />
    </>
  )
}
