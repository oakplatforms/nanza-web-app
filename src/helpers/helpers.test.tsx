import { slugify } from './'

describe('slugify', () => {
  it('converts a display name to a lowercase slug', () => {
    expect(slugify('Test DisplayName')).toBe('test-displayname')
  })

  it('removes special characters from the string', () => {
    expect(slugify('Product! @# $Name%')).toBe('product-name')
  })

  it('replaces spaces with hyphens', () => {
    expect(slugify('A Bunch Of Words')).toBe('a-bunch-of-words')
  })

  it('trims leading and trailing spaces', () => {
    expect(slugify('  Trim Me  ')).toBe('trim-me')
  })

  it('removes multiple consecutive hyphens', () => {
    expect(slugify('Too---Many----Hyphens')).toBe('too-many-hyphens')
  })

  it('removes leading and trailing hyphens', () => {
    expect(slugify('-Remove Leading And Trailing Hyphens-')).toBe('remove-leading-and-trailing-hyphens')
  })

  it('returns an empty string for an input with no valid characters', () => {
    expect(slugify('!@#$%^&*()')).toBe('')
  })

  it('handles a string with only spaces', () => {
    expect(slugify('     ')).toBe('')
  })

  it('does not alter a string that is already a valid slug', () => {
    expect(slugify('valid-slug')).toBe('valid-slug')
  })
})
