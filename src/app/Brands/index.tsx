import { useEffect, useState } from 'react'
import { BrandDto } from '../../types'
import { SimpleTable } from '../../components/SimpleTable'
import { Header, Button } from '../../components/Tailwind'
import { brandService } from '../../services/api/Brand'

export function Brands() {
  const [brands, setBrands] = useState<BrandDto[]>([])
  useEffect(() => {
    getBrands()
  }, [])

  const getBrands = async () => {
    try {
      const brandsData = await brandService.list('?include=brandCategories')
      setBrands(brandsData)
    } catch (error) {
      console.log('Error fetching tags.', error)
    }
  }

  const headers = ['Name', 'Categories', '']
  const tableRows = brands?.map((brands) => ({
    displayName: { value: brands.displayName || '', width: '250px' },
    supportedTagValues: {
      value: [],
      width: '800px'
    },
  }))

  return (
    <>
      <div className="flex">
        <Header>Brands</Header>
        <Button
          className="text-white px-4 py-2 ml-auto cursor-pointer"
          onClick={() => console.log('Create New Brand')}
          color="green"
        >
          Create New
        </Button>
      </div>
      <br />
      <SimpleTable
        headers={headers}
        rows={tableRows}
        onEdit={() => console.log('Edit Brand')}
        onDelete={() => console.log('Delete Brand')}
      />
    </>
  )
}
