import { useState, useEffect } from 'react'
import { ConditionDto } from '../../types'
import { conditionService } from '../../services/api/Condition'
import { SimpleTable } from '../../components/SimpleTable'
import { Header, Button } from '../../components/Tailwind'
import { SimpleDialog } from '../../components/SimpleDialog'
import { ConfirmDialog } from '../../components/ConfirmDialog'
import { CreateOrEditCondition } from './CreateOrEditCondition'
import { useSession } from '../../context/SessionContext'
import { PaginationControls } from '../../components/PaginationControls'
import { fetchConditions } from './data/fetchConditions'
import { useSearchParams } from 'react-router-dom'

export function Conditions({ readOnly = false }: { readOnly?: boolean }) {
  const { currentUser } = useSession()
  const [searchParams, setSearchParams] = useSearchParams()
  const [currentPage, setCurrentPage] = useState(0)
  const [isCreateOrEditModalOpen, setIsCreateOrEditModalOpen] = useState(false)
  const [selectedCondition, setSelectedCondition] = useState<ConditionDto | null>(null)
  const [isDeleteConditionDialogOpen, setIsDeleteConditionDialogOpen] = useState(false)

  const { conditions, refetchConditions } = fetchConditions(currentPage)

  // Check for create query parameter and open dialog
  useEffect(() => {
    if (!readOnly && searchParams.get('create') === 'true') {
      setSelectedCondition(null)
      setIsCreateOrEditModalOpen(true)
      searchParams.delete('create')
      setSearchParams(searchParams, { replace: true })
    }
  }, [searchParams, setSearchParams, readOnly])

  const handleNextPage = () => {
    if (conditions?.total !== null && (currentPage + 1) * 10 < conditions!.total) {
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

  const onSaveCondition = async () => {
    try {
      if (selectedCondition) {
        const existingCondition = !!selectedCondition.id

        if (existingCondition) {
          await conditionService.update(selectedCondition.id!, {
            name: selectedCondition.name,
            displayName: selectedCondition.displayName,
            description: selectedCondition.description,
            lastModifiedById: currentUser?.admin?.id
          })
        } else {
          await conditionService.create({
            name: selectedCondition.name,
            displayName: selectedCondition.displayName,
            description: selectedCondition.description,
            createdById: currentUser?.admin?.id,
          })
        }
        await refetchConditions()
        setCurrentPage(0)
        setIsCreateOrEditModalOpen(false)
        setSelectedCondition(null)
      }
    } catch (error) {
      console.log('Error saving condition.', error)
    }
  }

  const onDeleteCondition = async () => {
    try {
      if (selectedCondition?.id) {
        await conditionService.delete(selectedCondition.id)
        await refetchConditions()
        setCurrentPage(0)
        setIsDeleteConditionDialogOpen(false)
        setSelectedCondition(null)
      }
    } catch (error) {
      console.log('Error deleting condition.', error)
    }
  }

  const onSelectCondition = (conditionIdx: number) => {
    const selected = conditions?.data?.[conditionIdx]
    if (selected) {
      setSelectedCondition(selected)
      setIsCreateOrEditModalOpen(true)
    }
  }

  const onConfirmDeleteCondition = (conditionIdx: number) => {
    const selected = conditions?.data?.[conditionIdx]
    if (selected) {
      setSelectedCondition(selected)
      setIsDeleteConditionDialogOpen(true)
    }
  }

  const headers = ['Name', 'Description', '']
  const tableRows = conditions?.data.map((condition) => ({
    displayName: { value: condition.displayName || '', width: '250px' },
    description: { value: condition.description || '', width: '800px' },
  })) || []

  return (
    <>
      <div className="top-0 left-0 right-0 bottom-0 flex gap-0">
        {/*Main content column*/}
        <div className="flex-1 flex flex-col min-w-0 h-full">
          <div className="bg-[#e5e8eb] flex-shrink-0 flex items-center justify-between mb-0 pl-6 lg:pl-6 pr-4 lg:pr-3 py-2 lg:py-2">
            <div className="flex items-center gap-4">
              <Header>Conditions</Header>
            </div>
          </div>
          <div className="flex-1 overflow-x-auto overflow-y-auto p-6">
            <div className="h-20 flex items-center justify-between gap-3">
              {!readOnly && (
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
              )}
              <div className="flex items-center gap-4 mb-5">
                {conditions && conditions.total !== null && conditions.total > 10 && (
                  <PaginationControls
                    currentPage={currentPage}
                    total={conditions.total}
                    onPrev={handlePrevPage}
                    onNext={handleNextPage}
                  />
                )}
              </div>
            </div>
            <SimpleTable
              headers={headers}
              rows={tableRows}
              onEdit={readOnly ? undefined : onSelectCondition}
              onDelete={readOnly ? undefined : onConfirmDeleteCondition}
              readOnly={readOnly}
            />
          </div>
        </div>
      </div>
      <SimpleDialog
        isOpen={isCreateOrEditModalOpen}
        size="3xl"
        title={selectedCondition?.id ? 'Edit Condition' : 'Create Condition'}
        onClose={() => {
          setSelectedCondition(null)
          setIsCreateOrEditModalOpen(false)
        }}
        onSubmit={onSaveCondition}
        submitBtnTxt={selectedCondition?.id ? 'Update Condition' : 'Add Condition'}
      >
        <CreateOrEditCondition
          selectedCondition={selectedCondition}
          setSelectedCondition={setSelectedCondition}
        />
      </SimpleDialog>
      <ConfirmDialog
        isOpen={isDeleteConditionDialogOpen}
        onClose={() => {
          setSelectedCondition(null)
          setIsDeleteConditionDialogOpen(false)
        }}
        title="Delete Condition"
        description={`Are you sure you want to delete the condition "${selectedCondition?.displayName}"?`}
        onConfirm={onDeleteCondition}
        confirmBtnTxt="Delete"
      />
    </>
  )
}
