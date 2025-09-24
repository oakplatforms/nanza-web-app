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

  return (
    <>
      <div className="flex">
        <Header>Homepage</Header>
        <Button
          className="text-white px-4 py-2 ml-auto cursor-pointer"
          onClick={() => setIsCreateOrEditModalOpen(true)}
          color="green"
        >
          Create New Homepage List
        </Button>
      </div>
      <br />
      <SimpleTable
        headers={['Name', 'Description', 'Index', '']}
        rows={lists?.data
          ?.sort((a, b) => {
            const indexA = a.index ?? 999999
            const indexB = b.index ?? 999999
            return indexA - indexB
          })
          .map((list) => ({
            displayName: { value: list.displayName || '', width: '300px' },
            description: { value: list.description || '-', width: '500px' },
            index: { value: list.index?.toString() || '-', width: '100px' },
          })) || []}
        onEdit={onSelectList}
        onDelete={onConfirmDeleteList}
      />
      {lists && lists.total !== null && lists.total > 10 && (
        <PaginationControls
          currentPage={currentPage}
          total={lists.total}
          onPrev={handlePrevPage}
          onNext={handleNextPage}
        />
      )}
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
