import { useState, useEffect } from 'react'
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
import { useSearchParams } from 'react-router-dom'

export function Tags() {
  const { currentUser } = useSession()
  const [searchParams, setSearchParams] = useSearchParams()
  const [currentPage, setCurrentPage] = useState(0)
  const [isCreateOrEditModalOpen, setIsCreateOrEditModalOpen] = useState(false)
  const [selectedTag, setSelectedTag] = useState<TagDto | null>(null)
  const [isDeleteTagDialogOpen, setIsDeleteTagDialogOpen] = useState(false)
  const [newSupportedTagValue, setNewSupportedTagValue] = useState<string>('')
  const [deletedSupportedTagValues, setDeletedSupportedTagValues] = useState<string[]>([])
  const { tags, refetchTags } = fetchTags(currentPage)

  //Check for create query parameter and open dialog
  useEffect(() => {
    if (searchParams.get('create') === 'true') {
      setSelectedTag(null)
      setIsCreateOrEditModalOpen(true)
      searchParams.delete('create')
      setSearchParams(searchParams, { replace: true })
    }
  }, [searchParams, setSearchParams])

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

  const headers = ['Name', 'Supported Tag Values', '']
  const tableRows = tags?.data.map((tag) => ({
    displayName: { value: tag.displayName || '', width: '250px' },
    supportedTagValues: {
      value: tag.supportedTagValues?.map((val, index) => (
        <Badge key={index} color="zinc" className="mr-3 mt-1 relative whitespace-nowrap align-middle">
          {val.displayName}
        </Badge>
      )),
      width: '800px',
    },
  })) || []

  return (
    <>
      <div className="fixed top-10 left-0 right-0 bottom-0 flex gap-0">
        {/*Main content column*/}
        <div className="flex-1 flex flex-col min-w-0 h-full">
          <div className="bg-[#eef1e3] flex-shrink-0 flex items-center justify-between mb-0 pl-6 lg:pl-6 pr-4 lg:pr-3 py-2 lg:py-2">
            <div className="flex items-center gap-4">
              <Header>Tags</Header>
            </div>
          </div>
          <div className="flex-1 overflow-x-auto overflow-y-auto p-6">
            <div className="h-20 flex items-center justify-between gap-3">
              <Button
                className="text-white mb-5 px-4 py-2 cursor-pointer"
                color="sky"
                onClick={() => setIsCreateOrEditModalOpen(true)}
              >
                <svg width="10" height="10" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-white dark:text-white">
                  <path fillRule="evenodd" clipRule="evenodd" d="M0 48.031H31.969V80H48.031V48.031H80V31.969H48.031V0H31.969V31.969H0V48.031Z" fill="currentColor" />
                </svg>
                Add New
              </Button>
              <div className="flex items-center gap-4 mb-5">
                {tags && tags.total !== null && tags.total > 10 && (
                  <PaginationControls
                    currentPage={currentPage}
                    total={tags.total}
                    onPrev={handlePrevPage}
                    onNext={handleNextPage}
                  />
                )}
              </div>
            </div>
            <SimpleTable
              headers={headers}
              rows={tableRows}
              onEdit={onSelectTag}
              onDelete={onConfirmDeleteTag}
            />
          </div>
        </div>
      </div>
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
