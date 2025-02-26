import { render } from '@testing-library/react'
import { Tags } from '.'
import { tagService } from '../../services/api/Tag'

jest.mock('../../services/api/Tag', () => ({
  tagService: {
    list: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  }
}))

jest.mock('../../services/api/SupportedTagValue', () => ({
  supportedTagValueService: {
    create: jest.fn(),
    delete: jest.fn(),
  }
}))

describe('Tags', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('initializes tags on load', async () => {
    const mockTags = [
      {
        id: '1',
        displayName: 'Tag 1',
        name: 'tag-1',
        supportedTagValues: [{ id: '101', displayName: 'Value 1', name: 'value-1' }]
      }
    ];
    (tagService.list as jest.Mock).mockResolvedValue(mockTags)

    const { findByText } = render(<Tags />)

    expect(await findByText('Tag 1')).toBeInTheDocument()
    expect(await findByText('Value 1')).toBeInTheDocument()
  })

  it('handles errors gracefully during tag fetching', async () => {
    (tagService.list as jest.Mock).mockRejectedValue(new Error('Failed to fetch'))

    const { queryByText } = render(<Tags />)

    expect(await queryByText('Tag 1')).not.toBeInTheDocument()
  })
})
