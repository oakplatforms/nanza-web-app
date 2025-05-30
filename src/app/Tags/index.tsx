import { useState } from 'react'
import { TagDto } from '../../types'
import { tagService } from '../../services/api/Tag'
import { SimpleTable } from '../../components/SimpleTable'
import { Header, Badge, Button } from '../../components/Tailwind'
import { SimpleDialog } from '../../components/SimpleDialog'
import { ConfirmDialog } from '../../components/ConfirmDialog'
import { useSession } from '../../context/SessionContext'
import { CreateOrEditTag } from './CreateOrEditTag'
import { PaginationControls } from '../../components/PaginationControls'
import { fetchTags } from './data/fetchTags'

export function Tags() {
  const { currentUser } = useSession()
  const [currentPage, setCurrentPage] = useState(0)
  const [isCreateOrEditModalOpen, setIsCreateOrEditModalOpen] = useState(false)
  const [selectedTag, setSelectedTag] = useState<TagDto | null>(null)
  const [isDeleteTagDialogOpen, setIsDeleteTagDialogOpen] = useState(false)
  const [newSupportedTagValue, setNewSupportedTagValue] = useState<string>('')
  const [deletedSupportedTagValues, setDeletedSupportedTagValues] = useState<string[]>([])
  const { tags, refetchTags } = fetchTags(currentPage)

  const handleNextPage = () => {
    if (tags?.total !== null && (currentPage + 1) * 10 < tags!.total) {
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
            lastModifiedById: currentUser?.admin?.id,
            supportedTagValues: {
              create: newValues,
              delete: deletedSupportedTagValues.filter(id => id)
            }
          })
        } else {
          await tagService.create({
            name: selectedTag.name,
            displayName: selectedTag.displayName,
            createdById: currentUser?.admin?.id,
            supportedTagValues: {
              create: newValues,
            }
          })
        }
        await refetchTags()
        setCurrentPage(0)
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
        await refetchTags()
        setCurrentPage(0)
        setIsDeleteTagDialogOpen(false)
        setSelectedTag(null)
      }
    } catch (error) {
      console.log('Error deleting tag.', error)
    }
  }

  const onSelectTag = (tagIdx: number) => {
    const selected = tags?.data?.[tagIdx]
    if (selected) {
      setSelectedTag(selected)
      setDeletedSupportedTagValues([])
      setIsCreateOrEditModalOpen(true)
    }
  }

  const onConfirmDeleteTag = (tagIdx: number) => {
    const selected = tags?.data?.[tagIdx]
    if (selected) {
      setSelectedTag(selected)
      setIsDeleteTagDialogOpen(true)
    }
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
        rows={tags?.data.map((tag) => ({
          displayName: { value: tag.displayName || '', width: '250px' },
          supportedTagValues: {
            value: tag.supportedTagValues?.map((val, index) => (
              <Badge key={index} color="zinc" className="ml-3 mt-1 relative whitespace-nowrap align-middle">
                {val.displayName}
              </Badge>
            )),
            width: '800px',
          },
        })) || []}
        onEdit={onSelectTag}
        onDelete={onConfirmDeleteTag}
      />
      {tags && tags.total !== null && tags.total > 10 && (
        <PaginationControls
          currentPage={currentPage}
          total={tags.total}
          onPrev={handlePrevPage}
          onNext={handleNextPage}
        />
      )}
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
        <CreateOrEditTag
          selectedTag={selectedTag}
          newSupportedTagValue={newSupportedTagValue}
          setSelectedTag={setSelectedTag}
          setDeletedSupportedTagValues={setDeletedSupportedTagValues}
          setNewSupportedTagValue={setNewSupportedTagValue}
        />
      </SimpleDialog>
      <ConfirmDialog
        isOpen={isDeleteTagDialogOpen}
        onClose={() => {
          setSelectedTag(null)
          setIsDeleteTagDialogOpen(false)
        }}
        title="Delete Tag"
        description={`Are you sure you want to delete the tag "${selectedTag?.displayName}"?`}
        onConfirm={onDeleteTag}
        confirmBtnTxt="Delete"
      />
    </>
  )
}
