import { useState } from 'react'
import { SetDto, SetPayload } from '../../types'
import { setService } from '../../services/api/Set'
import { SimpleTable } from '../../components/SimpleTable'
import { Header, Button } from '../../components/Tailwind'
import { SimpleDialog } from '../../components/SimpleDialog'
import { ConfirmDialog } from '../../components/ConfirmDialog'
import { CreateOrEditSet } from './CreateOrEditSet'
import { useSession } from '../../context/SessionContext'
import { PaginationControls } from '../../components/PaginationControls'
import { SearchInput } from '../../components/SearchInput'
import { useFetchSets } from './data/fetchSets'

export function Sets() {
  const { currentUser } = useSession()
  const [currentPage, setCurrentPage] = useState(0)
  const [searchText, setSearchText] = useState('')
  const [isCreateOrEditModalOpen, setIsCreateOrEditModalOpen] = useState(false)
  const [selectedSet, setSelectedSet] = useState<SetDto | null>(null)
  const [isDeleteSetDialogOpen, setIsDeleteSetDialogOpen] = useState(false)

  const { sets, refetchSets } = useFetchSets(currentPage, searchText)

  const handleSearch = (query: string) => {
    setSearchText(query)
    setCurrentPage(0)
  }

  const handleNextPage = () => {
    if (sets?.total !== null && (currentPage + 1) * 10 < sets!.total) {
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

  const onSaveSet = async () => {
    try {
      if (selectedSet) {
        const existingSet = !!selectedSet.id

        if (existingSet) {
          const updatePayload: SetPayload = {
            name: selectedSet.name,
            displayName: selectedSet.displayName,
            description: selectedSet.description,
            code: selectedSet.code,
            banner: selectedSet.banner,
            logo: selectedSet.logo,
            lastModifiedById: currentUser?.admin?.id,
          }
          await setService.update(selectedSet.id!, updatePayload)
        } else {
          await setService.create({
            name: selectedSet.name,
            displayName: selectedSet.displayName,
            description: selectedSet.description,
            code: selectedSet.code,
            banner: selectedSet.banner,
            logo: selectedSet.logo,
            createdById: currentUser?.admin?.id,
          })
        }
        await refetchSets()
        setCurrentPage(0)
        setIsCreateOrEditModalOpen(false)
        setSelectedSet(null)
      }
    } catch (error) {
      console.log('Error saving set.', error)
    }
  }

  const onDeleteSet = async () => {
    try {
      if (selectedSet?.id) {
        await setService.delete(selectedSet.id)
        await refetchSets()
        setCurrentPage(0)
        setIsDeleteSetDialogOpen(false)
        setSelectedSet(null)
      }
    } catch (error) {
      console.log('Error deleting set.', error)
    }
  }

  const onSelectSet = async (setIdx: number) => {
    const selected = sets?.data?.[setIdx]
    if (selected) {
      setSelectedSet(selected)
      setIsCreateOrEditModalOpen(true)
    }
  }

  const onConfirmDeleteSet = (setIdx: number) => {
    const selected = sets?.data?.[setIdx]
    if (selected) {
      setSelectedSet(selected)
      setIsDeleteSetDialogOpen(true)
    }
  }

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <Header>Sets</Header>
        <div className="flex items-center gap-4">
          <SearchInput
            value={searchText}
            onSearch={handleSearch}
            placeholder="Search sets..."
            className="w-80"
          />
          <Button
            className="text-white px-4 py-2 cursor-pointer"
            color="green"
            onClick={() => setIsCreateOrEditModalOpen(true)}
          >
            Create New Set
          </Button>
        </div>
      </div>
      <SimpleTable
        headers={['Display Name', 'Code', 'Description', '']}
        rows={sets?.data?.map((set) => ({
          displayName: { value: set.displayName || '', width: '350px' },
          code: { value: set.code || '', width: '200px' },
          description: { value: set.description || '-', width: '500px' },
        })) || []}
        onEdit={onSelectSet}
        onDelete={onConfirmDeleteSet}
      />
      {!searchText && sets && sets.total !== null && sets.total > 10 && (
        <PaginationControls
          currentPage={currentPage}
          total={sets.total}
          onPrev={handlePrevPage}
          onNext={handleNextPage}
        />
      )}
      {searchText && sets && sets.data && sets.data.length === 0 && (
        <div className="text-center py-4 text-gray-500">
          No sets found for &quot;{searchText}&quot;
        </div>
      )}
      <SimpleDialog
        isOpen={isCreateOrEditModalOpen}
        size="4xl"
        title={selectedSet?.id ? 'Edit Set' : 'Create Set'}
        onClose={() => {
          setSelectedSet(null)
          setIsCreateOrEditModalOpen(false)
        }}
        onSubmit={onSaveSet}
        submitBtnTxt={selectedSet?.id ? 'Update Set' : 'Add Set'}
      >
        <CreateOrEditSet
          selectedSet={selectedSet}
          setSelectedSet={setSelectedSet}
        />
      </SimpleDialog>
      <ConfirmDialog
        isOpen={isDeleteSetDialogOpen}
        onClose={() => {
          setSelectedSet(null)
          setIsDeleteSetDialogOpen(false)
        }}
        title="Delete Set"
        description={`Are you sure you want to delete the set "${selectedSet?.displayName}"?`}
        onConfirm={onDeleteSet}
        confirmBtnTxt="Delete"
      />
    </>
  )
}
