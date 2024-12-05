import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { TagsDashboard } from './Tag'
import { tagService } from '../../services/api/Tag'

jest.mock('../../services/api/Tag', () => ({
  tagService: {
    list: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn()
  }
}))

jest.mock('../../services/api/SupportedTagValue', () => ({
  supportedTagValueService: {
    create: jest.fn(),
    delete: jest.fn()
  }
}))

describe('TagsDashboard', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('initializes tags on load', async () => {
    const mockTags = [
      { 
        id: '1', 
        displayName: 'Tag 1', 
        name: 'tag-1', 
        supportedTagValues: [
          { id: '101', displayName: 'Value 1', name: 'value-1' }
        ] 
      }
    ]
    ;(tagService.list as jest.Mock).mockResolvedValue(mockTags)

    render(<TagsDashboard />)

    await waitFor(() => {
      expect(tagService.list).toHaveBeenCalledWith('?include=supportedTagValues')
    })

    expect(screen.getByText('Tag 1')).toBeInTheDocument()
    expect(screen.getByText('Value 1')).toBeInTheDocument()
  })

  it('opens the create tag drawer when clicking "Create New"', () => {
    render(<TagsDashboard />)

    const createButton = screen.getByText('Create New')
    fireEvent.click(createButton)

    expect(screen.getByText('Create Tag')).toBeInTheDocument()
  })

  it('creates a tag and refreshes the list', async () => {
    const mockTags = [
      { 
        id: '1', 
        displayName: 'Tag 1', 
        name: 'tag-1', 
        supportedTagValues: [] 
      }
    ]
    ;(tagService.list as jest.Mock).mockResolvedValue(mockTags)
    ;(tagService.create as jest.Mock).mockResolvedValue({})

    render(<TagsDashboard />)

    const createButton = screen.getByText('Create New')
    fireEvent.click(createButton)

    const nameInput = screen.getByPlaceholderText('Enter tag name')
    fireEvent.change(nameInput, { target: { value: 'New Tag' } })

    const addButton = screen.getByText('Add Tag')
    fireEvent.click(addButton)

    await waitFor(() => {
      expect(tagService.create).toHaveBeenCalledWith(
        expect.objectContaining({
          displayName: 'New Tag',
          name: 'new-tag'
        })
      )
      expect(tagService.list).toHaveBeenCalledTimes(2)
    })
  })

  it('handles errors gracefully during tag fetching', async () => {
    ;(tagService.list as jest.Mock).mockRejectedValue(new Error('Failed to fetch'))

    render(<TagsDashboard />)

    await waitFor(() => {
      expect(tagService.list).toHaveBeenCalledWith('?include=supportedTagValues')
    })

    expect(screen.queryByText('Tag 1')).not.toBeInTheDocument()
  })
})
