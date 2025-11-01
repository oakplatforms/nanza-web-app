import { useState, useEffect } from 'react'
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
import { useSearchParams } from 'react-router-dom'

export function Sets() {
  const { currentUser } = useSession()
  const [searchParams, setSearchParams] = useSearchParams()
  const [currentPage, setCurrentPage] = useState(0)
  const [searchText, setSearchText] = useState('')
  const [isCreateOrEditModalOpen, setIsCreateOrEditModalOpen] = useState(false)
  const [selectedSet, setSelectedSet] = useState<SetDto | null>(null)
  const [isDeleteSetDialogOpen, setIsDeleteSetDialogOpen] = useState(false)

  const { sets, refetchSets } = useFetchSets(currentPage, searchText)

  // Check for create query parameter and open dialog
  useEffect(() => {
    if (searchParams.get('create') === 'true') {
      setSelectedSet(null)
      setIsCreateOrEditModalOpen(true)
      searchParams.delete('create')
      setSearchParams(searchParams, { replace: true })
    }
  }, [searchParams, setSearchParams])

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

  const headers = ['Display Name', 'Code', 'Description', '']
  const tableRows = sets?.data?.map((set) => ({
    displayName: { value: set.displayName || '', width: '350px' },
    code: { value: set.code || '', width: '200px' },
    description: { value: set.description || '-', width: '500px' },
  })) || []

  return (
    <>
      <div className="fixed top-10 left-0 right-0 bottom-0 flex gap-0">
        {/*Main content column*/}
        <div className="flex-1 flex flex-col min-w-0 h-full">
          <div className="bg-[#eef1e3] flex-shrink-0 flex items-center justify-between mb-0 pl-6 lg:pl-6 pr-4 lg:pr-3 py-2 lg:py-2">
            <div className="flex items-center gap-4">
              <Header>Sets</Header>
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
                {!searchText && sets && sets.total !== null && sets.total > 10 && (
                  <PaginationControls
                    currentPage={currentPage}
                    total={sets.total}
                    onPrev={handlePrevPage}
                    onNext={handleNextPage}
                  />
                )}
                <SearchInput
                  value={searchText}
                  onSearch={handleSearch}
                  placeholder="Search sets..."
                  className="w-80"
                />
              </div>
            </div>
            <SimpleTable
              headers={headers}
              rows={tableRows}
              onEdit={onSelectSet}
              onDelete={onConfirmDeleteSet}
            />
            {searchText && sets && sets.data && sets.data.length === 0 && (
              <div className="text-center py-4 text-gray-500">
                No sets found for &quot;{searchText}&quot;
              </div>
            )}
          </div>
        </div>
      </div>
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
