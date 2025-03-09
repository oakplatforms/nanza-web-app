import { useEffect, useState } from 'react'
import { TagDto } from '../../types'
import { Combobox } from '@headlessui/react'
import { tagService } from '../../services/api/Tag'
import { SimpleTable } from '../../components/SimpleTable'
import { Header, Badge, Button } from '../../components/Tailwind'
import { SimpleDialog } from '../../components/SimpleDialog'
import { ConfirmDialog } from '../../components/ConfirmDialog'

import { Input } from '../../components/Tailwind/Input'
import { slugify } from '../../helpers'
import { useSession } from '../../context/SessionContext'

export function Tags() {
  const { currentUser } = useSession()
  const [tags, setTags] = useState<TagDto[]>([])
  const [isCreateOrEditModalOpen, setIsCreateOrEditModalOpen] = useState(false)
  const [selectedTag, setSelectedTag] = useState<TagDto | null>(null)
  const [isDeleteTagDialogOpen, setIsDeleteTagDialogOpen] = useState(false)
  const [newSupportedTagValue, setNewSupportedTagValue] = useState<string>('')
  const [deletedSupportedTagValues, setDeletedSupportedTagValues] = useState<string[]>([])

  useEffect(() => {
    getTags()
  }, [])

  const getTags = async () => {
    try {
      const tagsData = await tagService.list('?include=supportedTagValues')
      setTags(tagsData)
    } catch (error) {
      console.log('Error fetching tags.', error)
    }
  }

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

  const onSaveTag = async () => {
    try {
      if (selectedTag) {
        const existingTag = !!selectedTag.id
        const newValues = (selectedTag.supportedTagValues || [])
          .filter(tag => !tag.id)
          .map(tag => ({ name: tag.name, displayName: tag.displayName }))

        if (existingTag) {
          await tagService.update(selectedTag.id!, {
            name: selectedTag.name,
            displayName: selectedTag.displayName,
            lastModifiedById: currentUser?.account?.id,
            supportedTagValues: {
              create: newValues,
              delete: deletedSupportedTagValues.filter(id => id)
            }
          })
        } else {
          await tagService.create({
            name: selectedTag.name,
            displayName: selectedTag.displayName,
            createdById: currentUser?.account?.id,
            supportedTagValues: {
              create: newValues,
            }
          })
        }

        await getTags()
        setIsCreateOrEditModalOpen(false)
        setSelectedTag(null)
        setDeletedSupportedTagValues([])
      }
    } catch (error) {
      console.log('Error saving tag.', error)
    }
  }

  const onDeleteTag = async () => {
    try {
      if (selectedTag?.id) {
        await tagService.delete(selectedTag.id)
        await getTags()
        setIsDeleteTagDialogOpen(false)
        setSelectedTag(null)
      }
    } catch (error) {
      console.log('Error deleting tag.', error)
    }
  }

  const onSelectTag = (tagIdx: number) => {
    setSelectedTag(tags[tagIdx])
    setDeletedSupportedTagValues([])
    setIsCreateOrEditModalOpen(true)
  }

  const onConfirmDeleteTag = (tagIdx: number) => {
    setSelectedTag(tags[tagIdx])
    setIsDeleteTagDialogOpen(true)
  }

  return (
    <>
      <div className="flex">
        <Header>Tags</Header>
        <Button
          className="text-white px-4 py-2 ml-auto cursor-pointer"
          onClick={() => setIsCreateOrEditModalOpen(true)}
          color="green"
        >
          Add New Tag
        </Button>
      </div>
      <br />
      <SimpleTable
        headers={['Name', 'Supported Tag Values', '']}
        rows={tags.map((tag) => ({
          displayName: { value: tag.displayName || '', width: '250px' },
          supportedTagValues: {
            value: tag.supportedTagValues?.map((val, index) => (
              <Badge key={index} color="zinc" className="ml-3 mt-1 relative whitespace-nowrap align-middle">
                {val.displayName}
              </Badge>
            )),
            width: '800px',
          },
        }))}
        onEdit={onSelectTag}
        onDelete={onConfirmDeleteTag}
      />
      <SimpleDialog
        isOpen={isCreateOrEditModalOpen}
        size='3xl'
        title={selectedTag?.id ? 'Edit Tag' : 'Create Tag'}
        onClose={() => {
          setSelectedTag(null)
          setIsCreateOrEditModalOpen(false)
        }}
        onSubmit={onSaveTag}
        submitBtnTxt={selectedTag?.id ? 'Update Tag' : 'Add Tag'}
      >
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
      </SimpleDialog>
      <ConfirmDialog
        isOpen={isDeleteTagDialogOpen}
        onClose={() => {
          setSelectedTag(null)
          setIsDeleteTagDialogOpen(false)
        }}
        title="Delete Tag"
        description={`Are you sure you want to delete the tag "${
          selectedTag?.displayName
        }"?`}
        onConfirm={onDeleteTag}
        confirmBtnTxt="Delete"
      />
    </>
  )
}
