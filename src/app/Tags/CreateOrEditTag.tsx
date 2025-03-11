import { Combobox } from '@headlessui/react'
import { Input } from '../../components/Tailwind'
import { slugify } from '../../helpers'
import { TagDto } from '../../types'

type CreateOrEditTagProps = {
  selectedTag: TagDto | null
  newSupportedTagValue: string
  setSelectedTag: React.Dispatch<React.SetStateAction<TagDto | null>>
  setDeletedSupportedTagValues: React.Dispatch<React.SetStateAction<string[]>>
  setNewSupportedTagValue: React.Dispatch<React.SetStateAction<string>>
}

export function CreateOrEditTag({
  selectedTag,
  newSupportedTagValue,
  setSelectedTag,
  setDeletedSupportedTagValues,
  setNewSupportedTagValue
} : CreateOrEditTagProps) {

  const handleAddSupportedTagValue = (value: string) => {
    if (!selectedTag || !value.trim()) return

    const formattedValue = value.trim()
    const name = slugify(formattedValue)

    setSelectedTag((prev) => {
      if (!prev) return null

      const exists = prev.supportedTagValues?.some(tag => tag?.displayName?.toLowerCase() === formattedValue.toLowerCase())
      if (exists) return prev

      return {
        ...prev,
        supportedTagValues: [
          ...(prev.supportedTagValues || []),
          { name, displayName: formattedValue }
        ]
      }
    })

    setDeletedSupportedTagValues((prev) => prev.filter(id => id !== name))
    setNewSupportedTagValue('')
  }

  const handleRemoveSupportedTagValue = (tagId: string) => {
    if (!selectedTag) return

    setSelectedTag((prev) => {
      if (!prev) return null

      return {
        ...prev,
        supportedTagValues: prev.supportedTagValues?.filter(tag => tag.id !== tagId) || []
      }
    })

    setDeletedSupportedTagValues((prev) => [...prev, tagId])
  }

  return (
    <div className="mb-4">
      <label className="block text-sm font-bold mb-1">Name</label>
      <Input
        type="text"
        value={selectedTag?.displayName || ''}
        onChange={(e) =>
          setSelectedTag({
            ...selectedTag!,
            displayName: e.target.value,
            name: slugify(e.target.value),
          })
        }
        placeholder="Enter tag name"
      />
      <div className="mb-4">
        <label className="block text-sm font-bold mb-1 mt-2">Supported Tag Values</label>
        <div className="relative">
          <div className="flex flex-wrap items-center gap-2 px-2 py-1.5 border rounded-md bg-white">
            {selectedTag?.supportedTagValues?.map((tagValue) => (
              <span
                key={tagValue.id}
                className="inline-flex items-center px-2 py-1 text-sm text-neutral-700 bg-gray-200 rounded-full"
              >
                {tagValue.displayName}
                <button
                  type="button"
                  onClick={() => handleRemoveSupportedTagValue(tagValue.id!)}
                  className="ml-2 text-xs text-neutral-700 hover:text-neutral-900"
                >
                ×
                </button>
              </span>
            ))}
            <Combobox as="div" value="" onChange={handleAddSupportedTagValue}>
              <div className="relative mt-1 text-sm">
                <Combobox.Input
                  className="flex-grow bg-transparent outline-none placeholder-gray-400"
                  value={newSupportedTagValue}
                  onChange={(e) => setNewSupportedTagValue(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === 'Tab') {
                      e.preventDefault()
                      handleAddSupportedTagValue(newSupportedTagValue)
                    }
                  }}
                  placeholder="Add a new value..."
                />
              </div>
            </Combobox>
          </div>
        </div>
      </div>
    </div>
  )
}
