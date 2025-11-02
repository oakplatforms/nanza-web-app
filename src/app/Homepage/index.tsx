import { useState, useRef } from 'react'
import { ListDto, ListUpdatePayload } from '../../types'
import { listService } from '../../services/api/List'
import { SimpleTable } from '../../components/SimpleTable'
import { Header, Button } from '../../components/Tailwind'
import { SimpleDialog } from '../../components/SimpleDialog'
import { ConfirmDialog } from '../../components/ConfirmDialog'
import { CreateOrEditHomepage } from './CreateOrEditHomepage'
import { useSession } from '../../context/SessionContext'
import { PaginationControls } from '../../components/PaginationControls'
import { fetchHomepageLists } from './data/fetchHomepageLists'

export function Homepage() {
  const { currentUser } = useSession()
  const [currentPage, setCurrentPage] = useState(0)
  const [isCreateOrEditModalOpen, setIsCreateOrEditModalOpen] = useState(false)
  const [selectedList, setSelectedList] = useState<ListDto | null>(null)
  const [isDeleteListDialogOpen, setIsDeleteListDialogOpen] = useState(false)
  const productChangesRef = useRef<{ create?: Array<{ entityId: string; quantity?: number }>; update?: Array<{ id: string; quantity?: number }>; delete?: string[] } | null>(null)

  const { lists, refetchLists } = fetchHomepageLists(currentPage)

  const handleNextPage = () => {
    if (lists?.total !== null && (currentPage + 1) * 10 < lists!.total) {
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

  const onSaveList = async () => {
    try {
      if (selectedList) {
        const existingList = !!selectedList.id

        if (existingList) {
          const updatePayload: ListUpdatePayload = {
            name: selectedList.name,
            displayName: selectedList.displayName,
            description: selectedList.description,
            navigation: selectedList.navigation,
            index: selectedList.index,
            isPrivate: selectedList.isPrivate || false,
            lastModifiedById: currentUser?.admin?.id,
            entityList: productChangesRef.current || undefined
          }
          await listService.updateWithEntityList(selectedList.id!, updatePayload)
        } else {
          await listService.create({
            name: selectedList.name,
            displayName: selectedList.displayName,
            description: selectedList.description,
            navigation: selectedList.navigation,
            index: selectedList.index,
            isPrivate: selectedList.isPrivate || false,
            type: 'HOMEPAGE',
            createdById: currentUser?.admin?.id,
          })
        }
        await refetchLists()
        setCurrentPage(0)
        setIsCreateOrEditModalOpen(false)
        setSelectedList(null)
      }
    } catch (error) {
      console.log('Error saving homepage list.', error)
    }
  }

  const onSaveProductsToList = async (entityList: { create?: Array<{ entityId: string; quantity?: number }>; update?: Array<{ id: string; quantity?: number }>; delete?: string[] }) => {
    productChangesRef.current = entityList
  }

  const onDeleteList = async () => {
    try {
      if (selectedList?.id && currentUser?.admin?.id) {
        await listService.delete(selectedList.id, currentUser.admin.id)
        await refetchLists()
        setCurrentPage(0)
        setIsDeleteListDialogOpen(false)
        setSelectedList(null)
      }
    } catch (error) {
      console.log('Error deleting homepage list.', error)
    }
  }

  const onSelectList = async (listIdx: number) => {
    const selected = lists?.data?.[listIdx]
    if (selected) {
      // Clear the selectedList state first to prevent cross-contamination
      setSelectedList(null)
      try {
        const fullListData = await listService.get(selected.id!, `?include=entityList.entity.product&_t=${Date.now()}`)
        setSelectedList(fullListData)
        setIsCreateOrEditModalOpen(true)
      } catch (error) {
        console.log('Error fetching list details.', error)
        setSelectedList(selected)
        setIsCreateOrEditModalOpen(true)
      }
    }
  }

  const onConfirmDeleteList = (listIdx: number) => {
    const selected = lists?.data?.[listIdx]
    if (selected) {
      setSelectedList(selected)
      setIsDeleteListDialogOpen(true)
    }
  }

  const headers = ['Name', 'Description', 'Index', '']
  const tableRows = lists?.data
    ?.sort((a, b) => {
      const indexA = a.index ?? 999999
      const indexB = b.index ?? 999999
      return indexA - indexB
    })
    .map((list) => ({
      displayName: { value: list.displayName || '', width: '300px' },
      description: { value: list.description || '-', width: '500px' },
      index: { value: list.index?.toString() || '-', width: '100px' },
    })) || []

  return (
    <>
      <div className="top-0 left-0 right-0 bottom-0 flex gap-0">
        {/*Main content column*/}
        <div className="flex-1 flex flex-col min-w-0 h-full">
          <div className="bg-[#e5e8eb] flex-shrink-0 flex items-center justify-between mb-0 pl-6 lg:pl-6 pr-4 lg:pr-3 py-2 lg:py-2">
            <div className="flex items-center gap-4">
              <Header>Homepage</Header>
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
                {lists && lists.total !== null && lists.total > 10 && (
                  <PaginationControls
                    currentPage={currentPage}
                    total={lists.total}
                    onPrev={handlePrevPage}
                    onNext={handleNextPage}
                  />
                )}
              </div>
            </div>
            <SimpleTable
              headers={headers}
              rows={tableRows}
              onEdit={onSelectList}
              onDelete={onConfirmDeleteList}
            />
          </div>
        </div>
      </div>
      <SimpleDialog
        isOpen={isCreateOrEditModalOpen}
        size="5xl"
        title={selectedList?.id ? 'Edit Homepage List' : 'Create Homepage List'}
        onClose={() => {
          setSelectedList(null)
          setIsCreateOrEditModalOpen(false)
        }}
        onSubmit={onSaveList}
        submitBtnTxt={selectedList?.id ? 'Update Homepage List' : 'Add Homepage List'}
      >
        <CreateOrEditHomepage
          selectedList={selectedList}
          setSelectedList={setSelectedList}
          onSaveProductsToList={onSaveProductsToList}
        />
      </SimpleDialog>
      <ConfirmDialog
        isOpen={isDeleteListDialogOpen}
        onClose={() => {
          setSelectedList(null)
          setIsDeleteListDialogOpen(false)
        }}
        title="Delete Homepage List"
        description={`Are you sure you want to delete the homepage list "${selectedList?.displayName}"?`}
        onConfirm={onDeleteList}
        confirmBtnTxt="Delete"
      />
    </>
  )
}
