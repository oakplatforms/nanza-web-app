import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { ProductsDashboard } from './Product'
import { productService } from '../../services/api/Product'
import { tagService } from '../../services/api/Tag'

jest.mock('../../services/api/Product', () => ({
  productService: {
    list: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn()
  }
}))

jest.mock('../../services/api/Tag', () => ({
  tagService: {
    list: jest.fn()
  }
}))

describe('ProductsDashboard', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('initializes products on load', async () => {
    const mockProducts = [
      { id: '1', displayName: 'Product 1', price: '10', description: 'Description 1', productTags: [] }
    ]
    const mockTags = [
      { id: '1', name: 'Tag1', displayName: 'Tag 1', supportedTagValues: [] }
    ]
    ;(productService.list as jest.Mock).mockResolvedValue(mockProducts)
    ;(tagService.list as jest.Mock).mockResolvedValue(mockTags)

    render(<ProductsDashboard />)

    await waitFor(() => {
      expect(productService.list).toHaveBeenCalled()
    })

    expect(screen.getByText('Product 1')).toBeInTheDocument()
  })

  it('opens the create product drawer when clicking "Create New"', () => {
    render(<ProductsDashboard />)

    const createButton = screen.getByText('Create New')
    fireEvent.click(createButton)

    expect(screen.getByText('Create Product')).toBeInTheDocument()
  })

  it('creates a product and refreshes the list', async () => {
    const mockProducts = [
      { id: '1', displayName: 'Product 1', price: '10', description: 'Description 1', productTags: [] }
    ]
    ;(productService.list as jest.Mock).mockResolvedValue(mockProducts)
    ;(productService.create as jest.Mock).mockResolvedValue({})

    render(<ProductsDashboard />)

    const createButton = screen.getByText('Create New')
    fireEvent.click(createButton)

    const nameInput = screen.getByPlaceholderText('Enter product name')
    const priceInput = screen.getByPlaceholderText('Enter product price')

    fireEvent.change(nameInput, { target: { value: 'New Product' } })
    fireEvent.change(priceInput, { target: { value: '20' } })

    const addButton = screen.getByText('Add Product')
    fireEvent.click(addButton)

    await waitFor(() => {
      expect(productService.create).toHaveBeenCalledWith(expect.objectContaining({
        displayName: 'New Product',
        price: '20'
      }))
      expect(productService.list).toHaveBeenCalledTimes(2)
    })
  })

  it('displays an error message if fetching products fails', async () => {
    ;(productService.list as jest.Mock).mockRejectedValue(new Error('Failed to fetch'))

    render(<ProductsDashboard />)

    await waitFor(() => {
      expect(productService.list).toHaveBeenCalled()
    })

    expect(screen.queryByText('Product 1')).not.toBeInTheDocument()
  })
})
